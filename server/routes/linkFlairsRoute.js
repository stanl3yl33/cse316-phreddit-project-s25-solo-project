const express = require("express");
const linkFlairController = require("./../controllers/linkFlairsController");
const router = express.Router();

router.route("/").get(linkFlairController.getAllLinkFlairs);
router.route("/:id").get(linkFlairController.getLinkFlairById);

module.exports = router;
