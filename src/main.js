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

        // Слушатели для активации статуса "touched" (чтобы ошибки не висели сразу)
        nameInput.addEventListener('blur', () => { touched.name = true; validateModal(); });
        phoneInput.addEventListener('blur', () => { touched.phone = true; validateModal(); });
        emailInput.addEventListener('blur', () => { touched.email = true; validateModal(); });
        
        // Для email включаем показ ошибки быстрее, если пользователь начал вводить данные
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
                document.body.style.overflow = 'hidden';
                
                // Сброс состояния ошибок при новом открытии
                Object.keys(touched).forEach(key => touched[key] = false);
                form.reset();
                validateModal(); 
            });
        });

        const closeAll = () => {
            modal.classList.remove('modal--active');
            document.body.style.overflow = '';
        };

        [overlay, closeBtn].forEach(el => el?.addEventListener('click', closeAll));

        // Финальная отправка
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // На всякий случай помечаем всё как touched перед отправкой
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
    // ЛОГИКА МОБИЛЬНОГО БУРГЕР-МЕНЮ (БЕЗ БЛОКИРОВКИ СКРОЛЛА)
    // ==========================================
    const navMenu = document.querySelector('.nav-menu');
    const burgerBtn = document.querySelector('.nav-menu__burger');
    const menuLinks = document.querySelectorAll('.nav-menu__link');

    if (burgerBtn && navMenu) {
        // 1. Тогглим меню при клике на сам бургер
        burgerBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Предотвращаем срабатывание клика по документу
            navMenu.classList.toggle('nav-menu--active');
        });

        // 2. Автоматически закрываем меню при клике на любой пункт
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('nav-menu--active');
            });
        });

        // 3. Закрываем меню, если кликнули в любое другое место экрана мимо меню
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && navMenu.classList.contains('nav-menu--active')) {
                navMenu.classList.remove('nav-menu--active');
            }
        });
    }

    // --- ЛОГИКА БАННЕРА ПРАЙС-ЛИСТА ---
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

    // --- УТИЛИТЫ ---
    function applyPhoneMask(input) {
        let matrix = "+7 (___) ___-__-__",
            i = 0,
            def = matrix.replace(/\D/g, ""),
            val = input.value.replace(/\D/g, "");
        if (def.length >= val.length) val = def;
        input.value = matrix.replace(/./g, function(a) {
            return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? "" : a;
        });
    }

    function toggleError(input, message, isError) {
        const group = input.closest('.form__group') || input.closest('.form__checkbox-label') || input.closest('.form-capture__field') || input.closest('.checkbox');
        if (!group) return;

        const errorClass = input.type === 'checkbox' ? 'form__checkbox-label--error' : 'form__group--error';
        
        if (isError) {
            group.classList.add(errorClass);
            if (input.type !== 'checkbox' && !group.querySelector('.form__error')) {
                const error = document.createElement('span');
                error.className = 'form__error';
                error.textContent = message;
                group.appendChild(error);
            }
        } else {
            group.classList.remove(errorClass);
            const errorText = group.querySelector('.form__error');
            if (errorText) errorText.remove();
        }
    }

    //-----ПЕРЕКЛЮЧАТЕЛЬ ТАБОВ-----

    const tabBtns = document.querySelectorAll('.tabs__btn');
    const tabPanes = document.querySelectorAll('.tabs__pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            // Убираем активные классы
            tabBtns.forEach(b => b.classList.remove('tabs__btn--active'));
            tabPanes.forEach(p => p.classList.remove('tabs__pane--active'));

            // Добавляем активные классы
            btn.classList.add('tabs__btn--active');
            document.getElementById(target).classList.add('tabs__pane--active');
        });
    });

    //------------------ДО/ПОСЛЕ+СЛАЙДЕР

    // 1. Инициализация слайдера
    const swiper = new Swiper('.cases-slider', {
        // Это заставит обертку растягивать слайды до高度 самого высокого
        autoHeight: false, 

        // Плавность переключений
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
            // Когда экран >= 320px
            320: {
                spaceBetween: 10
            },
            // Когда экран >= 768px
            768: {
                spaceBetween: 20
            },
            // Когда экран >= 1200px
            1200: {
                spaceBetween: 30
            }
        }
    });

    // Инициализация слайдера сертификатов
    const certsSwiper = new Swiper('.certs-slider', {
        speed: 600,
        grabCursor: true,
        loop: true, // Включаем бесконечную прокрутку
        
        // Настройки навигации кнопками
        navigation: {
            nextEl: '.certs-slider__btn--next',
            prevEl: '.certs-slider__btn--prev',
        },

        // Адаптивная сетка количества слайдов
        breakpoints: {
            // Экран от 320px до 767px (мобилки)
            320: {
                slidesPerView: 1,
                spaceBetween: 15
            },
            // Экран от 768px до 1199px (планшеты)
            768: {
                slidesPerView: 2,
                spaceBetween: 25
            },
            // Экран от 1200px (десктоп, как на макете)
            1200: {
                slidesPerView: 3,
                spaceBetween: 35
            }
        }
    });

    // 2. Логика До/После
    const compareSliders = document.querySelectorAll('.compare__slider');

    compareSliders.forEach(slider => {
        slider.addEventListener('input', (e) => {
            const value = e.target.value;
            const container = slider.closest('.compare');
            const beforeImg = container.querySelector('.compare__before');
            const handle = container.querySelector('.compare__handle');

            // Обновляем clip-path верхнего фото
            beforeImg.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
            // Двигаем линию разделителя
            handle.style.left = `${value}%`;
        });
    });

    // --- ЛОГИКА ФОРМЫ В СЕКЦИИ INVENTORY ---
    const inventoryForm = document.querySelector('.inventory__form');
    if (inventoryForm) {
        const invPhoneInput = inventoryForm.querySelector('.form-capture__input');
        const invConsentCheckbox = inventoryForm.querySelector('.checkbox__input');
        const invSubmitBtn = inventoryForm.querySelector('.form-capture__btn');
        
        // Объект для отслеживания взаимодействия (чтобы не пугать ошибками сразу)
        const invTouched = { phone: false, consent: false };

        function validateInventoryForm() {
            // Очищаем от не-цифр и проверяем длину (11 цифр для РФ)
            const cleanPhone = invPhoneInput.value.replace(/\D/g, "");
            const isPhoneValid = cleanPhone.length === 11;
            const isConsentValid = invConsentCheckbox.checked;

            // Кастомный вывод ошибок для структуры формы инвентаря
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
            
            // Кнопка становится активной только при полной валидности
            const isValid = isPhoneValid && isConsentValid;
            invSubmitBtn.disabled = !isValid;

            return isValid;
        }

        // Слушатель на потерю фокуса (blur), чтобы пометить поле как "тронутое"
        invPhoneInput.addEventListener('blur', () => { 
            invTouched.phone = true; 
            validateInventoryForm(); 
        });

        // Слушатель на чекбокс
        invConsentCheckbox.addEventListener('change', () => { 
            invTouched.consent = true; 
            validateInventoryForm(); 
        });

        // Живая валидация при вводе
        inventoryForm.addEventListener('input', (e) => {
            if (e.target === invPhoneInput) {
                applyPhoneMask(e.target); // Применяем твою маску
            }
            validateInventoryForm();
        });

        // Обработка отправки формы
        inventoryForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Останавливаем перезагрузку страницы

            if (!validateInventoryForm()) return;

            // Находим целевую модалку по атрибуту кнопки
            const targetModalId = invSubmitBtn.getAttribute('data-modal-target'); 
            const targetModal = document.querySelector(targetModalId);

            if (targetModal) {
                const serviceTitle = invSubmitBtn.getAttribute('data-modal-title') || 'Заказать уборку';
                
                const modalTitle = targetModal.querySelector('.modal__title');
                const formWrapper = targetModal.querySelector('.modal__form-wrapper');
                const successBlock = targetModal.querySelector('.modal__success');
                const serviceInput = targetModal.querySelector('[name="service_name"]');

                if (modalTitle) modalTitle.textContent = serviceTitle;
                if (serviceInput) {
                    serviceInput.value = serviceTitle;
                }

                if (formWrapper) formWrapper.style.display = 'block';
                if (successBlock) successBlock.classList.remove('modal__success--active');
                
                targetModal.classList.add('modal--active');
                document.body.style.overflow = 'hidden';

                // Сбрасываем форму инвентаря после вызова модалки
                invTouched.phone = false;
                invTouched.consent = false;
                inventoryForm.reset();
                validateInventoryForm();
            }
        });

        // Инициализация начального состояния кнопки (выключаем её сразу)
        validateInventoryForm();
    }


    //==============КНОПКА ВВЕРХ=================
    const backToTopBtn = document.getElementById('backToTop');

    if (backToTopBtn) {
        // 1. Отслеживаем прокрутку страницы
        window.addEventListener('scroll', () => {
            // Если пролистали больше 400 пикселей, добавляем класс показа
            if (window.scrollY > 400) {
                backToTopBtn.classList.add('back-to-top--show');
            } else {
                backToTopBtn.classList.remove('back-to-top--show');
            }
        });

        // 2. Обрабатываем клик по кнопке
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Плавный скролл наверх
            });
        });
    }
});