// Подключение к серверу
const socket = io({
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

// Элементы интерфейса
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const messagesDiv = document.getElementById('messages');
const userList = document.getElementById('userList');
const onlineCount = document.getElementById('onlineCount');
const statusDot = document.querySelector('.status-dot');

// Запрос имени пользователя
let username = localStorage.getItem('chat-username');
if (!username) {
  username = prompt('Введите ваше имя:') || `Гость-${Math.floor(Math.random() * 1000)}`;
  localStorage.setItem('chat-username', username);
}

// Регистрация пользователя
socket.emit('register', username);

// Отправка сообщений
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('sendMessage', message);
    addMessageToChat(username, message, 'user-message');
    messageInput.value = '';
  }
  messageInput.focus();
});

// Добавление сообщения в чат
function addMessageToChat(user, text, messageClass) {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${messageClass}`;
  messageElement.innerHTML = `
    <div class="message-text">${text}</div>
    <div class="message-info">
      <span>${user}</span>
      <span>${new Date().toLocaleTimeString()}</span>
    </div>
  `;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Обработка входящих сообщений
socket.on('message', (data) => {
  const messageClass = data.user === username ? 'user-message' : 'other-message';
  addMessageToChat(data.user, data.text, messageClass);
});

// Системные сообщения
socket.on('systemMessage', (text) => {
  const messageElement = document.createElement('div');
  messageElement.className = 'message system-message';
  messageElement.textContent = text;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Обновление списка пользователей
socket.on('userList', (users) => {
  userList.innerHTML = users.map(user => `<li>${user}</li>`).join('');
  onlineCount.textContent = users.length;
});

// Статус подключения
socket.on('connect', () => {
  statusDot.classList.add('connected');
  document.querySelector('#status span:last-child').textContent = 'Онлайн';
});

socket.on('disconnect', () => {
  statusDot.classList.remove('connected');
  document.querySelector('#status span:last-child').textContent = 'Оффлайн';
});

// Фокус на поле ввода при загрузке
window.addEventListener('DOMContentLoaded', () => {
  messageInput.focus();
});