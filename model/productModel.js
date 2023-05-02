const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
   prodName:{
    type:String,
    required:true,
    unique:true
   },
   prodDescription:{
    type:String
   },
   prodBrand:{
    type:String,
    required:true
   },
   prodPrice:{
    type:Number,
    required:true
   },
   prodPromoPrice:{
    type:Number,
   },
   prodQuantity:{
    type:Number
   },

   prodColor:{
    type:String
   },

   prodSize:{
    type:String,
    required:true
   },

   prodStatus:{
    type:Boolean,
    default:true
   },

   prodCategory:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"categories",
   },
   prodImage:{
    type:String,
    required:true
   }

})

const productData = mongoose.model('products', productSchema);

module.exports = productData;