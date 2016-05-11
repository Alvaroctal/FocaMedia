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

      app.get('/trailer/:movieName', function(req, res){
        //console.log("prueba");
        //res.send(req.params.movieName);
        getTrailer(req.params.movieName, function(data){
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
}

  function getTrailer(movieName, callback){
  	var Xray = require("x-ray");
    console.log(movieName.replace(/ /g, "+"));
  	var xray = new Xray();
  	xray('https://www.youtube.com/results?search_query=' + movieName.replace(/ /g, "+")+'trailer', 'a',
  		[{
  			a:'',
  			href: '@href',
  			css: '@class'
  		}]
  	)(function(err, a){
  		var found = false;
  		var i = 0;
  		while((found === false) && (i < a.length)){
  			var obj = a[i];
  			if(obj.a !== 'undefined' && obj.href.indexOf("watch?v=") !== -1){
  				if(obj.a.toLowerCase().indexOf(movieName) !== -1 && obj.href.split("watch?v=")[1] !== 'undefined'){
  					return callback("https://www.youtube.com/embed/" + obj.href.split("watch?v=")[1]);
  				}
  			}
  			i = i+1;
  		}
  	});
  }
