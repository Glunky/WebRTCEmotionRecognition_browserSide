const express = require('express');
const fs = require('fs');
const app = express();
const https = require('https').createServer({
    key: fs.readFileSync(__dirname + '/ssl/server.key'),
    cert: fs.readFileSync(__dirname + '/ssl/server.cert')
}, app);
const io = require('socket.io')(https);

app.use("/static", express.static('./static/'));
app.use("/models", express.static('./models/'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
    function log() {
        var array = [">>> "];
        for(var i = 0; i < arguments.length; i++) {
            array.push(arguments[i]);
        }
        socket.emit('log', array);
    }

    socket.on('message', function (message) {
        log('Got message: ', message);
        socket.broadcast.emit('message', message); 
    });

    socket.on('create or join', function (room) {
        var numClients = io.sockets.clients(room).length;

        log('Room ' + room + ' has ' + numClients + ' client(s)');
        log('Request to create or join room', room);

        if(numClients == 0) {
            socket.join(room);
            socket.emit('created', room);
        }

        else if(numClients == 1) {
            io.sockets.in(room).emit('join', room);
            socket.join(room);
            socket.emit('joined', room);
        }

        else { 
            socket.emit('full', room);
        }

        socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
        socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);
    });
});

https.listen(3000, function () {
    console.log('Example app listening on port 3000! Go to https://localhost:3000/')
})