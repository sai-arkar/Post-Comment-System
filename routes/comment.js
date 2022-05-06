const express = require("express");
const router = express.Router();

const commentController = require("../controllers/comment");

router.post("/post-comment", commentController.postComment);

router.delete("/delete-comment/:aId/:cId", commentController.deleteComment);

module.exports = router;