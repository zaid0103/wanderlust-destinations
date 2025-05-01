const mongoose= require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema=new Schema({
    comment:String,
    rating:{
        type:Number,
        min:0,
        max:5,
    },
    createAt:{
        type:Date,
        default:Date.now(),
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
});

module.exports = mongoose.model("Review",reviewSchema);