// Community Document Schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const communitySchema = new Schema({
  name: {
    type: String,
    required: true,
    maxLength: 100,
  },
  description: {
    type: String,
    required: true,
    maxLength: 500,
  },
  postIDs: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  members: {
    type: [{ type: Schema.Types.ObjectId, ref: "User" }],
    required: true,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// virtual schema for the url:
// url -  communities/_id
communitySchema.virtual("url").get(function () {
  return `communities/${this._id}`;
});
// membercount (length of members):
communitySchema.virtual("memberCount").get(function () {
  return this.members.length;
});

module.exports = mongoose.model("Community", communitySchema);
