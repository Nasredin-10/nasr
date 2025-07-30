// Конфигурация Firebase (замени значения на свои из Firebase Console!)
const firebaseConfig = {
  apiKey: "AIzaSyAftE7aN_6PWAo6nxcisz5rrFk67jt2n-k",
  authDomain: "game-649c1.firebaseapp.com",
  databaseURL: "https://game-649c1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "game-649c1",
  storageBucket: "game-649c1.firebasestorage.app",
  messagingSenderId: "177082622080",
  appId: "1:177082622080:web:2d522421fe30a3dda70665"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Состояние игры
let gameId = "duel1"; // Уникальный ID игры
let playerId = Math.random().toString(36).substr(2, 9); // Случайный ID игрока
let playerNumber = null; // 1 или 2

// Подключение к игре
function joinGame() {
  const gameRef = database.ref(`games/${gameId}`);

  gameRef.once("value").then((snapshot) => {
    const gameData = snapshot.val();

    if (!gameData) {
      // Первый игрок
      playerNumber = 1;
      gameRef.set({
        player1: { id: playerId, score: 0 },
        player2: null,
        winner: null,
      });
    } else if (!gameData.player2) {
      // Второй игрок
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

// Обработка клика
function clickButton(playerNum) {
  if (playerNum !== playerNumber) return;

  const playerKey = `player${playerNumber}`;
  const playerRef = database.ref(`games/${gameId}/${playerKey}/score`);

  playerRef.transaction((currentScore) => {
    return (currentScore || 0) + 1;
  });

  // Воспроизведение звука клика
  const clickSound = new Audio("sounds/click.mp3");
  clickSound.play().catch(e => console.log("Звук не воспроизведён:", e));
}

// Отслеживание изменений в игре
function startGameListener() {
  const gameRef = database.ref(`games/${gameId}`);

  gameRef.on("value", (snapshot) => {
    const gameData = snapshot.val();
    if (!gameData) return;

    // Обновление счёта
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
      if (winner === playerNumber) {
        status.textContent = "Ты победил! 🎉";
        new Audio("sounds/win.mp3").play().catch(e => console.log(e));
      } else {
        status.textContent = "Ты проиграл... 😢";
      }
      disableButtons();
    }

    // Подсветка активного игрока
    document.getElementById("player1").classList.toggle("active", playerNumber === 1);
    document.getElementById("player2").classList.toggle("active", playerNumber === 2);
  });
}

// Блокировка кнопок после игры
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

// Запуск игры при загрузке страницы
window.onload = joinGame;
