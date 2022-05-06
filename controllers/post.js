const Post = require("../models/post");
const Author = require("../models/author");
const fileHelper = require("../middleware/file");
const path = require("path");

exports.createPost = (req, res, next)=>{
     const title = req.body.title;
     const description = req.body.description;

     if(!req.file){
          const error = new Error("Image Must Be Include!");
          error.statusCode = 409;
          throw error;
     }

     const imageUrl = req.file.path.replace("\\", "/");

     const post = new Post({
          title: title,
          description: description,
          image: imageUrl,
          authorId: req.body.authorId // Need to add jwt token and user id
     });
     post.save()
          .then(()=>{
               return Author.findById(req.body.authorId)
          })
          .then((author)=>{
               author.posts.push(post);
               return author.save();
          })
          .then((result)=>{
               res.status(201).json({
                    message: "Post Created",
                    post: post,
                    author: result
               });
          })
          .catch(err=>{
               if(!err.statusCode){
                    err.statusCode = 500;
               }
               next(err);
          })
}

exports.getAllPost = (req, res, next)=>{
     Post.find().populate("authorId")
          .then((posts)=>{
               res.status(200).json({
                    message: "Fetched Posts Successfully", 
                    posts: posts
               })
          })
          .catch(err=>{
               if(!err.statusCode){
                    err.statusCode = 500;
               }
               next(err);
          })
}

exports.getPost = (req, res, next)=>{
     const postId = req.params.postId;

     Post.findById(postId).populate("authorId")
          .then(post=>{
               if(!post){
                    const error = new Error("Post Not Found");
                    error.statusCode = 404;
                    throw error;
               }
               res.status(200).json({
                    message: "Fetch Post Successfully", 
                    post: post
               });
          })
          .catch(err=>{
               if(!err.statusCode){
                    err.statusCode = 500;
               }
               next(err);
          })
}

exports.deletePost = (req, res, next)=>{
     const postId = req.params.postId;
     const authorId = req.params.authorId;

     Post.findById(postId)
          .then((post)=>{
               if(!post){
                    const error = new Error("Post Not Found");
                    error.statusCode = 404;
                    throw error;
               }
               if(post.authorId.toString() !== authorId.toString()){
                    const error = new Error("Not Authorized!");
                    error.statusCode = 403;
                    throw error;
               }

               fileHelper.deleteFile(post.image);
               return Post.findByIdAndRemove(postId);
          })
          .then(()=>{
               return Author.findById(authorId);
          })
          .then((author)=>{
               author.posts.pull(postId);
               return author.save();
          })
          .then(()=>{
               res.status(200).json({
                    message: "Delete Post Successfully"
               });
          })
          .catch(err=>{
               if(!err.statusCode){
                    err.statusCode = 500;
               }
               next(err);
          })
}

exports.getEditPost = (req, res, next)=>{
     const editMode = req.query.edit;
     const authorId = req.params.authorId;
     const postId = req.params.postId;

     if(!editMode){
          const error = new Error("Not Authorized!");
          error.statusCode = 403;
          throw error;
     }
     Post.findById(postId)
          .then(post=>{
               if(post.authorId.toString() !== authorId.toString()){
                    const error = new Error("Not Authorized");
                    error.statusCode = 200;
                    throw error;
               }
               res.status(200).json({
                    message: "Fetch Edit Post", 
                    post: post
               });
          })
          .catch(err=>{
               if(!err.statusCode){
                    err.statusCode = 500;
               }
               next(err);
          })
}

exports.postEditPost = (req, res, next)=>{
     const authorId = req.body.authorId;
     const postId = req.body.postId;
     const title = req.body.title;
     const description = req.body.description;

     let imageUrl = req.body.image;
     if(req.file){
          imageUrl = req.file.path.replace('\\','/');
     }
     if(!imageUrl){
          const error = new Error('No file picked');
          error.statusCode = 422;
          throw error;
     }

     Post.findById(postId)
          .then((post)=>{
               if(!post){
                    const error = new Error("Post Not Found");
                    error.statusCode = 404;
                    throw error;
               }
               if(post.authorId.toString() !== authorId.toString()){
                    const error = new Error("Not Authorized");
                    error.statusCode = 403;
                    throw error;
               }
               if(imageUrl !== post.image){
                    fileHelper.deleteFile(post.image);
                    post.image = imageUrl;
               }

               post.title = title;
               post.description = description;
               post.authorId = authorId;

               return post.save();
          })
          .then((newPost)=>{
               console.log("Edit Post Successfully");
               res.status(201).json({
                    message: "Edit Post Successfully", 
                    post: newPost
               })
          })
          .catch(err=>{
               if(!err.statusCode){
                    err.statusCode = 500;
               }
               next(err);
          })
}