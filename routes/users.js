var express = require('express');
var router = express.Router();
const userController = require('../controller/userController')
const {isUserLogin,userAuthenticationCheck} = require('../middlewares/userSession')


/* GET users listing. */
router.get('/',userAuthenticationCheck,userController.userHome );

router.get('/landingPage',userController.landingPage)

//<user signUp>
router.get('/userSignUp',userAuthenticationCheck,userController.userSignUp);

router.post('/userSignUpPost',userController.userSignUpPost)


//<user Login>
router.get('/userLogin',userAuthenticationCheck,userController.userLogin);

router.post('/userloginPost',userController.userLoginPost)

//user logOut
router.get('/userLogout',userController.userLogout);

//<get otp>
router.get('/otpLogin',userController.getOtpLogin);//getting the otpLogin page

router.post('/otpLogin',userController.postOtpMob);//posting The mobile number

router.post('/verifyOtp',userController.otpVerify)









module.exports = router;
