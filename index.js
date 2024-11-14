// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

let users = {};
let messages = []; // Array to store messages

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('join', (username) => {
    users[socket.id] = username;
    socket.broadcast.emit('userJoined', username);
  });

  socket.on('sendMessage', (message) => {
    const username = users[socket.id];
    const messageData = { username, message };
    messages.push(messageData); // Store message in array
    io.emit('receiveMessage', messageData);
  });

  socket.on('leave', () => {
    const username = users[socket.id];
    if (username) {
      delete users[socket.id];
      socket.broadcast.emit('userLeft', username);
    }
  });

  socket.on('disconnect', () => {
    const username = users[socket.id];
    if (username) {
      delete users[socket.id];
      socket.broadcast.emit('userLeft', username);
    }
  });
});

// Endpoint to fetch messages
app.get('/messages', (req, res) => {
  res.json(messages);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
