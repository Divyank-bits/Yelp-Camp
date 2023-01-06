
const mongoose =require('mongoose');
const review = require('./review');
//for shortning the code
const schema=mongoose.Schema;

const campgroundSchema =new schema( {
    title:String,
    image:String,
    price:Number,
    description:String,
    location:String,
    author: {
        type: schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: schema.Types.ObjectId,
            ref:'Review'
        }
    ]
});

//Deleting all reviews if the campground is deleted
campgroundSchema.post('findOneAndDelete',async(doc)=> {
    if(doc) {
        await review.remove({
            _id: { 
                $in: doc.reviews
            }
        })
    }
})

module.exports=mongoose.model('CampGround',campgroundSchema);
