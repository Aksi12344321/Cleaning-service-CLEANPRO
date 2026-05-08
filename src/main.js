import './scss/main.scss'; // или любой другой путь к твоему главному файлу стилей

document.addEventListener('DOMContentLoaded', () => {

    const modal = document.getElementById('calcModal');
    if (!modal) return;

    const overlay = modal.querySelector('.modal__overlay');
    const closeBtn = modal.querySelector('.modal__close');
    const formWrapper = modal.querySelector('.modal__form-wrapper');
    const successBlock = modal.querySelector('.modal__success');
    const form = document.getElementById('calcForm');

    // Находим элементы текста внутри попапа
    const modalTitle = modal.querySelector('.modal__title');
    const modalSubtitle = modal.querySelector('.modal__subtitle');
    const successTitle = modal.querySelector('.modal__success-title');
    const successText = modal.querySelector('.modal__success-text');

    const nameInput = form.querySelector('[name="user_name"]');
    const phoneInput = form.querySelector('[name="user_phone"]');
    const emailInput = form.querySelector('[name="user_email"]');
    const consentCheckbox = form.querySelector('[name="consent_data"]');
    const submitBtn = form.querySelector('button[type="submit"]');

    // -------------------------
    // TOUCH STATE
    // -------------------------
    const touched = { name: false, phone: false, email: false, consent: false };
    submitBtn.disabled = true;

    // -------------------------
    // HELPERS
    // -------------------------
    function removeError(group) {
        group.classList.remove('form__group--error');
        const error = group.querySelector('.form__error');
        if (error) error.remove();
    }

    function showError(group, message) {
        group.classList.add('form__group--error');
        const error = document.createElement('span');
        error.className = 'form__error';
        error.innerHTML = message;
        group.appendChild(error);
    }
    
    // Функция полной очистки ошибок (нужно при открытии)
    function clearAllErrors() {
        document.querySelectorAll('.form__error').forEach(el => el.remove());
        document.querySelectorAll('.form__group--error').forEach(el => el.classList.remove('form__group--error'));
        document.querySelectorAll('.form__checkbox-label--error').forEach(el => el.classList.remove('form__checkbox-label--error'));
    }

    // -------------------------
    // PHONE MASK
    // -------------------------
    phoneInput.addEventListener('input', (e) => {
        let digits = e.target.value.replace(/\D/g, '');
        if (digits.startsWith('8')) digits = digits.slice(1);
        if (digits.startsWith('7')) digits = digits.slice(1);
        digits = digits.substring(0, 10);

        let formatted = '+7';
        if (digits.length > 0) formatted += ' (' + digits.substring(0, 3);
        if (digits.length >= 4) formatted += ') ' + digits.substring(3, 6);
        if (digits.length >= 7) formatted += '-' + digits.substring(6, 8);
        if (digits.length >= 9) formatted += '-' + digits.substring(8, 10);
        e.target.value = formatted;

        validateAll();
    });

    // -------------------------
    // TOUCH EVENTS
    // -------------------------
    nameInput.addEventListener('blur', () => touched.name = true);
    phoneInput.addEventListener('blur', () => touched.phone = true);
    emailInput.addEventListener('blur', () => touched.email = true);
    consentCheckbox.addEventListener('change', () => touched.consent = true);

    // -------------------------
    // LIVE VALIDATION
    // -------------------------
    nameInput.addEventListener('input', validateAll);
    phoneInput.addEventListener('input', validateAll);
    emailInput.addEventListener('input', validateAll);
    consentCheckbox.addEventListener('change', validateAll);

    // -------------------------
    // VALIDATION
    // -------------------------
    function validateAll() {
        let valid = true;

        const nameGroup = nameInput.closest('.form__group');
        removeError(nameGroup);
        if (touched.name && !nameInput.value.trim()) { showError(nameGroup, 'Поле должно быть заполнено'); valid = false; }

        const phoneGroup = phoneInput.closest('.form__group');
        removeError(phoneGroup);
        const phoneDigits = phoneInput.value.replace(/\D/g, '');
        if (touched.phone && phoneDigits.length > 0 && phoneDigits.length < 11) { showError(phoneGroup, 'Введите корректный номер'); valid = false; }
        if (touched.phone && phoneDigits.length === 0 && phoneInput.value !== '') { showError(phoneGroup, 'Введите номер'); valid = false; }

        const emailGroup = emailInput.closest('.form__group');
        removeError(emailGroup);
        const emailVal = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (touched.email && emailVal && !emailRegex.test(emailVal)) { showError(emailGroup, 'Введите корректный email'); valid = false; }
        if (touched.email && emailVal === '') { showError(emailGroup, 'Поле должно быть заполнено'); valid = false; }

        const label = consentCheckbox.closest('.form__checkbox-label');
        if (touched.consent && !consentCheckbox.checked) { label.classList.add('form__checkbox-label--error'); valid = false; } 
        else { label.classList.remove('form__checkbox-label--error'); }

        const nameOk = nameInput.value.trim().length > 0;
        const phoneOk = phoneDigits.length === 11;
        const emailOk = emailRegex.test(emailVal);
        const consentOk = consentCheckbox.checked;

        submitBtn.disabled = !(nameOk && phoneOk && emailOk && consentOk);
    }

    // -------------------------
    // MODAL LOGIC (ИЗМЕНЕНО!)
    // -------------------------
    function openModal(triggerBtn) {
        // 1. Читаем текст из data-атрибутов нажатой кнопки (с подстраховкой на случай, если атрибута нет)
        const title = triggerBtn.getAttribute('data-modal-title') || 'Заявка';
        const subtitle = triggerBtn.getAttribute('data-modal-subtitle') || '';
        const sTitle = triggerBtn.getAttribute('data-modal-success-title') || 'Спасибо!';
        let sText = triggerBtn.getAttribute('data-modal-success-text') || '';

          // МАГИЯ ЗДЕСЬ: Если у кнопки стоит флажок data-show-promo, 
        // мы находим слово SAVE10 в тексте и оборачиваем его в красивый синий span
        if (triggerBtn.hasAttribute('data-show-promo')) {
            sText = sText.replace('SAVE10', "<span class='modal__promo-highlight'>'SAVE10'</span>");
        }
       

        // 2. Подменяем текст в попапе
        modalTitle.textContent = title;
        modalSubtitle.textContent = subtitle;
        successTitle.textContent = sTitle;
        successText.innerHTML = sText;

        // 3. Сбрасываем состояние формы
        form.reset();
        submitBtn.disabled = true;
        Object.keys(touched).forEach(key => touched[key] = false); // Сбрасываем touched
        clearAllErrors();

        // 4. Показываем нужную часть попапа и открываем
        formWrapper.style.display = 'block';
        successBlock.classList.remove('modal__success--active');
        
        modal.classList.add('modal--active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('modal--active');
        document.body.style.overflow = '';
    }

    // Привязываем клик, передавая саму кнопку (this) внутрь функции
    document.querySelectorAll('[data-modal-target="#calcModal"]').forEach(btn => {
        btn.addEventListener('click', function() {
            openModal(this); 
        });
    });

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // -------------------------
    // SUBMIT
    // -------------------------
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        // Принудительно трогаем все поля для проверки перед отправкой
        touched.name = true; touched.phone = true; touched.email = true; touched.consent = true;
        validateAll();

        if (submitBtn.disabled) return;

        setTimeout(() => {
            formWrapper.style.display = 'none';
            successBlock.classList.add('modal__success--active');
        }, 300);
    });



        // -------------------------
    // BURGER MENU LOGIC
    // -------------------------
    const navMenu = document.querySelector('.nav-menu');
    const burgerBtn = document.querySelector('.nav-menu__burger');

    if (navMenu && burgerBtn) {
        // Открытие/Закрытие по клику на бургер
        burgerBtn.addEventListener('click', () => {
            navMenu.classList.toggle('nav-menu--active');
        });

        // Закрытие меню при клике на ссылку (чтобы не закрывало вручную)
        navMenu.querySelectorAll('.nav-menu__link').forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('nav-menu--active')) {
                    navMenu.classList.remove('nav-menu--active');
                }
            });
        });

        // Закрытие меню при клике вне его области
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && navMenu.classList.contains('nav-menu--active')) {
                navMenu.classList.remove('nav-menu--active');
            }
        });
    }

});