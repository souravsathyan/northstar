const isLogin = async (req, res, next) => {

    try {
        if (req.session.user) {
            res.redirect("/");
        } else {
            next()
        }
    } catch (err) {
        console.log(err);
    }

}



module.exports = {
    isLogin
}