var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var hbs = require('express-handlebars');
var Handlebars = require('handlebars'); // Import Handlebars
var app = express();
var db = require('./config/connection');
var fileUpload = require('express-fileupload');
var session = require('express-session');

// Register the toFixed helper
// Register the multiply helper
Handlebars.registerHelper('multiply', function (price, quantity) {
  // Remove commas from price string and convert to float
  const numPrice = parseFloat(price.replace(/,/g, ''));
  const numQuantity = parseInt(quantity, 10);

  if (isNaN(numPrice) || isNaN(numQuantity)) {
    return 'NaN';
  }
  return (numPrice * numQuantity).toFixed(2);
});

Handlebars.registerHelper('reverseArray', function (array) {
  if (!Array.isArray(array)) {
    throw new Error('reverseArray helper requires an array as the first argument');
  }
  // Return a reversed copy of the array
  return array.slice().reverse();
});


// Register the formatPrice helper
Handlebars.registerHelper('formatPrice', function (price) {
  // Remove commas and convert to a number
  const numPrice = parseFloat(price.replace(/,/g, ''));
  if (isNaN(numPrice)) {
    return 'Invalid Price';
  }
  // Convert to Indian currency format
  return '₹ ' + numPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
});

// Register the formatDate helper
Handlebars.registerHelper('formatDate', function(date) {
  if (!date) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
});

// Register the eq helper
// Register the ifEqual helper
Handlebars.registerHelper('ifEqual', function (a, b, options) {
    if (a === b) {
      return options.fn(this); // Render the "if" block
    } else {
      return options.inverse(this); // Render the "else" block
    }
  });
  
// Register the checkStatus helper
Handlebars.registerHelper('checkStatus', function(status, options) {
  if (status === 'placed') {
    return options.fn(this); // Render the "if" block
  } else {
    return options.inverse(this); // Render the "else" block
  }
});
Handlebars.registerHelper('ne', function (v1, v2) {
  return v1 !== v2;
});

// Register other helpers as needed, for example:
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
// view engine setup 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, 'views/layout/'),
  partialsDir: path.join(__dirname, 'views/partials/'),
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    helpers: {
      json: Handlebars.helpers.json,
      ne: Handlebars.helpers.ne,
      eq: Handlebars.helpers.eq,
      or: Handlebars.helpers.or,
    },
  },
  handlebars: Handlebars // Pass Handlebars with the custom helper registered
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(session({ secret: "key", cookie: { maxAge: 6000000 } }));

db.connect((err) => {
  if (err) console.log('error in connection');
  else console.log('successful connection');
});

app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
