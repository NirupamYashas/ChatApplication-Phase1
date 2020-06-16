const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = process.env.PORT || 3000

app.use(express.static(__dirname + "/public"))
let clients = 0

var fs = require('fs'),
    socket = require("socket.io"),
    path = require('path');

io.on('connection', function (socket) {
    socket.on("NewClient", function () {
        if (clients < 2) {
            if (clients == 1) {
                this.emit('CreatePeer')
            }
        }
        else
            this.emit('SessionActive')
        clients++;
    })
    socket.on('Offer', SendOffer)
    socket.on('Answer', SendAnswer)
    socket.on('disconnect', Disconnect)

    socket.on('chat',function(data){
  io.sockets.emit('chat',data);
});

socket.on('typing',function(data){
  socket.broadcast.emit('typing',data);
});

socket.on('disconnect', function(){
  console.log('Client disconnected');
});

socket.on('upload-image', function (message) {

  var writer = fs.createWriteStream(path.resolve(__dirname, './public/tmp/' + message.name), {
      encoding: 'base64'
  });

  console.log('Uploading image...');

  writer.write(message.data);
  writer.end();

  writer.on('finish', function () {
      console.log('Image uploaded!');

      io.sockets.emit('image-uploaded', {
          name: '/tmp/' + message.name,
          h: message.h
      });

  });
});


});

function Disconnect() {
    if (clients > 0) {
        if (clients <= 2)
            this.broadcast.emit("Disconnect")
        clients--
    }
}

function SendOffer(offer) {
    this.broadcast.emit("BackOffer", offer)
}

function SendAnswer(data) {
    this.broadcast.emit("BackAnswer", data)
}


http.listen(port, () => console.log(`Active on ${port} port`))
