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
const Razorpay = require('razorpay');
var instance = new Razorpay({
    key_id: process.env.RAZ_KEY_ID,
    key_secret: process.env.RAZ_SECRET_KEY,
});
const couponDatas = require('../model/couponModel')
const productHelpers = require('../helpers/productHelpers');
const walletSchema = require('../model/walletModel');
const wishlistSchema = require('../model/wishlist')



module.exports = {
    //user sign up 
    doSignUp: (userData) => {
        return new Promise(async (resolve, reject) => {
            console.log(userData);
            const isUserExists = await usersData.findOne({ $or: [{ email: userData.Email }, { phone: userData.Mobile },] })
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
                await productData.findOne({ slug: prodId })
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
            if (total.length > 0) {
                return total[0].total;
            } else {
                // Cart is empty, return 0
            }
        } catch (error) {
            throw new Error('Error getting order Address: ' + error);
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
    // setupUserProfile: (userId, data, image) => {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //               await usersData.create({
    //                 userId: userId,
    //                 profilePic: image.filename,
    //                 DOB: data.DOB,
    //                 setAccount: true
    //             })
    //             resolve();
    //         } catch (error) {
    //             reject(error)
    //         }
    //     })
    // },

    editProfile: (userId, data, newImage) => {
        return new Promise(async (resolve, reject) => {
            if (newImage) {
                await usersData.findByIdAndUpdate(
                    { _id: userId },
                    {
                        name: data.name,
                        email: data.email,
                        phone: data.phone,
                        profilePic: newImage.filename
                    }
                );
            } else {
                //if no product image then update the project with no image
                updatedProduct = await products.findByIdAndUpdate(
                    { _id: userId },
                    {
                        name: data.name,
                        email: data.email,
                        phone: data.phone,
                    }
                );
            }
            resolve()
        })
    },

    placeOrder: (addressId, products, paymentMethod, total, userId, discountAmt, subTotal) => {
        return new Promise(async (resolve, reject) => {
            try {
                let status = paymentMethod === 'COD' ? 'placed' : 'pending'
                const orderDetails = await orderData.create({
                    address: addressId,
                    orderedItems: products,
                    user: userId,
                    totalAmount: total,
                    paymentMethod: paymentMethod,
                    orderStatus: status,
                    realAmount: subTotal,
                    couponAmount: discountAmt,
                    orderDate: new Date()
                })



                await cartDB.findOneAndRemove({ userId: new ObjectId(userId) })//clearing cart
                await productHelpers.decreaseStock(products)//decreasnig product qty

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
                    },
                    { $sort: { createdAt: -1 } }
                ])
                resolve(orderDetails)
            } catch (error) {
                reject(error)
            }
        })
    },
    getUserDetails: async (userId) => {
        let userDetails = await usersData.findOne({ _id: new ObjectId(userId) })
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


    generateRazorpay: (orderid, totalPrice) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: totalPrice,  // amount in the smallest currency unit
                currency: "INR",
                receipt: orderid.toString()
            };
            instance.orders.create(options, function (err, order) {
                console.log(order);
                const response = {
                    orderId: orderid,
                    orders: order
                }
                resolve(response)
            });
        })
    },
    // verifyPayment:(details)=>{
    //     return new Promise((resolve, reject) => {
    //         const crypto = require('crypto')
    //         let hmac = crypto.createHmac('sha256',`${process.env.RAZ_SECRET_KEY}`)
    //         hmac.update(details['payment[razorpay_order_id]']+'|' + details['payment[razorpay_payment_id]']);
    //         hmac=hmac.digest('hex')
    //         if(hmac==['payment[razorpay_signature']){
    //             console.log('its success');
    //             resolve()
    //         }else{
    //             console.log('its rejected');
    //             reject()
    //         }
    //     })
    // },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            let body = details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'];
            var crypto = require("crypto");
            var expectedSignature = crypto.createHmac('sha256', `${process.env.RAZ_SECRET_KEY}`)
                .update(body.toString())
                .digest('hex');
            // var response = { "signatureIsValid": "false" }
            if (expectedSignature === details['payment[razorpay_signature]']) {
                console.log('its success');
                resolve()
            } else {
                console.log('its failure');
                reject()
            }
        });
    },
    changePaymentStatus: (orderId) => {
        return new Promise(async (resolve, reject) => {
            console.log(orderId, 'int he change status');
            await orderData.updateOne(
                { _id: new ObjectId(orderId) },
                {
                    $set: { orderStatus: 'placed' }
                }
            ).then(() => {
                console.log("status changed");
                resolve()
            })
        })
    },
    getProdColors: () => {
        return new Promise((resolve, reject) => {
            productData.aggregate([
                { $group: { _id: '$prodColor' } },
                { $project: { _id: 0, color: '$_id' } }
            ])
                .then(result => {
                    const distColors = result.map(item => item.color);
                    resolve(distColors)
                })
        })

    },
    applyCoupon: async (userId, couponCode, totalPrice) => {
        try {
            console.log(userId, couponCode, totalPrice)
            let coupon = await couponDatas.findById(couponCode);
            console.log('coupon found')
            let cart = await cartDB.findOne({ userId: userId })
            const discount = coupon.discount
            cart.totalAmount = totalPrice - coupon.discount;
            cart.coupon = couponCode;
            await cart.save()//saving the totalAmt
            coupon.usedBy.push(userId);//registering the userId in the coupon
            await coupon.save()
            console.log('cart updated success')
        } catch (error) {
            throw new Error(error);
        }

    },
    deleteAddress: (addId) => {
        console.log(addId)
        return new Promise((resolve, reject) => {
            addressData.deleteOne({ _id: new ObjectId(addId) })
                .then((response) => {
                    resolve(response)
                })
                .catch((error) => {
                    reject(error)
                })
        })
    },
    // *WALLET**
    getWalletData: (userId) => {
        return new Promise(async (resolve, reject) => {
            const userWallet = await walletSchema.findOne({ user: userId })
            if (!userWallet) {
                resolve({ walletBalance: 0 })
            } else {
                resolve(userWallet.walletBalance)
            }
        })
    },
    getOrderPrice: (orderId) => {
        return new Promise((resolve, reject) => {
            orderData.findById(orderId)
                .then((response) => {
                    const result = {
                        totalAmont: response.totalAmount,
                        paymentMethod: response.paymentMethod
                    }
                    resolve(result)
                })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                })
        })
    },
    getCancelOrder: (orderId, reason) => {
        return new Promise((resolve, reject) => {
            orderData.updateOne(//changing the order status
                { _id: orderId },
                {
                    $set: {
                        returnReason: reason,
                        orderStatus: 'cancelled'
                    }
                }
            ).then(() => {
                resolve()
            })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                })
        })
    },
    addToWallet: (addCash, userId) => {
        console.log(addCash, '00000000000000')
        return new Promise(async (resolve, reject) => {
            const userWalletExists = await walletSchema.findOne({ user: userId })
            //if no wallet is created
            if (!userWalletExists) {
                await walletSchema.create({
                    walletBalance: addCash,
                    user: userId
                }).then((response) => {
                    console.log(response, '11111111111111111111')
                    resolve()
                })
                    .catch((error) => {
                        reject(error)
                    })
            } else {
                //if user has wallet then add the new balance to the existing wallet amount 
                const walletBalance = userWalletExists.walletBalance
                const newBalance = walletBalance + addCash
                await walletSchema.updateOne(
                    { user: userId },
                    {
                        $set: {
                            walletBalance: newBalance
                        }
                    }
                )
                    .then(() => {

                        resolve()
                    })
                    .catch((error) => {
                        reject(error)
                    })
            }

        })
    },
    addToWishlist: (userId, prodId) => {
        return new Promise(async (resolve, reject) => {
            const isWishlistExist = await wishlistSchema.findOne({ userId: new ObjectId(userId) })
            if (!isWishlistExist) {
                console.log('not exists')
                wishlistSchema.create({
                    userId: userId,
                    products: [{ productId: new ObjectId(prodId) }]
                })
                    .then((response) => {
                        console.log('product added ')
                        resolve({ status: true, message: 'product added to wishlist successfully' })
                    })
                    .catch((error) => {
                        reject({ status: false, message: 'there were some internal Error. Please try again' })
                    })
            } else {//if wishlist exists
                //if the product already exists
                console.log('it exists')
                console.log(isWishlistExist)
                let exisitingProd = isWishlistExist.products.findIndex(product => product.productId == prodId)
                if(exisitingProd !== -1){
                    console.log('123 already exists')
                    reject({status:false,message:'product already exists in the wishlist'})
                }else{
                    console.log('prod not exists - updated array')
                    await wishlistSchema.updateOne(
                        { userId: new ObjectId(userId) },
                        {
                            $push: { products: { productId: new ObjectId(prodId) } }
                        }
                    ).then((response)=>{
                        console.log('updated wish')
                        resolve({status:true,message:'product added ti wishlist successfully'})
                    }).catch((error)=>{
                        reject({status:false,message:'there were some internal Error. Please try again'})
                    })
                }
            }
        })
    },
    getAllWishProducts:(userId)=>{
        return new Promise((resolve, reject) => {
             wishlistSchema.aggregate([
                {
                    $match:{
                        userId : userId
                    }
                },
                {
                    $lookup:{
                        from:'products',
                        localField:'products.productId',
                        foreignField:'_id',
                        as:'wishProducts'
                    }
                }
             ]).then((response)=>{
                resolve(response[0].wishProducts)
            }).catch((error)=>{
                console.log(error)
                reject(error)
            })
        })
    }


}

