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

    socket.on('joinRoom', function (room) {
        if(!groups.hasOwnProperty(room)){
            groups[room] = new Map();
            console.log("Group " + room + " has been created")
        }

        numClients = groups[room].size;

        if (numClients < 5) {
            sid = socket.id;
            groups[room].set(sid, socket)
            console.log("Client " + socket.id + " has been added into " + room + " group")
            console.log(groups[room].size + " client in " + room + " group now")
        }
        else { // max two clients
             console.log(room + "group is full")
        }
    });

    socket.on('onMessage', function (message) {
        console.log('Got message:', message);
        // for a real app, would be room only (not broadcast)
        io.emit('onMessage', message);
    });

    socket.on('disconnect', function(){
        console.log("user " + socket.id + " has been disconnected");
        groups["Apex"].delete(socket.id)
        delete clients[socket.id]
        console.log(clients)
        console.log(groups)
    });

    /*
  // convenience function to log server messages on the client
    function log(){
        var array = [">>> Message from server: "];
      for (var i = 0; i < arguments.length; i++) {
          array.push(arguments[i]);
      }
        socket.emit('log', array);
    }

    socket.on('message', function (message) {
        log('Got message:', message);
    // for a real app, would be room only (not broadcast)
        socket.broadcast.emit('message', message);
    });

    socket.on('create or join', function (room) {
        var numClients = io.sockets.clients(room).length;

        log('Room ' + room + ' has ' + numClients + ' client(s)');
        log('Request to create or join room ' + room);

        if (numClients === 0){
            socket.join(room);
            socket.emit('created', room);
        } else if (numClients === 1) {
            io.sockets.in(room).emit('join', room);
            socket.join(room);
            socket.emit('joined', room);
        } else { // max two clients
            socket.emit('full', room);
        }
        socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
        socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);
    });
*/
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
