const Location = require("../models/location");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
    const {id} = req.params;
    const location = await Location.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    location.reviews.push(review);
    await review.save();
    await location.save();
    req.flash('success', 'Succesfully created a new review')
    res.redirect(`/locations/${location._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const {id, reviewId} = req.params;
    await Location.findByIdAndUpdate(id, { $pull: { reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted your review');
    res.redirect(`/locations/${id}`);
}