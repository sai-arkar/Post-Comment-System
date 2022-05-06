const express = require("express");

const router = express.Router();

const Author = require("../models/author");
const authControllers = require("../controllers/auth");
const isAuth = require("../middleware/is-auth");

router.put("/signup", authControllers.putSignup);

router.post("/login", authControllers.postLogin);

router.get("/authors", isAuth, authControllers.getAllAuthors);

router.get("/author/:authorId", isAuth, authControllers.getAuthor);


module.exports = router;