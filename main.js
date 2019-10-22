room = "Apex"
var socket = io();
socket.emit('joinRoom', room);

function onMessage() {
    let message = document.getElementById("chatinfo").valueOf().value
    socket.emit("onMessage", {'message': message})
}

socket.on('onMessage', function(msg){
    $('#messages').append($('<li>').text(msg['message']));
    console.log(msg['message'])
});
