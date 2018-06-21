const nodemailer = require('nodemailer');
const { TRANSPORT } = require('../config');

const { Schema } = require('mongoose');
const assert = require('assert');
const _ = require('lodash');

function sendMail(email, subject, content, site, onSend) {
  const { title, mail } = site;

  const mailHeader = (mail !== undefined && mail.header) ? mail.header
    : `<h1>${title}</h1>`;
  const mailFooter = (mail !== undefined && mail.footer) ? mail.footer
    : `<p>Copyright © ${(new Date()).getFullYear()} ${title}.</p>`;

  const mailHtml = `
    <div>
      <header>${mailHeader}</header>
      <div>${content}</div>
      <footer>${mailFooter}</footer>
    </div>
  `;

  const startTransport = (transport) => {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport(transport);

    // setup email data with unicode symbols
    const mailOptions = {
      from: `"${title}" <${transport.auth.user}>`, // sender address
      to: email, // list of receivers
      subject: subject, // Subject line
      html: mailHtml // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      console.log(error ? error : `Message sent: ${info.messageId}`);

      // Preview only available when sending through an Ethereal account
      if (transport.host === 'smtp.ethereal.email') {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }

      onSend(!error);
    });
  }

  if (TRANSPORT.host !== 'smtp.ethereal.email') {
    startTransport(TRANSPORT);
  } else {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    nodemailer.createTestAccount((err, account) => {
      if (err) {
        console.error('Failed to create a testing account. ' + err.message);
        return onSend(false);
      }

      TRANSPORT.auth.user = account.user;
      TRANSPORT.auth.pass = account.pass;
      startTransport(TRANSPORT);
    });
  }
};

function toSlug(text) {
  let slug = text.replace(/[^\w\s-]/gi, '');
  slug = slug.replace(/\s+/g, '-');
  slug = slug.toLowerCase();
  return slug;
}

function authorFieldRef(userRef) {
  return {
    author: { type: Schema.ObjectId, ref: userRef, required: true }
  };
}

function tagsFieldRef(collectionPrefix) {
  return {
    categories: [{ type: Schema.ObjectId, ref: `${collectionPrefix}Category` }],
    tags: [{ type: Schema.ObjectId, ref: `${collectionPrefix}Tag` }]
  };
}

function ancestorsFieldRef(pageRef) {
  return {
    parent: { type: Schema.ObjectId, ref: pageRef },
    ancestors: [{ type: Schema.ObjectId, ref: pageRef }]
  };
}

function retrieveAncestors(model, nextParent, post, res, onFind, ancestors = []) {
  if (!ancestors.length)
    post.parent = nextParent ? nextParent : null;

  if (nextParent) {
    model.findOne(
      { _id: nextParent },
      (err, parentPost) => {
        assert.ifError(err);

        if ( post._id && post._id.equals(parentPost.parent) ) {
          return res.status(409).json({ errors: { parent: "Can't select the parent of any ancestors." } });
        } else if (parentPost) {
          ancestors.unshift(nextParent);
        }

        nextParent = parentPost ? parentPost.parent : false;
        nextParent ?
          retrieveAncestors(model, nextParent, post, res, onFind, ancestors) :
          onFind( Object.assign(post, { ancestors }) );
      }
    );
  } else {
    onFind( Object.assign(post, { ancestors }) );
  }
}

function populateSort(docQuery, sort, callback) {
  const params = {
    path: 'author categories tags',
    select: '-hash -email'
  };

  if ( !docQuery.populate().exec ) { // docQuery is a doc
    docQuery.populate( _.merge(
      params, { options: { sort } }
    ), (err, doc) => {
      assert.ifError(err);
      callback(doc);
    });
  } else { // docQuery is a query
    docQuery.populate( params )
    .sort( sort )
    .exec( (err, result) => {
      assert.ifError(err);
      callback(result);
    });
  }
}

function tagsCount(models) {
  _.forEach({
    Category: 'categories',
    Tag: 'tags'
  }, (value, key) => {
    models[key].find( {},
      (err, tags) => {
        assert.ifError(err);

        tags.forEach( tag => {
          models.Post.find( { [value]: tag._id },
            (err, posts) => {
              assert.ifError(err);

              tag.count = posts.length;
              tag.save(err => assert.ifError(err));
            }
          );
        });
      }
    );
  });
}

module.exports = {
  sendMail,
  toSlug,
  authorFieldRef,
  tagsFieldRef,
  ancestorsFieldRef,
  retrieveAncestors,
  populateSort,
  tagsCount,
};
