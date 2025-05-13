const { extractAllCommentFromPost } = require("../utils/commentUtils");
const { isValidObjectId } = require("mongoose");

const Post = require("../models/posts");
const Community = require("../models/communities");
const Comment = require("../models/comments");
const LinkFlair = require("../models/linkflairs");
const User = require("../models/users");

// should increment view count by 1 every time it is requested
exports.getPostById = async (req, res) => {
  try {
    // const post = await Post.findById(req.params.id);
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getEditPostById = async (req, res) => {
  try {
    // const post = await Post.findById(req.params.id);
    const post = await Post.findById(req.params.id);

    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getAllPost = async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

// route: posts/:id/replies
//  return json with empty array in it if replies exhist
exports.getPostReplies = async (req, res) => {
  try {
    //get  post
    const post = await Post.findById(req.params.id);

    // check if any comment exhists for the post at all first
    if (!post || !post.commentIDs) return res.status(200).json([]);

    // array filled with comment objects to be returned
    const replies = [];
    if (post.commentIDs) {
      for (const replyID of post.commentIDs) {
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

// shoulud insert the id into the appropriate community (based on req.params)
// create or insert or do nothing for link flair based on req.body
// no longer need creator since we can just use session id.
exports.createPost = async (req, res) => {
  try {
    // validate the parameters
    if (!req.body.cID || !req.body.title || !req.body.content) {
      return res.status(400).json({
        status: "fail",
        message: "A parameter for creating a comment is missing",
      });
    }

    // check if flair is included in params or not
    // req.body.flair => either id or content of new flair that is made
    let curFlair = null;

    // flair can be empty
    if (req.body.flair) {
      // need to check if its a objectID type, else if input for new flair contains spaces -> results in casting error:
      if (isValidObjectId(req.body.flair)) {
        curFlair = await LinkFlair.findById(req.body.flair);
      }

      // passed in flair data != id, create new flair with passed in content
      if (!curFlair) {
        const flairPayload = {
          content: req.body.flair,
        };

        curFlair = await LinkFlair.create(flairPayload);
      }
    }

    // create the post obj
    const payload = {
      title: req.body.title,
      content: req.body.content,
      linkFlairID: curFlair ? curFlair._id : null,
      postedBy: req.session.user.uid,
      commentIDs: [],
      voteCount: 0,
      votes: [],
    };

    const newPost = await Post.create(payload);

    // insert the newly created post's object id into the specified community that was passed in
    await Community.findByIdAndUpdate(req.body.cID, {
      $push: { postIDs: newPost._id },
    });

    // send back the newly created post
    res.status(201).json(newPost);
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

//
// search method (refactored from pa01)
// posts/search?q=some search query
// ex: ?q=aitj
exports.searchPosts = async (req, res) => {
  try {
    // req.params.search -> (searchQuery)
    // instead of params, use query => avoids "" error
    // let searchQuery = req.params.search.toLowerCase().trim();
    let searchQuery = req.query.q?.toLowerCase().trim();

    if (!searchQuery || searchQuery === "") return res.status(200).json([]);

    if (searchQuery !== "") {
      const queryList = searchQuery.split(" ");

      // edge case - set the default to empty array if no data for posts
      // const postList = model?.data?.posts ?? [];
      const postList = await Post.find();

      if (postList.length === 0) {
        return res.status(200).json([]);
      }

      // set -> avoids adding duplicate post items
      const resultSet = new Set();

      // iterate through all posts and search for query in the title and content of post or in the comments of the post
      for (let post of postList) {
        let added = false;

        let postTitle = post.title.toLowerCase();
        let postContent = post.content.toLowerCase();

        for (let query of queryList) {
          // search title or content of post
          if (postTitle.includes(query) || postContent.includes(query)) {
            resultSet.add(post);
            added = true;
            break;
          }
        }

        // skip searching through comments if we found in title or content
        if (added === true) {
          continue;
        }

        // Search comments if there are any
        // extractAllCommentFromPost();
        if (post.commentIDs.length !== 0) {
          const allComments = await extractAllCommentFromPost(post);
          for (let query of queryList) {
            for (let comment of allComments) {
              if (comment.content.toLowerCase().includes(query)) {
                resultSet.add(post);
                added = true;
                break;
              }
            }
            if (added === true) {
              break;
            }
          }
        }
      }

      // convert set to an array and return it
      const resultList = Array.from(resultSet);

      return res.status(200).json(resultList);
    }
  } catch (err) {
    return res.status(500).json({
      status: "fail",
      message: err,
    });
  }
};

// update post vote by id
exports.votePost = async (req, res) => {
  // idea:
  // get specific post
  // check votes if current session user is in the votes
  // if so we check voteValue passed in body
  //  * if voteValue in body is same as one in votes => remove the vote / undo the upvote or downvote
  // * if it is different, then we do the opposite (ex: 1 vs. -1 --> convert vote to downvote)

  // assume val is either 1 or -1
  try {
    const { val } = req.body;

    // getting appropriate models:
    const post = await Post.findById(req.params.id);
    const voter = await User.findById(req.session.user.uid);
    const postCreator = await User.findById(post.postedBy);

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
    for (let i = 0; i < post.votes.length; i++) {
      if (post.votes[i].user.toString() === req.session.user.uid.toString()) {
        hasVoted = true;
        index = i;
        break;
      }
    }

    // new user vote:
    if (hasVoted === false) {
      post.votes.push({
        user: req.session.user.uid,
        voteValue: val,
      });

      // upvote or downvote depending on value passed (i.e. val pass to body should be of 1 or -1)
      post.voteCount += val;

      // update rep based on vote value
      if (val === 1) postCreator.reputation += 5;
      if (val === -1) postCreator.reputation -= 10;

      // save the changes:
      await post.save();
      await postCreator.save();
    } else {
      // if currently Stored value matches passed in value -> undo
      if (val === post.votes[index].voteValue) {
        // remove user from votes via splice():
        post.votes.splice(index, 1);

        // update voteCount to reflect the rermoval
        post.voteCount -= val;

        // undo rep change
        if (val === 1) {
          postCreator.reputation -= 5;
        }
        if (val === -1) {
          postCreator.reputation += 10;
        }

        await post.save();
        await postCreator.save();
      } else {
        // else swap and update
        // remove prev vote val
        post.voteCount -= post.votes[index].voteValue;

        // undo rep for old vote
        if (post.votes[index].voteValue === 1) {
          postCreator.reputation -= 5;
        }
        if (post.votes[index].voteValue === -1) {
          postCreator.reputation += 10;
        }

        // add new vote value:
        post.voteCount += val;

        // upvote = +5 on post creator | downvote = -10 on post creatorr reputationn
        if (val === 1) {
          postCreator.reputation += 5;
        }
        if (val === -1) {
          postCreator.reputation -= 10;
        }

        // update voteValue field in array:
        post.votes[index].voteValue = val;

        // save changes
        await post.save();
        await postCreator.save();
      }
    }

    return res.status(200).json(post);
  } catch (err) {
    return res.status(500).json({
      status: "fail",
      message: "Error - something went wrong when updating vote for post",
    });
  }
};

// edit post
exports.editPostById = async (req, res) => {
  try {
    let curFlairID = null;

    if (req.body.flair) {
      if (isValidObjectId(req.body.flair)) {
        curFlairID = req.body.flair; // this case flair will be passed as an id, if post already has post
      } else {
        // new content is passed to create new flair and get use the newly created flair's id
        const newFlair = await LinkFlair.create({ content: req.body.flair });
        curFlairID = newFlair._id;
      }
    }

    // update payload
    const updates = {
      title: req.body.title,
      content: req.body.content,
      linkFlairID: curFlairID,
    };

    // find thhe post itself and replace the parts to be updated with the payload
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Failed to edit post.",
    });
  }
};

// delete post (deleting post => cascade (delete all comments attached to said post))
// possible route: posts/delete/:id
exports.deletePostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res
        .status(404)
        .json({ status: "fail", message: "Post does not exist" });
    }
    // delete all comments from the post:
    // get all comments from post using commentUtils:
    const postComments = await extractAllCommentFromPost(post);

    console.log(postComments);

    // iteratively delete all of the comments
    for (const comment of postComments) {
      // await Comment.findByIdAndDelete(comment._id);
      await Comment.findByIdAndDelete(comment._id.toString());
    }

    // find community that has that post and remove the post id from the postIDs field via 'pull'
    await Community.findOneAndUpdate(
      { postIDs: { $in: [post._id] } },
      { $pull: { postIDs: post._id } },
      { new: true }
    );

    // finally delete the post itself
    await Post.findByIdAndDelete(req.params.id);

    return res
      .status(200)
      .json({ status: "success", message: "Post and comments deleted" });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// get all posts related to session id / user id
exports.getPostsByUserId = async (req, res) => {
  try {
    const uid = req.params.id; // now using dynamic ID, not session
    const posts = await Post.find({ postedBy: uid });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: "Failed to fetch posts by user.",
    });
  }
};
