const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const refreshBtn = document.getElementById("refreshBtn");
const playerNameInput = document.getElementById("playerName");
const timeValue = document.getElementById("timeValue");
const scoreValue = document.getElementById("scoreValue");
const apiStatus = document.getElementById("apiStatus");
const message = document.getElementById("message");
const arena = document.getElementById("arena");
const target = document.getElementById("target");
const leaderboard = document.getElementById("leaderboard");

let score = 0;
let timeLeft = 20;
let gameActive = false;
let timer = null;

function setMessage(text) {
  message.textContent = text;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function moveTarget() {
  const arenaRect = arena.getBoundingClientRect();
  const targetSize = 56;

  const maxX = Math.max(0, arenaRect.width - targetSize);
  const maxY = Math.max(0, arenaRect.height - targetSize);

  const x = randomInt(0, Math.floor(maxX));
  const y = randomInt(0, Math.floor(maxY));

  target.style.left = `${x}px`;
  target.style.top = `${y}px`;
}

function resetGameUi() {
  score = 0;
  timeLeft = 20;
  gameActive = false;
  scoreValue.textContent = "0";
  timeValue.textContent = "20";
  target.style.display = "none";
  clearInterval(timer);
  timer = null;
}

async function checkApiHealth() {
  try {
    const response = await fetch("/api/health/full");
    if (!response.ok) throw new Error("health failed");
    const data = await response.json();
    apiStatus.textContent = data.status || "ok";
  } catch (e) {
    apiStatus.textContent = "fail";
  }
}

async function loadLeaderboard() {
  leaderboard.innerHTML = "<div>Загрузка...</div>";

  try {
    const response = await fetch("/api/scores?limit=10");
    if (!response.ok) throw new Error("cannot load leaderboard");
    const payload = await response.json();
    const rows = payload.data || [];

    if (!rows.length) {
      leaderboard.innerHTML = "<div>Пока нет результатов</div>";
      return;
    }

    leaderboard.innerHTML = rows.map((row, index) => {
      const date = new Date(row.created_at).toLocaleString("ru-RU");
      return `
        <div class="score-row">
          <div>
            <div class="name">${index + 1}. ${escapeHtml(row.player_name)}</div>
            <div class="meta">${date}</div>
          </div>
          <div><strong>${row.score}</strong></div>
        </div>
      `;
    }).join("");
  } catch (e) {
    leaderboard.innerHTML = "<div>Ошибка загрузки лидерборда</div>";
  }
}

async function saveScore(playerName, currentScore) {
  const response = await fetch("/api/scores", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      player_name: playerName,
      score: currentScore
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "save failed");
  }

  return response.json();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function finishGame() {
  gameActive = false;
  target.style.display = "none";
  clearInterval(timer);
  timer = null;

  const playerName = playerNameInput.value.trim();
  if (!playerName) {
    setMessage(`Игра окончена. Счёт: ${score}. Введи имя, чтобы сохранить результат.`);
    return;
  }

  try {
    await saveScore(playerName, score);
    setMessage(`Игра окончена. Результат ${score} сохранён.`);
    await loadLeaderboard();
  } catch (e) {
    setMessage(`Игра окончена. Счёт: ${score}. Не удалось сохранить результат.`);
  }
}

function startGame() {
  const playerName = playerNameInput.value.trim();

  if (!playerName) {
    setMessage("Сначала введи имя игрока.");
    return;
  }

  resetGameUi();
  gameActive = true;
  target.style.display = "block";
  moveTarget();
  setMessage("Игра началась. Кликайте по цели.");

  timer = setInterval(() => {
    timeLeft -= 1;
    timeValue.textContent = String(timeLeft);

    if (timeLeft <= 0) {
      finishGame();
    }
  }, 1000);
}

target.addEventListener("click", () => {
  if (!gameActive) return;
  score += 1;
  scoreValue.textContent = String(score);
  moveTarget();
});

startBtn.addEventListener("click", startGame);

resetBtn.addEventListener("click", () => {
  resetGameUi();
  setMessage("Сброшено.");
});

refreshBtn.addEventListener("click", loadLeaderboard);

window.addEventListener("load", async () => {
  await checkApiHealth();
  await loadLeaderboard();
  setInterval(checkApiHealth, 10000);
});
