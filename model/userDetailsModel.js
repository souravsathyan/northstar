const mongoose=require('mongoose');
const ObjectId=mongoose.Types.ObjectId;

const userDetailsModel=mongoose.Schema({

    userId:ObjectId,
    profilePic:String,
    DOB:String,
    setAccount:{
        type:Boolean,
        default:false
    }

},{
    timestamps:true
})


module.exports=mongoose.model('userDetails',userDetailsModel);