var express = require('express');
var router = express.Router();
const adminController = require('../controller/adminController')
const {isAdminLoggedIn} = require('../middlewares/adminSession');


/* GET home page. */
router.get('/',isAdminLoggedIn,adminController.getAdminDashboard);

router.get("/login",isAdminLoggedIn, adminController.getAdminLogin);

router.post('/postAdminLogin',adminController.postAdminLogin);

router.get('/adminLogout',isAdminLoggedIn,adminController.getAdminLogout);

router.get('/usersList',isAdminLoggedIn,adminController.getUsersList);

router.get('/blockUser/:id',isAdminLoggedIn,adminController.getBlockUser)

router.get('/unblockUser/:id',isAdminLoggedIn,adminController.getUnblockUser)

module.exports = router;
