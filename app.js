const express = require("express");
const mongoose = require("mongoose");

const app = express();

const uri = "mongodb+srv://root:root@cluster0.hl7kn.mongodb.net/Post-Comment-System?retryWrites=true&w=majority";

const authRoutes = require("./routes/auth");
const feedRoutes = require("./routes/feed");

app.use(express.json());

const fileStorge = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'images');
    },
    filename: (req, file, cb)=>{
        // cb(null, file.originalname);
       cb(null, uuidv4.v4() + '-' + file.originalname);
    }
});
 
const fileFilter = (req, file, cb)=>{
    if(
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' 
    ){
        cb(null, true);
    } else{
        cb(null, false);
    }
}


app.use(express.json()); // application/json
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
    multer({storage: fileStorge, fileFilter: fileFilter}).single('image')
);

app.use("/auth", authRoutes);
app.use("/feed", feedRoutes);

app.use((req, res, next)=>{
     res.setHeader('Access-Control-Allow-Origin', '*');
     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
     res.setHeader('Access-Control-Allow-Credentials', true);
     next();
})



mongoose.connect(uri)
    .then(()=>{
        console.log("Connected");
        app.listen(3000);
    })
    .catch(err=>{
        console.log(err);
    })