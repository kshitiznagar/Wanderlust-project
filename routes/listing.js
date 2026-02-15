const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn,isOwner,validateListing} = require("../middlewares.js");
const listingController = require("../controllers/listings.js");


//-----------index route-----------

router.get("/listings", wrapAsync(listingController.index));

//---------new listing route------------
//we are adding this above shown route because /listings/new directing us to listing/:id

router.get("/listings/new", isLoggedIn,listingController.renderNewForm);

//---------edit route---------

router.get("/listing/:id/edit",isLoggedIn, wrapAsync(listingController.edit));

//---------update route--------

router.put("/listings/:id",isLoggedIn,isOwner,wrapAsync(listingController.update));
//----------delete route---------

router.delete("/listing/:id/delete",isLoggedIn,wrapAsync(listingController.delete));

//----------show route-------------

router.get("/listing/:id", wrapAsync(listingController.show));

//----------create route------------

router.post("/listing/new",isLoggedIn,wrapAsync(listingController.create));

module.exports = router;