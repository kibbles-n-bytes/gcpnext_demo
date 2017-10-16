'use strict';
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var atob = require('atob');
var gcloud = require('google-cloud')

var TIMEOUT = 1500;
request.debug = true;

if(process.env.PUBSUB_KEY_DATA) {
  var gcpCredentials = JSON.parse(atob(process.env.PUBSUB_KEY_DATA));
  var pubsub = gcloud.pubsub({ credentials: gcpCredentials });

  var topic = pubsub.topic('gcpnext');
  var subscription = topic.subscription('gcpnext');

  var deleteSubscription = subscription.exists().then(
      b => b[0] ? subscription.delete() : Promise.resolve(),
      console.log);
} else {
  var gcpCredentials = null;
}

function server(options) {
  var app = express();

  if (options.log) {
    app.use(function(req, res, next) {
      console.log(req.method, req.originalUrl);
      next();
    });
  }
  app.use(bodyParser.json());

  function createMaybe(thing, s) {
    return thing.exists().then(
        function(data) {
          if(data[0]) {
            return Promise.resolve();
          } else {
            console.log("creating " + s);
            return thing.create();
          }
        },
        console.log
    );
  }

  function error(res, status, message) {
    res.status(status).json({
      error: status,
      message: message
    });
  }

  function createSubscriptionMaybe() {
    return createMaybe(subscription, "subscription");
  }

  function createTopicMaybe() {
    return createMaybe(topic, "topic");
  }

  function getHelper(uriFunc, svc) {
    return function(req, res) {
      rq({uri: getURL(uriFunc(req.params), svc), timeout: TIMEOUT}, function(err, msg, response) {
          res.status(msg.statusCode).json(response);
        });
    };
  }

  function getURL(uri, svc) {
    if (uri.startsWith("http")) {
      return uri;
    }
    return "http://"+svc.host+":"+svc.port+uri;
  }

  function postHelper(uriFunc, svc) {
    return function(req, res) {
      let requestOptions = {
          uri: getURL(uriFunc(req.params), svc),
          timeout: TIMEOUT,
          method: 'POST',
          body: req.body,
          json: true
      };
      rq(requestOptions, function(err, msg, response) {
        res.status(msg.statusCode).json(response);
      });
    }
  }

  function publishMessage(msg) {
    if(gcpCredentials) {
      console.log("publishing message: " + msg);
      deleteSubscription.then(createTopicMaybe, console.log)
          .then(createSubscriptionMaybe, console.log)
          .then(_ => topic.publish({ data: msg}), console.log)
          .then(console.log, console.log);
    }
  }

  function rq(opts, callback) {
    if (!('headers' in opts)) {
      opts.headers = {};
    }
    return request(opts, callback)
  }

  // books inventory
  app.get('/shelves', getHelper(_ => '/shelves', options.books));
  app.get('/shelves/:shelf', getHelper(params => '/shelves/' + params.shelf, options.books));
  app.get('/shelves/:shelf/books',
      getHelper(params => '/shelves/' + params.shelf + '/books', options.books));
  app.get('/shelves/:shelf/books/:book',
      getHelper(params => '/shelves/' + params.shelf + '/books/' + params.book, options.books));

  // users
  app.get('/users', getHelper(_ => '/users', options.users));
  app.get('/users/:user', getHelper(params => '/users/' + params.user, options.users));
  app.get('/users/:user/books',
      getHelper(params => '/users/' + params.user + '/books', options.users));
  app.get('/users/:user/books/:book',
      getHelper(params => '/users/' + params.user + '/books/' + params.book, options.users));

  // purchases
  app.get('/purchases', getHelper(_ => '/purchases', options.purchases));
  app.post('/purchases', function(req, res) {
      postHelper(_ => '/purchases', options.purchases)(req, res);
      publishMessage("purchase made");
  });
  app.get('/purchases/:purchase', getHelper(params => '/purchases/' + params.purchase, options.purchases));

  // TODO(mkibbe): Re-enable once front-end Angular files build properly again.
  // app.use(express.static('dist'));

  return app
}

var port = process.env.PORT || '8080';
var options = {
  log: true,
};
options.users = {
  host: process.env.SVC_USERS_HOST || "users",
  port: process.env.SVC_USERS_PORT || "8080",
};
options.books = {
  host: process.env.SVC_BOOKS_HOST || "inventory",
  port: process.env.SVC_BOOKS_PORT || "8080",
};
options.purchases = {
  host: process.env.SVC_PURCHASES_HOST || "purchases",
  port: process.env.SVC_PURCHASES_PORT || "8080",
};

var svcname = process.env.SVC_NAME || "defaultapp";
svcname = svcname.split("-")[0];
options.svc_id = svcname + "." + (process.env.SVC_NAMESPACE || "default")
console.log(options);

var s = server(options).listen(port, '0.0.0.0',
    function() {
      var host = s.address().address;
      var port = s.address().port;
      console.log('Purchases listening at http://%s:%s', host, port);
    }
);
