const express = require('express');
const mongoose = require('mongoose');
const csv = require('csv-parser');
const fs = require('fs');
const fetch = require('node-fetch');
const Movies = require('./models/movies');
const bodyParser = require('body-parser');

require('dotenv').config()

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static('public'));
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex:true,
    useFindAndModify: false,
    useUnifiedTopology:true
});

app.get('/', (req, res) => {
    var count=0;
var rand = Math.floor(Math.random() * 9683) + 1;

    fs.createReadStream('docs/bollywood.csv')
    .pipe(csv())
    .on('data', (row) => {
  count++;
     if(count==rand){
      const url = 'http://www.omdbapi.com/?t='+ row.Title +'&apikey='+process.env.API_KEY;

fetch(url)
    .then(res => res.json())
    .then(json => {        
        if(json.Poster == "N/A"){
            row.image = "http://www.ttdyradio.com/archive/archive_images/poster_unavailable.jpg";
        }
        else{
            row.image = json.Poster;
        }
          row.imdb = json.imdbRating;
          row.genre = json.Genre;
          row.id=json.imdbID;
          row.release_year=json.Year;
          row.duration=json.Runtime;
          row.country=json.Country;
          row.description=json.Plot;
        if(json.Response == 'False'){
            res.redirect('/');
        }else{
            res.render('home',{movie:row});
        }         
})
}
}).on('end', () => {
    });
});

app.post('/',(req,res)=>{
   const title=req.body.title;
   const country=req.body.country;
   const release_year=req.body.release_year;
   const duration=req.body.duration;
   const rating=req.body.rating;
   const description=req.body.description;
   const image=req.body.image;
   const genre=req.body.genre;

    Movies.exists({ title }).then(exists => {
        if (exists) {
            Movies.findOne({title},(err,movie)=>{
                movie.likes = movie.likes + 1 ;
                movie.save().then(res.redirect('/'));
            });
        } else {
            const movie = new Movies({
                title:title,
                country:country,
                release_year:release_year ,
                duration: duration,
                rating: rating,
                description: description,
                image: image,
                genre: genre,
                likes: 1
            });
            movie.save().then(res.redirect('/'));                
        }
      })
});

app.get('/about', (req, res) => {
    res.render('about');
});
app.get('/liked', (req, res) => {
    Movies.find({ "likes": {$gt:0} }, function (err, movie) {
        if (err)
            console.log(err);
        else {
            res.render("liked", { movie: movie });
        }
    });
});
app.listen(process.env.PORT || 3000);