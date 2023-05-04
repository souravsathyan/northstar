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
},
    {
        timestamps: true
    }
)

const categoryDB = mongoose.model("category", categoryModel);

module.exports = categoryDB