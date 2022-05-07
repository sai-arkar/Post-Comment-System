const Comment = require("../models/comment");

exports.postComment = async (req, res, next)=>{
     const postId = req.body.postId;
     const authorId = req.body.authorId;
     const comment = req.body.comment;

     try{
          const c = new Comment({
               author: authorId,
               post: postId,
               comment: comment
          });
          let result = await c.save()
               // console.log(comment);
               res.status(201).json({
                    message: "Post Comment Successfully",
                    comment: result
               });
     }catch(err){
          if(!err.statusCode){
               err.statusCode = 500;
          }
          next();
     }
}

exports.deleteComment = async(req, res, next)=>{
     const authorId = req.params.aId;
     const commentId = req.params.cId;

     try{
          let comment = await Comment.findById(commentId);
          // console.log(comment)
               if(comment.author.toString() !== authorId.toString()){
                    const error = new Error("Not Authorized!");
                    error.statusCode = 401;
                    throw error;
               }
               await Comment.findByIdAndRemove(commentId);
               res.status(200).json({
                    message: "Delete Comment Successfully"
               });
     }catch(err) {
          const error = new Error(err);
          error.statusCode = 500;
          next(error);
     }
}