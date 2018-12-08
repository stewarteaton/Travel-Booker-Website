require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// Declared mongoose constant here
const mongoose = require('mongoose');
// Declare compression
const compression = require('compression');
const helmet = require('helmet');

var indexRouter = require('./routes/index');

// For Sessions
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

// For flash messages 
const flash = require('connect-flash');

// For passport.js 
const User = require('./models/user');
const passport = require('passport');

var app = express();
app.use(helmet());
// Compress responses
app.use(compression());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//set up session as middleware  secret used to sign cookie
app.use(session({
  secret: process.env.SECRET,
  // new session is not saved to DB unless session is modified
  saveUninitialized: false,
  resave: false,
  // takes in mongoose connection as constant
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}))

// Configure passport middleware
app.use(passport.initialize());
app.use(passport.session());
//Strategy is a user password combo
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash messages as middleware
app.use(flash());

// Setting up our middleware to work
app.use( (request, response, next) =>{
  response.locals.user = request.user;
  // request.path is the url 
  // allows us to access url local anywhere in project
  response.locals.url = request.path;
  // makes flash available everywhere
  response.locals.flash = request.flash();
  next();
});

//set up mongoose connection  copy URI from mLab
mongoose.connect(process.env.DB, { useNewUrlParser: true });

//allows us to use native promise library with ES6 for sending information back and forth
mongoose.Promise = global.Promise;

//add event listener to check for errors
mongoose.connection.on('error', (error) => console.error(error.message) );
 

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
