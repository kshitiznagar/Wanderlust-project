const express = require("express");
const router = express.Router({mergeParams : true});
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const expressError = require("../utils/expressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/reviews.js");
const { isLoggedIn, isReviewAuthor } = require("../middlewares.js");
const reviewControllers = require("../controllers/reviews.js");


//----------function for server side validation using JOI-----------//

// const validateReview = (req, res, next) => {
//     let { error } = reviewSchema.validate(req.body);
//     console.log(error);
//     let errorMsg = error.details.map((el) => el.message).join(",");
//     if (error) {
//         throw new expressError(400, errorMsg);
//     } else {
//         next();
//     }
// }

//---------review route-------------//

router.post("/listing/:id/reviews",isLoggedIn,wrapAsync(reviewControllers.createReview));

//---------review delete route-----------//

router.delete("/listing/:id/reviews/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewControllers.reviewDelete));

module.exports = router;