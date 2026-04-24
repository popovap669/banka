"use strict";
const burger = document.getElementById('burger');
const nav = document.querySelector('header nav');
burger?.addEventListener('click', () => {
    nav?.classList.toggle('active');
});
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
const products = [
    { id: 1, name: 'Ванильный вечер', price: 990, image: 'img/product1.png', description: 'Тёплый сладкий аромат для уютных вечеров дома.' },
    { id: 2, name: 'Лаванда и хлопок', price: 1090, image: 'img/product1.png', description: 'Нежный расслабляющий аромат с чистыми нотами.' },
    { id: 3, name: 'Цитрусовое утро', price: 950, image: 'img/product1.png', description: 'Свежий бодрящий аромат для лёгкого начала дня.' },
    { id: 4, name: 'Кедр и амбра', price: 1250, image: 'img/product1.png', description: 'Глубокий древесный аромат с мягким шлейфом.' },
    { id: 5, name: 'Ягодный чай', price: 1150, image: 'img/product1.png', description: 'Согревающий аромат с фруктовыми и чайными нотами.' },
    { id: 6, name: 'Морская соль', price: 1050, image: 'img/product1.png', description: 'Чистый свежий аромат с ощущением морского воздуха.' }
];
function getCart() {
    const data = localStorage.getItem('cart');
    return data ? JSON.parse(data) : [];
}
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
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
        <div>
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
function bindCartActions() {
    const checkoutButton = document.getElementById('checkout-btn');
    const closeButton = document.getElementById('close-modal');
    const overlay = document.querySelector('[data-close-modal]');
    checkoutButton?.addEventListener('click', () => {
        const cart = getCart();
        if (cart.length === 0)
            return;
        openModal('payment-modal');
        saveCart([]);
        updateCartCount();
        renderCart();
    });
    closeButton?.addEventListener('click', () => closeModal('payment-modal'));
    overlay?.addEventListener('click', () => closeModal('payment-modal'));
}
function getSavedProfile() {
    const data = localStorage.getItem('profile');
    return data ? JSON.parse(data) : null;
}
function bindProfileForm() {
    const form = document.getElementById('profile-form');
    if (!form)
        return;
    const savedProfile = getSavedProfile();
    if (savedProfile) {
        form.elements.namedItem('fullName').value = savedProfile.fullName;
        form.elements.namedItem('phone').value = savedProfile.phone;
        form.elements.namedItem('email').value = savedProfile.email;
    }
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const fullName = (form.elements.namedItem('fullName')?.value ?? '').trim();
        const phone = (form.elements.namedItem('phone')?.value ?? '').trim();
        const email = (form.elements.namedItem('email')?.value ?? '').trim();
        localStorage.setItem('profile', JSON.stringify({ fullName, phone, email }));
        openModal('profile-modal');
    });
    document.getElementById('close-profile-modal')?.addEventListener('click', () => closeModal('profile-modal'));
    document.querySelector('[data-close-profile]')?.addEventListener('click', () => closeModal('profile-modal'));
}
document.addEventListener('DOMContentLoaded', () => {
    const slider = new AutoSlider({ autoSlideDelay: 3000 });
    slider.init();
    updateCartCount();
    bindCatalogButtons();
    renderCart();
    bindCartActions();
    bindProfileForm();
});
//# sourceMappingURL=main.js.map