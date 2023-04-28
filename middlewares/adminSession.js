module.exports = {
    isAdminLoggedIn: (req, res, next) => {
        try {
            if (req.session.admin) {
                next();
            } else {
                res.redirect('/admin/login');
            }
        } catch (err) {
            console.log(err);
        }

    },
     adminAuthenticationChecking : async (req, res, next) => {
        try {
            if (req.session.admin) {
                res.redirect('/admin')
            } else {
                next()
            }
        } catch (error) {
            res.status(500).redirect('/error')
        }
    }
}
