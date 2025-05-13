const express = require("express");
const postController = require("./../controllers/postsController");
const authController = require("./../controllers/authenticateController");
const router = express.Router();

// need to use validation middlware now

// router.route("/search/:search").get(postController.searchPosts);
// get request to this route: ..../search?q=aitj for example
router.route("/search").get(postController.searchPosts);

// get all post, create post
router
  .route("/")
  .get(postController.getAllPost)
  .post(authController.validSession, postController.createPost);

// get specific post by id:
// delete post by id
// edit post by id
router
  .route("/:id")
  .get(postController.getPostById)
  .delete(authController.validPermission, postController.deletePostById)
  .patch(authController.validPermission, postController.editPostById);

// post for getting post to edit:
// needed because regular get id updates post view count
router.route("/edit/:id").get(postController.getEditPostById);

router.route("/:id/replies").get(postController.getPostReplies);

router
  .route("/:id/vote")
  .patch(authController.validSession, postController.votePost);

router
  .route("/user/:id")
  .get(authController.validSession, postController.getPostsByUserId);

module.exports = router;
