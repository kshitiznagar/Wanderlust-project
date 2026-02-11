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
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const session = require("express-session");
const flash = require("connect-flash");

const sessionOptions = {
    secret: "mysupersecretstring",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true
    }
};
app.use(session(sessionOptions));
app.use(flash());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    next();
})


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

app.use("/", listings);
app.use("/", reviews);


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