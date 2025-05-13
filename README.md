[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/2tEDYwzN)

# Term Project

Add design docs in _images/_

## Instructions to setup and run project

Clearly explain the steps required to install and configure necessary packages,
for both the server and the client, and the sequence of steps required to get
your application running.

Instructions:

- I only used the packages that were used in class. Namely: bcrypt, connect-mongo, cors, express, express-session, mongoose, and nodemon

- First install those required dependencies:

  - If we have access to the package.json files:

  * Simply go into server (cd server) and type npm install
  * Afterwards navigate to the client directory and type: npm install

  -Alternatively, if we want to install them individually do the following.

  - For server side:

    - navigate to the server folder. i.e. cd server
    - then do the following npm installs:

    1. npm install bcrypt
    2. npm install connect-mongo
    3. npm install express
    4. npm install express-session
    5. npm install mongoose
    6. npm install nodemon

  - For client side:

    - navigate to client folder. i.e. cd client
    - then do the following npm installs

    1. npm install
    2. npm install axios

- Second, we need to run init.js to populate the database
- init.js takes in 3 command line arguments: the email of the admin, displayname of admin, and the password in plaintext of the admin
- So in server folder, go to terminal and type the following:
- node init.js yourAdminEmail yourAdminDisplayName yourAdminPassword

- Ex: node init.js admin@phreddit.com Admin32 password123

- Finally we need to run the server
- Ensure that mongod is running in the background. Assuming, mongodb is set up like how prof. kane taught us, go to command prompt and type 'mongod' to run it in background
- Afterwards:
- Go into the server folder and type: nodemon server.js
- this will run the server

- Next go to the client side and go to the terminal and type: npm start
- this allows us access to app and boots it up in the welcome page
- From there you can login, register, or view as guest to interact with the appplication

---

In the sections below, list and describe each contribution briefly.

## Team Member 1 Contribution

I did all the front-end and back-end changes
