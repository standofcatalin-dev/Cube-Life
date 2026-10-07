const tg = window.Telegram.WebApp;

// ✅ Раскрываем на весь экран
tg.expand();
tg.ready();

// ✅ ПРИНУДИТЕЛЬНО ставим тёмные цвета хедера
try {
    tg.setHeaderColor('#0a0a1a');
    tg.setBackgroundColor('#0a0a1a');
    tg.setBottomBarColor?.('#0a0a1a');
} catch(e) {}

// ✅ Отключаем вертикальные свайпы закрытия (чтобы не мешало)
try { tg.disableVerticalSwipes?.(); } catch(e) {}

// ✅ Получаем юзера
const user = tg.initDataUnsafe?.user;
const userName = user?.first_name || 'друг';

if (user) {
    const subtitle = document.querySelector('.hero-subtitle');
    if (subtitle) {
        subtitle.innerHTML = `Привет, <strong>${userName}</strong>! 👋<br>Автоматизирую рутину, продажи и клиентов.<br>Бот работает 24/7 — а вы отдыхаете 😎`;
    }
}

// Плавный скролл
function scrollToOrder() {
    document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
    tg.HapticFeedback?.impactOccurred('medium');
}

// Связь
function contactMe() {
    tg.HapticFeedback?.notificationOccurred('success');
    const myUsername = 'ваш_username'; // ← ЗАМЕНИ

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
        window.open(`https://t.me/${myUsername}`, '_blank');
    }
}

// Анимация появления
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.fact-card, .service, .step').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `all 0.5s ease ${i * 0.05}s`;
    observer.observe(el);
});
