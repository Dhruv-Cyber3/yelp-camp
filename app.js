const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const expressError = require('./utils/expressError');
const joi = require('joi');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const Review = require('./models/review');


mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log("database connected");
});


const app = express();


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// const validateCampground = (req, res, next) => {
//     const { error } = campgroundSchema.validate(req.body);
//     const msg = error.details.map(el => el.message).join(',')
//     if (error) {
//         throw new expressError(msg, 400)
//     }
//     else {
//         next();
//     }
// }



const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new expressError(msg, 400);
    }
    else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new expressError(msg, 400);
    } else {
        next();
    }
}


//GET REQUEST FOR HOME PAGE

app.get('/', (req, res) => {
    res.render('home');
});



//GET REQUEST TO SHOW ALL CAMPGROUNDS

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
});



//GET REQUEST TO RENDER NEW.EJS 

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});


//POST REQUEST FOR ADDING A CAMPGROUND

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new expressError('Invalid campground Data', 400);

    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);

}));



//GET REQUEST FOR VIEWING CAMPGROUND USING ID

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
}));



//GET REQUEST FOR RENDERING EDIT.EJS 

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}));



//PUT REQUEST FOR CAMPGROUND ID

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
}));


//DELETE REQUEST FOR DELETING CAMPGROUND

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));


app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))


app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))


app.all('*', (req, res, next) => {
    next(new expressError('Page not found', 404))
})

app.use((err, req, res, next) => {
    // const { statusCode = 500 } = err;
    // if (!err.message) err.message = "Something went wrong"
    // res.status(statusCode).render('error', { err });
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'something went wrong';
    res.status(statusCode).render('error', { err });
})



//LISTENING 

app.listen(3000, () => {
    console.log('listening on 3000');
})