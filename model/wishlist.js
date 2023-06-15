const mongoose = require('mongoose');

const whistlistSchema =new mongoose.Schema({

  userId: {
    type: String,
    required: true
    
  },
  products :[{
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"products",
        required: true
    }}]

});

const wishlist= mongoose.model("wishlist", whistlistSchema);

module.exports = wishlist