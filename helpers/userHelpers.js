const connection = require('../config/connection');
const bcrypt = require('bcrypt');
const usersData = require('../model/userModel');
const twilio = require('../api/twilio');
const { response } = require('../app');
const mongoose = require('mongoose');
const productData = require('../model/productModel');
const ObjectId = require("mongoose").Types.ObjectId;
const addressData = require('../model/addressModel')
const cartDB = require('../model/cartModel');
const { resolveInclude } = require('ejs');
const orderData = require('../model/orderModel')
const userProfileData = require('../model/userDetailsModel');

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
                reject(error)
            }

        })
    },
    //user login
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            //finds user by the email
            let user = await usersData.findOne({ email: userData.Email })
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
                    }).catch((error) => {
                        reject(error)
                    })
                } else {
                    console.log('login failure2');
                    resolve({ status: false })
                }
            } catch (error) {
                reject(error)
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
            reject(error)
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
                reject(error)
            }

        })
    },
    //getting the product
    getProductView: (prodId) => {
        return new Promise(async (resolve, reject) => {
            try {
                await productData.findById({ _id: prodId })
                    .then((response) => {
                        console.log(response + 'got product');
                        resolve(response)
                    })
            } catch (error) {
                reject(error)
            }
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
                        //if existing prod inc qty by 1
                        await cartDB.updateOne(
                            { userId: new ObjectId(userId), 'products.productId': new ObjectId(prodId) },
                            {
                                $inc: { "products.$.quantity": 1 }
                            }
                        )
                        console.log('quantity increased');
                    } else {
                        //if not existing then push the prodId to array
                        await cartDB.updateOne(
                            { userId: new ObjectId(userId) },
                            {
                                $push: { products: { productId: new ObjectId(prodId) } }
                            }
                        )
                    }
                    resolve()
                } else {
                    //if no cart create the cart with userId and prodId
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
    getCartCount: async (userId) => {
        //using the aggregation
        //first matching the doc with user Id 
        //then creating each doc for elems in products Array
        //then grouping the sum of Quantity = gets the total qty
        let cartCount = await cartDB.aggregate([
            { $match: { userId: new ObjectId(userId) } },
            { $unwind: '$products' },
            { $group: { _id: null, totalQty: { $sum: '$products.quantity' } } }
        ])
        return cartCount
    },
    //TODO cart count
    //GETTING THE CART PAGE
    getCart: (userID) => {
        return new Promise((resolve, reject) => {
            try {
                cartDB.findOne({ userId: userID }).populate({
                    path: 'products.productId',
                    model: productData,
                    select: 'prodName prodDescription prodBrand prodPrice prodQuantity prodColor prodSize prodImage'
                }).then((cart) => {
                    console.log(cart, 'its the cart page');
                    resolve(cart)
                })
            } catch (error) {
                reject(error)
            }
        })
    },
    //CHANGING THE CART QTY WHEN BTN CLICKED
    changeQtyByButton: (cartId, prodId, count, quantity) => {
        count = parseInt(count)
        quantity = parseInt(quantity)
        //if cart Qty is 1 and the count is -1 then we remove the product from the cart
        return new Promise(async (resolve, reject) => {
            try {
                if (count == -1 && quantity == 1) {
                    cartDB.updateOne(
                        { _id: new ObjectId(cartId) },
                        {
                            $pull: { products: { productId: new ObjectId(prodId) } }
                        }).then((response) => {
                            resolve({ removeProduct: true })
                        })
                } else {
                    //else we update the cart qty by the count we get
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
                    })
                }
            } catch (error) {
                reject(error)
            }
        })
    },

    //FINDING THE TOTAL AMT
    getTotalAmt: async (userId) => {
        //marching the docs with userID 
        //creating seperate docs for products Array
        //lookup with product collection -> retrieving the product details in 'product field'
        //using project taking product price product Name and in totalPrice field we multiply the prodQty with the price for each doc
        //by grouping we find the sum of totalPrice of all doc 
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
            reject(error)
        }

    },
    addAddress: (data, userId) => {
        return new Promise((resolve, reject) => {
            try {
                addressData.create({
                    firstName: data.fname,
                    lastName: data.lname,
                    mobile: data.phone,
                    emailId: data.email,
                    address: data.address,
                    city: data.city,
                    state: data.state,
                    country: data.country,
                    pincode: data.pincode,
                    userId: new ObjectId(userId)
                }).then((response) => {
                    resolve()
                })
            } catch (error) {
                reject(error)
            }
        })
    },
    setupUserProfile:(userId,data,image)=>{
        return new Promise(async (resolve, reject) => {
          try {
                const userProfile = await userProfileData.create({
                    userId: userId,
                    profilePic:image.filename,
                    DOB:data.DOB,
                    setAccount:true
                })
                resolve();
            } catch (error) {
                reject(error)
          }  
        })
    },
    //TODO edit full user profile 
    // editProfile:(userId,data,newImage)=>{
    //     return new Promise( async (resolve, reject) => {
    //         if (newImg) {
    //             updatedProduct = await products.findByIdAndUpdate(
    //               { _id: userId },
    //               {
    //                DOB:data.DOB,

    //               }
    //             );
    //           } else {
    //             //if no product image then update the project with no image
    //             updatedProduct = await products.findByIdAndUpdate(
    //               { _id: prodId },
    //               {
                    
    //               }
    //             );
    //           }
    //     })
    // },

    placeOrder: (order, products, total, userId) => {
        console.log(order, products, total, userId);
        return new Promise(async (resolve, reject) => {
            try {
                let status = order.paymentType === 'COD' ? 'placed' : 'pending'
                const orderDetails = await orderData.create({
                    address: order.address,
                    orderedItems: products,
                    user: userId,
                    totalAmount: total,
                    paymentMethod: order['paymentType'],
                    orderStatus: status,
                    orderDate: new Date()
                })
                await cartDB.findOneAndRemove({ userId: new ObjectId(userId) })
                const response = {
                    status: true,
                    orderId: orderDetails._id
                }
                resolve(response)
            } catch (error) {
                reject(error)
            }
        })
    },
    getCartProducts: async (userId) => {
        let cart = await cartDB.findOne({ userId: new ObjectId(userId) })
        return cart.products
    },
    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let orderDetails = await orderData.aggregate([
                    { $match: { user: new ObjectId(userId) } },
                    {
                        $lookup: {
                            from: 'addresses',
                            localField: 'address',
                            foreignField: '_id',
                            as: 'address'
                        }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'orderedItems.productId',
                            foreignField: '_id',
                            as: 'products'
                        }
                    }
                ])
                resolve(orderDetails)
            } catch (error) {
                reject(error)
            }
        })
    },
    getUserDetails: async (userId) => {
        let userDetails =await userProfileData.aggregate([
            {$match:{userId: new ObjectId(userId)}},
            {
                $lookup:{
                    from: 'myusers',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            }
        ])
        console.log(userDetails);
        return userDetails
    },
    updateAddress: (newAddress) => {
        return new Promise(async (resolve, reject) => {
            try {
                await addressData.findByIdAndUpdate(
                    { _id: new ObjectId(newAddress.addressId) },
                    {
                        firstName: newAddress.fname,
                        lastName: newAddress.lname,
                        mobile: newAddress.phone,
                        emailId: newAddress.email,
                        address: newAddress.address,
                        city: newAddress.city,
                        state: newAddress.state,
                        country: newAddress.country,
                        pincode: newAddress.pincode,

                    }).then((response) => {
                        resolve()
                    })
            } catch (error) {
                reject(error)
            }
        })
    },


}

