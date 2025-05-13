// User Document Schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// reputation users = 100
// reputation of admin = 1000
const userSchema = new Schema({
  creationDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  reputation: {
    type: Number,
    required: true,
    default: 100,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
});

//virtual property url:
userSchema.virtual("url").get(function () {
  return `users/${this._id}`;
});

//exporting
module.exports = mongoose.model("User", userSchema);
