var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

let clients = {}
let groups = {};

io.on('connection', function (socket){
    if(!clients.hasOwnProperty(socket.id)){
        clients[socket.id] = socket
    }

    socket.on('message', function (message) {
        console.log('Got message: ', message);
        // For a real app, should be room only (not broadcast)
        socket.broadcast.emit('message', message);
    });

    socket.on('joinRoom', function (room) {
        if(!groups.hasOwnProperty(room)){
            groups[room] = new Map();
            console.log("Group " + room + " has been created");
        }

        numClients = groups[room].size;

        if (numClients == 0) {
            sid = socket.id;
            groups[room].set(sid, socket);
            clients[sid].cliType = "offer"
            socket.emit('created')
        }

        else if (numClients == 1) {
            sid = socket.id;
            groups[room].set(sid, socket);
            clients[sid].cliType = "answer"
            socket.emit('joined')
        }

        else { // max two clients
            console.log(room + "group is full")
        }
    });

    socket.on('onMessage', function (message) {
        console.log('Got message:', message);
        // for a real app, would be room only (not broadcast)
        socket.broadcast.emit('onMessage', message);
    });

    socket.on('disconnect', function(){
        console.log("user " + socket.id + " has been disconnected");
        groups["Apex"].delete(socket.id)
        delete clients[socket.id]
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
