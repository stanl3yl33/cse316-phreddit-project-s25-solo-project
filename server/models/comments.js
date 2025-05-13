// Comment Document Schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  content: {
    type: String,
    required: true,
    maxLength: 500,
  },
  commentIDs: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  commentedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  commentedDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  voteCount: {
    type: Number,
    default: 0,
  },
  // voteCouunt keeps track if +1 upvote or -1 upvote for corresponding user id in form of obj
  votes: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      voteValue: { type: Number },
    },
  ],
});

//virtual property url:
commentSchema.virtual("url").get(function () {
  return `comments/${this._id}`;
});
//exporting
module.exports = mongoose.model("Comment", commentSchema);
