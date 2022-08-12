const express = require("express");
const ROUTER = express.Router({ mergeParams: true });
const catchAsync = require("../utilities/catchAsync");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware");
const reviews = require("../controllers/reviews")

ROUTER.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

ROUTER.delete("/:reviewId",isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = ROUTER;