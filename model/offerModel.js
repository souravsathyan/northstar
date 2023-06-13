const mongoose = require('mongoose')

const offerModel = new mongoose.Schema({

    offerName: {
        type: String,
        require: true,
    },
    discount: {
        type: Number,
        require: true,
    },
    expiryDate: {
        type: Date,
        require: true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId
    },
    offerApplied:{
        type:Boolean
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

const offers = mongoose.model("offers", offerModel);

module.exports = offers