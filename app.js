var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');
var session = require("express-session");
var bodyParser = require('body-parser');
var mongo = require("mongodb");
var db = require("monk")("localhost/nodeblog");
var multer = require("multer");
var flash = require("connect-flash");

var routes = require('./routes/index');
var posts = require('./routes/posts');
var category = require('./routes/category');

var app = express();

app.locals.moment = require("moment");

app.locals.truncateText = function(text, length) {
    var shownString = text.substring(0, length);
    return shownString; 
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Handle File uploads and Multipart data
app.use(multer({dest: "./public/images/uploads"}).single("mainimage"));


app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

//Express Sessions
app.use(session({
    secret: "secret",
    saveUninitialized: true,
    resave: true
}));

//Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;
 
    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));
app.use(express.static(path.join(__dirname, 'public')));

//Connect-Flash
app.use(flash());
app.use(function(req, res, next) {
    res.locals.message = require("express-messages")(req, res);
    next();
});

//Make our db accessible to our routers
app.use(function(req, res, next){
    req.db = db;
    next();
})

app.use('/', routes);
app.use('/posts', posts);
app.use('/category', category);


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
