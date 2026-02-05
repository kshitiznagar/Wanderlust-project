const express = require("express");
const app = express();
const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const Listing = require("./models/listing");
const path = require("path");
const wrapAsync = require("./utils/wrapAsync.js");
const expressError = require("./utils/expressError.js");
const { listingSchema } = require("./schema.js");

//ejs-mate is used to make layout boilerplate by eliminating common lines for example navbar will be same on different pages

const ejsMate = require("ejs-mate");

//method override is used to transform post req into put req

const methodOverride = require("method-override");


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


app.get("/", (req, res) => {
    res.redirect("/listings")
});

//-----------index route-----------

app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
}));

//---------new listing route------------
//we are adding this above shown route because /listings/new directing us to listing/:id

app.get("/listings/new", (req, res) => {
    res.render("./listings/new.ejs");
});

//---------edit route---------

app.get("/listing/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", { listing });
}));

//---------update route--------

app.put("/listings/:id", wrapAsync(async (req, res) => {
    if (!req.body.listing) {
        throw new expressError(400, "Send valid data for listing");
    };
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect("/listings");
}));
//----------delete route---------

app.delete("/listing/:id/delete", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

//----------show route-------------

app.get("/listing/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/show.ejs", { listing });
}));

//----------create route------------

app.post("/listing/new", wrapAsync(async (req, res, next) => {
    let result = listingSchema.validate(req.body);
    if(result.error){
        throw new expressError(400,result.error);
    }

    // let {title,description,image,price,location,country} = req.params; first method is this but to ignore we make objects in new ejs file

    let newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));


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