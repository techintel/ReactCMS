const express = require('express');
const router = express.Router();
const { Site } = require('../models');
const authenticate = require('../middlewares/authenticate');
const { isUserCapable } = require('../utils/reactcms');
const assert = require('assert');
const { orderBy } = require('lodash');
const { Types } = require('mongoose');

router.get('/:domain?', (req, res, next) => {
  const { domain } = req.params;

  Site.findOne({ '_id.domain': (domain ? domain : "") })
    .then(doc => {
      if (doc) {
        res.send(doc);
      } else {
        Site.findOne({ '_id.domain': "" })
          .then(doc => res.send(doc));
      }
    });
});

router.post('/themes', authenticate, (req, res, next) => {
  const { currentUser } = req;
  const { template } = req.body;

  if ( isUserCapable( 'switch', 'theme', currentUser ) ) {
    Site.findOne({ '_id.collectionPrefix': currentUser.collectionPrefix })
      .then(doc => {
        if (doc) {
          doc.template = template;
          doc.save(err => {
            assert.ifError(err);
            res.json(doc);
          });
        }
      });
  }
});

router.post('/widgets/:action', authenticate, (req, res, next) => {
  const { currentUser } = req;
  const { action } = req.params;
  const { area, values } = req.body;

  if ( isUserCapable( 'edit_theme', 'option', currentUser ) ) {
    Site.findOne({ '_id.collectionPrefix': currentUser.collectionPrefix })
      .then(doc => {
        if (doc) {
          switch (action) {
            case 'move':
              const areaKeys = ['content', 'left_sidebar', 'right_sidebar', 'footer'];
              areaKeys.forEach(areaKey => {
                let areaArr = doc[areaKey];
                const dragIndex = areaArr.findIndex( el => el._id.equals(values._id) );

                // Delete drag item
                if ( dragIndex !== -1 ) {
                  areaArr.splice(dragIndex, 1);
                  areaArr = orderBy(areaArr, 'order');
                  areaArr.forEach((o, i, a) => {
                    o.order = i + 1;
                    a[i] = o;
                  });
                }
              });

              // Relocate drag item
              doc[area].forEach((o, i, a) => {
                if ( o.order >= values.order ) {
                  o.order += 1;
                  a[i] = o;
                }
              });
              if (!values._id) values._id = Types.ObjectId(); // Create `_id` for a newly activate widget.
              doc[area].push(values);
              break;
            case 'save':
              const savingIndex = doc[area].findIndex(el => el.order === values.order);
              doc[area][savingIndex] = values;
              break;
            default: break;
          }

          doc.save(err => {
            if (err) {
              console.log('err', err);
              assert.ifError(err);
            } else {
              res.json(doc);
            }
          });
        }
      });
  }
});

router.delete('/widgets', authenticate, (req, res, next) => {
  const { currentUser } = req;
  const { area, values: { type, order } } = req.body;

  if ( isUserCapable( 'edit_theme', 'option', currentUser ) ) {
    Site.findOne({ '_id.collectionPrefix': currentUser.collectionPrefix })
      .then(doc => {
        if (doc) {
          const index = doc[area].findIndex(el => el.type === type && el.order === order);
          doc[area].splice(index, 1);
          doc[area] = orderBy(doc[area], 'order');
          doc[area].forEach((o, i, a) => {
            o.order = i + 1;
            a[i] = o;
          });

          doc.save(err => {
            assert.ifError(err);
            res.json(doc);
          });
        }
      });
  }
});

router.post('/settings/:optionName', authenticate, (req, res) => {
  const { optionName } = req.params;
  const { currentUser, body } = req;

  if ( isUserCapable( 'manage', 'option', currentUser ) ) {
    Site.findOne({ '_id.collectionPrefix': currentUser.collectionPrefix })
      .then(doc => {
        if (doc) {
          doc[optionName] = body;
          doc.save(err => {
            assert.ifError(err);
            res.json(doc);
          });
        }
      });
  }
});

module.exports = router;
