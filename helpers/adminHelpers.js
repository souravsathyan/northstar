// const { Result } = require("express-validator");
const usersData = require("../model/userModel");
const swal = require("sweetalert");
const orderData = require('../model/orderModel');
const { response } = require("express");
const ObjectId = require("mongoose").Types.ObjectId;


module.exports = {
    getUsers: () => {
        let usersList = []
        return new Promise(async (resolve, reject) => {
            try {

                await usersData
                    .find()
                    // .exec()
                    .then((result) => {
                        usersList = result
                    })

                resolve(usersList)
            } catch (error) {
                reject(error)
            }
        })
    },
    blockUser: (user_id) => {
        try {
            return new Promise(async (resolve, reject) => {
                await usersData
                    .updateOne({ _id: user_id }, { $set: { blocked: true } })
                    .then((data) => {
                        resolve()
                    })
            })
        } catch (error) {
            reject(error)
        }
    },
    unblockUser: (user_id) => {
        try {
            return new Promise(async (resolve, reject) => {
                await usersData
                    .updateOne({ _id: user_id }, { $set: { blocked: false } })
                    .then((data) => {
                        resolve()
                    })
            })
        } catch (error) {
            reject(error)
        }
    },
    getAllOrder: () => {
        return new Promise((resolve, reject) => {
            try {

                orderData.aggregate([
                    {
                        $lookup: {
                            from: 'myusers',
                            localField: 'user',
                            foreignField: '_id',
                            as: 'users'
                        }
                    }
                ]).then((response) => {
                    resolve(response)
                })
            } catch (error) {
                reject(error)
            }
        })
    },
    getOrderAddressDetails: async (orderId) => {
        try {
            let addressDetails = await orderData.aggregate([
                {
                    $match: { _id: new ObjectId(orderId) }
                },
                {
                    $lookup: {
                        from: 'addresses',
                        localField: 'address',
                        foreignField: '_id',
                        as: 'orderAddress'
                    }
                }
            ])
            return addressDetails
        } catch (error) {
            throw new Error('Error getting order Address: ' + error);
        }

    },
    getOrderItemDetails: async (orderId) => {

        try {
            let orderProducts = await orderData.aggregate([
                {
                    $match: { _id: new ObjectId(orderId) }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'orderedItems.productId',
                        foreignField: '_id',
                        as: 'orderProducts'
                    }
                }
            ])
            return orderProducts
        } catch (error) {
            throw new Error('Error getting order Address: ' + error);
        }

    },
    getChangeStatus: (changedStatus, orderId) => {
        return new Promise((resolve, reject) => {
            try {
                let newStatus = changedStatus.selectedValue
            orderData.updateOne(
                { _id: new ObjectId (orderId) },
                { $set: { orderStatus: newStatus } })
                .then((response) => {
                    console.log(response);
                    resolve(response)
                })
            } catch (error) {
                reject(error)
            }
        })
    }
}


