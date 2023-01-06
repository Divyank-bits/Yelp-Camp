if(process.env.NODE_ENV!=='production') {
    require('dotenv').config({'path': 'config.env'})
}
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
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const Review=require('./models/review');
// conat {reviewSchema}=require('')
const session = require('express-session');
const  flash=require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

//Routes
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const userRoutes = require('./routes/users');

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI,{useNewUrlParser: true,useUnifiedTopology: true})
    .then(() => console.log("Mongo Database connected!"))
    .catch(err => console.log(err));

app.engine('ejs',ejsMate)    
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));


const sessionConfig ={
    secret:"GoodSecret",
    resave:false,
    saveUninitialized:true,
    cookie: {
        httpOnly:true
    }

}
app.use(session(sessionConfig));
app.use(flash());

// app.use((req,res,next)=> {
//     req.flash('success')
// })


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//configuring Routes
app.use('/', userRoutes);
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

//Initial for checking
app.get('/', (req, res)=> {
    res.send("Hi");
    res.send
})


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
