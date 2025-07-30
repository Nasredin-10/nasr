const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*", // Разрешаем все домены
    methods: ["GET", "POST"]
  }
});

// Настройка статики
app.use(express.static(path.join(__dirname, 'public')));

// API для проверки работы
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    users: Array.from(users.values()),
    timestamp: new Date().toISOString()
  });
});

// Хранилище данных
const users = new Map(); // socket.id -> username

// Socket.io логика
io.on('connection', (socket) => {
  console.log('Новое подключение:', socket.id);

  // Регистрация пользователя
  socket.on('register', (username) => {
    users.set(socket.id, username);
    updateUserList();
    io.emit('systemMessage', `${username} присоединился к чату`);
  });

  // Обработка сообщений
  socket.on('sendMessage', (text) => {
    const username = users.get(socket.id);
    if (username) {
      io.emit('message', {
        user: username,
        text: text,
        time: new Date().toLocaleTimeString()
      });
    }
  });

  // Отключение пользователя
  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    if (username) {
      users.delete(socket.id);
      updateUserList();
      io.emit('systemMessage', `${username} покинул чат`);
    }
  });

  // Обновление списка пользователей
  function updateUserList() {
    io.emit('userList', Array.from(users.values()));
  }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Важно для внешнего доступа

server.listen(PORT, HOST, () => {
  console.log(`Сервер запущен на http://${HOST}:${PORT}`);
  console.log('Доступен для внешних подключений');
});