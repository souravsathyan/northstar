const mongoose=require('mongoose');
const ObjectId=mongoose.Types.ObjectId;

const addressModel=mongoose.Schema({

    firstName:String,
    lastName:String,
    mobile:Number,
    emailId:String,
    address:String,
    city:String,
    state:String,
    country:String,
    pincode:Number,
    userId:ObjectId

},{
    timestamps:true
})


module.exports=mongoose.model('address',addressModel)