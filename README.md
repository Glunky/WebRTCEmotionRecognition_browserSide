WebRTC and [face-api.js](http://example.com) implementation for video calls with face detection and emotion recognition possibility 
on client (browser) side.

# Installation and usage
Just download project and run server by command "node server.js" in root directory.
Then go to https://localhost:3000/. Note that in project use not signed certificate so when you go to localhost you see notation about it.
So anyway just skip this notation and you see example scene. Press "Yes" if browser will require access to your webcamera. 
You also should open second page and do same to create connection. Then just press call-button and you see yourself in main window. 
After about 5-10 second you should see face-detector and emotion-recognition module. Note that only first client see emotions of second client.
Second user cannot see emotions of first user. If you need both users detecting, change static/script.js by deleting if-statements.
