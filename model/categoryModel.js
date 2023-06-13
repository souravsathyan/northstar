const mongoose = require('mongoose')

const categoryModel = new mongoose.Schema({
    name: {
        type: String,

    }, 
    description: {
        type: String,

    },
    status: {
        type: Boolean,
        default: true
    },
    offerApplied:{
        type:Boolean,
        default:false
    }
},
    {
        timestamps: true
    }
)

const categoryDB = mongoose.model("category", categoryModel);

module.exports = categoryDB