const { response } = require('../app');
const adminHelpers = require('../helpers/adminHelpers')
const usersData = require('../model/userModel')



const adminCredentials = {
    name: "Admin",
    email: "admin@gmail.com",
    password: "123"
}

module.exports = {

    getAdminLogin: (req, res, next) => {
        res.render('admin/adminLogin');
    },

    getAdminDashboard: (req, res, next) => {
        res.render('admin/index')
    },

    postAdminLogin: (req, res) => {
        console.log(req.body);
        try {
            if (
                req.body.email == adminCredentials.email &&
                req.body.password == adminCredentials.password
            ) {
                req.session.admin = true
                res.redirect('/admin')
            }else{
                res.redirect('/admin/login')
            }

        } catch (error) {
            console.error(error);
        }
    },

    getAdminLogout: (req, res) => {
        req.session.admin = false;
        res.redirect('/admin')
    },

    getUsersList: async (req, res) => {
        try {
            adminHelpers.getUsers().then((users)=>{
                res.render('admin/usersList',{users})
            })
        } catch (error) {
            console.error(error);
        }

    },
    getBlockUser:(req,res)=>{
        
        try {
            adminHelpers.blockUser(req.params.id).then((response)=>{
                res.redirect('/admin/usersList')
            })
            .catch((error)=>{
                console.error(error)
            })
        } catch (error) {
            console.error(error);
        }
    },
    getUnblockUser:(req,res)=>{
        try {
            adminHelpers.unblockUser(req.params.id).then((response)=>{
                res.redirect('/admin/usersList')
            })
        } catch (error) {
            
        }
    }

}