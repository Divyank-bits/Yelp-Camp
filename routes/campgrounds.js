const express=require('express');
const router=express.Router();
const catchAsync =require('../utils/catchAsync');
const ExpressError=require('../utils/ExpressError');
const CampGround=require('../models/campground');
const { campgroundSchema } = require('../schemas.js');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

//List of all Campgrounds
router.get('/',catchAsync(async(req,res,next)=> {
    const campgrounds= await CampGround.find({});
    res.render('campgrounds/index',{campgrounds});

}))

//New CampGround 
/*Since "campgrounds/:id" comes first my get for "campgrounds/new" will result in allocating "new" as id.
Maybe this could be your cause as well? Or if it helps anybody else.*/
router.get('/new', isLoggedIn, (req,res)=> {
    
    res.render('campgrounds/new');
})
// Add new Campground
router.post('/',isLoggedIn,validateCampground, catchAsync(async (req,res,next)=> {
    // await CampGround.insertMany(req.body); //not able to go to show page otherwise it's fine
    
    const newcamp = new CampGround(req.body);
    newcamp.author = req.user._id;
    await newcamp.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${newcamp._id}`);
    
}))

//details page or show page
router.get('/:id',catchAsync(async(req,res,next)=> {
    // const campground=await CampGround.findById(req.params.id).populate('reviews').populate('author');
    const campground = await CampGround.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    // console.log(campground);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{campground});
}))

//Edit 
router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(async (req,res,next)=> { //dont forget await and async
    
    const campground=await CampGround.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground} );
}))
//Edit form request
router.put('/:id',isLoggedIn,isAuthor,catchAsync(async (req,res,next)=> {
    const {id}=req.params;
    const campground=await CampGround.findByIdAndUpdate(id,req.body,{runValidators:true,new:true});
    // const campground=await CampGround.findByIdAndUpdate(id,{...req.body.campground});
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))
//delete a campground
router.delete('/:id',isLoggedIn,isAuthor,catchAsync(async (req,res,next)=> {
    const {id}=req.params;
    // findByIdAndDelete will trriger the middleware tht is used in campground.js for deleting the reviews of the campground
    await CampGround.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}))

module.exports=router;
