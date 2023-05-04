var express = require('express');
var router = express.Router();
const userController = require('../controller/userController')
const {isUserLogin,userAuthenticationCheck} = require('../middlewares/userSession')


/* GET users listing. */
router.get('/',userController.userHome );
router.get('/landingPage',userController.landingPage)

//<user signUp>
router.get('/userSignUp',userAuthenticationCheck,userController.userSignUp);
router.post('/userSignUpPost',userController.userSignUpPost)

//<userLogin>
router.get('/userLogin',userAuthenticationCheck,userController.userLogin);
router.post('/userloginPost',userController.userLoginPost)

//userlogOut
router.get('/userLogout',userController.userLogout);

//<otp>
router.get('/otpLogin',userController.getOtpLogin);//getting the otpLogin page
router.post('/otpLogin',userController.postOtpMob);//posting The mobile number
router.post('/verifyOtp',userController.otpVerify)

//filter products by category
router.get('/getShopProducts',isUserLogin,userController.getShopProducts)
router.get('/getProductById/:id',isUserLogin,userController.getProductByCategory)








module.exports = router;
