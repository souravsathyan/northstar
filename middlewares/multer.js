const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads')
    },
    filename:(req,file,cb)=>{
        console.log(file);
        cb(null,Date.now()+path.extname(file.originalname))
    }
})
console.log('in multer');

const upload = multer({
    storage:storage
}).single('image')

module.exports={
    upload
}