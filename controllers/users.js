const passport = require("passport");
module.exports.renderSignUpForm =  (req, res) => {
    res.render("./users/signup.ejs");
};
module.exports.signUpPost = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", `Dear ${username}, welcome to Wanderlust`);
            res.redirect("/listings");
        })

    } catch (error) {
        req.flash("error", error.message);
        res.redirect("/signup")
    }

};
module.exports.renderLogInForm = (req, res) => {
    res.render("./users/login.ejs");
};
module.exports.logInPost = async (req, res) => {
        req.flash("success", "Welcome back to Wanderlust!")
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
    };

module.exports.logOut = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Logged you out!");
        res.redirect("/listings");
    })
};   