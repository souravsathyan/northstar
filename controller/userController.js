const userHelpers = require('../helpers/userHelpers');
const usersData = require('../model/userModel');
module.exports = {
    userHome: (req, res, next) => {
        res.render('user/index');
    },

    landingPage: (req, res) => {
        res.render('user/index')
    },

    //user Signup /creation

    userSignUp: (req, res) => {
        let user = false
        res.render('user/userSignUp')
    },
    userSignUpPost: async (req, res) => {
        console.log(req.body);
        try {
            userHelpers.doSignUp(req.body).then((response) => {
                if (!response.isUserExists) {
                    res.redirect('/')
                } else {
                    req.flash('error')
                    const message = 'You are an existing user please Login '
                    console.log('***USER EXISTS***');
                    res.render('user/userSignUp', {
                        oldUser: true,
                        message: message
                    })
                }
            })
        } catch (error) {
            console.error(error);
        }

    },

    //User login

    userLogin: (req, res) => {
        res.render('user/userLogin')
    },

    userLoginPost: (req, res) => {
        console.log(req.body);
        userHelpers.doLogin(req.body).then((response) => {
            console.log(response);
            try {
                if (response.status) {
                    req.session.login = true
                    req.session.user = response.user
                    let user = response.user.name
                    res.render('user/index', { user })
                } else if (response.blocked) {
                    req.flash('error')
                    const message = 'you are blocked'
                    res.render('user/userLogin', {
                        userBlocked: true,
                        message: message
                    })
                } else {
                    req.flash("error")
                    const message = 'Incorrect credentials. Please try again'
                    res.render('user/userLogin', {
                        credentialErr: true,
                        message: message
                    })
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

    postOtpMob:(req,res)=>{
        console.log(req.body.phone);
        const {phone}= req.body;
        console.log(phone);
        req.session.phone = phone
        userHelpers.sendOtp(phone).then((response)=>{
            if(response.status){
                req.session.tempUser = response.user
                const msg = 'OTP has been Sent. Please check your Mobile'
                res.render('user/otpVerify',{
                    msg:msg,
                    phone:phone
                })
            }else{
                res.render('user/userLogin')
            }
        })
    },
    otpVerify:(req,res)=>{
        const phoneNo = req.session.phone
        const otpArray = [
            req.body.otp1,
            req.body.otp2,
            req.body.otp3,
            req.body.otp4,
            req.body.otp5,
            req.body.otp6
        ];
        otpValues = otpArray.join('')
        console.log(otpValues);
        userHelpers.otpVerification(phoneNo,otpValues).then((response)=>{
            if(response.status){
                req.session.user = req.session.tempUser
                req.session.login = true
                let user = req.session.user.name
                res.render('user/index', { user })
            }else{
                req.flash('error')
                    const message = 'Invalid Otp'
                    res.render('user/userLogin', {
                        invalidOtp: true,
                        message: message
                    })
                res.redirect('/userLogin')
            }
        })
    }









}
