// Конфигурация Firebase (замени значения на свои из Firebase Console!)
const firebaseConfig = {
  apiKey: "AIzaSyAftE7aN_6PWAo6nxcisz5rrFk67jt2n-k",
  authDomain: "game-649c1.firebaseapp.com",
  databaseURL: "https://game-649c1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "game-649c1",
  storageBucket: "game-649c1.firebasestorage.app",
  messagingSenderId: "177082622080",
  appId: "1:177082622080:web:2d522421fe30a3dda70665",
  measurementId: "G-CKJ2XD2ZGH"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Состояние игры
let gameId = "duel1";
let playerId = Math.random().toString(36).substr(2, 9);
let playerNumber = null;

// Подключение к игре
function joinGame() {
  const gameRef = database.ref(`games/${gameId}`);

  gameRef.once("value").then((snapshot) => {
    const gameData = snapshot.val();

    if (!gameData) {
      playerNumber = 1;
      gameRef.set({
        player1: { id: playerId, score: 0 },
        player2: null,
        winner: null,
      });
    } else if (!gameData.player2) {
      playerNumber = 2;
      gameRef.update({
        player2: { id: playerId, score: 0 },
      });
    } else {
      alert("Игра уже началась!");
      return;
    }

    updateUI();
    startGameListener();
  });
}

// Клик по кнопке
function clickButton(playerNum) {
  if (playerNum !== playerNumber) return;

  const playerKey = `player${playerNumber}`;
  const playerRef = database.ref(`games/${gameId}/${playerKey}/score`);

  playerRef.transaction((currentScore) => {
    return (currentScore || 0) + 1;
  });
}

// Отслеживание игры
function startGameListener() {
  const gameRef = database.ref(`games/${gameId}`);

  gameRef.on("value", (snapshot) => {
    const gameData = snapshot.val();
    if (!gameData) return;

    if (gameData.player1) {
      document.querySelector("#player1 .score").textContent = gameData.player1.score;
    }
    if (gameData.player2) {
      document.querySelector("#player2 .score").textContent = gameData.player2.score;
    }

    // Проверка победы (первый до 50)
    if (gameData.player1?.score >= 50 || gameData.player2?.score >= 50) {
      const winner = gameData.player1?.score >= 50 ? 1 : 2;
      gameRef.update({ winner });

      const status = document.getElementById("status");
      status.textContent = winner === playerNumber ? "Ты победил! 🎉" : "Ты проиграл... 😢";
      disableButtons();
    }

    // Подсветка активного игрока
    document.getElementById("player1").classList.toggle("active", playerNumber === 1);
    document.getElementById("player2").classList.toggle("active", playerNumber === 2);
  });
}

// Блокировка кнопок
function disableButtons() {
  document.querySelectorAll(".click-btn").forEach(btn => {
    btn.disabled = true;
  });
}

// Обновление интерфейса
function updateUI() {
  const status = document.getElementById("status");
  status.textContent = playerNumber === 1 
    ? "Ждём второго игрока..." 
    : "Игра началась! Кликай быстрее!";
}

// Запуск при загрузке
window.onload = joinGame;
