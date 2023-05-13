const connection = require('../config/connection');
const bcrypt = require('bcrypt');
const usersData = require('../model/userModel');
const twilio = require('../api/twilio');
const { response } = require('../app');
const mongoose = require('mongoose');
const productData = require('../model/productModel');
const ObjectId = require("mongoose").Types.ObjectId;
const cartDB = require('../model/cartModel');
const { resolveInclude } = require('ejs');

module.exports = {
    //user sign up 
    doSignUp: (userData) => {
        return new Promise(async (resolve, reject) => {
            console.log(userData);
            const isUserExists = await usersData.findOne({ $or: [{ email: userData.Email }, { phone: userData.Mobile }, { name: userData.name }] })
            try {
                if (!isUserExists) {
                    userData.Password = await bcrypt.hash(userData.Password, 10)
                    console.log(userData);
                    usersData.create({
                        name: userData.Name,
                        email: userData.Email,
                        phone: userData.Mobile,
                        password: userData.Password
                    }).then((data) => {
                        resolve(data)
                    }).catch((error) => {
                        reject(error)
                    })
                } else {
                    resolve({ isUserExists: true })
                }
            } catch (error) {
                console.error(error.message);
            }

        })
    },
    //user login
    doLogin: (userData) => {
        console.log(userData);
        return new Promise(async (resolve, reject) => {
            //finds user by the email
            let user = await usersData.findOne({ email: userData.Email })
            console.log(user);
            let response = {}
            try {
                if (user) {
                    //comparing the entered password 
                    bcrypt.compare(userData.Password, user.password).then((status) => {
                        //if user is blocked 
                        if (user.blocked) {
                            response.blocked = true
                            resolve({
                                response
                            })
                        }
                        //if compared success assiging user and status to an empty object
                        //and resolving it 

                        else if (status) {
                            response.user = user
                            response.status = true
                            console.log('login success');
                            resolve(response)
                        } else {
                            console.log('login failure1');
                            resolve({ status: false })
                        }
                    })
                } else {
                    console.log('login failure2');
                    resolve({ status: false })
                }
            } catch (error) {
                console.error(error);
            }

        })
    },
    //sending Otp
    sendOtp: (phoneNo) => {
        return new Promise(async (resolve, reject) => {
            try {
                let response = {}
                //finding the user by the phone no.
                const existingUser = await usersData.findOne({ phone: phoneNo });
                //if no resolve it with false status
                if (!existingUser) {
                    response.status = false
                    console.log('non-existing user');
                    resolve(response);
                } //if yes resolve it with true status also with user
                else {
                    twilio.sendOTP(phoneNo)
                    response.status = true
                    response.user = existingUser
                    console.log('OTP sent');
                    resolve(response)
                }
            } catch (error) {
                console.log(error);
                reject(error);
            }
        })
    },
    //verifying otp
    otpVerification: (phoneNo, otpValues) => {
        try {
            let response = {}
            return new Promise(async (resolve, reject) => {
                let verifiedOtp = await twilio.verifyOtp(phoneNo, otpValues)
                if (verifiedOtp) {
                    response.status = true
                    resolve(response)
                } else {
                    response.stats = false
                    resolve(response)
                }
            })
        } catch (error) {
            console.log(error);
        }
    },
    //updating password
    newPassword: (newPwd, userID) => {
        return new Promise(async (resolve, reject) => {
            try {
                // const objectId = new ObjectId(userID);
                //bycrypting the new password
                let hashedPassword = await bcrypt.hash(newPwd, 10)
                console.log(hashedPassword + '   ------pwd hashed');
                //updating the user password
                await usersData.updateOne(
                    { _id: userID },
                    { $set: { password: hashedPassword } })
                    .then((response) => {
                        resolve()
                    })
                console.log('password updated');
            } catch (error) {
                console.log(error);
            }
        })
    },
    //getting the product
    getProductView: (prodId) => {
        return new Promise(async (resolve, reject) => {
            await productData.findById({ _id: prodId })
                .then((response) => {
                    console.log(response + 'got product');
                    resolve(response)
                })
                .catch((error) => {
                    console.log(error);
                })

        })
    },
    //******CART MANAGEMENT ******/
    //ADDING TO CART
    addToCart: (prodId, userId) => {
        //creating a new doc. in cart collection
        //with userId and ProdId[]
        //if the user had a cart then -> push prod ID to prodID[]
        //if no cart then create a NEW ONE
        return new Promise(async (resolve, reject) => {
            try {
                let existingCart = await cartDB.findOne({ userId: new ObjectId(userId) })
                if (existingCart) {
                    console.log('exisiting cart');
                    let exisitingProd = existingCart.products.findIndex(product => product.productId == prodId)
                    if (exisitingProd !== -1) {
                        await cartDB.updateOne(
                            { userId: new ObjectId(userId), 'products.productId': new ObjectId(prodId) },
                            {
                                $inc: { "products.$.quantity": 1 }
                            }
                        )
                        console.log('quantity increased');
                    } else {
                        await cartDB.updateOne(
                            { userId: new ObjectId(userId) },
                            {
                                $push: { products: { productId: new ObjectId(prodId) } }
                            }
                        )
                    }
                    resolve()
                } else {
                    await cartDB.create({
                        userId: new ObjectId(userId),
                        products: [{ productId: new ObjectId(prodId) }]
                    })
                    console.log('product created');
                    resolve()
                }
            } catch (error) {
                console.log(error);
                reject(error)
            }
        })
    },
    //GETTING THE CART COUNT
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await cartDB.findOne({ userId: new ObjectId(userId) })
            let count = 0
            console.log(cart);
            if (cart) {
                count = cart.prodId.length
                console.log('cart count is ' + count);
            }
            console.log('resolved cart count');
            resolve(count)
        })
    },
    //GETTING THE CART PAGE
    getCart: (userID) => {
        return new Promise((resolve, reject) => {
            cartDB.findOne({ userId: userID }).populate({
                path: 'products.productId',
                model: productData,
                select: 'prodName prodDescription prodBrand prodPrice prodQuantity prodColor prodSize prodImage'
            }).then((cart) => {
                console.log(cart, 'its the cart page');
                resolve(cart)
            }).catch((error) => {
                reject()
            })

        })
    },
    //CHANGING THE CART QTY WHEN BTN CLICKED
    changeQtyByButton: (cartId, prodId, count, quantity) => {
        count = parseInt(count)
        quantity = parseInt(quantity)
        return new Promise(async (resolve, reject) => {
            if (count == -1 && quantity == 1) {
                cartDB.updateOne(
                    { _id: new ObjectId(cartId) },
                    {
                        $pull: { products: { productId: new ObjectId(prodId) } }
                    }).then((response) => {
                        resolve({ removeProduct: true })
                    })
            } else {
                cartDB.updateOne(
                    {
                        _id: new ObjectId(cartId),
                        'products.productId': new ObjectId(prodId)
                    },
                    {
                        $inc: { 'products.$.quantity': count }
                    }
                ).then((response) => {
                    resolve({ qtyChanged: true })
                }).catch((error) => {
                    reject(error)
                })
            }
        })
    },

    //FINDING THE TOTAL AMT
    getTotalAmt: async (userId) => {
        try {
            let total = await cartDB.aggregate([
                {
                    $match: { userId: new ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "products.productId",
                        foreignField: "_id",
                        as: "product"
                    }
                },
                {
                    $project: {
                        _id: 0,
                        'product.prodName': 1,
                        'product.prodPrice': 1,
                        quantity: '$products.quantity',
                        totalPrice: { $multiply: ['$products.quantity', { $arrayElemAt: ['$product.prodPrice', 0] }] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$totalPrice' }
                    }
                }
            ])
            return total[0].total
        } catch (error) {
            console.log(error);
        }

    }
}

