const isUserLogin = async (req, res, next) => {
    try {
        if (req.session.user) {
            next()
        } else {
            res.status(200).redirect("/userLogin");
        }
    } catch (err) {
        console.log(err);
    }

}

const userAuthenticationCheck = async (req, res, next) =>{
    try {
        if(req.session.user){
            res.status(200).redirect('/')
        } else {
            next()
        }
    } catch (error) {
        res.status(500).redirect('/error')
    }
}



module.exports = {
    isUserLogin,
    userAuthenticationCheck
}