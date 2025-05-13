const Community = require("./../models/communities");
const Comment = require("./../models/comments");
const Post = require("./../models/posts");
const { extractAllCommentFromPost } = require("./../utils/commentUtils");

// gets all communities in db
exports.getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find();
    res.status(200).json(communities);
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

// get Community by object id
exports.getCommunityById = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    res.status(200).json(community);
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

// get all specified post from a community:
// route: communities/:id/posts
exports.getPostsFromCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community || !community.postIDs) return res.status(200).json([]);

    // array filled with comment objects to be returned
    const posts = [];
    if (community.postIDs) {
      for (const pID of community.postIDs) {
        const post = await Post.findById(pID);
        posts.push(post);
      }
    }

    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

// create community
// no longer need req.body.creator -> replaced with current session: req.session.user.uid
exports.createCommunity = async (req, res) => {
  try {
    // the validation checks are done on client side
    // const { name, description, member } = req.body;
    if (!req.body.name || !req.body.description) {
      return res
        .status(400)
        .json({ status: "fail", message: "A parameter is missing" });
    }

    const payload = {
      name: req.body.name,
      description: req.body.description,
      postIDs: [],
      members: [req.session.user.uid],
      creator: req.session.user.uid,
    };

    const newCommunity = await Community.create(payload);

    res.status(201).json(newCommunity);
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

// edit
exports.editCommunityById = async (req, res) => {
  try {
    const update = {
      name: req.body.name,
      description: req.body.desc,
    };

    const updatedCommunity = await Community.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    res.status(200).json(updatedCommunity);
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Failed to edit community",
    });
  }
};

// community join
exports.joinCommunity = async (req, res) => {
  // find community and add current session user into the member list:
  try {
    const community = await Community.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: req.session.user.uid } },
      { new: true }
    );

    if (!community) {
      return res
        .status(404)
        .json({ status: "fail", message: "Could not find community" });
    }

    return res.status(200).json(community);
  } catch (err) {
    return res.status(500).json({
      status: "fail",
      message: "Error - fail to join community",
    });
  }
};

// community leave
exports.leaveCommunity = async (req, res) => {
  try {
    // find community and remove from member list
    const community = await Community.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: req.session.user.uid } },
      { new: true }
    );

    if (!community) {
      return res
        .status(404)
        .json({ status: "fail", message: "Could not find community" });
    }

    return res.status(200).json(community);
  } catch (err) {
    return res.status(500).json({
      status: "fail",
      message: "Error - fail to leave community",
    });
  }
};

// according to piazza post -> community founder can still leave -> meaning members list can technically be 0
// they will still be considered the owner tho ===> should still appear in that  user's user profile (but not in members list)

// community delete
exports.deleteCommunity = async (req, res) => {
  try {
    // get list of post ids
    const community = await Community.findById(req.params.id);
    const pids = community.postIDs;

    // delete all comments from post and then delete the post itself. repeat for entire post list
    for (let pid of pids) {
      // find post:
      const post = await Post.findById(pid.toString());

      // extract all comments from post:
      const comments = await extractAllCommentFromPost(post);

      for (const comment of comments) {
        // iteratively delete all the comment:
        await Comment.findByIdAndDelete(comment._id.toString());
      }

      // delete the post itself:
      await Post.findByIdAndDelete(pid.toString());
    }

    // finally delete community itself
    await Community.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      status: "success",
      message:
        "Community and its related post and comments were successfully deleted",
    });
  } catch (err) {
    return res.status(500).json({
      status: "fail",
      message: "Error - failed to delete community",
    });
  }
};

exports.getCommunitiesByUserId = async (req, res) => {
  try {
    const uid = req.params.id;
    const communities = await Community.find({ creator: uid });
    res.status(200).json(communities);
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: "Failed to fetch comments by user.",
    });
  }
};
