const userHelpers = require('../helpers/userHelpers')
module.exports = {
    userHome: (req, res, next) => {
        res.render('user/index');
    },

    landingPage: (req, res) => {
        res.render('user/index')
    },

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
    
                    console.log('******************************************USER EXISTS****************************************');
                    res.render('user/userSignUp', { oldUser: true })
                }
            })
        } catch (error) {
            console.error(error);
        }
        
    },

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
                } else if(response.blocked){
                    req.flash('error')
                    res.render('user/userLogin',{
                        userBlocked:true,
                    })
                } else {
                    res.redirect('/userLogin')
                }
            } catch (error) {
                console.error(error);
            }
        })
    },
    userLogout: (req, res) => {
        req.session.user = null;
        req.session.login=false
        res.redirect("/");
    },
   






}
