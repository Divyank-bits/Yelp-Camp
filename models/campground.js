
const mongoose =require('mongoose');
//for shortning the code
const schema=mongoose.Schema;

const campgroundSchema =new schema( {
    title:String,
    image:String,
    price:Number,
    description:String,
    location:String,
    reviews: [
        {
            type: schema.Types.ObjectId,
            ref:'Review'
        }
    ]
});

module.exports=mongoose.model('CampGround',campgroundSchema);
