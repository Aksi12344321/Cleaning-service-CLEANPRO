import './scss/main.scss';
import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';


document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('calcModal');
    
    if (modal) {
        const overlay = modal.querySelector('.modal__overlay');
        const closeBtn = modal.querySelector('.modal__close');
        const formWrapper = modal.querySelector('.modal__form-wrapper');
        const successBlock = modal.querySelector('.modal__success');
        const modalTitle = modal.querySelector('.modal__title');
        const form = document.getElementById('calcForm');

        // Элементы полей
        const nameInput = form.querySelector('[name="user_name"]');
        const phoneInput = form.querySelector('[name="user_phone"]');
        const emailInput = form.querySelector('[name="user_email"]');
        const consentCheckbox = form.querySelector('[name="consent_data"]');
        const submitBtn = form.querySelector('button[type="submit"]');
        const serviceInput = form.querySelector('[name="service_name"]');

        // Состояния валидации (true — пользователь взаимодействовал с полем)
        const touched = { name: false, phone: false, email: false, consent: false };

        // Регулярное выражение для Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        function validateModal() {
            const isNameValid = nameInput.value.trim().length >= 2;
            const isPhoneValid = phoneInput.value.replace(/\D/g, "").length === 11;
            
            // Email ОБЯЗАТЕЛЕН и должен соответствовать регулярке
            const isEmailValid = emailRegex.test(emailInput.value.trim()); 
            const isConsentValid = consentCheckbox.checked;

            // Логика отображения ошибок (только если поле "тронуто")
            toggleError(nameInput, 'Введите имя (минимум 2 символа)', !isNameValid && touched.name);
            toggleError(phoneInput, 'Введите полный номер телефона', !isPhoneValid && touched.phone);
            toggleError(emailInput, 'Введите корректный email', !isEmailValid && touched.email);
            toggleError(consentCheckbox, '', !isConsentValid && touched.consent);

            // Кнопка активна только если ВСЕ поля валидны
            const canSubmit = isNameValid && isPhoneValid && isEmailValid && isConsentValid;
            submitBtn.disabled = !canSubmit;
            
            return canSubmit;
        }

        // Слушатели для активации статуса "touched"
        nameInput.addEventListener('blur', () => { touched.name = true; validateModal(); });
        phoneInput.addEventListener('blur', () => { touched.phone = true; validateModal(); });
        emailInput.addEventListener('blur', () => { touched.email = true; validateModal(); });
        
        emailInput.addEventListener('input', () => {
            if (emailInput.value.trim().length > 5) touched.email = true; 
            validateModal();
        });

        consentCheckbox.addEventListener('change', () => { 
            touched.consent = true; 
            validateModal(); 
        });

        // Маска телефона и общая валидация при вводе
        form.addEventListener('input', (e) => {
            if (e.target.name === 'user_phone') applyPhoneMask(e.target);
            if (e.target.name === 'user_name') validateModal();
        });

        // Открытие модалки и подстановка услуги
        document.querySelectorAll('[data-modal-target="#calcModal"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const serviceTitle = btn.getAttribute('data-modal-title') || 'Рассчитать стоимость';
                modalTitle.textContent = serviceTitle;

                if (serviceInput) {
                    serviceInput.value = serviceTitle;
                }

                formWrapper.style.display = 'block';
                successBlock.classList.remove('modal__success--active');
                modal.classList.add('modal--active');
               document.body.classList.add('modal-open');
                
                // Сброс состояния ошибок при новом открытии
                Object.keys(touched).forEach(key => touched[key] = false);
                form.reset();
                validateModal(); 
            });
        });

        const closeAll = () => {
            modal.classList.remove('modal--active');
            document.body.classList.remove('modal-open');
        };

        [overlay, closeBtn].forEach(el => el?.addEventListener('click', closeAll));

        // Финальная отправка
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            Object.keys(touched).forEach(k => touched[k] = true);
            if (!validateModal()) return;

            submitBtn.textContent = 'ОТПРАВКА...';
            submitBtn.disabled = true;

            setTimeout(() => {
                const formData = new FormData(form);
                console.log("Данные к отправке:", Object.fromEntries(formData));

                form.reset();
                submitBtn.textContent = 'Отправить заявку';
                formWrapper.style.display = 'none';
                successBlock.classList.add('modal__success--active');
            }, 1500);
        });
    }

    // ==========================================
    // ЛОГИКА МОБИЛЬНОГО БУРГЕР-МЕНЮ
    // ==========================================
    const navMenu = document.querySelector('.nav-menu');
    const burgerBtn = document.querySelector('.nav-menu__burger');
    const menuLinks = document.querySelectorAll('.nav-menu__link');

    if (burgerBtn && navMenu) {
        burgerBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            navMenu.classList.toggle('nav-menu--active');
        });

        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('nav-menu--active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && navMenu.classList.contains('nav-menu--active')) {
                navMenu.classList.remove('nav-menu--active');
            }
        });
    }

    // ==========================================
    // ЛОГИКА БАННЕРА ПРАЙС-ЛИСТА
    // ==========================================
    const priceForm = document.getElementById('priceForm');
    if (priceForm) {
        const pricePhoneInput = priceForm.querySelector('[name="user_phone"]');
        const priceConsentCheckbox = priceForm.querySelector('[name="consent_data"]');
        const priceSubmitBtn = priceForm.querySelector('.price-banner__btn');
        const priceTouched = { phone: false, consent: false };

        function validatePriceForm() {
            const isPhoneValid = pricePhoneInput.value.replace(/\D/g, "").length === 11;
            const isConsentValid = priceConsentCheckbox.checked;

            toggleError(pricePhoneInput, 'Неполный номер', !isPhoneValid && priceTouched.phone);
            toggleError(priceConsentCheckbox, '', !isConsentValid && priceTouched.consent);

            priceSubmitBtn.disabled = !(isPhoneValid && isConsentValid);
            return isPhoneValid && isConsentValid;
        }

        pricePhoneInput.addEventListener('blur', () => { priceTouched.phone = true; validatePriceForm(); });
        priceConsentCheckbox.addEventListener('change', () => { priceTouched.consent = true; validatePriceForm(); });

        priceForm.addEventListener('input', (e) => {
            if (e.target.name === 'user_phone') applyPhoneMask(e.target);
            validatePriceForm();
        });

        priceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!validatePriceForm()) return;

            priceSubmitBtn.textContent = 'ОТКРЫВАЕМ ПРАЙС...';
            priceSubmitBtn.disabled = true;

            const pdfUrl = '/public/dogovor.pdf'; 

            setTimeout(() => {
                window.open(pdfUrl, '_blank');
                priceForm.reset();
                priceTouched.phone = false;
                priceTouched.consent = false;
                priceSubmitBtn.textContent = 'ПОЛУЧИТЬ ПРАЙС';
                validatePriceForm();
            }, 600);
        });
    }

    // ==========================================
    // ЛОГИКА БАННЕРА КАЛЬКУЛЯТОРА
    // ==========================================
    const calcBannerForm = document.getElementById('calcBannerForm');
    if (calcBannerForm) {
        const cbPhoneInput = calcBannerForm.querySelector('[name="user_phone"]');
        const cbConsentCheckbox = calcBannerForm.querySelector('[name="consent_data"]');
        const cbSubmitBtn = calcBannerForm.querySelector('.calc-banner__btn');
        const cbTouched = { phone: false, consent: false };

        function validateCalcBannerForm() {
            const isPhoneValid = cbPhoneInput.value.replace(/\D/g, "").length === 11;
            const isConsentValid = cbConsentCheckbox.checked;

            toggleError(cbPhoneInput, 'Неполный номер', !isPhoneValid && cbTouched.phone);
            toggleError(cbConsentCheckbox, '', !isConsentValid && cbTouched.consent);

            cbSubmitBtn.disabled = !(isPhoneValid && isConsentValid);
            return isPhoneValid && isConsentValid;
        }

        cbPhoneInput.addEventListener('blur', () => { cbTouched.phone = true; validateCalcBannerForm(); });
        cbConsentCheckbox.addEventListener('change', () => { cbTouched.consent = true; validateCalcBannerForm(); });

        calcBannerForm.addEventListener('input', (e) => {
            if (e.target.name === 'user_phone') applyPhoneMask(e.target);
            validateCalcBannerForm();
        });

        calcBannerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!validateCalcBannerForm()) return;

            cbSubmitBtn.textContent = 'ОБРАБОТКА...';
            cbSubmitBtn.disabled = true;

            setTimeout(() => {
                if (modal) {
                    const modalTitle = modal.querySelector('.modal__title');
                    const modalFormWrapper = modal.querySelector('.modal__form-wrapper');
                    const modalSuccessBlock = modal.querySelector('.modal__success');
                    const modalPhoneInput = modal.querySelector('[name="user_phone"]');
                    const modalServiceInput = modal.querySelector('[name="service_name"]');

                    if (modalTitle) modalTitle.textContent = "Расчёт из калькулятора";
                    if (modalServiceInput) modalServiceInput.value = "Расчёт из калькулятора";
                    if (modalPhoneInput) modalPhoneInput.value = cbPhoneInput.value;

                    if (modalFormWrapper) modalFormWrapper.style.display = 'block';
                    if (modalSuccessBlock) modalSuccessBlock.classList.remove('modal__success--active');

                    if (typeof touched !== 'undefined') {
                        Object.keys(touched).forEach(key => touched[key] = false);
                        touched.phone = true; 
                    }

                    if (typeof validateModal === 'function') validateModal();

                    modal.classList.add('modal--active');
                    document.body.style.overflow = 'hidden';
                }

                calcBannerForm.reset();
                cbTouched.phone = false;
                cbTouched.consent = false;
                cbSubmitBtn.textContent = 'ПОЛУЧИТЬ РАСЧЁТ И БОНУСЫ';
                validateCalcBannerForm();
            }, 600);
        });
    }

    // ==========================================
    // ЛОГИКА СЕКЦИИ КОНСУЛЬТАЦИИ (BENEFITS-FORM) -> СРАЗУ УСПЕХ
    // ==========================================
    const mainSectionForm = document.getElementById('mainSectionForm');
    if (mainSectionForm) {
        const msPhoneInput = mainSectionForm.querySelector('[name="user_phone"]');
        const msConsentCheckbox = mainSectionForm.querySelector('[name="consent_data"]');
        const msSubmitBtn = mainSectionForm.querySelector('.benefits-form__btn');
        const msTouched = { phone: false, consent: false };

        function validateMainSectionForm() {
            const isPhoneValid = msPhoneInput.value.replace(/\D/g, "").length === 11;
            const isConsentValid = msConsentCheckbox.checked;

            toggleError(msPhoneInput, 'Неполный номер', !isPhoneValid && msTouched.phone);
            toggleError(msConsentCheckbox, '', !isConsentValid && msTouched.consent);

            msSubmitBtn.disabled = !(isPhoneValid && isConsentValid);
            return isPhoneValid && isConsentValid;
        }

        msPhoneInput.addEventListener('blur', () => { msTouched.phone = true; validateMainSectionForm(); });
        msConsentCheckbox.addEventListener('change', () => { msTouched.consent = true; validateMainSectionForm(); });

        mainSectionForm.addEventListener('input', (e) => {
            if (e.target.name === 'user_phone') applyPhoneMask(e.target);
            validateMainSectionForm();
        });

        mainSectionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!validateMainSectionForm()) return;

            msSubmitBtn.textContent = 'ОТПРАВКА...';
            msSubmitBtn.disabled = true;

            setTimeout(() => {
                const formData = new FormData(mainSectionForm);
                console.log("Данные из секции консультации:", Object.fromEntries(formData));

                // Сбрасываем и очищаем форму на странице
                mainSectionForm.reset();
                msTouched.phone = false;
                msTouched.consent = false;
                msSubmitBtn.textContent = 'ЖДУ ЗВОНКА';
                validateMainSectionForm();

                // Открываем модалку ОРАЗУ в состоянии успешной отправки
                if (modal) {
                    const modalTitle = modal.querySelector('.modal__title');
                    const modalFormWrapper = modal.querySelector('.modal__form-wrapper');
                    const modalSuccessBlock = modal.querySelector('.modal__success');

                    if (modalTitle) modalTitle.textContent = 'Заявка принята!';
                    if (modalFormWrapper) modalFormWrapper.style.display = 'none'; // Прячем инпуты модалки
                    if (modalSuccessBlock) modalSuccessBlock.classList.add('modal__success--active'); // Показываем окно успеха

                    modal.classList.add('modal--active');
                    document.body.style.overflow = 'hidden';
                }
            }, 1000);
        });

        // Первичная инициализация состояния кнопки
        validateMainSectionForm();
    }

    // ==========================================
    // ЛОГИКА ФОРМЫ В СЕКЦИИ INVENTORY
    // ==========================================
    const inventoryForm = document.querySelector('.inventory__form');
    if (inventoryForm) {
        const invPhoneInput = inventoryForm.querySelector('.form-capture__input');
        const invConsentCheckbox = inventoryForm.querySelector('.checkbox__input');
        const invSubmitBtn = inventoryForm.querySelector('.form-capture__btn');
        const invTouched = { phone: false, consent: false };

        function validateInventoryForm() {
            const cleanPhone = invPhoneInput.value.replace(/\D/g, "");
            const isPhoneValid = cleanPhone.length === 11;
            const isConsentValid = invConsentCheckbox.checked;

            const fieldGroup = invPhoneInput.closest('.form-capture__field');
            if (fieldGroup) {
                if (!isPhoneValid && invTouched.phone) {
                    fieldGroup.classList.add('form-capture__field--error');
                    if (!fieldGroup.querySelector('.form__error')) {
                        const error = document.createElement('span');
                        error.className = 'form__error';
                        error.textContent = 'Введите полный номер';
                        fieldGroup.appendChild(error);
                    }
                } else {
                    fieldGroup.classList.remove('form-capture__field--error');
                    const errorText = fieldGroup.querySelector('.form__error');
                    if (errorText) errorText.remove();
                }
            }
            
            const checkboxGroup = invConsentCheckbox.closest('.checkbox');
            if (checkboxGroup) {
                if (!isConsentValid && invTouched.consent) {
                    checkboxGroup.classList.add('form__checkbox-label--error');
                } else {
                    checkboxGroup.classList.remove('form__checkbox-label--error');
                }
            }
            
            const isValid = isPhoneValid && isConsentValid;
            invSubmitBtn.disabled = !isValid;

            return isValid;
        }

        invPhoneInput.addEventListener('blur', () => { invTouched.phone = true; validateInventoryForm(); });
        invConsentCheckbox.addEventListener('change', () => { invTouched.consent = true; validateInventoryForm(); });

        inventoryForm.addEventListener('input', (e) => {
            if (e.target === invPhoneInput) applyPhoneMask(e.target);
            validateInventoryForm();
        });

        inventoryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!validateInventoryForm()) return;

            const targetModalId = invSubmitBtn.getAttribute('data-modal-target'); 
            const targetModal = document.querySelector(targetModalId);

            if (targetModal) {
                const serviceTitle = invSubmitBtn.getAttribute('data-modal-title') || 'Заказать уборку';
                
                const modalTitle = targetModal.querySelector('.modal__title');
                const formWrapper = targetModal.querySelector('.modal__form-wrapper');
                const successBlock = targetModal.querySelector('.modal__success');
                const serviceInput = targetModal.querySelector('[name="service_name"]');

                if (modalTitle) modalTitle.textContent = serviceTitle;
                if (serviceInput) serviceInput.value = serviceTitle;

                if (formWrapper) formWrapper.style.display = 'block';
                if (successBlock) successBlock.classList.remove('modal__success--active');
                
                targetModal.classList.add('modal--active');
                document.body.style.overflow = 'hidden';

                invTouched.phone = false;
                invTouched.consent = false;
                inventoryForm.reset();
                validateInventoryForm();
            }
        });

        validateInventoryForm();
    }

    // ==========================================
    // УТИЛИТЫ (МАСКА И ОШИБКИ)
    // ==========================================
    function applyPhoneMask(input) {
        const matrix = "+7 (___) ___-__-__";
        let i = 0;
        const def = matrix.replace(/\D/g, "");
        let val = input.value.replace(/\D/g, "");
        
        if (def.length >= val.length) val = def;
        
        input.value = matrix.replace(/./g, function(a) {
            return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? "" : a;
        });
    }

    function toggleError(input, message, isError) {
        const group = input.closest('.form__group') || 
                      input.closest('.form__checkbox-label') || 
                      input.closest('.form-capture__field') || 
                      input.closest('.checkbox') || 
                      input.closest('.calc-banner__group');
                      
        if (!group) return;

        const errorClass = input.type === 'checkbox' ? 'form__checkbox-label--error' : 'form__group--error';
        
        if (isError) {
            group.classList.add(errorClass);
            if (input.type !== 'checkbox') {
                let errorSpan = group.querySelector('.form__error');
                if (!errorSpan) {
                    errorSpan = document.createElement('span');
                    errorSpan.className = 'form__error';
                    group.appendChild(errorSpan);
                }
                errorSpan.textContent = message;
            }
        } else {
            group.classList.remove(errorClass);
            if (input.type !== 'checkbox') {
                const errorText = group.querySelector('.form__error');
                if (errorText && errorText.textContent !== "") errorText.textContent = "";
            }
        }
    }

    // ==========================================
    // ПЕРЕКЛЮЧАТЕЛЬ ТАБОВ
    // ==========================================
    const tabBtns = document.querySelectorAll('.tabs__btn');
    const tabPanes = document.querySelectorAll('.tabs__pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('tabs__btn--active'));
            tabPanes.forEach(p => p.classList.remove('tabs__pane--active'));

            btn.classList.add('tabs__btn--active');
            const targetPane = document.getElementById(target);
            if (targetPane) targetPane.classList.add('tabs__pane--active');
        });
    });

    // ==========================================
    // СЛАЙДЕРЫ И ДО/ПОСЛЕ
    // ==========================================
    const swiper = new Swiper('.cases-slider', {
        autoHeight: false, 
        speed: 800,
        grabCursor: true,
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.cases-slider__btn--next',
            prevEl: '.cases-slider__btn--prev',
        },
        breakpoints: {
            320: { spaceBetween: 10 },
            768: { spaceBetween: 20 },
            1200: { spaceBetween: 30 }
        }
    });

    const certsSwiper = new Swiper('.certs-slider', {
        speed: 600,
        grabCursor: true,
        loop: true, 
        navigation: {
            nextEl: '.certs-slider__btn--next',
            prevEl: '.certs-slider__btn--prev',
        },
        breakpoints: {
            320: { slidesPerView: 1, spaceBetween: 15 },
            768: { slidesPerView: 2, spaceBetween: 25 },
            1200: { slidesPerView: 3, spaceBetween: 35 }
        }
    });

    // ==========================================
