var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var twitter = require('ntwitter');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

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

var server = app.listen(3000);
var io = require('socket.io').listen(server);

var hashtagArray = new Array(1000);
var trending = new Array();
var counts = []
var arrCount = 0;

//Creating the ntwitter client
var twit = new twitter({
  consumer_key: 'v9BIUekmGglxjrty77VbNZdPM',
  consumer_secret: 'qD4mnlXLHPdhbDOrZvGSRJjv0UEzwxZD3cVbrSqQbWgMXRDn83',
  access_token_key: '25076520-1T97cLiNDmjqAgFcBDcnwPURkyxh1Ta6WQlTSZkpS',
  access_token_secret: 'NWnJflgeXljmeKtzkbei3oigd1ung2lahm3vYxJje7M60'
});

var english = /^[A-Za-z0-9]*$/;

twit.stream('statuses/sample', function(stream) {
  stream.on('data', function (data) {

    tArrCount = arrCount%1000;

    var splitTweet = data["text"].split("#");
    for(var i = 1; i < splitTweet.length; i++) {
      var hashtag = splitTweet[i].split(" ");

      if(hashtag[0].trim().length > 0 && english.test(hashtag[0].trim())) {
        currentCount = 1;
        if (counts[hashtag[0]] != undefined && counts[hashtag[0]] != null) {
          currentCount = parseInt(counts[hashtag[0]]) + 1;
          hashtagArray[tArrCount] = hashtag[0];
        }

        counts[hashtag[0]] = currentCount;

        trending = trending
            .filter(function (el) {
              return el.name !== hashtag[0];
            });

        trending.push({name: hashtag[0], val: counts[hashtag[0]]});

        var tArrCount = arrCount%1000;
        var lastSeenHashtag = hashtagArray[tArrCount];
        if(lastSeenHashtag != undefined && lastSeenHashtag != null) {
          var tempCount = parseInt(counts[lastSeenHashtag]);
          if(tempCount == undefined)
            break;
          trending = trending
              .filter(function (el) {
                return el.name !== lastSeenHashtag;
              });
          if (tempCount == 0) {
            counts[hashtagArray[tArrCount]] = 0;
          } else {
            counts[lastSeenHashtag] = tempCount - 1;
            trending.push({name: lastSeenHashtag, val: counts[lastSeenHashtag]});
          }
        }

        trending.sort(function(a, b) {
          return b.val - a.val;
        });

        var twerp = 0;

        var topTrending = new Array();
        for(var key in trending) {
          if(twerp > 10)
            break;

          twerp++;
          topTrending.push({name: trending[key].name, val: counts[trending[key].name]});
        }

        trending = topTrending;
        //console.log(trending);
        arrCount = (++arrCount)%1000;

      }
    }
  });
});

var connected = 0;

io.on('connection', function(socket){
    connected++;
    socket.on('get-trending', function(msg){
        io.emit('trending', trending);
    });
});



module.exports = app;
