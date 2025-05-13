// comment related helper methods adapted from pa02 to pa033
const Comment = require("../models/comments");

//return list of all comments of a comment i.e the replies
async function extractAllReplies(cID) {
  // const comment = this.getCommentByID(cID);
  const comment = await Comment.findById(cID);

  if (!comment) return [];

  let replies = [];
  if (comment.commentIDs.length !== 0) {
    for (let x = 0; x < comment.commentIDs.length; x++) {
      const replyID = comment.commentIDs[x];
      const reply = await Comment.findById(replyID);

      replies.push(reply);

      // recursively call this method to extract the replies' reply
      // .concat() combines the list returned with the current replies list.
      replies = replies.concat(await extractAllReplies(replyID));
    }
  }

  return replies;
}

async function extractAllCommentFromPost(post) {
  if (!post || post.commentIDs.length === 0) {
    return [];
  }

  // gets all comments from post
  const commentList = [];

  for (let i = 0; i < post.commentIDs.length; i++) {
    const comment = await Comment.findById(post.commentIDs[i]);
    if (comment) commentList.push(comment);
  }

  let replies = [];

  // get all replies to comments on the post
  for (let i = 0; i < commentList.length; i++) {
    // spread the replies into replies array
    replies.push(...(await extractAllReplies(commentList[i]._id)));
  }

  // using spread operator combine both list into one list of all comment obj of post
  const combined = [...commentList, ...replies];
  return combined;
}

async function latestComment(post) {
  // no comment on post case:
  if (post.commentIDs.length === 0 || !post.commentIDs) {
    return null;
  }
  const comments = await extractAllCommentFromPost(post);
  if (comments.length === 0) return null;

  comments.sort((a, b) => b.commentedDate - a.commentedDate);

  // sorted from based on the newest comment on each post. hence index 0 => most recent comment / active
  return comments[0];
}

module.exports = {
  latestComment,
  extractAllCommentFromPost,
  extractAllReplies,
};
