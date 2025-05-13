const express = require("express");
const authController = require("./../controllers/authenticateController");
const router = express.Router();

// Log in user
router.route("/login").post(authController.login);

// Log out user
router.route("/logout").post(authController.logout);

// Get current user session (optional, for client-side checking)
router.route("/session").get(authController.getSessionUser);

module.exports = router;
