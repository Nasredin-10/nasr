// Настройка Firebase (замени на свои данные!)
const firebaseConfig = {
    apiKey: "ВАШ_API_KEY",
    authDomain: "ВАШ_PROJECT.firebaseapp.com",
    databaseURL: "https://ВАШ_PROJECT.firebaseio.com",
    projectId: "ВАШ_PROJECT",
    storageBucket: "ВАШ_PROJECT.appspot.com",
    messagingSenderId: "ВАШ_SENDER_ID",
    appId: "ВАШ_APP_ID"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Состояние игры
let gameId = "duel1"; // Можно сделать динамическим
let playerId = Math.random().toString(36).substr(2, 9); // Рандомный ID игрока
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

// Клик по кнопке
function clickButton(playerNum) {
    if (playerNum !== playerNumber) return; // Не даём кликать за соперника

    const playerKey = `player${playerNumber}`;
    const playerRef = database.ref(`games/${gameId}/${playerKey}/score`);

    playerRef.transaction((currentScore) => {
        return (currentScore || 0) + 1;
    });

    // Звук клика (добавь звук в папку sounds)
    const clickSound = new Audio("sounds/click.mp3");
    clickSound.play();
}

// Слушаем изменения в игре
function startGameListener() {
    const gameRef = database.ref(`games/${gameId}`);

    gameRef.on("value", (snapshot) => {
        const gameData = snapshot.val();
        if (!gameData) return;

        // Обновляем счёт
        if (gameData.player1) {
            document.querySelector("#player1 .score").textContent = gameData.player1.score;
        }
        if (gameData.player2) {
            document.querySelector("#player2 .score").textContent = gameData.player2.score;
        }

        // Проверяем победу
        if (gameData.winner) {
            const winner = gameData.winner;
            const status = document.getElementById("status");
            if (winner === playerNumber) {
                status.textContent = "Ты победил! 🎆";
                new Audio("sounds/win.mp3").play();
            } else {
                status.textContent = "Ты проиграл... 😢";
            }
            disableButtons();
        }

        // Подсвечиваем активного игрока
        document.getElementById("player1").classList.toggle("active", playerNumber === 1);
        document.getElementById("player2").classList.toggle("active", playerNumber === 2);
    });
}

// Блокируем кнопки после победы
function disableButtons() {
    document.querySelectorAll(".click-btn").forEach(btn => {
        btn.disabled = true;
    });
}

// Обновляем интерфейс
function updateUI() {
    const status = document.getElementById("status");
    status.textContent = playerNumber === 1 ? "Ждём второго игрока..." : "Игра началась! Кликай быстрее!";
}

// Запускаем игру при загрузке
window.onload = joinGame;
