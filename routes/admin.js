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
router.get('/usersList',isAdminLoggedIn,adminController.getUsersList);//getting userList
router.get('/blockUser/:id',isAdminLoggedIn,adminController.getBlockUser)//blocking userList
router.get('/unblockUser/:id',isAdminLoggedIn,adminController.getUnblockUser)//unblock userList

//*********CATEGORY MANAGEMENT */
router.get('/getCategories',isAdminLoggedIn,adminController.getCategory)//getting category
router.post('/addCategory',isAdminLoggedIn,adminController.createCategory)//adding Category
router.get('/deleteCategory/:id',isAdminLoggedIn,adminController.getDeleteCategory)//deleting category


//*****PRODUCT MANAGEMENT *******/
router.get('/getProducts',isAdminLoggedIn,adminController.getProductList)//getting product page
router.get('/addProduct',isAdminLoggedIn,adminController.getAddProduct)//getting adding product
router.post('/addProduct',multer.upload.array('images',4),adminController.postAddProduct)//post adding product
router.get('/editProduct/:id',isAdminLoggedIn,adminController.getEditProduct)//getting edit product page
router.post('/editProduct/:id',isAdminLoggedIn,multer.upload.array('images',4),adminController.postEditProduct)//posting prodcut edit details 
router.get('/deleteProduct/:id',isAdminLoggedIn,adminController.DeleteProduct)//deleting the product page

//*****ORDER LIST******* */
router.get('/orderList',isAdminLoggedIn,adminController.getOrderList)
router.get('/getOrderDetails/:id',isAdminLoggedIn,adminController.getOrderDetails)
router.post('/changeStatus/:id',isAdminLoggedIn,adminController.getChangeStatus)
router.get('/cancelOrder/:id',isAdminLoggedIn,adminController.getCancelOrder)




module.exports = router;
