const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

io.on('connection', (socket) => {
  console.log('Новый пользователь подключён!');
  
  socket.on('message', (text) => {
    io.emit('message', text); // Рассылаем всем
  });
});

server.listen(3000, () => console.log('Сервер запущен на http://localhost:3000'));
