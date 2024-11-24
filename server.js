const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

const users = {};
const messages = [];

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Set username
  socket.on('set username', (username) => {
    users[socket.id] = { username, color: getRandomColor() };
    io.emit('update users', users);
  });

  // Handle messages
  socket.on('chat message', (data) => {
    const message = {
      ...data,
      id: Date.now(),
      socketId: socket.id,
      timestamp: new Date().toLocaleTimeString(),
    };
    messages.push(message);
    io.emit('chat message', message);
  });

  // Handle replies
  socket.on('reply message', (data) => {
    io.emit('reply message', data);
  });

  // Handle file uploads
  socket.on('file upload', (fileData) => {
    io.emit('file upload', fileData);
  });

  // User typing
  socket.on('typing', (isTyping) => {
    socket.broadcast.emit('typing', isTyping);
  });

  // Disconnect
  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('update users', users);
  });
});

function getRandomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
