/**
 * Created by bingo on 2017/7/4.
 */

var
    gameport = process.env.PORT || 4004,
    io = require('socket.io'),
    express = require('express'),
    UUID = require('node-uuid'),
    verbose = false,
    http = require('http'),
    app = express(),
    server = http.createServer(app);

server.listen(gameport);
console.log('\t :: Express :: Listening on port ' + gameport);

app.get('/', function (req, res) {
    console.log('trying to load %s', __dirname + '/index.html');
    res.sendfile('/index.html', {root: __dirname});
});

app.get( '/*' , function( req, res, next ) {

    //This is the current file they have requested
    var file = req.params[0];

    //For debugging, we can track what files are requested.
    if(verbose) console.log('\t :: Express :: file requested : ' + file);

    //Send the requesting client the file.
    res.sendfile( __dirname + '/' + file );

}); //app.get *


var sio = io.listen(server);

sio.configure(function () {
    sio.set('log level', 0);
    sio.set('authorization', function (handshakeData, callback) {
        callback(null, true); // error first callback style
    });
});

var game_server = require('./server.js');

sio.sockets.on('connection', function (client) {

    client.userid = UUID();
    client.emit('onconnected', {id:client.id});
    console.log('\t socket.io:: player ' + client.userid + ' connected');
    client.on('message', function (msg) {
        console.log("msg:" + JSON.stringify(msg));
        console.log("game_server:" + game_server);
        game_server.handleMsg(msg)
    });
    client.on('disconnect', function () {
        console.log('\t socket.io:: client disconnected ' + client.userid + ' ' + client.game_id);

    });
});
