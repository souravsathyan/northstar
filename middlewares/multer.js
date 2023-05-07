const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
}).array('images',4)


module.exports = {
    upload
};


// fileFilter:(req,file,cb)=>{
    // if(file.mimetype=='image/png' || file.mimetype=='image/jpg' || file.mimetype=='image/jpeg'){
        // cb(null,true);
    // }else{
        // console.log('only jpg jpeg png files are allowed');
        // cb(null,false);           
    // }
// },
// limits:{
    // fileSize:1024*2
// }
