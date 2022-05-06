const express = require("express");
const router = express.Router();

const postController = require("../controllers/post");

// Create Post
router.post("/post", postController.createPost);

// Fetch All Posts
router.get("/posts", postController.getAllPost);

// Delete Post
router.delete("/post/:authorId/:postId", postController.deletePost);

// Fetch One Post
router.get("/post/:postId", postController.getPost);

// Get Edit Post
router.get("/edit-post/:authorId/:postId", postController.getEditPost);

// Post Edit Post
router.post("/edit-post", postController.postEditPost);

module.exports = router;
