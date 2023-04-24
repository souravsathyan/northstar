module.exports = {
    isAdminLoggedIn: (req, res, next) => {
        try {
            if (req.session.admin) {
                next(); 
            } else {
                res.render('admin/adminLogin'); 
            }
        } catch (err) {
            console.log(err);
        }
        
    }
}
