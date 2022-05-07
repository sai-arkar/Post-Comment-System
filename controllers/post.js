const Post = require("../models/post");
const Author = require("../models/author");
const fileHelper = require("../middleware/file");
const Comment = require("../models/comment");

exports.createPost = async (req, res, next)=>{
     const title = req.body.title;
     const description = req.body.description;

     if(!req.file){
          const error = new Error("Image Must Be Include!");
          error.statusCode = 409;
          throw error;
     }

     const imageUrl = req.file.path.replace("\\", "/");

     try{
          const post = new Post({
               title: title,
               description: description,
               image: imageUrl,
               authorId: req.body.authorId // Need to add jwt token and user id
          });
          await post.save()
          let author = await Author.findById(req.body.authorId)
               author.posts.push(post);

          let result = await author.save();
               res.status(201).json({
                    message: "Post Created",
                    post: post,
                    author: result
               });
     }catch(err){
          if(!err.statusCode){
               err.statusCode = 500;
          }
          next(err);
     }
}

exports.getAllPost = async (req, res, next)=>{
     try{
          let posts = await Post.find().populate("authorId")
               res.status(200).json({
                    message: "Fetched Posts Successfully", 
                    posts: posts
               })
     }catch(err){
          if(!err.statusCode){
               err.statusCode = 500;
          }
          next(err);
     }
}

exports.getPost = async (req, res, next)=>{
     const postId = req.params.postId;

     try{
          let post = await Post.findById(postId).populate("authorId");
               if(!post){
                    const error = new Error("Post Not Found");
                    error.statusCode = 404;
                    throw error;
               }
               res.status(200).json({
                    message: "Fetch Post Successfully", 
                    post: post
               });
     }catch(err){
          if(!err.statusCode){
               err.statusCode = 500;
          }
          next(err);
     }
}

exports.deletePost = async (req, res, next)=>{
     const postId = req.params.postId;
     const authorId = req.params.authorId;

     try{
          let post = await Post.findById(postId);
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
          await Comment.deleteMany({post: postId});

          await Post.findByIdAndRemove(postId);

          let author = await Author.findById(authorId);
               author.posts.pull(postId);

          await author.save();
               res.status(200).json({
                    message: "Delete Post Successfully"
               });
     }catch(err){
          if(!err.statusCode){
               err.statusCode = 500;
          }
          next(err);
     }
}

exports.getEditPost = async (req, res, next)=>{
     const editMode = req.query.edit;
     const authorId = req.params.authorId;
     const postId = req.params.postId;

     if(!editMode){
          const error = new Error("Not Authorized!");
          error.statusCode = 403;
          throw error;
     }
     try{
          let post = await Post.findById(postId)
               if(post.authorId.toString() !== authorId.toString()){
                    const error = new Error("Not Authorized");
                    error.statusCode = 200;
                    throw error;
               }
               res.status(200).json({
                    message: "Fetch Edit Post", 
                    post: post
               });
     }catch(err){
          if(!err.statusCode){
               err.statusCode = 500;
          }
          next(err);
     }
}

exports.postEditPost = async (req, res, next)=>{
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

     try{
          let post = await Post.findById(postId);
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

          let newPost = await post.save();
               console.log("Edit Post Successfully");
               res.status(201).json({
                    message: "Edit Post Successfully", 
                    post: newPost
               });
     }catch(err){
          if(!err.statusCode){
               err.statusCode = 500;
          }
          next(err);
     }
}