var express = require('express');
var router = express.Router();
const userController = require('../controller/userController')
const {isUserLogin,userAuthenticationCheck} = require('../middlewares/userSession')
const multer = require('../middlewares/multer')


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
router.post('/verifyOtp',userController.otpVerify)//verifying and login

//forget password
router.get('/forgetPassword',userController.getForgetPassword)//getting the otp page
router.post('/postForgetPwd',userController.postForgetPassword)//entering the mobile
router.post('/verifyForgetPwd',userController.postVerifyPassword)//entering the otp and verifying 
router.post('/postNewPassword/:id',userController.postNewPassword)//updating the password


//filter products by category
router.get('/getShopProducts',isUserLogin,userController.getShopProducts)
router.get('/getProductById/:id',isUserLogin,userController.getProductByCategory)

//VIEW PRODUCT
router.get('/viewProduct/:id',isUserLogin,userController.getViewProduct)

//************CART MANAGEMENT**************//
//adding to the cart
router.get('/addToCart/:id',isUserLogin,userController.getAddToCart)
//getting the cart page and passing the user id 
router.get('/getShoppingCart/:id',isUserLogin,userController.getUserCart)
//changing the qty when +/- button clicked
router.post('/changeQuantity',isUserLogin,userController.postChangeQty)
//deleting the product in cart
router.get('/deleteCartProduct',isUserLogin,userController.deleteCartProduct)
//placing the order
router.get('/placeOrder',isUserLogin,userController.getPlaceOrder)
router.post('/proceedToCheckout',isUserLogin,userController.postCheckout)
//order placing success - final
router.get('/placeOrderFinal',isUserLogin,userController.getPlaceOrderFinal)
//view Order details
router.get('/viewOrderSummary/:id',isUserLogin,userController.getOrderSummaryPage)



//**USER PROFILE*/
//user account
router.get('/userProfile',isUserLogin,userController.getUserAccount)
//add address
router.get('/addAddress',isUserLogin,userController.getUserAdAddress)
//post address
router.post('/postAddAddress',isUserLogin,userController.postUserAdAddress)
//proceed to checkout
router.get('/editAddress/:id',isUserLogin,userController.getEditAddress)
//post Edit Address
router.post('/postEditAddress',isUserLogin,userController.postEditAddress)
//set up account details
// router.post('/postSetUpProfile',isUserLogin,multer.upload.single('image'),userController.postUserProfile)
//edit profile details
router.post('/postEditProfile',isUserLogin,multer.upload.single('image'),userController.postEditProfile)
//editing user image
router.post('/postChangeImage',isUserLogin,multer.upload.single('image'),userController.postChangeUserImage)
//cancel order by user
router.post('/cancelOrder',isUserLogin,userController.getChangeStatusOrder)
//return order
router.post('/returnOrder/:id',isUserLogin,userController.getReturnOrder) 
//change password
router.get('/changePassword',isUserLogin,userController.getChangePwd)


//****PAYMENT */
//verify payment
router.post('/verifyPayment',isUserLogin,userController.getVerifyPayment)

//***filtereing the products */
router.post("/filterProducts",isUserLogin,userController.getFilterProducts)
//** SEARCHING**/
router.get('/searchProducts',isUserLogin,userController.getSearchProducts)
module.exports = router;
