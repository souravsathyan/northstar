const mongoose = require('mongoose')

const categoryModel = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }, description: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
},
{
    timestamps:true
}
)

const categoryDB = mongoose.model("category", categoryModel);

module.exports = categoryDB