const express=require('express');
const app=express();
const path=require('path');
const mongoose =require('mongoose');
const CampGround=require('./models/campground');
const methodOverride=require('method-override');
const ejsMate=require('ejs-mate');
const catchAsync =require('./utils/catchAsync');
const ExpressError=require('./utils/ExpressError');
const Joi=require('joi');
const { campgroundSchema } = require('./schemas.js');
const Review=require('./models/review');
// conat {reviewSchema}=require('')

mongoose.connect('mongodb://127.0.0.1:27017/yelp_camp ',{useNewUrlParser: true,useUnifiedTopology: true})
    .then(() => console.log("Mongo Database connected!"))
    .catch(err => console.log(err));

app.engine('ejs',ejsMate)    
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'))

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//Initial for checking
app.get('/', (req, res)=> {
    res.send("Hi");
    res.send
})
//List of all Campgrounds
app.get('/campgrounds',catchAsync(async(req,res,next)=> {
    const campgrounds= await CampGround.find({});
    res.render('./campgrounds/index',{campgrounds});

}))

//New CampGround 
/*Since "campgrounds/:id" comes first my get for "campgrounds/new" will result in allocating "new" as id.
Maybe this could be your cause as well? Or if it helps anybody else.*/
app.get('/campgrounds/new',  (req,res)=> {
    
    res.render('campgrounds/new');
})
// Add new Campground
app.post('/campgrounds',validateCampground, catchAsync(async (req,res,next)=> {
    // await CampGround.insertMany(req.body); //not able to go to show page otherwise it's fine
    const newcamp = new CampGround(req.body);
    await newcamp.save();
    res.redirect(`/campgrounds/${newcamp._id}`);
    
}))

//details page or show page
app.get('/campgrounds/:id',catchAsync(async(req,res,next)=> {
    const campground=await CampGround.findById(req.params.id);
    res.render('./campgrounds/show',{campground});
}))

//Edit 
app.get('/campgrounds/:id/edit',catchAsync(async (req,res,next)=> { //dont forget await and async
    const campground=await CampGround.findById(req.params.id);
    res.render('./campgrounds/edit', {campground} );
}))
//Edit form request
app.put('/campgrounds/:id',catchAsync(async (req,res,next)=> {
    const {id}=req.params;
    const campground=await CampGround.findByIdAndUpdate(id,req.body,{runValidators:true,new:true});
    // const campground=await CampGround.findByIdAndUpdate(id,{...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
}))
//delete
app.delete('/campgrounds/:id',catchAsync(async (req,res,next)=> {
    const {id}=req.params;
    await CampGround.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

//Submit the review
app.post('/campgrounds/:id/reviews',catchAsync(async(req,res,next)=> {
    // res.send(req.params.id);
    // res.send(mongoose.Types.ObjectId.isValid(req.params.id));
    const campground=await CampGround.findById(req.params.id);
    // res.send();
    const review=new Review(req.body.review);
    // res.send(campground);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    
    res.redirect(`/campgrounds/${campground._id}`);

}))
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000,()=> {
    console.log("Serving on port 3000");
})


//For checking connection with database 
// app.get('/campground', async (req, res)=> {
//     const camp=new CampGround({ title:"Ranthambore",price:'5000',description:'Best for sightseeing and wildlife experience',location:'Rajasthan'});
//     await camp.save();
//     res.send(camp);
// })