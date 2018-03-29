const nodemailer = require('nodemailer');
const { TRANSPORT } = require('../config');

const sendMail = (email, subject, content, site, callback) => {
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

      callback(!error);
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
        return callback(false);
      }

      TRANSPORT.auth.user = account.user;
      TRANSPORT.auth.pass = account.pass;
      startTransport(TRANSPORT);
    });
  }
};

module.exports = {
  sendMail
};
