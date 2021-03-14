const mongoose = require("mongoose");
const movieSchema = new mongoose.Schema({
    title: String,
    country: String,
    release_year:Number,
    duration: String,
    rating: Number,
    description : String,
    image: String,
    genre: String,
    likes :{
        type : Number,
        default:0
    } 
});

const Movies = mongoose.model('movies', movieSchema);

module.exports = Movies;