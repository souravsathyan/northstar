const mongoose = require('mongoose')

const couponModel = new mongoose.Schema({

    couponName: {
        type: String,
        require: true,
    },
    code: {
        type: String,
        require: true,
        unique: true,
        uppercase: true
    },
    discount: {
        type: Number,
        require: true,
        min: 0,
        max: 1000
    },
    minimumAmt:{
        type: Number,
        require: true
    },
    expiryDate: {
        type: Date,
        require: true
    },
    usedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    ],
    isActive: {
        type: String,
        enum: ["Active", "Expired"],
        default: 'Active'
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})
couponModel.pre('save', function (next) {
    const now = new Date();
    if (this.expiryDate < now) {
        this.isActive = "Expired";
    } else {
        this.isActive = "Active";
    }
    next();
})

const coupons = mongoose.model("coupons", couponModel);

module.exports = coupons