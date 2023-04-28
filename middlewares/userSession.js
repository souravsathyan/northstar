const isUserLogin = async (req, res, next) => {
    try {
        if (req.session.user) {
            next()
        } else {
            res.redirect("/landingPage");
        }
    } catch (err) {
        console.log(err);
    }

}



module.exports = {
    isUserLogin
}