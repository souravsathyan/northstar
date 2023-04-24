var express = require('express');
var router = express.Router();
const userController = require('../controller/userController')
const sessionHandler = require('../middlewares/userSession')


/* GET users listing. */
router.get('/',userController.userHome );

router.get('/landingPage',userController.landingPage)

//<user signUp>
router.get('/userSignUp',userController.userSignUp);

router.post('/userSignUpPost',userController.userSignUpPost)


//<user Login>
router.get('/userLogin',userController.userLogin);

router.post('/userloginPost',userController.userLoginPost)

//user logOut
router.get('/userLogout',userController.userLogout);







module.exports = router;
