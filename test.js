const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const Campground = require('./models/campground');
const campground = require('./models/campground');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("db connected")
})

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));



const testCampground = new Campground({
  title: "Test Camp",
  image: "test.jpg",
  price: "not-a-number",
  description: "Test Description",
  location: "Test Location"
});

testCampground.save()
  .then(() => console.log("Saved successfully"))
  .catch(err => console.log("Error:", err.message));
