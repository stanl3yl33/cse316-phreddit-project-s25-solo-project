const express = require("express");
const communityController = require("./../controllers/communitiesController");
const authController = require("./../controllers/authenticateController");
const router = express.Router();

router
  .route("/")
  .get(communityController.getAllCommunities)
  .post(authController.validSession, communityController.createCommunity);

router
  .route("/:id")
  .get(communityController.getCommunityById)
  .patch(authController.validPermission, communityController.editCommunityById)
  .delete(authController.validPermission, communityController.deleteCommunity);

router.route("/:id/posts").get(communityController.getPostsFromCommunity);

// join and leave routes:
router
  .route("/:id/join")
  .patch(authController.validSession, communityController.joinCommunity);

router
  .route("/:id/leave")
  .patch(authController.validSession, communityController.leaveCommunity);

// get communities that users made route:
router
  .route("/user/:id")
  .get(authController.validSession, communityController.getCommunitiesByUserId);

module.exports = router;
