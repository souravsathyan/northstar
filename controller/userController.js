const userHelpers = require('../helpers/userHelpers');
const usersData = require('../model/userModel');
const products = require('../model/productModel')
const categoryHelpers = require('../helpers/categoryHelpers');
const categoryDB = require('../model/categoryModel')
const mongoose = require('mongoose');
const productHelpers = require('../helpers/productHelpers');
const cartDB = require('../model/cartModel');
const { ObjectId } = mongoose.Types;

module.exports = {
    userHome: async (req, res, next) => {
        if (req.session.user) {
            let productList = []
            let userID = req.session.user._id
            productList = await products.find()
            // let cartCount = await userHelpers.getCartCount(userID)
            // req.session.cartCount = cartCount
            let user = req.session.user
            
            console.log(productList);
            res.render('user/index', { user, productList})
        } else {
            res.redirect('/landingPage')
        }
    },

    landingPage: (req, res) => {
        res.render('user/landingPage')
    },

    //user Signup /creation
    userSignUp: (req, res) => {

        res.render('user/userSignUp', {

            message: req.flash('message')

        })
    },
    userSignUpPost: async (req, res) => {
        console.log(req.body);
        try {
            userHelpers.doSignUp(req.body).then((response) => {
                if (!response.isUserExists) {
                    res.redirect('/userLogin')
                } else {
                    req.flash('message', 'You are an existing user please Login ')
                    console.log('***USER EXISTS***');
                    res.redirect('/userSignUp')
                }
            })
        } catch (error) {
            console.error(error);
        }

    },

    //User login
    userLogin: (req, res) => {
        res.render('user/userLogin', {
            message: req.flash('message')
        })
    },
    userLoginPost:  (req, res) => {
        console.log(req.body);
        userHelpers.doLogin(req.body).then((response) => {
            console.log(response);
            try {
                if (response.status) {
                    req.session.login = true
                    req.session.user = response.user
                    res.redirect('/')
                    console.log('kkkk');
                } else if (response.blocked) {
                    req.flash('message', 'you are blocked. PLease contact Admin')
                    res.redirect('/userLogin')
                } else {
                    req.flash('message', 'Incorrect credentials. PLease try again')
                    res.redirect('/userLogin')
                }
            } catch (error) {
                console.error(error);
            }
        })
    },
    userLogout: (req, res) => {
        req.session.user = null;
        req.session.login = false
        res.redirect("/");
    },


    //:::::OTP LOGIN:::://
    getOtpLogin: (req, res) => {
        res.render('user/otpLogin')
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
        console.log(otpValues);
        userHelpers.otpVerification(phoneNo, otpValues).then((response) => {
            console.log(response + "*****************************");
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
        })
    },

    //::::::forget password::::://
    getForgetPassword: (req, res) => {
        res.render('user/forgetPwd')
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
            console.log(response + "*****************************");
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
        })
    },
    postNewPassword: (req, res) => {
        const userId = req.params.id
        const { Password } = req.body
        console.log(userId, Password);
        try {
            userHelpers.newPassword(Password, userId)
                .then((response) => {
                    res.redirect('/userLogin')
                })
        } catch (error) {

        }
    },

    //-------------------------------------------------------------------------------------------
    //:::getting the shop page::://
    getShopProducts: async (req, res) => {
        let productList = []
        let cartCount = req.session.cartCount
        let category = await categoryDB.find()
        productList = await products.find()
        console.log('##got productList and caategory');
        let user = req.session.user
        //if filtered / user clicked view by category
        if (req.session.filtered) {
            req.session.filtered = false
            const product = req.session.product
            res.render('user/product', {
                filtered: true,
                product: product,
                category,
                user,
                cartCount
            })
        } else {
            res.render('user/product', {
                category,
                user,
                productList
            })
        }

    },
    //filtering products based on category
    getProductByCategory: (req, res) => {
        let catId = req.params.id
        productHelpers.getProductByCategory(catId).then((result) => {
            req.session.product = result
            req.session.filtered = true
            console.log('##filtered product by category');
            res.redirect('/getShopProducts')
        })
    },
    //view product when clicking
    getViewProduct: (req, res) => {
        let prodId = req.params.id
        let cartCount = req.session.cartCount
        console.log(prodId);
        userHelpers.getProductView(prodId)
            .then((response) => {
                let user = req.session.user
                let product = response
                console.log(product + 'product in resolve');
                res.render('user/viewProduct', {
                    product: product,
                    user,
                    cartCount
                })
            })
    },

    //*************CART MANAGEMENT************ */
    //ADDING TO PRODUCT TO USERCART
    getAddToCart: (req, res) => {
        //getting teh prodId & getting the userID from session
        //passing to userHelper
        try {
            let prodId = req.params.id
            let userID = req.session.user._id
            console.log('****product id : ' + prodId + " " + "user id : " + userID);
            console.log('api called');
            userHelpers.addToCart(prodId, userID)
                .then((response) => {
                    console.log('got the response for adding to  cart');
                    res.json({status:true})
                })
        } catch (error) {
            console.log(error);
        }
    },
    //GETTING THE USER CART PAGE
    getUserCart:  async (req, res) => {
        let userID = req.params.id
        let user = req.session.user
        // let cartCount = req.session.cartCount
        let totalPrice = await userHelpers.getTotalAmt(req.session.user._id)
        userHelpers.getCart(userID)
            .then((cartProduct) => {
                res.render('user/shoping-cart',{
                     user,
                     cartProduct,
                     totalPrice
                    })
            }).catch(()=>{
                res.status(404).render('error')
            })
    },
    //CHANGE CART PRODUCT QTY
    postChangeQty:(req,res)=>{
        const {cart,product,userId,count,quantity} = req.body
        userHelpers.changeQtyByButton(cart,product,count,quantity)
        .then(async(response)=>{
            response.total = await userHelpers.getTotalAmt(userId)
            res.json(response)
        }).catch((error)=>{
            console.log("error");
            res.json({status:false})
        })
    },
    //DELETING THE PRODUCT IN THE CART
    deleteCartProduct:async(req,res)=>{
        const {cartId,prodId,userId} = req.query
        console.log(cartId,prodId);
        await cartDB.updateOne(
            {_id:new ObjectId(cartId)},
            {
                $pull:{products:{productId: new ObjectId(prodId)}}
            }
        )
        let response={}
        response.total = await userHelpers.getTotalAmt(userId)
        response.status=true
        res.json(response)
    },
    //PLACING THE ORDER
    getPlaceOrder:async  (req,res)=>{
        let totalPrice = await userHelpers.getTotalAmt(req.session.user._id)
        console.log(totalPrice);
        
    }




}
