const express = require('express');
const router = express.Router({ mergeParams: true });

const CampGround = require('../models/campground');
const Review = require('../models/review');

const { reviewSchema } = require('../schemas.js');

const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

//Submit the review
router.post('/',isLoggedIn,validateReview,catchAsync(async(req,res,next)=> {
    const campground=await CampGround.findById(req.params.id);
    const review=new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);

}))

//Delete a review
router.delete('/:reviewId',isLoggedIn, isReviewAuthor,catchAsync(async(req,res,next)=> {
    // res.send(req.params);
    const { id,reviewId } = req.params;
    await CampGround.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports=router;