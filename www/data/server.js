var http = require('http');
var polo = require('polo');
var apps = polo({ monitor: true, heartbeat: 3 });

var server = http.createServer(function(req, res) {
    if (req.url !== '/') {
        res.writeHead(404);
        res.end();
        return;
    }

    res.end('hello-http is available at http://' + apps.get('hello-http').address);
});

server.listen(0, function() {
    var port = server.address().port; // let's find out which port we binded to

    apps.put({
        name: 'foca-media',
        port: port
    });

    console.log('visit: http://localhost:' + port);
});