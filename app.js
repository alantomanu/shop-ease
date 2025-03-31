require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var hbs = require('express-handlebars');
var Handlebars = require('handlebars');
var app = express();
var db = require('./config/connection');
var fileUpload = require('express-fileupload');
var session = require('express-session');

// Register Handlebars helpers
Handlebars.registerHelper('multiply', function (price, quantity) {
  const numPrice = parseFloat(price.replace(/,/g, ''));
  const numQuantity = parseInt(quantity, 10);
  return isNaN(numPrice) || isNaN(numQuantity) ? 'NaN' : (numPrice * numQuantity).toFixed(2);
});

Handlebars.registerHelper('reverseArray', function (array) {
  return Array.isArray(array) ? array.slice().reverse() : 'Invalid input';
});

Handlebars.registerHelper('formatPrice', function (price) {
  const numPrice = parseFloat(price.replace(/,/g, ''));
  return isNaN(numPrice) ? 'Invalid Price' : '₹ ' + numPrice.toLocaleString('en-IN');
});

Handlebars.registerHelper('formatDate', function (date) {
  if (!date) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
});

Handlebars.registerHelper('ifEqual', function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('checkStatus', function (status, options) {
  return status === 'placed' ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ne', function (v1, v2) {
  return v1 !== v2;
});

Handlebars.registerHelper('eq', function (v1, v2) {
  return v1 === v2;
});

Handlebars.registerHelper('or', function () {
  const args = Array.prototype.slice.call(arguments, 0, -1);
  return args.some(Boolean);
});

Handlebars.registerHelper('json', function (context) {
  return JSON.stringify(context);
});

// Configure view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, 'views/layout/'),
  partialsDir: path.join(__dirname, 'views/partials/'),
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
  },
  helpers: Handlebars.helpers,
}));

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(
  session({
    secret: 'your-secret-key', // Replace with a secure key
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 6000000 },
  })
);

// Database connection
db.connect((err) => {
  if (err) {
    console.error('Error in DB connection:', err.message);
  } else {
    console.log('Successfully connected to the database');
  }
});

// Routers
app.use('/', userRouter);
app.use('/admin', adminRouter);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
