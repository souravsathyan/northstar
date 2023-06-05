// const { Result } = require("express-validator");
const usersData = require("../model/userModel");
const swal = require("sweetalert");
const orderData = require('../model/orderModel');
const { response } = require("express");
const ObjectId = require("mongoose").Types.ObjectId;
const productsData = require('../model/productModel')
const couponDatas = require('../model/couponModel')
const vocherGenerator = require('voucher-code-generator')



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
                    { _id: new ObjectId(orderId) },
                    { $set: { orderStatus: newStatus } })
                    .then((response) => {
                        console.log(response);
                        resolve(response)
                    })
            } catch (error) {
                reject(error)
            }
        })
    },
    totalSales: async () => {
        let result = await orderData.aggregate([
            {
                $match: {
                    orderStatus: { $nin: ['cancelled', 'return'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$totalAmount' }
                }
            }
        ])
        console.log(result);
        if (result.length > 0) {
            const totalRevenue = result[0].totalAmount;
            console.log("Total Revenue:", totalRevenue);
            return totalRevenue;
        } else {
            console.log("No orders found or all relevant orders are cancelled or refunded.");
            return 0;
        }
    },
    productCount: async () => {
        const result = await productsData.find()
        return result.length
    },
    orderCount: async () => {
        const result = await orderData.aggregate([
            { $match: { orderStatus: { $in: ['Delivered', 'placed'] } } }
        ])
        if (result.length > 0) {
            return result.length
        } else {
            console.log("No orders found or all relevant orders are cancelled or refunded.");
            return 0;
        }
    },
    getSalesDEtails: () => {
        return new Promise(async (resolve, reject) => {
            //matching the deliverd products
            const orders = await orderData.aggregate([
                { $match: { orderStatus: 'Delivered' } },
                {
                    $project: {
                        _id: 0,
                        orderDate: '$createdAt'
                    }
                }
            ])

            //datas that we render into the template
            let monthlyData = []
            let dailyData = []

            const monthsData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

            //creating map to store sales data as key value pair
            let monthlyMap = new Map();
            let dailyMap = new Map();

            //taking the sales data as key value pair
            orders.forEach((order) => {
                //getting the order date and taking the month
                const date = new Date(order.orderDate)
                const month = date.toLocaleDateString('en-GB', { month: 'short' })

                //if Map not have month data then we insert the month with 1 value {month:value}
                if (!monthlyMap.has(month)) {
                    monthlyMap.set(month, 1)
                } else {
                    //if already have that month then increment the value by 1
                    monthlyMap.set(month, monthlyMap.get(month) + 1)
                }
            })

            for (let i = 0; i < monthsData.length; i++) {
                //pushing the value to the monthsData that we will render it to ejs
                // const monthsData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                if (monthlyMap.has(monthsData[i])) {
                    monthlyData.push(monthlyMap.get(monthsData[i]))
                } else {
                    monthlyData.push(0)
                }
            }

            orders.forEach((order) => {
                const date = new Date(order.orderDate)
                const day = date.toLocaleDateString('en-GB', { weekday: 'long' })

                if (!dailyMap.has(day)) {
                    dailyMap.set(day, 1)
                } else {
                    dailyMap.set(day, dailyMap.get(day) + 1)
                }
            })

            for (let i = 0; i < days.length; i++) {
                if (dailyMap.has(days[i])) {
                    dailyData.push(dailyMap.get(days[i]))
                } else {
                    dailyData.push(0)
                }
            }

            resolve({ monthlyData: monthlyData, dailyData: dailyData })

        })
    },
    getAllDeliveredOrder: () => {
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
                    },
                    {
                        $match: {
                            orderStatus: 'Delivered'
                        }
                    }
                ]).then((response) => {
                    console.log(response, 'in the first response')
                    resolve(response)
                })
            } catch (error) {
                reject(error)
            }
        })
    },
    getDeliveredOrders: (startDate, endDate) => {
        return new Promise(async (resolve, reject) => {
            await orderData.find({ orderDate: { $gte: startDate, $lte: endDate }, orderStatus: 'Delivered' })
                .populate({
                    path: 'user',
                    model: 'myusers'
                })
                .lean()
                .then((result) => {
                    console.log(result[0].users);
                    resolve(result);
                }).catch((error)=>{
                    reject(error)
                })
        })
    },
    makeCoupon: (couponData) => {
        return new Promise(async (resolve, reject) => {

            const dateString = couponData.couponExpiry; //asiging it into a variable
            const [day, month, year] = dateString.split(/[-/]/); //spliting thedate format dd-mm-yyyy
            const date = new Date(`${year}-${month}-${day}`);//taking it to the yyyy-mm-dd
            const convertedDate = date.toISOString();//converting it into ISO format in database
            

            let couponCode = vocherGenerator.generate({ //COUPON CODE GENERATOR
                length: 6,
                count: 1,
                charset: vocherGenerator.charset("alphabetic")//in alphabetic
            });

            const coupon = await new couponDatas({//creating the coupon in the database
                couponName: couponData.couponName,
                code: couponCode[0],
                discount: couponData.couponAmount,
                expiryDate: convertedDate,
                minimumAmt:couponData.minimumAmt
            })

            await coupon.save()//saving the coupon in database
                .then(() => {
                    resolve(coupon._id)
                })
                .catch((error) => {
                    reject(error)
                })
        })
    },
    getAllCoupons: () => {
        return new Promise(async (resolve, reject) => {
            await couponDatas.find().lean()
                .then((result) => {
                    resolve(result)
                })
        })
    },

}


