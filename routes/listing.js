const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const expressError = require("../utils/expressError.js");
const { listingSchema } = require("../schema.js");

//--------validations for listing using JOI-----------

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    let errorMsg = error.details.map((el) => el.message).join(",");
    if (error) {
        throw new expressError(400, errorMsg);
    } else {
        next();
    }
}

//-----------index route-----------

router.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
}));

//---------new listing route------------
//we are adding this above shown route because /listings/new directing us to listing/:id

router.get("/listings/new", (req, res) => {
    res.render("./listings/new.ejs");
});

//---------edit route---------

router.get("/listing/:id/edit", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", { listing });
}));

//---------update route--------

router.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect("/listings");
}));
//----------delete route---------

router.delete("/listing/:id/delete", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

//----------show route-------------

router.get("/listing/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("./listings/show.ejs", { listing });
}));

//----------create route------------

router.post("/listing/new", wrapAsync(async (req, res, next) => {

    // let {title,description,image,price,location,country} = req.params; first method is this but to ignore we make objects in new ejs file

    let newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

module.exports = router;