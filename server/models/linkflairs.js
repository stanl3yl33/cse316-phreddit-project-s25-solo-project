// LinkFlair Document Schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const linkFlairSchema = new Schema({
  content: {
    type: String,
    required: true,
    maxLength: 30,
  },
});

// virtual property url:
linkFlairSchema.virtual("url").get(function () {
  return `linkFlairs/${this._id}`;
});

// exporting:
module.exports = mongoose.model("LinkFlair", linkFlairSchema);
