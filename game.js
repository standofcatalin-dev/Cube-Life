// ===== Инициализация Telegram WebApp =====
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Красим хедер под наш тёмный фон
try {
    tg.setHeaderColor('#0a0a1a');
    tg.setBackgroundColor('#0a0a1a');
} catch(e) {}

// Получаем данные пользователя
const user = tg.initDataUnsafe?.user;
const userName = user?.first_name || 'друг';

// Персонализированное приветствие 🎯
if (user) {
    const subtitle = document.querySelector('.hero-subtitle');
    if (subtitle) {
        subtitle.innerHTML = `Привет, <strong>${userName}</strong>! 👋<br>Автоматизирую рутину, продажи и клиентов.<br>Бот работает 24/7 — а вы отдыхаете 😎`;
    }
}

// ===== Плавный скролл к форме =====
function scrollToOrder() {
    document.getElementById('order').scrollIntoView({ behavior: 'smooth' });

    // Легкая вибрация если доступна
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
}

// ===== Связь со мной =====
function contactMe() {
    // Вибрация
    if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }

    // Вариант 1: открыть чат с вами в Telegram
    // 👇 ЗАМЕНИТЕ НА ВАШ USERNAME (без @)
    const myUsername = 'ваш_username';

    // Отправляем данные боту (если сайт открыт из бота)
    if (tg.initData && user) {
        tg.sendData(JSON.stringify({
            action: 'contact_request',
            userId: user.id,
            username: user.username || '',
            firstName: user.first_name || '',
            timestamp: Date.now()
        }));
        tg.close();
    } else {
        // Если открыт вне Telegram — открываем ссылку
        window.open(`https://t.me/${myUsername}`, '_blank');
    }
}

// ===== Анимация появления карточек при скролле =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Изначально прячем все карточки
document.querySelectorAll('.fact-card, .service, .step').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `all 0.5s ease ${i * 0.05}s`;
    observer.observe(el);
});

// ===== Плавное появление hero =====
window.addEventListener('load', () => {
    document.querySelector('.hero').style.opacity = '1';
});
