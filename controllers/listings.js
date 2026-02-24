const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_API;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    if (req.query.category) {
        let category = req.query.category;
        const allListings = await Listing.find({ category: category });
        res.render("./listings/index.ejs", { allListings });
    } else {
        req.flash("error","There is no place in this category");
        const allListings = await Listing.find({});
        res.render("./listings/index.ejs", { allListings });
    }

};
module.exports.renderNewForm = (req, res) => {
    res.render("./listings/new.ejs");
};
module.exports.edit = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Place you are looking for is deleted");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_250,w_300")
    res.render("./listings/edit.ejs", { listing, originalImageUrl });
};
module.exports.update = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { filename, url };
        await listing.save();
    }
    req.flash("success", "Edited successfully");
    res.redirect(`/listing/${id}`);
};
module.exports.delete = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Deleted successfully!");
    res.redirect("/listings");
};
module.exports.show = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!listing) {
        req.flash("error", "Place was deleted");
        res.redirect("/listings");
    }
    res.render("./listings/show.ejs", { listing });
};
module.exports.create = async (req, res, next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send();
    let url = req.file.path;
    let filename = req.file.filename;

    // let {title,description,image,price,location,country} = req.params; first method is this but to ignore we make objects in new ejs file

    const newListing = new Listing(req.body.listing);
    console.log(newListing);
    newListing.owner = req.user._id;
    newListing.image = { filename, url };
    newListing.geometry = response.body.features[0].geometry;
    await newListing.save();
    req.flash("success", "New place is added!");
    res.redirect("/listings");
};