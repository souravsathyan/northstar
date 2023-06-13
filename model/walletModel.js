const mongoose = require('mongoose')

const walletModel = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        require: true
    },
    walletBalance: {
        type: Number,
        default: 0
    }
})

const walletSchema = mongoose.model("walletDatas", walletModel);

module.exports = walletSchema