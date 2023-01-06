const mongoose =require('mongoose');
const CampGround=require('../models/campground');
const cities=require('./cities');
const { descriptors, places } = require('./seedhelper');
// const {descriptors,places}=require('./seedhelper');

mongoose.connect('mongodb://127.0.0.1:27017/yelp_camp ',{useNewUrlParser: true,useUnifiedTopology: true})
    .then(() => console.log("Mongo Database connected!"))
    .catch(err => console.log(err));

const sample=array => array[Math.floor(Math.random()*array.length)];

const newDB = async() => {
    await CampGround.deleteMany({});
    // const p=CampGround({title:'eg'});
    for(let i=0;i<50;i++) {
        const random=Math.floor(Math.random()*1000);
        const p=Math.floor(Math.random()*20)+10;
        const camp=new CampGround( {
            author:'63b7f89efa730f1b1f0e783f',
            location:`${cities[random].city}, ${cities[random].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            image:'https://source.unsplash.com/collection/483251',
            description:'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Non voluptatibus et, sint hic quasi sequi, delectus distinctio perferendis dolores facere architecto odit earum. A minus delectus at explicabo culpa vel!',
            price:p
        })
        await camp.save();
    }
}

newDB().then(()=> {
    mongoose.connection.close();
})


//Random Number from array
// array[Math.floor(Math.random()*array.length)];