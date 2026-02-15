const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
};
module.exports.renderNewForm = (req, res) => {
    res.render("./listings/new.ejs");
};
module.exports.edit = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Place you are looking for is deleted");
        res.redirect("/listings");
    }
    res.render("./listings/edit.ejs", { listing });
};
module.exports.update = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success","Edited successfully");
    res.redirect(`/listings/${id}`);
};
module.exports.delete = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Deleted successfully!");
    res.redirect("/listings");
};
module.exports.show = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path : "reviews", populate: {path : "author"}}).populate("owner");
    if(!listing){
        req.flash("error","Place was deleted");
        res.redirect("/listings");
    }
    res.render("./listings/show.ejs", { listing });
};
module.exports.create = async (req, res, next) => {

    // let {title,description,image,price,location,country} = req.params; first method is this but to ignore we make objects in new ejs file

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; 
    await newListing.save();
    req.flash("success","New place is added!");
    res.redirect("/listings");
};