// ЛОГИКА ДО/ПОСЛЕ (БЕЗ КОНФЛИКТА С SWIPER)
// ==========================================
const compares = document.querySelectorAll('.compare');

compares.forEach(container => {
    const handle = container.querySelector('.compare__handle');
    const beforeImg = container.querySelector('.compare__before');

    let isMoving = false;

    // Функция обновления положения
    const updateSplit = (percent) => {
        const validatedPercent = Math.max(0, Math.min(100, percent));

        handle.style.left = `${validatedPercent}%`;
        beforeImg.style.clipPath = `inset(0 ${100 - validatedPercent}% 0 0)`;
    };

    // ==========================================
    // POINTER EVENTS (мышь + touchpad + touch)
    // ==========================================

    handle.addEventListener('pointerdown', (e) => {
        e.preventDefault();

        isMoving = true;

        // отключаем свайп swiper
        swiper.allowTouchMove = false;

        // убираем transition во время движения
        handle.style.transition = 'none';
        beforeImg.style.transition = 'none';

        // захватываем pointer
        handle.setPointerCapture(e.pointerId);

        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = (x / rect.width) * 100;

        updateSplit(percent);
    });

    container.addEventListener('pointermove', (e) => {
        if (!isMoving) return;

        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = (x / rect.width) * 100;

        updateSplit(percent);
    });

    const stopMoving = () => {
        if (!isMoving) return;

        isMoving = false;

        // возвращаем swiper
        swiper.allowTouchMove = true;

        // возвращаем плавность
        handle.style.transition = 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        beforeImg.style.transition = 'clip-path 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    };

    window.addEventListener('pointerup', stopMoving);
    window.addEventListener('pointercancel', stopMoving);

    // стартовое положение
    updateSplit(50);
});
    // ==========================================
    // КНОПКА ВВЕРХ
    // ==========================================
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTopBtn.classList.add('back-to-top--show');
            } else {
                backToTopBtn.classList.remove('back-to-top--show');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


});