"use strict";
class AutoSlider {
    constructor(config = {}) {
        this.sliderWrapper = document.getElementById('sliderWrapper');
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.dotsContainer = document.getElementById('dots');
        this.config = {
            autoSlideDelay: 3000,
            transitionDuration: 500,
            ...config
        };
        this.state = {
            currentIndex: 0,
            slideCount: this.slides.length,
            autoSlideInterval: undefined
        };
    }
    createDots() {
        if (!this.dotsContainer)
            return;
        for (let i = 0; i < this.state.slideCount; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === this.state.currentIndex)
                dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(i));
            this.dotsContainer.appendChild(dot);
        }
    }
    updateDots() {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.state.currentIndex);
        });
    }
    goToSlide(index) {
        if (!this.sliderWrapper)
            return;
        let targetIndex = index;
        if (targetIndex < 0)
            targetIndex = this.state.slideCount - 1;
        if (targetIndex >= this.state.slideCount)
            targetIndex = 0;
        this.state.currentIndex = targetIndex;
        this.sliderWrapper.style.transform = `translateX(-${this.state.currentIndex * 100}%)`;
        this.updateDots();
        this.resetAutoSlide();
    }
    nextSlide() {
        this.goToSlide(this.state.currentIndex + 1);
    }
    prevSlide() {
        this.goToSlide(this.state.currentIndex - 1);
    }
    startAutoSlide() {
        if (this.state.autoSlideInterval !== undefined) {
            clearInterval(this.state.autoSlideInterval);
        }
        this.state.autoSlideInterval = window.setInterval(() => {
            this.nextSlide();
        }, this.config.autoSlideDelay);
    }
    resetAutoSlide() {
        if (this.state.autoSlideInterval !== undefined) {
            clearInterval(this.state.autoSlideInterval);
        }
        this.startAutoSlide();
    }
    stopAutoSlideOnHover() {
        const container = document.querySelector('.slider-container');
        if (!container)
            return;
        container.addEventListener('mouseenter', () => {
            if (this.state.autoSlideInterval !== undefined) {
                clearInterval(this.state.autoSlideInterval);
                this.state.autoSlideInterval = undefined;
            }
        });
        container.addEventListener('mouseleave', () => {
            this.startAutoSlide();
        });
    }
    checkRequiredElements() {
        return Boolean(this.sliderWrapper && this.prevBtn && this.nextBtn && this.dotsContainer && this.state.slideCount > 0);
    }
    init() {
        if (!this.checkRequiredElements())
            return;
        this.createDots();
        this.startAutoSlide();
        this.stopAutoSlideOnHover();
        this.prevBtn?.addEventListener('click', () => this.prevSlide());
        this.nextBtn?.addEventListener('click', () => this.nextSlide());
    }
}
const STORAGE_KEYS = {
    users: 'banka-home-users-json',
    currentUserId: 'banka-home-current-user-id'
};
const products = [
    { id: 1, name: 'Аромасвеча в граненом стакане', price: 1200, image: 'img/product1.jpg', description: 'Изящная свеча в гранёном стекле с тёплым мягким ароматом.' },
    { id: 2, name: 'Декоративная свеча зимняя', price: 900, image: 'img/product2.webp', description: 'Атмосферная декоративная свеча для уютного зимнего настроения.' },
    { id: 3, name: 'Свеча градиент', price: 700, image: 'img/product3.jpg', description: 'Нежная градиентная свеча с мягким светом и спокойным ароматом.' },
    { id: 4, name: 'Аромасвеча в белой банке', price: 800, image: 'img/product4.jpg', description: 'Минималистичная свеча в белой банке для стильного интерьера.' },
    { id: 5, name: 'Натуральные свечи с травами', price: 1000, image: 'img/product5.jpg', description: 'Натуральные свечи с травяными нотами и природным характером.' },
    { id: 6, name: 'Свечи лаванда и аметист', price: 600, image: 'img/product6.webp', description: 'Нежное сочетание лаванды и аметистового оттенка в одной композиции.' }
];
function readJson(key, fallback) {
    const rawValue = localStorage.getItem(key);
    if (!rawValue)
        return fallback;
    try {
        return JSON.parse(rawValue);
    }
    catch {
        return fallback;
    }
}
function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
function getUsers() {
    return readJson(STORAGE_KEYS.users, []);
}
function saveUsers(users) {
    writeJson(STORAGE_KEYS.users, users);
}
function getCurrentUserId() {
    return localStorage.getItem(STORAGE_KEYS.currentUserId);
}
function setCurrentUserId(userId) {
    if (userId) {
        localStorage.setItem(STORAGE_KEYS.currentUserId, userId);
        return;
    }
    localStorage.removeItem(STORAGE_KEYS.currentUserId);
}
function getCurrentUser() {
    const currentUserId = getCurrentUserId();
    if (!currentUserId)
        return null;
    return getUsers().find((user) => user.id === currentUserId) ?? null;
}
function updateUser(updatedUser) {
    const users = getUsers().map((user) => user.id === updatedUser.id ? updatedUser : user);
    saveUsers(users);
}
function getCartStorageKey() {
    const currentUser = getCurrentUser();
    return currentUser ? `banka-home-cart-${currentUser.id}` : 'banka-home-cart-guest';
}
function getCart() {
    return readJson(getCartStorageKey(), []);
}
function saveCart(cart) {
    writeJson(getCartStorageKey(), cart);
}
function formatPrice(price) {
    return `${price} ₽`;
}
function getCartTotal(cart) {
    return cart.reduce((sum, item) => sum + item.price, 0);
}
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = String(getCart().length);
    }
}
function updateProfileNav() {
    const currentUser = getCurrentUser();
    document.querySelectorAll('[data-profile-link-label]').forEach((element) => {
        element.textContent = currentUser ? `Профиль: ${currentUser.login}` : 'Профиль';
    });
}
function bindCatalogButtons() {
    const buttons = document.querySelectorAll('button[data-id]');
    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const productId = Number(button.dataset.id);
            const product = products.find((item) => item.id === productId);
            if (!product)
                return;
            const cart = getCart();
            cart.push(product);
            saveCart(cart);
            updateCartCount();
        });
    });
}
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal)
        return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
}
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal)
        return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
}
function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('cart-total-price');
    const totalCountElement = document.getElementById('cart-total-count');
    const checkoutButton = document.getElementById('checkout-btn');
    if (!cartContainer || !totalPriceElement || !totalCountElement || !checkoutButton) {
        return;
    }
    const cart = getCart();
    totalCountElement.textContent = String(cart.length);
    totalPriceElement.textContent = formatPrice(getCartTotal(cart));
    checkoutButton.disabled = cart.length === 0;
    checkoutButton.style.opacity = cart.length === 0 ? '0.6' : '1';
    checkoutButton.style.cursor = cart.length === 0 ? 'not-allowed' : 'pointer';
    if (cart.length === 0) {
        cartContainer.innerHTML = `
      <div class="cart-item cart-empty">
        <div class="cart-empty__content">
          <h3 class="cart-item__title">Корзина пуста</h3>
          <p class="cart-item__text">Добавьте свечи из каталога, чтобы оформить заказ.</p>
          <a class="btn-link page-link" href="catalog.html">Перейти в каталог</a>
        </div>
      </div>
    `;
        return;
    }
    cartContainer.innerHTML = '';
    cart.forEach((item, index) => {
        const cartItem = document.createElement('article');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item__image rounded-media">
      <div>
        <h3 class="cart-item__title">${item.name}</h3>
        <p class="cart-item__text">${item.description}</p>
        <p class="cart-item__price">${formatPrice(item.price)}</p>
      </div>
      <button class="cart-item__remove" data-index="${index}">Удалить</button>
    `;
        const removeButton = cartItem.querySelector('button[data-index]');
        removeButton?.addEventListener('click', () => {
            const updatedCart = getCart();
            updatedCart.splice(index, 1);
            saveCart(updatedCart);
            updateCartCount();
            renderCart();
        });
        cartContainer.appendChild(cartItem);
    });
}
function addOrderToCurrentUser(items) {
    const currentUser = getCurrentUser();
    if (!currentUser)
        return false;
    const order = {
        id: `ORD-${Date.now()}`,
        createdAt: new Date().toISOString(),
        items,
        total: getCartTotal(items)
    };
    currentUser.purchases = [order, ...currentUser.purchases];
    updateUser(currentUser);
    return true;
}
function bindCartActions() {
    const checkoutButton = document.getElementById('checkout-btn');
    const closeButton = document.getElementById('close-modal');
    const overlay = document.querySelector('[data-close-modal]');
    checkoutButton?.addEventListener('click', () => {
        const cart = getCart();
        if (cart.length === 0)
            return;
        if (!getCurrentUser()) {
            alert('Чтобы оформить заказ и сохранить покупки в профиле, сначала зарегистрируйтесь или войдите в аккаунт.');
            window.location.href = 'profile.html';
            return;
        }
        addOrderToCurrentUser(cart);
        openModal('payment-modal');
        saveCart([]);
        updateCartCount();
        renderCart();
    });
    closeButton?.addEventListener('click', () => closeModal('payment-modal'));
    overlay?.addEventListener('click', () => closeModal('payment-modal'));
}
function formatOrderDate(isoDate) {
    return new Date(isoDate).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
function renderProfilePage() {
    const root = document.getElementById('profile-root');
    if (!root)
        return;
    const currentUser = getCurrentUser();
    if (!currentUser) {
        root.innerHTML = `
      <section class="profile-auth-grid">
        <article class="profile-card">
          <div class="profile-avatar rounded-media" aria-hidden="true">📝</div>
          <div class="profile-card__content">
            <h2>Регистрация</h2>
            <p class="profile-note">Сначала зарегистрируйтесь, затем сможете входить под своим логином и паролем.</p>
            <form class="profile-form" id="register-form">
              <label class="field">
                <span>ФИО</span>
                <input type="text" name="fullName" placeholder="Введите ваше ФИО" required>
              </label>
              <label class="field">
                <span>Телефон</span>
                <input type="tel" name="phone" placeholder="+7 (___) ___-__-__" required>
              </label>
              <label class="field">
                <span>Почта</span>
                <input type="email" name="email" placeholder="example@mail.ru" required>
              </label>
              <label class="field">
                <span>Логин</span>
                <input type="text" name="login" placeholder="Придумайте логин" required>
              </label>
              <label class="field">
                <span>Пароль</span>
                <input type="password" name="password" placeholder="Придумайте пароль" required>
              </label>
              <button type="submit" class="btn-link profile-submit">Зарегистрироваться</button>
            </form>
          </div>
        </article>

        <article class="profile-card">
          <div class="profile-avatar rounded-media" aria-hidden="true">🔐</div>
          <div class="profile-card__content">
            <h2>Вход</h2>
            <p class="profile-note">Войдите, чтобы увидеть прошлые покупки с этого аккаунта.</p>
            <form class="profile-form" id="login-form">
              <label class="field">
                <span>Логин</span>
                <input type="text" name="login" placeholder="Введите логин" required>
              </label>
              <label class="field">
                <span>Пароль</span>
                <input type="password" name="password" placeholder="Введите пароль" required>
              </label>
              <button type="submit" class="btn-link profile-submit">Войти</button>
            </form>
            <div class="profile-json-box">
              <h3>Как сохраняются данные</h3>
              <p>Данные аккаунтов, текущий вход и история покупок сохраняются в браузере в JSON-формате.</p>
            </div>
          </div>
        </article>
      </section>
    `;
        bindRegisterForm();
        bindLoginForm();
        return;
    }
    const purchasesHtml = currentUser.purchases.length > 0
        ? currentUser.purchases.map((order) => `
        <article class="purchase-card">
          <div class="purchase-card__header">
            <div>
              <h3>${order.id}</h3>
              <p>${formatOrderDate(order.createdAt)}</p>
            </div>
            <strong>${formatPrice(order.total)}</strong>
          </div>
          <ul class="purchase-card__list">
            ${order.items.map((item) => `<li>${item.name} — ${formatPrice(item.price)}</li>`).join('')}
          </ul>
        </article>
      `).join('')
        : '<p class="profile-note">Покупок пока нет. После оплаты они появятся здесь автоматически.</p>';
    root.innerHTML = `
    <section class="profile-dashboard">
      <article class="profile-card profile-card--wide">
        <div class="profile-avatar rounded-media" aria-hidden="true">👤</div>
        <div class="profile-card__content">
          <p class="page-kicker">ВЫ ВОШЛИ В АККАУНТ</p>
          <h2>${currentUser.fullName}</h2>
          <div class="profile-user-meta">
            <p><strong>Логин:</strong> ${currentUser.login}</p>
            <p><strong>Почта:</strong> ${currentUser.email}</p>
            <p><strong>Телефон:</strong> ${currentUser.phone}</p>
          </div>
          <div class="profile-actions-row">
            <a class="btn-link page-link" href="catalog.html">Перейти в каталог</a>
            <button class="catalog-card__button" id="logout-btn" type="button">Выйти</button>
          </div>
        </div>
      </article>

      <section class="profile-history">
        <div class="profile-history__head">
          <h2>Прошлые покупки</h2>
          <p>История заказов привязана к текущему аккаунту.</p>
        </div>
        <div class="purchase-list">${purchasesHtml}</div>
      </section>
    </section>
  `;
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        setCurrentUserId(null);
        updateProfileNav();
        updateCartCount();
        renderProfilePage();
    });
}
function bindRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form)
        return;
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const fullName = String(formData.get('fullName') ?? '').trim();
        const phone = String(formData.get('phone') ?? '').trim();
        const email = String(formData.get('email') ?? '').trim();
        const login = String(formData.get('login') ?? '').trim();
        const password = String(formData.get('password') ?? '').trim();
        const users = getUsers();
        const loginExists = users.some((user) => user.login.toLowerCase() === login.toLowerCase());
        if (loginExists) {
            alert('Пользователь с таким логином уже существует.');
            return;
        }
        const newUser = {
            id: `user-${Date.now()}`,
            fullName,
            phone,
            email,
            login,
            password,
            purchases: []
        };
        users.push(newUser);
        saveUsers(users);
        setCurrentUserId(newUser.id);
        updateProfileNav();
        openModal('profile-modal');
        renderProfilePage();
    });
}
function bindLoginForm() {
    const form = document.getElementById('login-form');
    if (!form)
        return;
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const login = String(formData.get('login') ?? '').trim();
        const password = String(formData.get('password') ?? '').trim();
        const user = getUsers().find((item) => item.login === login && item.password === password);
        if (!user) {
            alert('Неверный логин или пароль.');
            return;
        }
        setCurrentUserId(user.id);
        updateProfileNav();
        updateCartCount();
        renderProfilePage();
    });
}
function bindProfileModal() {
    document.getElementById('close-profile-modal')?.addEventListener('click', () => closeModal('profile-modal'));
    document.querySelector('[data-close-profile]')?.addEventListener('click', () => closeModal('profile-modal'));
}
function bindBurgerMenu() {
    const header = document.querySelector('.site-header');
    const burger = document.getElementById('burger');
    const nav = document.getElementById('site-nav');
    if (!header || !burger || !nav)
        return;
    const closeMenu = () => {
        header.classList.remove('menu-open');
        burger.setAttribute('aria-expanded', 'false');
    };
    burger.addEventListener('click', () => {
        const isOpen = header.classList.toggle('menu-open');
        burger.setAttribute('aria-expanded', String(isOpen));
    });
    nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => closeMenu());
    });
    document.addEventListener('click', (event) => {
        const target = event.target;
        if (!header.contains(target)) {
            closeMenu();
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    const slider = new AutoSlider({ autoSlideDelay: 3000 });
    slider.init();
    bindBurgerMenu();
    bindProfileModal();
    updateProfileNav();
    updateCartCount();
    bindCatalogButtons();
    renderCart();
    bindCartActions();
    renderProfilePage();
});
//# sourceMappingURL=main.js.map