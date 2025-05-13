const bcrypt = require("bcrypt");
const User = require("../models/users");
const Post = require("../models/posts");
const Comment = require("../models/comments");
const Community = require("../models/communities");
const {
  extractAllCommentFromPost,
  extractAllReplies,
} = require("../utils/commentUtils");

// uniqueness methods for register:
exports.checkDisplayName = async (req, res) => {
  const { displayName } = req.body;

  const user = await User.findOne({ displayName });

  return res.status(200).json({
    status: user ? "duplicate" : "non-duplicate",
    message: user
      ? "Display name already used. Use another please."
      : "Display name is available",
  });
};

exports.checkEmail = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  return res.status(200).json({
    status: user ? "duplicate" : "non-duplicate",
    message: user
      ? "Email is already used. Use another please."
      : "Email is available",
  });
};

// register user (create new user)
exports.registerUser = async (req, res) => {
  try {
    // destructure: firstName, lastName, displayName, email, encrypt the plaintext password
    const { firstName, lastName, displayName, email, password } = req.body;

    // check for empty / missing parameters
    if (!firstName || !lastName || !displayName || !email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "A parameter for registering a new user",
      });
    }

    // check for email uniqueness
    const dup = await User.findOne({ email });
    if (dup) {
      return res.status(400).json({
        status: "fail",
        message: "Email is already used. Please use a new one.",
      });
    }

    // hash the password
    const saltRounds = 11;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // payload with encrypted password
    const payload = {
      firstName,
      lastName,
      displayName,
      email,
      passwordHash,
      isAdmin: false,
      reputation: 100,
    };

    // create new user obj
    const newUser = await User.create(payload);

    // return user obj
    res.status(201).json({
      _id: newUser._id,
      displayName: newUser.displayName,
      email: newUser.email,
      reputation: newUser.reputation,
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err,
    });
  }
};

// get specific user
exports.getUserById = async (req, res) => {
  try {
    // exclude the passwordHash for security
    const user = await User.findById(req.params.id).select("-passwordHash");
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message:
        "Error - something went wrong when attempting to fetch specific user",
    });
  }
};

// get all users
exports.getAllUsers = async (req, res) => {
  try {
    // exclude the passwordHash for security
    const users = await User.find().select("-passwordHash");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err,
    });
  }
};

exports.updateRep = async (req, res) => {
  // check if param is a number type first:
  if (isNaN(Number(req.body.rep))) {
    return res.status(400).json({
      status: "fail",
      message: "Reputation can only be numbers.",
    });
  }

  try {
    // find user and update rep accordingly
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $inc: { reputation: req.body.rep } },
      { new: true }
    ).select("-passwordHash");
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: "Error - failed to update user reputation",
    });
  }
};

// delete user (admin only, use admin middleware to check):

exports.deleteUserById = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    // cascade delete any communities the user made

    // list of communities that user made
    const communities = await Community.find({ creator: targetUserId });
    for (let community of communities) {
      const posts = await Post.find({ _id: { $in: community.postIDs } });

      for (let post of posts) {
        // list of comment obj
        const comments = await extractAllCommentFromPost(post);
        for (let c of comments) {
          // remove comment id from commentIDs in post and comment respectively
          const parentPost = await Post.findOne({ commentIDs: c._id });
          if (parentPost) {
            await Post.findByIdAndUpdate(parentPost._id, {
              $pull: { commentIDs: c._id },
            });
          } else {
            const parentComment = await Comment.findOne({ commentIDs: c._id });
            if (parentComment) {
              await Comment.findByIdAndUpdate(parentComment._id, {
                $pull: { commentIDs: c._id },
              });
            }
          }

          // delete comment:
          await Comment.findByIdAndDelete(c._id);
        }
        // delete post itself:
        await Post.findByIdAndDelete(post._id);
      }
      // delete that community and move onto next community:
      await Community.findByIdAndDelete(community._id);
    }

    // Delete any post user made:
    const posts = await Post.find({ postedBy: targetUserId });
    for (let post of posts) {
      // list of comment obj
      const comments = await extractAllCommentFromPost(post);
      for (let c of comments) {
        const parentPost = await Post.findOne({ commentIDs: c._id });
        if (parentPost) {
          await Post.findByIdAndUpdate(parentPost._id, {
            $pull: { commentIDs: c._id },
          });
        } else {
          const parentComment = await Comment.findOne({ commentIDs: c._id });
          if (parentComment) {
            await Comment.findByIdAndUpdate(parentComment._id, {
              $pull: { commentIDs: c._id },
            });
          }
        }

        // delete comment:
        await Comment.findByIdAndDelete(c._id);
      }
      // delete post itself:
      await Post.findByIdAndDelete(post._id);
    }

    // delete any comments and its following threads made by user:
    // list of comments made by creator:
    const comments = await Comment.find({ commentedBy: targetUserId });

    // Need to remember to remove comment from parent's commentIDs field (whether it is post or comment)
    for (let comment of comments) {
      const replyThread = await extractAllReplies(comment);

      for (let reply of replyThread) {
        if (reply) {
          const parentPost = await Post.findOne({ commentIDs: reply._id });
          if (parentPost) {
            await Post.findByIdAndUpdate(parentPost._id, {
              $pull: { commentIDs: reply._id },
            });
          } else {
            const parentComment = await Comment.findOne({
              commentIDs: reply._id,
            });
            if (parentComment) {
              await Comment.findByIdAndUpdate(parentComment._id, {
                $pull: { commentIDs: reply._id },
              });
            }
          }

          await Comment.findByIdAndDelete(reply._id);
        }
      }

      const parentPost = await Post.findOne({ commentIDs: comment._id });
      if (parentPost) {
        await Post.findByIdAndUpdate(parentPost._id, {
          $pull: { commentIDs: comment._id },
        });
      } else {
        const parentComment = await Comment.findOne({
          commentIDs: comment._id,
        });
        if (parentComment) {
          await Comment.findByIdAndUpdate(parentComment._id, {
            $pull: { commentIDs: comment._id },
          });
        }
      }

      // delete comment itself:
      await Comment.findByIdAndDelete(comment._id);
    }

    // 4. Finally, delete the user
    await User.findByIdAndDelete(targetUserId);

    return res.status(200).json({
      status: "success",
      message:
        "User and their associated communities, posts, and comments successfully deleted",
    });
  } catch (err) {
    return res.status(500).json({
      status: "fail",
      message: "Error occurred while deleting user and related data.",
    });
  }
};

// getting comments, posts, and communities for users will be done in their respective controllers
