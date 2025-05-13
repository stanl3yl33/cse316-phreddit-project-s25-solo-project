const Comment = require("./../models/comments");
const Post = require("./../models/posts");
const User = require("./../models/users");

const {
  extractAllCommentFromPost,
  extractAllReplies,
} = require("./../utils/commentUtils");

exports.getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    res.status(200).json(comment);
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

// gets all comments from database
exports.getAllComments = async (req, res) => {
  try {
    const comment = await Comment.find();
    res.status(200).json(comment);
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

// given a comment, get their replies if any
// comment/:id/replies
exports.getReplies = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment || !comment.commentIDs) return res.status(200).json([]);

    // array filled with comment objects to be returned
    const replies = [];
    if (comment.commentIDs) {
      for (const replyID of comment.commentIDs) {
        const reply = await Comment.findById(replyID);
        replies.push(reply);
      }
    }

    res.status(200).json(replies);
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

// req.body (i.e. data sent):
// 1) id -> comment or a post |
// 2) content
// 3) user session id instead of user name
exports.createComment = async (req, res) => {
  try {
    // check if provided data from POST request is there
    if (!req.body.id || !req.body.content) {
      return res.status(400).json({
        status: "fail",
        message: "A parameter for creating a comment is missing",
      });
    }

    const commentPayload = {
      content: req.body.content,
      commentIDs: [],
      commentedBy: req.session.user.uid,
      voteCount: 0,
      votes: [],
    };

    // determine if id belongs to a post or if belongs to comment
    const post = await Post.findById(req.body.id);
    const comment = await Comment.findById(req.body.id);
    if (post === null && comment === null) {
      return res.status(400).json({
        status: "fail",
        message: "Id provided did not belong to either comment or post",
      });
    }

    const replyTo = post ? "post" : "comment";

    // create comment
    const newComment = await Comment.create(commentPayload);

    // insert comment id into post or comment
    if (replyTo === "post") {
      await Post.findByIdAndUpdate(req.body.id, {
        $push: { commentIDs: newComment._id },
      });
    } else {
      await Comment.findByIdAndUpdate(req.body.id, {
        $push: { commentIDs: newComment._id },
      });
    }

    return res.status(201).json(newComment);
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getAllCommentsFromPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        status: "fail",
        message: "provided invalid post id",
      });
    }
    const comments = await extractAllCommentFromPost(post);
    return res.status(200).json(comments);
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

// edit comment
// only modify content based on user input
exports.editCommentById = async (req, res) => {
  try {
    const update = {
      content: req.body.content,
    };

    const updateComment = await Comment.findByIdAndUpdate(
      req.params.id,
      update,
      {
        new: true,
      }
    );

    res.status(200).json(updateComment);
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Failed to edit comment content",
    });
  }
};

// delete comment
// need to delete the thread chain under specific comment i.e. delete all of its replies
exports.deleteCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        status: "fail",
        message: "Error - invalid comment id provided",
      });
    }

    // need to get the parent of the to-be removed comment id if there is any and remove it from the commentID list field from post or comment:
    // Determine parent: post or another comment
    const post = await Post.findOne({ commentIDs: comment._id });
    const parentComment = await Comment.findOne({ commentIDs: comment._id });

    // Remove the comment ID from its parent's commentIDs array
    if (post) {
      await Post.findByIdAndUpdate(post._id, {
        $pull: { commentIDs: comment._id },
      });
    } else if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment._id, {
        $pull: { commentIDs: comment._id },
      });
    }

    // extract all replies to comment:
    const replies = await extractAllReplies(comment._id);

    // delete all replies
    for (let reply of replies) {
      await Comment.findByIdAndDelete(reply._id.toString());
    }

    // finally, delete the parent comment
    await Comment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: "success",
      message: "comment and its replies successfully deleted",
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: "Error - failed to delete comment",
    });
  }

  // getting all replies to comment thread:
};

// voteComment
// utilize the same idea / structure from post Controller:
// update post vote by id
exports.voteComment = async (req, res) => {
  try {
    // destructure the payload:
    const { val } = req.body;

    //get model info:
    const comment = await Comment.findById(req.params.id);
    const voter = await User.findById(req.session.user.uid);
    const commentCreator = await User.findById(comment.commentedBy);

    // Need to check if current session users has a rep >= 50 -> if not === can't vote
    if (voter.reputation < 50) {
      return res.status(403).json({
        status: "fail",
        message: "You must have at least a reputation 50 to vote.",
      });
    }

    // check if current session user has voted already or not, if not -> add user and modify vote count:
    let hasVoted = false;
    let index = 0;
    for (let i = 0; i < comment.votes.length; i++) {
      if (
        comment.votes[i].user.toString() === req.session.user.uid.toString()
      ) {
        hasVoted = true;
        index = i;
        break;
      }
    }

    // new user vote on comment:
    if (hasVoted === false) {
      comment.votes.push({
        user: req.session.user.uid,
        voteValue: val,
      });

      // upvote or downvote depending on value passed
      comment.voteCount += val;

      // update rep based on vote value
      if (val === 1) {
        commentCreator.reputation += 5;
      }
      if (val === -1) {
        commentCreator.reputation -= 10;
      }

      // save the changes:
      await comment.save();
      await commentCreator.save();
    } else {
      // if currently Stored value matches passed in value -> undo
      if (val === comment.votes[index].voteValue) {
        // remove user from votes via splice():
        comment.votes.splice(index, 1);

        // update voteCount to reflect the rermoval
        comment.voteCount -= val;

        // undo the rep / update rep for creator:
        if (val === 1) {
          commentCreator.reputation -= 5;
        }
        if (val === -1) {
          commentCreator.reputation += 10;
        }

        // save changes :
        await comment.save();
        await commentCreator.save();
      } else {
        // else swap and update
        // remove prev vote val
        comment.voteCount -= comment.votes[index].voteValue;

        // remove old rep
        if (comment.votes[index].voteValue === 1) {
          commentCreator.reputation -= 5;
        }
        if (comment.votes[index].voteValue === -1) {
          commentCreator.reputation += 10;
        }

        // add new vote value:
        comment.voteCount += val;

        // update new rep
        if (val === 1) {
          commentCreator.reputation += 5;
        }
        if (val === -1) {
          commentCreator.reputation -= 10;
        }

        // update voteValue field in array:
        comment.votes[index].voteValue = val;

        // save changes
        await comment.save();
        await commentCreator.save();
      }
    }

    return res.status(200).json(comment);
  } catch (err) {
    return res.status(500).json({
      status: "fail",
      message: "Error - something went wrong when updating vote for comment",
    });
  }
};

exports.getCommentByUserId = async (req, res) => {
  try {
    const uid = req.params.id;
    const comments = await Comment.find({ commentedBy: uid });
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: "Failed to fetch comments by user.",
    });
  }
};

// /comment/post/title/:id
exports.getRepliedPostTitle = async (req, res) => {
  try {
    const cid = req.params.id;

    const posts = await Post.find().select("title commentIDs");

    for (const post of posts) {
      const comments = await extractAllCommentFromPost(post);
      const match = comments.find((comment) => comment._id.toString() === cid);

      if (match) {
        return res.status(200).json(post.title);
      }
    }

    return res.status(200).json("Unknown"); // fallback if not found
  } catch (err) {
    console.error("Error locating post for comment:", err);
    return res.status(500).json({
      status: "fail",
      message: "Failed to get the title the comment replied to",
    });
  }
};
