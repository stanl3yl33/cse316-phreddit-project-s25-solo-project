// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// used for sessions
const session = require("express-session");
const MongoStore = require("connect-mongo");

// import routers:
const commentRouter = require("./routes/commentsRoute");
const communityRouter = require("./routes/communitiesRoute");
const postRouter = require("./routes/postsRoutes");
const linkFlairRouter = require("./routes/linkFlairsRoute");
const authRouter = require("./routes/authenticateRoute");
const userRouter = require("./routes/usersRoutes");

const DB = "mongodb://127.0.0.1:27017/phreddit";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// 2. Body parser (needed before routes)
app.use(express.json());

// 3. Session middleware
// leave secret as is for project
app.use(
  session({
    secret: "supersecret difficult to guess string",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 5000 * 60 * 60,
      sameSite: "lax",
      secure: false,
    },
    store: MongoStore.create({
      mongoUrl: "mongodb://127.0.0.1:27017/phreddit",
    }),
  })
);

app.get("/", function (req, res) {
  // console.log("Get request received at '/'");
  res.send("Hello Phreddit!");
});

// connect to mongodb via mongoose:
mongoose
  .connect(DB)
  .then(() => {
    console.log("Connected to phreddit database");
  })
  .catch((err) => {
    console.log("Error - ", err);
  });

app.listen(8000, () => {
  console.log("Server listening on port 8000...");
});

// mounting routers
app.use("/communities", communityRouter);
app.use("/linkFlairs", linkFlairRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRouter);
app.use("/authenticate", authRouter);
app.use("/users", userRouter);
