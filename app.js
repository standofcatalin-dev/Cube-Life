// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Получаем данные пользователя
const user = tg.initDataUnsafe?.user;
if (user) {
    document.getElementById('user-name').textContent = `Привет, ${user.first_name}!`;
}

// Заглушка: подгружаем статы
function loadStats() {
    document.getElementById('stat-level').textContent = '1';
    document.getElementById('stat-hp').textContent = '100/100';
    document.getElementById('stat-gold').textContent = '50';
    document.getElementById('stat-attack').textContent = '10';
}

// Отправка действия в бота
function sendAction(action) {
    tg.HapticFeedback.impactOccurred('light');
    tg.sendData(JSON.stringify({ action: action }));
    tg.showAlert(`Действие: ${action}`);
}

loadStats();
