const userHelpers = require('../helpers/userHelpers');
const usersData = require('../model/userModel');
const products = require('../model/productModel')
const categoryHelpers = require('../helpers/categoryHelpers');
const categoryDB = require('../model/categoryModel')
const mongoose = require('mongoose');
const productHelpers = require('../helpers/productHelpers');
const cartDB = require('../model/cartModel');
const productData = require('../model/productModel');
const addressData = require('../model/addressModel')
const orderData = require('../model/orderModel');
const adminHelpers = require('../helpers/adminHelpers');
const { ObjectId } = mongoose.Types;
const userProfileData = require('../model/userDetailsModel');
const slug = require('slugify')
const bannersData = require('../model/banner')
const wallet = require('../model/walletModel');
const walletSchema = require('../model/walletModel');
const couponData = require('../model/couponModel')
const wishlistSchema = require('../model/wishlist')

module.exports = {
    userHome: async (req, res, next) => {
        try {
            if (req.session.user) {
                let productList = []
                let user = req.session.user
                let userID = req.session.user._id
                let cartCount = await userHelpers.getCartCount(userID)
                productList = await products.find()
                colorList = await userHelpers.getProdColors()
                const bannerList = await bannersData.find({})
                const userWallet = await userHelpers.getWalletData(userID)
                res.render('user/index', {
                    user,
                    productList,
                    cartCount,
                    colorList,
                    bannerList,
                    userWallet
                })
            } else {
                res.redirect('/landingPage')
            }
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },

    landingPage: async (req, res) => {
        try {
            const bannerList = await bannersData.find({})
            let productList = []
            productList = await products.find()
            res.render('user/landingPage', {
                bannerList,
                productList
            });
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },

    //user Signup /creation
    userSignUp: (req, res) => {
        try {
            res.render('user/userSignUp', {
                message: req.flash('message')
            })
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },
    userSignUpPost: async (req, res) => {

        userHelpers.doSignUp(req.body).then((response) => {
            if (!response.isUserExists) {
                res.redirect('/userLogin')
            } else {
                req.flash('message', 'You are an existing user please Login ')
                console.log('***USER EXISTS***');
                res.redirect('/userSignUp')
            }
        }).catch((error) => {
            res.status(500).render('error', { error });
        })
    },

    //User login
    userLogin: (req, res) => {
        try {
            res.render('user/userLogin', {
                message: req.flash('message')
            })
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },

    userLoginPost: (req, res) => {

        userHelpers.doLogin(req.body).then((response) => {

            try {
                if (response.status) {
                    req.session.login = true
                    req.session.user = response.user
                    res.redirect('/')

                } else if (response.blocked) {
                    req.flash('message', 'you are blocked. PLease contact Admin')
                    res.redirect('/userLogin')
                } else {
                    req.flash('message', 'Incorrect credentials. PLease try again')
                    res.redirect('/userLogin')
                }
            } catch (error) {
                res.status(500).render('error', { error });
            }
        })
    },
    userLogout: (req, res) => {
        try {
            req.session.user = null;
            req.session.login = false
            res.redirect("/");
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },


    //:::::OTP LOGIN:::://
    // FIXME TWILIO OTP - GIT ISSUE
    getOtpLogin: (req, res) => {
        try {
            res.render('user/otpLogin')
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },
    postOtpMob: (req, res) => {
        const { phone } = req.body;
        //assigining the phone no to session inorder to retreive it when verifying the otp
        req.session.phone = phone
        userHelpers.sendOtp(phone).then((response) => {
            if (response.status) {
                req.session.tempUser = response.user
                const sendMsg = 'OTP has been Sent. Please check your Mobile'
                res.render('user/otpVerify', {
                    otpSend: true,
                    sendMsg: sendMsg,
                })
            } else {
                const msg = 'enter a valid mobile number'
                res.render('user/otpLogin', { msg })
            }
        }).catch((error) => {
            res.status(500).render('error', { error });
        })
    },
    resendOtp: (req, res) => {
        const phone = req.session.phone
        userHelpers.sendOtp(phone).then((response) => {
            if (response.status) {
                req.session.tempUser = response.user
                const sendMsg = 'OTP has been Sent. Please check your Mobile'
                res.render('user/otpVerify', {
                    otpSend: true,
                    sendMsg: sendMsg,
                })
            } else {
                const msg = 'enter a valid mobile number'
                res.render('user/otpLogin', { msg })
            }
        }).catch((error) => {
            res.status(500).render('error', { error });
        })
    },
    otpVerify: (req, res) => {
        const phoneNo = req.session.phone
        const otpArray = [
            req.body.otp1,
            req.body.otp2,
            req.body.otp3,
            req.body.otp4,
            req.body.otp5,
            req.body.otp6
        ]; //recieving the otp values in Array
        otpValues = otpArray.join('')//transforming array to string

        userHelpers.otpVerification(phoneNo, otpValues).then((response) => {

            if (response.status) {
                req.session.user = req.session.tempUser
                req.session.login = true
                res.redirect('/')
            } else {
                req.flash('error')
                const msg = 'Invalid Otp'
                res.render('user/otpVerify', {
                    msg: msg
                })

            }
        }).catch((error) => {
            res.status(500).render('error', { error });
        })
    },

    //::::::forget password::::://
    getForgetPassword: (req, res) => {
        try {
            let changePwd = req.session.changed = false
            res.render('user/forgetPwd', { changePwd })
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },
    postForgetPassword: (req, res) => {
        const { phone } = req.body;
        //assigining the phone no to session inorder to retreive it when verifying the otp
        req.session.phone = phone
        userHelpers.sendOtp(phone).then((response) => {
            if (response.status) {
                console.log('otp send - pwd change');
                req.session.tempUser = response.user
                const sendMsg = 'OTP has been Sent. Please check your Mobile'
                res.render('user/otpPwdVerify', {
                    otpSend: true,
                    sendMsg: sendMsg,
                })
            } else {
                const msg = 'enter a valid mobile number'
                res.render('user/otpLogin', { msg })
            }
        }).catch((error) => {
            res.status(500).render('error', { error });
        })
    },
    postVerifyPassword: (req, res) => {
        const phoneNo = req.session.phone
        const otpArray = [
            req.body.otp1,
            req.body.otp2,
            req.body.otp3,
            req.body.otp4,
            req.body.otp5,
            req.body.otp6
        ]; //recieving the otp values in Array
        otpValues = otpArray.join('')//transforming array to string
        console.log(otpValues);
        userHelpers.otpVerification(phoneNo, otpValues).then((response) => {

            if (response.status) {
                let user = req.session.tempUser
                res.render('user/newPassword', {
                    user: user,
                })
            } else {
                req.flash('error')
                const msg = 'Invalid Otp'
                res.render('user/otpVerify', {
                    msg: msg
                })

            }
        }).catch((error) => {
            res.status(500).render('error', { error });
        })
    },
    postNewPassword: (req, res) => {
        const userId = req.params.id
        const { Password } = req.body
        userHelpers.newPassword(Password, userId)
            .then((response) => {
                res.redirect('/userLogin')
            }).catch((error) => {
                res.status(500).render('error', { error });
            })

    },

    //-------------------------------------------------------------------------------------------
    //:::getting the shop page::://
    getShopProducts: async (req, res) => {
        try {
            let productList = []
            let user = req.session.user
            let userID = req.session.user._id
            let category = await categoryDB.find()
            productList = await products.find()
            let cartCount = await userHelpers.getCartCount(userID)
            const userWallet = await userHelpers.getWalletData(userID)
            console.log(userWallet)
            //if filtered / user clicked view by category
            if (req.session.filtered) {
                req.session.filtered = false
                const product = req.session.product
                res.render('user/product', {
                    filtered: true,
                    product: product,
                    category,
                    user,
                    cartCount,
                    userWallet
                })
            } else {
                res.render('user/product', {
                    category,
                    user,
                    productList,
                    cartCount,
                    userWallet
                })
            }
        } catch (error) {
            res.status(500).render('error', { error });
        }

    },
    //filtering products based on category
    getProductByCategory: (req, res) => {
        let catId = req.params.id
        productHelpers.getProductByCategory(catId).then((result) => {
            req.session.product = result
            req.session.filtered = true
            res.redirect('/getShopProducts')
        }).catch((error) => {
            res.status(500).render('error', { error });
        })
    },
    //view product when clicking
    getViewProduct: async (req, res) => {
        console.log(req.params.id);
        let prodId = req.params.id
        let userID = req.session.user._id
        let cartCount = await userHelpers.getCartCount(userID)
        const userWallet = await userHelpers.getWalletData(userID)

        userHelpers.getProductView(prodId)
            .then((response) => {
                let user = req.session.user
                let product = response
                res.render('user/viewProduct', {
                    product: product,
                    user,
                    userWallet
                    // cartCount
                })
            }).catch((error) => {
                console.log(error);
                res.status(500).render('error', { error });
            })
    },

    //*************CART MANAGEMENT************ */

    //ADDING TO PRODUCT TO USERCART
    getAddToCart: (req, res) => {
        //getting teh prodId & getting the userID from session
        //passing to userHelper

        let prodId = req.params.id
        let userID = req.session.user._id
        userHelpers.addToCart(prodId, userID)
            .then(async () => {
                let response = {}
                console.log('got the response for adding to  cart');
                response.status = true
                res.json(response)
            }).catch((error) => {
                res.status(500).render('error', { error });
            })

    },
    //GETTING THE USER CART PAGE
    getUserCart: async (req, res) => {
        let userID = req.params.id
        let user = req.session.user
        let cartCount = await userHelpers.getCartCount(userID)
        let totalPrice = await userHelpers.getTotalAmt(req.session.user._id)
        const userWallet = await userHelpers.getWalletData(userID)

        userHelpers.getCart(userID)
            .then((cartProduct) => {
                res.render('user/shoppingCart', {
                    user,
                    cartProduct,
                    totalPrice,
                    cartCount,
                    userWallet
                })
            }).catch((error) => {
                res.status(500).render('error', { error });
            })
    },
    //CHANGE CART PRODUCT QTY
    postChangeQty: async (req, res) => {
        try {
            const { cart, product, userId, count, quantity } = req.body
            userHelpers.changeQtyByButton(cart, product, count, quantity)
                .then(async (response) => {
                    response.total = await userHelpers.getTotalAmt(userId)
                    res.json(response)
                }).catch((error) => {
                    console.log("error");
                    res.json(error)
                })
        } catch (error) {
            res.status(500).render('error', { error });

        }
    },
    //DELETING THE PRODUCT IN THE CART
    deleteCartProduct: async (req, res) => {
        try {
            const { cartId, prodId, userId } = req.query
            await cartDB.updateOne(
                { _id: new ObjectId(cartId) },
                {
                    $pull: { products: { productId: new ObjectId(prodId) } }
                }
            )
            let response = {}
            response.total = await userHelpers.getTotalAmt(userId)
            response.status = true
            res.json(response)
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },



    //***********USER ACCOUNT********* */
    //USER ACCOUNT
    getUserAccount: async (req, res) => {
        try {
            const user = req.session.user
            const userId = req.session.user._id
            const cartCount = await userHelpers.getCartCount(userId)
            const userAddress = await addressData.find({ userId: new ObjectId(userId) })
            const orderDetails = await userHelpers.getUserOrders(userId)
            const userDetails = await userHelpers.getUserDetails(userId)
            const userWallet = await userHelpers.getWalletData(userId)

            console.log(userDetails)
            res.render('user/userProfile', {
                user,
                userAddress,
                cartCount,
                orderDetails,
                userDetails,
                userWallet
            })
        } catch (error) {
            res.status(500).render('error', { error });

        }
    },
    //ADD ADDRESS
    getUserAdAddress: (req, res) => {
        try {
            let user = req.session.user
            res.render('user/addAddress', { user })
        } catch (error) {
            res.status(500).render('error', { error });

        }
    },
    //creating the address
    postUserAdAddress: (req, res) => {
        let userId = req.session.user._id
        userHelpers.addAddress(req.body, userId)
            .then((response) => {
                res.status(200).json({ success: true });
            }).catch((error) => {
                res.status(500).json({ success: false });
            })

    },
    //profile Details
    // postUserProfile: (req, res) => {
    //     let userId = req.session.user._id
    //     console.log(req.body, req.file)
    //     userHelpers.setupUserProfile(userId, req.body, req.file)
    //         .then(() => {
    //             res.redirect('/userProfile')
    //         })
    //         .catch((error) => {
    //             res.status(500).render('error', { error });
    //         })
    // },
    postEditProfile: (req, res) => {
        console.log('edited', req.body);
        let userId = req.session.user._id
        userHelpers.editProfile(userId, req.body, req.file)
            .then(() => {
                res.redirect('/userProfile')
            })
    },
    postChangeUserImage: async (req, res) => {
        console.log(req.file);
        try {
            let userId = req.session.user._id
            await usersData.updateOne(
                { _id: new ObjectId(userId) },
                {
                    $set: { profilePic: req.file.filename }
                }
            );
            res.redirect('/userProfile')
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },
    getChangeStatusOrder: async (req, res) => {
        console.log(req.body)
        const { selectedValue } = req.body
        const orderId = req.params.id
        const userId = req.session.user._id
        const orderPrice = await userHelpers.getOrderPrice(orderId)
        console.log(orderPrice)
        if (orderPrice.paymentMethod === 'COD') {
            // If payment method is COD, do not add money to wallet and cancel the order
            await userHelpers.getCancelOrder(orderId, selectedValue)
                .then(() => {
                    console.log('updated');
                    res.json({ status: true, message: 'Order cancelled successfully.' });
                })
                .catch((error) => {
                    res.status(500).render('error', { error });
                });
        } else {
            // If payment method is ONLINE, add money to wallet and cancel the order
            console.log(orderPrice)
            await userHelpers.addToWallet(orderPrice.totalAmont, userId);
            await userHelpers.getCancelOrder(orderId)
                .then(() => {
                    console.log('updated');
                    res.json({ status: true, message: 'Order cancelled and the amount has been credited to your wallet.' });
                })
                .catch((error) => {
                    res.status(500).render('error', { error });
                });
        }

    },
    getReturnOrder: async (req, res) => {
        console.log(req.body, 'iiiiiiiiiiiiiiiiiiiiii');
        try {
            const orderId = req.params.id
            const reason = req.body.selectedValue
            const orderPrice = await userHelpers.getOrderPrice(orderId)
            const userId = req.session.user._id
            console.log(orderPrice)
            await userHelpers.addToWallet(orderPrice.totalAmont, userId)
            await orderData.updateOne(
                { _id: orderId },
                {
                    $set: {
                        returnReason: reason,
                        orderStatus: 'return'
                    }
                }
            )
            res.json({ status: true })
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },
    //***********ORDER MANAGEMENT***** */
    //PLACING THE ORDER
    getPlaceOrder: async (req, res) => {
        try {
            let userId = req.session.user._id
            let user = req.session.user
            let cartCount = await userHelpers.getCartCount(userId)//getting the cart  cont
            let totalPrice = await userHelpers.getTotalAmt(req.session.user._id);//getting the cart total
            let userAddress = await addressData.find({ userId: new ObjectId(userId) });//getting the address to display 
            let cartProducts = await userHelpers.getCart(userId);//getting the cart products to display by populate method
            let allCoupons = await adminHelpers.getAllCoupons();//getting all coupons
            const userWallet = await userHelpers.getWalletData(userId)

            res.render('user/orderCheckout', {
                user,
                userAddress,
                totalPrice,
                cartProducts,
                cartCount,
                allCoupons,
                userWallet
            })
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },
    postCheckout: async (req, res) => {
        try {
            console.log(req.body, 'iiiiiiiiiii')
            const userId = req.session.user._id
            const products = await userHelpers.getCartProducts(userId)//getting the cart Products
            const userWallet = await walletSchema.findOne({ user: new ObjectId(userId) })//getting wallet 
            const totalPrice = req.body.totalAmount//getting the cart TotalAmt 
            const userAddress = req.body.addressId
            const paymentMethod = req.body.paymentMethod
            const discountAmt = req.body.discountAmt
            const subTotal = req.body.subTotal
            const coupon = req.body.couponId
            console.log(req.body, 'iiiiiiiiiii')
            const response = await userHelpers.applyCoupon(userId, coupon, totalPrice);
            console.log(req.body, 'iiiiiiiiiii')
            console.log(userWallet)
            if (!req.body.paymentMethod) {
                return res.json({ error: true, message: "Please choose a payment method" });
            }
            //storing in the order Collection
            //adding cartProducts by finding the cart also adding the the address that comes from the body

            if (req.body.paymentMethod == 'COD') {
                console.log('in the cod')
                userHelpers.placeOrder(userAddress, products, paymentMethod, totalPrice, userId, discountAmt, subTotal)
                    .then((response) => {
                        console.log('order placed in COD')
                        const orderId = response.orderId
                        res.json({ status: true, orderId: orderId, message: 'order placed successfully' });
                    })
            } else if (req.body.paymentMethod == 'wallet') {
                console.log('in the wallet')
                if (totalPrice <= userWallet.walletBalance) {
                    console.log('in the wallet if')
                    const newBalance = userWallet.walletBalance - totalPrice
                    console.log(newBalance, totalPrice, userWallet.walletBalance)
                    await walletSchema.updateOne(
                        { user: new ObjectId(userId) },
                        {
                            $set: { walletBalance: newBalance }
                        }
                    )
                    console.log('wallet amount updated')
                    userHelpers.placeOrder(userAddress, products, paymentMethod, totalPrice, userId, discountAmt, subTotal)
                        .then((response) => {
                            console.log('order placed in wallet')
                            const orderId = response.orderId
                            res.json({ status: true, orderId: orderId, message: 'order placed successfully' });
                        })
                } else {
                    res.json({ error: true, message: 'insufficient amount in wallet' })
                }
            } else if (req.body.paymentMethod === 'ONLINE') {//ONLINE
                console.log('in online')
                userHelpers.placeOrder(userAddress, products, paymentMethod, totalPrice, userId, discountAmt, subTotal)
                    .then((response) => {
                        console.log('order placed in online')
                        const orderId = response.orderId
                        userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
                            res.json({ online: true, orders: response.orders, status: true, orderId: response.orderId, message: 'order placed successfully' })
                        })
                    }).catch((error) => {
                        res.json({ error: true, status: false, message: 'Error placing the order' });
                    })

            }
        } catch (error) {
            res.status(500).render('error', { error });

        }
    },
    getPlaceOrderFinal: async (req, res) => {
        try {
            const user = req.session.user
            const userID = req.session.user._id
            const orderId = req.query.orderId
            console.log(orderId);
            const userWallet = await userHelpers.getWalletData(userID)

            res.render('user/orderPlaceSuccess', {
                user,
                orderId,
                userWallet
            })
        } catch (error) {
            res.status(500).render('error', { error });

        }
    },
    getOrderSummaryPage: async (req, res) => {
        try {
            const orderId = req.params.id
            const user = req.session.user
            const userId = req.session.user._id
            console.log(orderId, 'its the order id');
            const addressDetails = await adminHelpers.getOrderAddressDetails(orderId)
            const itemDetails = await adminHelpers.getOrderItemDetails(orderId)
            //getting the orderDetails by matching the userID and Lookup ing the product and address collection to order Collection
            const productDetails = itemDetails[0].orderProducts
            const userWallet = await userHelpers.getWalletData(userId)


            res.render('user/orderSummary', {
                user,
                addressDetails,
                productDetails,
                userWallet
            })
        } catch (error) {
            console.log(error);
            res.status(500).render('error', { error });
        }
    },
    getEditAddress: async (req, res) => {
        try {
            let address = await addressData.findOne({ _id: new Object(req.params.id) })
            res.render('user/editAddress', {
                address
            })
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },
    postEditAddress: async (req, res) => {
        await userHelpers.updateAddress(req.body)
            .then((response) => {
                res.json({ status: true })
            })
            .catch((error) => {
                res.status(500).render('error', { error });
            })
    },
    deleteAddress: (req, res) => {
        userHelpers.deleteAddress(req.body.addId)
            .then((response) => {
                res.json({ status: true })
            })
            .catch((error) => {
                res.json({ status: false, message: 'failed to delete the address' })
            })
    },
    //******PAYMENT */
    getVerifyPayment: async (req, res) => {
        console.log(req.body);
        let orderId = req.body['order[receipt]']
        await userHelpers.verifyPayment(req.body)
            .then(() => {
                userHelpers.changePaymentStatus(orderId)
                    .then(() => {
                        console.log(orderId);
                        res.json({ status: true, orderId: orderId })
                    })
            }).catch((err) => {
                console.log(err);
                res.json({ status: false, errMsg: 'payment failed' })
            })
    },
    //changing the ser password
    getChangePwd: (req, res) => {
        try {
            let changePwd = req.session.changed = true
            res.render('user/forgetPwd', { changePwd })
        } catch (error) {
            res.json({ error: 'payment failed' })
        }
    },
    //filtering the products
    getFilterProducts: async (req, res) => {
        try {
            const { sortBy, priceValue, colorValue } = req.body;
            let filteredProducts = [];
            const filter = {}

            if (priceValue !== 'all') {
                const [minPrice, maxPrice] = priceValue.split('-');
                filter.prodPrice = {
                    $gte: minPrice,
                    $lte: maxPrice
                }
            }

            if (colorValue !== 'all') {
                filter.prodColor = colorValue;
            }


            if (sortBy === 'low-to-high') {
                filteredProducts = await productData.find(filter).sort({ prodPrice: 1 })
            } else if (sortBy === 'high-to-low') {
                filteredProducts = await productData.find(filter).sort({ prodPrice: -1 })
            } else {
                filteredProducts = await productData.find(filter)
            }

            res.json(filteredProducts)

        } catch (error) {
            console.log(error);
            res.status(500).render('error', { error });
        }
    },
    getSearchProducts: async (req, res) => {
        try {
            const query = req.query.query
            const products = await productData.find({ prodName: { $regex: `${query}`, $options: 'i' } })
            res.json(products)
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },
    // getApplyCoupon: async (req, res) => {
    //     try {
    //         console.log(req.body)
    //         if (req.body.coupon === '') {
    //             res.json({ error: true, message: `pelase select the coupon` })
    //         } else {
    //             const coupon = req.body.coupon
    //             const user = req.session.user
    //             let totalPrice = await userHelpers.getTotalAmt(req.session.user._id)

    //             console.log(response)
    //             res.status(202).json(response);
    //         }
    //     } catch (error) {
    //         res.status(500).render('error', { error });
    //     }
    // },
    getCoupon: async (req, res) => {
        try {
            const userId = req.session.user._id
            const coupon = await couponData.findById(req.query.coupon)
            const exists =coupon.usedBy.indexOf(userId) !== -1;
            console.log(exists)
            if (exists) {
                res.json({used:true,message:'You Have Already used coupon'})
            } else {
                res.json(coupon)
            }
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },
    getAddToWishlist: (req, res) => {
        try {
            console.log(req.body)
            const userId = req.session.user._id
            const prodId = req.body.prodId
            userHelpers.addToWishlist(userId, prodId)
                .then((response) => {
                    console.log(response)
                    res.json(response)
                }).catch((error) => {
                    console.log(error)
                    res.json(error)
                })
        } catch (error) {
            res.status(500).render('error', { error })
        }
    },
    getWishlist: async (req, res) => {
        const userID = req.session.user._id
        const user = req.session.user
        const userWallet = await userHelpers.getWalletData(userID)
        userHelpers.getAllWishProducts(userID)
            .then((wishProducts) => {
                res.render('user/wishlist', {
                    wishProducts,
                    user,
                    userWallet
                })
            })
            .catch((error) => {
                res.status(500).render('error', { error })
            })

    }
}
