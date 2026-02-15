const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { reviewSchema } = require("../schema.js");
const { saveRedirectUrl } = require("../middlewares.js");
const usersController = require("../controllers/users.js");

router.get("/signup",usersController.renderSignUpForm);

router.post("/signup", wrapAsync(usersController.signUpPost));

router.get("/login", usersController.renderLogInForm);

router.post("/login", saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: '/login',
        failureFlash: true
    }), usersController.logInPost);

router.get("/logout", usersController.logOut);


module.exports = router;