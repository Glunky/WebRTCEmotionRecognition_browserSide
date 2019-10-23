var io = require('socket.io-client');
var socket = io.connect("http://localhost:3000/", {
    reconnection: true
});

room = "Apex"
socket.emit('joinRoom', room);

socket.on('connect', function () {
    console.log('connected to localhost:3000');
});

socket.on('onMessage', function(msg){
    //$('#messages').append($('<li>').text(msg['message']));
    console.log(msg['message'])
});
