var express = require('express');
var router = express.Router();
const adminController = require('../controller/adminController')
const {isAdminLoggedIn,adminAuthenticationChecking} = require('../middlewares/adminSession');
const multer = require('../middlewares/multer')


/* GET home page. */
router.get('/',isAdminLoggedIn,adminController.getAdminDashboard);



//*******ADMIN LOGIN SIGN UP */
router.get("/login",adminAuthenticationChecking,adminController.getAdminLogin);
router.post('/postAdminLogin',adminController.postAdminLogin);
router.get('/adminLogout',isAdminLoggedIn,adminController.getAdminLogout);


// *******USER MANAGEMENT**********************/
router.get('/usersList',isAdminLoggedIn,adminController.getUsersList);
router.get('/blockUser/:id',isAdminLoggedIn,adminController.getBlockUser)
router.get('/unblockUser/:id',isAdminLoggedIn,adminController.getUnblockUser)

//*********CATEGORY MANAGEMENT */
router.get('/getCategories',isAdminLoggedIn,adminController.getCategory)//getting category
router.post('/addCategory',isAdminLoggedIn,adminController.createCategory)//adding Category
router.get('/deleteCategory/:id',isAdminLoggedIn,adminController.getDeleteCategory)

//*****PRODUCT MANAGEMENT */
router.get('/getProducts',isAdminLoggedIn,adminController.getProductList)
router.get('/addProduct',isAdminLoggedIn,adminController.getAddProduct)
router.post('/addProduct',multer.upload,adminController.postAddProduct)






module.exports = router;
