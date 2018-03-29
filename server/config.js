module.exports = {

  // MongoDB Connection URI
  MONGODB_URI: 'mongodb://localhost:27017',
  // Database Name
  DATABASE_NAME: 'reactcms',

  // Client URL
  CLIENT_ROOT_URL: 'http://localhost:3000',


  TRANSPORT: {

    // Hostname or IP address of your server that will send the email
    host: 'smtp.ethereal.email',
    // Port to connect to (defaults to 587 if secure is false or 465 if true)
    port: 587,
    // Use TLS (true for 465, false for other ports)
    secure: false,

    auth: {
      // The email address for your application
      user: "your_app_email@example.com",
      // Your app email password
      pass: "YOUR_APP_EMAIL_PASSWORD"
    },

    tls: {
      // Set to true to fail sending on invalid certificates
      rejectUnauthorized: false
    }

  },


  // The salt to be used to hash the password
  SALT_ROUNDS: 10,

  // The secret key for JsonWebToken.
  JWT_SECRET: 'SECRET_KEY_FOR_JSONWEBTOKEN'

}
