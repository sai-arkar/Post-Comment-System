const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Author = require("../models/author");

exports.putSignup = (req, res, next)=>{
     const name = req.body.name;
     const email = req.body.email;
     const password = req.body.password;

     Author.findOne({email: email})
          .then(author=>{
               if(author){
                    const error = new Error("Email Already Exist!");
                    error.statusCode = 409;
                    throw error;
               }
               bcrypt.hash(password, 12)
                    .then(hashedPass =>{
                         const author = new Author({
                              name: name,
                              email: email,
                              password: hashedPass
                         });
                         return author.save();
                    })
                    .then(author=>{
                         console.log("Author Created!");
                         res.status(201).json({
                              message: "Author Created!",
                              author: author
                         })
                    })
          })
          .catch(err=>{
               if(!err.statusCode){
                    err.statusCode = 500;
               }
               next(err);
          })
}

exports.postLogin = (req, res, next)=>{
     const email = req.body.email;
     const password = req.body.password;
     let loadedUser;
     Author.findOne({email: email})
          .then(author=>{
               if(!author){
                    const error = new Error("A user with this email couldn't found!");
                    error.statusCode = 404;
                    throw error;
               }
               loadedUser = author;
               return bcrypt.compare(password, author.password);
          })
          .then((isEqual)=>{
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
          })
          .catch(err=>{
               if(!err.statusCode){
                    err.statusCode = 500;
               }
               next(err);
          })
}

exports.getAllAuthors = (req, res, next)=>{
     Author.find().populate("posts")
          .then((authors)=>{
               res.status(200).json({
                    message: "Fetch All Author Successfully", 
                    authors: authors
               });
          })
          .catch(err=>{
               if(!err.statusCode){
                    err.statusCode = 500;
               }
               next(err);
          })
}

exports.getAuthor = (req, res, next)=>{
     const authorId = req.params.authorId;

     // Fetch Author and his Created Posts
     Author.findById(req.authorId).populate("posts")
          .then((author)=>{
               if(!author){
                    const error = new Error("Author Not Found!");
                    error.statusCode = 404;
                    throw error;
               }
               res.status(200).json({
                    message: "Fetch Author Successfully", 
                    author: author
               });
          })
          .catch(err=>{
               if(!err.statusCode){
                    err.statusCode = 500;
               }
               next(err);
          })
}