const express = require("express");
const app = express();
const mongoose = require("mongoose");

//ejs-mate is used to make layout boilerplate by eliminating common lines for example navbar will be same on different pages

const ejsMate = require("ejs-mate");

//method override is used to transform post req into put req

const methodOverride = require("method-override");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const Review = require("./models/reviews.js");
const path = require("path");
const expressError = require("./utils/expressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./routes/user.js");

const sessionOptions = {
    secret: "mysupersecretstring",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());//to store info about user in session is known as serialise user
passport.deserializeUser(User.deserializeUser());//and to remove user in session is known as deserialise user

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

// app.get("/demouser",async(req,res)=>{
//     let fakeUser = new User({
//         email : "kshitiznagar2003@gmail.com",
//         username : "kshitiz",
//     });
//     let registeredUser = await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// });

async function main() {
    await mongoose.connect(MONGO_URL);
}

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });


//---------adding ejs template-------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//--------- It decodes the URL-encoded string---------

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

//-----root route---------

app.get("/", (req, res) => {
    res.redirect("/listings")
});

//---------listing routes----------

app.use("/", listingRouter);
app.use("/", reviewRouter);
app.use("/",userRouter);

//"*" valid before express v5 

app.all("/*splat", (req, res, next) => {
    next(new expressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, (req, res) => {
    console.log("server is connected to port 8080");
});