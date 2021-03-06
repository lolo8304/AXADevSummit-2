var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

/*swagger */
var argv = require('minimist')(process.argv.slice(2));
var swagger = require("swagger-node-express");

// add mongo connection
var mongo = require('mongodb');
var monk = require('monk');

// Connect to remote DB, settings are extended due to Firefall issues between nodejs -> mongodb
// depending on the installed mongodb driver, settings are different
// poolSize vs maxPoolSize
// keepAlive vs socketOptions.keepAlive
// connectTimeoutMS vs socketOptions.connectTimeoutMS
/*var dbURL = 'HackZurich2016-user:password@40.68.213.58:27018/hackzurich2016-axa'
    +'?'
    +       'maxPoolSize=10'
    +'&'+   'poolSize=10'
    +'&'+   'keepAlive=60000'
    +'&'+   'socketOptions.keepAlive=60000'
    +'&'+   'connectTimeoutMS=10000'
    +'&'+   'socketOptions.connectTimeoutMS=10000'
    +'&'+   'reconnectTries=5';
*/
// uncomment for localhost database
var dbURL = 'localhost:27018/axadevsummit2';
    
var db = monk(dbURL);
console.log("mongodb connected with URL="+dbURL);

// CORS issues
var cors = require('express-cors')

//var routes = require('./routes/index');
var axa = require('./routes/axa');
//var users = require('./routes/users');

var app = express();

app.use(cors({
    "origin": false,
    "allowedOrigins" : [
        'http://localhost:8080', 'http://127.0.0.1:8080', 'http://petstore.swagger.io', '*'
    ]
}))
app.use(express.static(path.join(__dirname, '/dist')));

/* view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
*/


// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

/* swagger */
var subpath = express();
app.use("/v1", subpath);
swagger.setAppHandler(subpath);

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/dist/index.html'));
});

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

/* swagger - line removed */
// app.use('/', routes);

app.use('/axa', axa);
//app.use('/test', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send(err.message);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});



module.exports = app;
