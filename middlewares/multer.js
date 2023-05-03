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
console.log("in multer");

const upload = multer({
    storage: storage,
    // fileFilter:(req,file,cb)=>{
    //     if(file.mimetype=='image/png' || file.mimetype=='image/jpg' || file.mimetype=='image/jpeg'){
    //         cb(null,true);
    //     }else{
    //         cb(null,false);
    //         return cb(new Error('Only .png , .jpg , .jpeg format is allowed'))
    //     }
    // }
}).single("image");

module.exports = {
    upload,
};
