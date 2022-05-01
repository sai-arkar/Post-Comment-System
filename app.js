const express = require("express");
const mongoose = require("mongoose");

const app = express();

const uri = "mongodb+srv://root:root@cluster0.hl7kn.mongodb.net/Post-Comment-System?retryWrites=true&w=majority";

mongoose.connect(uri)
    .then(()=>{
        console.log("Connected");
        app.listen(3000);
    })
    .catch(err=>{
        console.log(err);
    })