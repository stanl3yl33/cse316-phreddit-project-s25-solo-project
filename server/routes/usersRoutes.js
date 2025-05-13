const express = require("express");
const userController = require("./../controllers/usersController");
const authController = require("./../controllers/authenticateController");

const router = express.Router();

// Get all users
router.route("/").get(userController.getAllUsers);

// Get specific user info by ID
router.route("/:id").get(userController.getUserById);

// Admin deletes a user (with cascade deletion)
router
  .route("/:id/delete")
  .delete(authController.validAdmin, userController.deleteUserById);

// register route
router.route("/register").post(userController.registerUser);

// for register form (checking duplicate info via back end)
router.route("/check-duplicate-email").post(userController.checkEmail);
router.route("/check-duplicate-name").post(userController.checkDisplayName);

// updating reputation
router
  .route("/:id/reputation")
  .patch(authController.validSession, userController.updateRep);

module.exports = router;
