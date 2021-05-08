const express = require('express');
const formateMessage = require('./utils/formateMessage');
const {
  userJoin,
  getCurrentUser,
  leaveChat,
  getRoomUsers,
} = require('./utils/users');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const chatbot = 'Chat Bot';

app.use(express.static(path.join(__dirname, 'public')));
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    //this message only show to the single user
    socket.emit('message', formateMessage(chatbot, 'welcomr to the chatbox'));

    //this message show every others without the connected suer
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formateMessage(chatbot, `${user.username} has connected to the chat`)
      );

    // send room user info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //listen the message from client
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formateMessage(user.username, msg));
  });

  socket.on('disconnect', () => {
    const user = leaveChat(socket.id);

    if (user) {
      //this message is for everyone
      io.to(user.room).emit(
        'message',
        formateMessage(chatbot, `${user.username} has left from the chat`)
      );

      // send room user info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`server is running on port ${PORT}`));
