const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const orderModel = mongoose.Schema({

    address: {
        type: ObjectId
    },
    orderedItems: [
        {
            productId: {
                type: ObjectId,
                ref: 'products'
            },
            quantity: {
                type: Number,
            }
        }
    ],
    user: {
        type: ObjectId,
        ref: 'myUsers'
    },
    orderDate: Date,
    totalAmount: {
        type: Number
    },
    paymentMethod: {
        type: String
    },
    orderStatus: {
        type: String
    },

    realAmount: {
        type: Number,
    },
    couponAmount: {
        type: Number,
    },
    returnReason: {
        type: String
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('orders', orderModel)