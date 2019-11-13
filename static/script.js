//const video = document.getElementById('video')

var clientType = "";

var PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
var SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia || navigator.mediaDevices.mozGetUserMedia || navigator.mediaDevices.webkitGetUserMedia;
var pc; // PeerConnection
// Step 1. getUserMedia
navigator.getUserMedia(
    { audio: true, video: true },
    gotStream,
    function(error) { console.log(error) }
);

function gotStream(stream) {
    document.getElementById("callButton").style.display = 'inline-block';
    document.getElementById("localVideo").srcObject = stream;
    pc = new PeerConnection(null);
    pc.addStream(stream);
    pc.onicecandidate = gotIceCandidate;
    pc.onaddstream = gotRemoteStream;
}
// Step 2. createOffer
function createOffer() {
    pc.createOffer(
        gotLocalDescription,
        function(error) { console.log(error) },
        { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } }
    );
}
// Step 3. createAnswer
function createAnswer() {
    pc.createAnswer(
        gotLocalDescription,
        function(error) { console.log(error) },
        { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } }
    );
}

function gotLocalDescription(description){
    pc.setLocalDescription(description);
    sendMessage(description);
}

function gotIceCandidate(event){
    if (event.candidate) {
        sendMessage({
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate
        });
    }
}

let video = document.getElementById("remoteVideo");
function gotRemoteStream(event){
    document.getElementById("remoteVideo").srcObject = event.stream;
    
    
    if(clientType === "offer"){
        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]).then(console.log("loaded"));
          
          video.addEventListener('play', () => {
            const canvas = document.getElementById("canvas");
            //const canvas = faceapi.createCanvasFromMedia(video)
            //document.body.append(canvas)
            const displaySize = { width: video.getBoundingClientRect().width, height: video.getBoundingClientRect().height }
            faceapi.matchDimensions(canvas, displaySize)
            setInterval(async function() {
                try{
                  const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
                  const resizedDetections = faceapi.resizeResults(detections, displaySize)
                  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
                  faceapi.draw.drawDetections(canvas, resizedDetections)
                  faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
                }
                catch{

                }
            }, 100)
          });
    }
  }
////////////////////////////////////////////////
// Socket.io
var socket = io.connect('', {port: 1234});
function sendMessage(message){
    socket.emit('message', message);
}
socket.on('message', function (message){
    if (message.type === 'offer') {
        clientType = "answer";
        pc.setRemoteDescription(new SessionDescription(message));
        createAnswer();
    }
    
    else if (message.type === 'answer') {
        clientType = "offer";
        pc.setRemoteDescription(new SessionDescription(message));
    }

    else if (message.type === 'candidate') {
        var candidate = new IceCandidate({sdpMLineIndex: message.label, candidate: message.candidate});
        pc.addIceCandidate(candidate);
    }
});
