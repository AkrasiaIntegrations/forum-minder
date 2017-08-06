// server.js
var express = require('express');
var bodyParser = require('body-parser');
var Request = require('request');

var app = express();

app.use(express.static('public'));
app.use(bodyParser.json()); // for parsing application/json

var AKRASIA_BASE_URL = 'https://akr.asia'
var akrasiaCallback = function(session, result) {
  Request.post({
    url: AKRASIA_BASE_URL + '/integrations/callback',
    body: {
      'session': session,
      'result': result // valid keys: value, timestamp, daystamp, comment, requestid
    },
    json: true
  })
};

app.post("/fetch", function(request, response) {
  console.log('Fetch called.');
  var callbackSession = request.body.session;
  var userOptions = request.body.user_options;
  
  var forumUsername = userOptions.forum_username;
  
  response.send({'result': 'started'});
  
  Request('http://forum.beeminder.com/u/' +  forumUsername + '/summary.json', function(err, res, body) {
    var forumData = JSON.parse(body);
    
    var forumPostCount = forumData.user_summary.post_count;
    
    var result = {
      value: forumPostCount,
      comment: 'via Akrasia integration: Pinboard Unread Count'
    };
    akrasiaCallback(callbackSession, result);
    console.log(result);
  });
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
