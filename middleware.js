const ExpressError = require("./utilities/ExpressError");
const {locationSchema, reviewSchema} = require("./validationSchemas")
const Location = require("./models/location");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
  
  if(!req.isAuthenticated()){
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in");
    return res.redirect("/login");
  }

  next();
}

module.exports.validateLocation = (req, res, next) => {
  const { error } = locationSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const {id} = req.params;
  const foundLocation = await Location.findById(id);
  if(!foundLocation.author.equals(req.user._id)){
    req.flash("error", "You do not have permission to do that");
    return res.redirect(`/locations/${id}`);
  } 
  next();
}

module.exports.validateReview = (req, res, next) => {
  const {error} = reviewSchema.validate(req.body);
  if (error){
      const msg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(msg, 400);
  } else {
      next();
  }
}

module.exports.isReviewAuthor = async (req, res, next) => {
  const {id, reviewId} = req.params;
  const foundReview = await Review.findById(reviewId);
  if(!foundReview.author.equals(req.user._id)){
    req.flash("error", "You do not have permission to do that");
    return res.redirect(`/locations/${id}`);
  } 
  next();
}