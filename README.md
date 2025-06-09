[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/2tEDYwzN)

# Term Project
## Description:
This is a MERN Stack project that I have done for my CSE 316 last semester. I have forked this from my github classroom repo and updated the current readme.

## Instructions to Set Up and Run the Project

Follow the steps below to install dependencies, initialize the database, and start both the server and client applications.

---

### Step 1: Install Dependencies

This project uses only the packages introduced in class:

- `bcrypt`, `connect-mongo`, `cors`, `express`, `express-session`, `mongoose`, and `nodemon`

#### Option A: Using `package.json` (Recommended Way)

1. Install server dependencies:

   ```bash
   cd server
   npm install
   ```

2. Install client dependencies:

   ```bash
   cd ../client
   npm install
   ```

#### Option B: Manually Install Packages (If `package.json` is unavailable)

**For the server**:

```bash
cd server
npm install bcrypt
npm install connect-mongo
npm install express
npm install express-session
npm install mongoose
npm install nodemon
```

**For the client**:

```bash
cd ../client
npm install
npm install axios
```

---

### Step 2: Initialize the Database

You must run the `init.js` script to populate the MongoDB database with an initial admin user. This should be done before starting the server.

#### Usage:

```bash
cd server
node init.js <admin_email> <admin_display_name> <admin_password>
```

#### Example:

```bash
node init.js admin@phreddit.com Admin32 password123
```

This will create an admin user with the given email, display name, and password in the database.

---

### Step 3: Start the Application

1. Make sure MongoDB is running. If the system PATH for MongoDB was set up, simply write the following in a terminal:

   ```bash
   mongod
   ```

2. In a new terminal, start the server:

   ```bash
   cd server
   nodemon server.js
   ```

3. In another terminal, start the client:

   ```bash
   cd client
   npm start
   ```

---

### Access the Application

Once both the server and client are running, open your browser and go to:

```bash
http://localhost:3000
```

You will see the welcome page, where you can:

- Register a new user
- Log in using the admin credentials you created
- Browse as a guest

From there, you can interact with the application.


---

In the sections below, list and describe each contribution briefly.

## Team Member 1 Contribution

Front-end React Components, Back-end server, setting up routes, handlers for each routes, and node script for initializing databasae 
