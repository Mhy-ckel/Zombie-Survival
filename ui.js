const healthText = document.getElementById("health-text");
const ammoText = document.getElementById("ammo-text");
const waveText = document.getElementById("wave-text");
const scoreText = document.getElementById("score-text");
const finalScore = document.getElementById("final-score");

const pauseMenu = document.getElementById("pause-menu");
const gameOverScreen = document.getElementById("game-over-screen");

export function updateHUD(player, gameState) {
  healthText.textContent = Math.max(0, Math.ceil(player.health));
  ammoText.textContent = player.reloading ? "..." : player.ammo;
  waveText.textContent = gameState.wave;
  scoreText.textContent = gameState.score;
}

export function showPauseMenu() {
  pauseMenu.classList.remove("hidden");
}

export function hidePauseMenu() {
  pauseMenu.classList.add("hidden");
}

export function showGameOver(score) {
  finalScore.textContent = score;
  gameOverScreen.classList.remove("hidden");
}

export function hideGameOver() {
  gameOverScreen.classList.add("hidden");
}