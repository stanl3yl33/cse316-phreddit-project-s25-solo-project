const express = require("express");
const commentController = require("./../controllers/commentsController");
const authController = require("./../controllers/authenticateController");
const router = express.Router();

// for validPermission, need to set req.body.type

// route for getting all of the actual comments from a given post id
router.route("/post/:id").get(commentController.getAllCommentsFromPost);

router
  .route("/")
  .get(commentController.getAllComments)
  .post(authController.validSession, commentController.createComment);

router
  .route("/:id")
  .get(commentController.getCommentById)
  .patch(authController.validPermission, commentController.editCommentById)
  .delete(authController.validPermission, commentController.deleteCommentById);

router
  .route("/:id/vote")
  .patch(authController.validSession, commentController.voteComment);

// get top level replies to the comment (not entire thread)
router.route("/:id/replies").get(commentController.getReplies);

router
  .route("/user/:id")
  .get(authController.validSession, commentController.getCommentByUserId);

router
  .route("/post/title/:id")
  .get(authController.validSession, commentController.getRepliedPostTitle);

module.exports = router;
