const bcrypt = require("bcrypt");
const User = require("../models/users");
const Post = require("../models/posts");
const Comment = require("../models/comments");
const Community = require("../models/communities");

// login and logout deals with the session creation and deletion
// login controller
exports.login = async (req, res) => {
  // destructure email and password from request boddy
  const { emailInput, pwInput } = req.body;

  if (!pwInput || !emailInput) {
    return res.status(400).json({
      status: "fail",
      message: "Must provide email and password input.",
    });
  }

  try {
    const user = await User.findOne({ email: emailInput });
    // check if user return null before comparing:
    if (user === null) {
      return res.status(401).json({
        status: "fail",
        message: "Wrong email or password provided",
      });
    }

    const verdict = await bcrypt.compare(pwInput, user.passwordHash);

    if (verdict) {
      // create new session and store ._id and isAdmin status for ease of development in the session

      // creating user session:
      req.session.user = {
        uid: user._id,
        isAdmin: user.isAdmin,
      };

      return res.status(200).json({
        status: "success",
        message: "login successful",
        user: {
          _id: user._id,
          displayName: user.displayName,
          email: user.email,
          isAdmin: user.isAdmin,
          reputation: user.reputation,
          creationDate: user.creationDate,
        },
      });
    } else {
      return res
        .status(401)
        .json({ status: "fail", message: "Wrong email or password provided" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "fail",
      message: "Error occurrerd while attempting to login.",
    });
  }
};

// logout controller
exports.logout = async (req, res) => {
  if (req.session.user) {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          status: "fail",
          message: "Something went wrong when attempting to logout",
        });
      }
      // remove / clear session cookie from browser before sending success msg json:
      // connect.sid = session id that is given to session
      res.clearCookie("connect.sid");

      return res.status(200).json({
        status: "success",
        message: "Logout successful",
      });
    });
  } else {
    return res.status(400).json({
      status: "fail",
      message: "There in no correct session.",
    });
  }
};

// getting info about currently logged in session:
exports.getSessionUser = async (req, res) => {
  if (!req.session.user) {
    return res.status(200).json({
      user: null,
      message: "Guest Access. currenlty no active session",
    });
  }

  try {
    // get user with the following fields: id, displayName, email, isAdmin status, reputation
    const user = await User.findById(req.session.user.uid).select(
      "_id displayName email isAdmin reputation creationDate"
    );

    // throw error if no user found based on current session user id
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found.",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (err) {
    return res.status(500).json({
      status: "fail",
      message: "Error retrieving session user.",
    });
  }
};

// middlewares to be used below:

// admin capabilities only (such as deleting user from db):
exports.validAdmin = async (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      status: "fail",
      message: "Must log in first",
    });
  }

  try {
    if (req.session.user.isAdmin) {
      return next();
    } else {
      return res.status(403).json({
        status: "fail",
        message: "Must be admin to access resource.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: "fail",
      message: "Server error while checking admin status.",
    });
  }
};

// middleware for checking valid user or admin:
exports.validPermission = async (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      status: "fail",
      message: "Must log in first",
    });
  }

  const { type, id } = req.body;

  if (!type || !id) {
    return res.status(400).json({
      status: "fail",
      message: "Requires 'type' and 'id' in request body.",
    });
  }

  let modelType = null;
  if (type.toLowerCase() === "post") {
    modelType = Post;
  } else if (type.toLowerCase() === "comment") {
    modelType = Comment;
  } else if (type.toLowerCase() === "community") {
    modelType = Community;
  }

  if (modelType === null) {
    return res.status(400).json({
      status: "fail",
      message: "Type must be 'post', 'comment', or 'community'.",
    });
  }

  try {
    const rsrc = await modelType.findById(id);
    if (!rsrc) {
      return res.status(404).json({
        status: "fail",
        message: `${type} not found.`,
      });
    }

    let creatorId = null;
    if (type.toLowerCase() === "post") {
      creatorId = rsrc.postedBy;
    } else if (type.toLowerCase() === "comment") {
      creatorId = rsrc.commentedBy;
    } else if (type.toLowerCase() === "community") {
      creatorId = rsrc.creator;
    }

    if (!creatorId) {
      return res.status(400).json({
        status: "fail",
        message: "Could not determine the resource creator.",
      });
    }

    if (
      req.session.user.uid.toString() === creatorId.toString() ||
      req.session.user.isAdmin
    ) {
      return next();
    } else {
      return res.status(403).json({
        status: "fail",
        message: "You must be the owner or an admin.",
      });
    }
  } catch (err) {
    console.error("Permission check error:", err);
    return res.status(500).json({
      status: "fail",
      message: "Server error while checking permissions.",
    });
  }
};

// middleware to check if there is an ongoing session for user
exports.validSession = async (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    return res.status(401).json({
      status: "fail",
      message: "You must login to perform / access this",
    });
  }
};
