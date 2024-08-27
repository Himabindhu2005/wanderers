if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const Campground = require('./models/campground');
const Review = require('./models/review')
const ejsMate = require('ejs-mate');
const { campgroundSchema, reviewSchema } = require('./schemas')
const ExpressErrors = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash')
const passport = require('passport');
const LocalStratergy = require('passport-local');
const User = require('./models/user')
const mongoSanitize=require('express-mongo-sanitize');
const helmet=require('helmet')
// const MongoStore=require('connect-mongo')


const { title } = require('process');

const userRoute = require('./routes/users')
const campgroundsRoute = require('./routes/campgrounds');
const reviewsRoute = require('./routes/reviews');
const { name } = require('ejs');
const { MongoStore } = require('connect-mongo');
const MongoDbStore=require("connect-mongo")(session);
// const dbUrl=process.env.DB_URL
const dbUrl=process.env.DB_URL||'mongodb://127.0.0.1:27017/yelp-camp';
// dbUrl
mongoose.connect(dbUrl);

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
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
  replaceWith:'_'
}))
 

// const store = MongoStore.create({
//   mongoUrl: dbUrl,
//   touchAfter: 24 * 60 * 60,
//   crypto: {
//       secret: 'thisshouldbeabettersecret!'
//   }
// });

const secret=process.env.SECRET || 'thisismysecret';

const store=new MongoDbStore({
  url:dbUrl,
  secret,
  touchAfter:24 * 60 * 60
});

store.on("error",function(e){
  console.log("session store error",e)
})

const sessionConfig = {
  store,
  name:'session',
  secret,
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure:true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}


app.use(session(sessionConfig))
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  // "https://api.tiles.mapbox.com/",
  // "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  // "https://api.mapbox.com/",
  // "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/", // add this
];

const connectSrcUrls = [
  // "https://api.mapbox.com/",
  // "https://a.tiles.mapbox.com/",
  // "https://b.tiles.mapbox.com/",
  // "https://events.mapbox.com/",
  "https://api.maptiler.com/", // add this
];
const fontSrcUrls=[];

app.use(
  helmet.contentSecurityPolicy({
    directives:{
      defaultSrc:[],
      connectSrc:["'self'",...connectSrcUrls],
      scriptSrc:["'unsafe-inline'","'self'",...scriptSrcUrls],
      styleSrc:["'self'","'unsafe-inline'",...styleSrcUrls],
      workerSrc:["'self'","blob:"],
      objectSrc:[],
      imgSrc:[
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dserpq24p/",
        "http://res.cloudinary.com/dserpq24p",
        "https://images.unsplash.com/",
        "https://api.maptiler.com/",
      ],
      fontSrc:["'self'",...fontSrcUrls],
    },
  })
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
  // console.log(req.user);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})


// passport.use(new LocalStratergy(User.authenticate()));

app.get('/fakeUser', async (req, res) => {
  const user = new User({ email: 'bindu@gmail.com', username: 'bindu' });
  const newUser = await User.register(user, 'balreddy');
  res.send(newUser)
})

app.use('/campgrounds', campgroundsRoute);
app.use('/campgrounds/:id/reviews', reviewsRoute);
app.use('/', userRoute)

app.get('/', (req, res) => {
  res.render("home")
})


app.all('*', (req, res, next) => {
  next(new ExpressErrors('page not found', 404))
})



app.use((err, req, res, next) => {
  const { status = 500, } = err;
  if (!err.message) err.message = 'oh no smtng went wrong!'
  res.status(status).render('error', { err });
});


app.listen(3000, () => {
  console.log("serving on 3000 port")
})

