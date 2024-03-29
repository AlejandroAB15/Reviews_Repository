const User = require("../models/user");

module.exports.renderRegisterForm = (req, res) => {
    res.render("users/register");
}

module.exports.registerUser = async (req, res) => {
    try {
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err){
                return next(err);
            }
            req.flash('success',"Welcome to Irreal Reviews!");
            res.redirect("/locations"); 
        });
    } catch(e) {
        req.flash('error', e.message);
        res.redirect("users/register");
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
}

module.exports.loginUser = (req, res) => {
    req.flash('success', 'Welcome back');
    const redirectUrl = req.session.returnTo || "/locations";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = async (req, res) => {
    req.logout(err => {
        if(err){
            return next(err);
        }
        req.flash("success", 'Goodbye')
        res.redirect("/locations");
    });
}