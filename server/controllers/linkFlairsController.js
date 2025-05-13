const LinkFlair = require("./../models/linkflairs");

// link flair creation will be delt with in the post controller

// get all link flairs (for post form)
exports.getAllLinkFlairs = async (req, res) => {
  try {
    const linkFlairs = await LinkFlair.find();
    res.status(200).json(linkFlairs);
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

// get link flair
exports.getLinkFlairById = async (req, res) => {
  try {
    const linkFlair = await LinkFlair.findById(req.params.id);
    res.status(200).json(linkFlair);
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
