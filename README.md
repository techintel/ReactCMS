ReactCMS is a free and open-source content management system *(CMS)* based on ReactJS, Node.js, Express and MongoDB.

**This software is still in development**

|   |   |
|:-:|:-:|
| [![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=7CKXRHMTRVSZC) | This option is for those who are willing to support me to continue building this software.<br />I really appreciate your donations! |
|   |   |

To use ReactCMS, you must first checkout this repository, or download the .ZIP file and extract its contents, and proceed to the following server and client-side installations:

### Installing back-end with Node.js, Express and MongoDB

The "server" directory contains the source code for your app's backend Express server.<br />
*(You can build your own custom backend server using other programming language if you want.)*

 - First, you must have a `mongod` running version 3.2.x of MongoDB or above.
 - In the "server" directory, run `npm install` to install its dependencies.
 - Open */server/config.js*, read the property descriptions carefully and set them properly according to the configuration of your server.
 - */sites.json* contains your multisite information, modify and import it as your database collection named 'sites' by running: `mongoimport --drop -d reactcms -c sites sites.json`
 - In the "server" directory, run `npm start` or `nodemon` to run the Express app which starts your server.

### Installing front-end React application

The "client" directory contains the source code for your React app.

 - Open */client/src/config.js* and configure it for your app.
 - In the "client" directory, run `npm install` to install its dependencies.
 - In the "client" directory, run `npm start` to start your ReactCMS app.
