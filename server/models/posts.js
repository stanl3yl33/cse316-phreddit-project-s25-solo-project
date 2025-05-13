// Post Document Schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// modified posts to align with project
// postedBy now refers to User obj's ._id field
// also keep track on who upvoted / downvoted what on a comment
const postSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxLength: 100,
  },
  content: {
    type: String,
    required: true,
  },
  linkFlairID: {
    type: Schema.Types.ObjectId,
    ref: "LinkFlair",
  },
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  postedDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  commentIDs: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  views: {
    type: Number,
    required: true,
    default: 0,
  },
  voteCount: {
    type: Number,
    default: 0,
  },
  // same idea as comment. basically provide a map for user._id to corresponding +1 or -1 vote value
  votes: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      voteValue: { type: Number },
    },
  ],
});

// virtual property url:
postSchema.virtual("url").get(function () {
  return `posts/${this._id}`;
});
// exporting
module.exports = mongoose.model("Post", postSchema);
