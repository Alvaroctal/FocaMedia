// server.js

    // set up ========================
    var express  = require('express');
    var app      = express();                               // create our app w/ express


    // listen (start app with node server.js) ======================================
    app.listen(8080);
    console.log("App listening on port 8080");

      //Allow Access-Control-Allow-Origin
      app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

      // routes ======================================================================
      // api ---------------------------------------------------------------------

      app.get('/services', function(req, res){
        getServices(function(data){
          res.send(data);
        })
      });


function getServices(callback){
  var polo = require('polo');
  var apps = polo();
  var service = apps.once('up', function(name, service) {                   // up fires everytime some service joins
      console.log(apps.get(name));
      callback(apps.get(name));
  });
};
