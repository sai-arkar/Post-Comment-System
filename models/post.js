const mongoose = require("mongoose");

const Scheam = mongoose.Schema;

const postSchema = new Scheam({
          title: {
               type: String,
               required: true
          },
          description: {
               type: String,
               required: true
          },
          image: {
               type: String,
               required: true
          },
          authorId: {
               type: Scheam.Types.ObjectId,
               ref: "Author",
               required: true
          }
     },
     {timestamps: true}
);

module.exports = mongoose.model("Post", postSchema);