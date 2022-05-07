const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Author = require("../models/author");

exports.putSignup = async (req, res, next)=>{
     const name = req.body.name;
     const email = req.body.email;
     const password = req.body.password;

     try{
          let author = await Author.findOne({email: email})
               if(author){
                    const error = new Error("Email Already Exist!");
                    error.statusCode = 409;
                    throw error;
               }
          let hashedPass = await bcrypt.hash(password, 12)
               const newAuthor = new Author({
                    name: name,
                    email: email,
                    password: hashedPass
               });
          let result = await newAuthor.save();
               console.log("Author Created!");
               res.status(201).json({
                    message: "Author Created!",
                    author: result
               })
     }catch(err){
          if(!err.statusCode){
               err.statusCode = 500;
          }
          next(err);
     }
}

exports.postLogin = async (req, res, next)=>{
     const email = req.body.email;
     const password = req.body.password;
     let loadedUser;

     try{
          let author = await Author.findOne({email: email});
               if(!author){
                    const error = new Error("A user with this email couldn't found!");
                    error.statusCode = 404;
                    throw error;
               }
               loadedUser = author;
          let isEqual = await bcrypt.compare(password, author.password);
               if(!isEqual){
                    const error = new Error("Wrong Password!");
                    error.statusCode = 401;
                    throw error;
               }
               const token = jwt.sign({
                    email: loadedUser.email,
                    authorId: loadedUser._id.toString()
               },
               "thisissupersupersecretYeah",
               {expiresIn: '1h'}
               );
               res.status(200).json({
                    message: "Login Successfully",
                    token : token,
                    authorId: loadedUser._id.toString()
               });
     }catch(err){
          if(!err.statusCode){
               err.statusCode = 500;
          }
          next(err);
     }
}

exports.getAllAuthors = async (req, res, next)=>{
     try{
          let authors = await Author.find().populate("posts")
               res.status(200).json({
                    message: "Fetch All Author Successfully", 
                    authors: authors
               });
     }catch(err){
          if(!err.statusCode){
               err.statusCode = 500;
          }
          next(err);
     }
}

exports.getAuthor = async (req, res, next)=>{
     const authorId = req.params.authorId;

     // Fetch Author and his Created Posts
     try{
          let author = await Author.findById(req.authorId).populate("posts")
               if(!author){
                    const error = new Error("Author Not Found!");
                    error.statusCode = 404;
                    throw error;
               }
               res.status(200).json({
                    message: "Fetch Author Successfully", 
                    author: author
               });
     }catch(err){
          if(!err.statusCode){
               err.statusCode = 500;
          }
          next(err);
     }
}