const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,

    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    blocked: {
        type: Boolean,
        default: false,
    },
    profilePic:{
        type:String
    },

})

const usersData = mongoose.model('myusers', userSchema);

module.exports = usersData;