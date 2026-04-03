/**
 * MetaAdsWala - Main JavaScript
 * Handles mobile menu, scroll reveal, and interactive elements
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // Mobile Menu Toggle
    // =========================================================================
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const menuIcon = menuBtn?.querySelector('i');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            const isOpen = !mobileMenu.classList.contains('hidden');

            if (isOpen) {
                // Close menu
                mobileMenu.classList.add('hidden');
                mobileMenu.style.maxHeight = '0';
                menuBtn.setAttribute('aria-expanded', 'false');
                // Update icon if using lucide
                if (menuIcon) {
                    menuIcon.setAttribute('data-lucide', 'menu');
                    lucide.createIcons();
                }
            } else {
                // Open menu
                mobileMenu.classList.remove('hidden');
                mobileMenu.style.maxHeight = mobileMenu.scrollHeight + 'px';
                menuBtn.setAttribute('aria-expanded', 'true');
                // Update icon if using lucide
                if (menuIcon) {
                    menuIcon.setAttribute('data-lucide', 'x');
                    lucide.createIcons();
                }
            }
        });

        // Close menu when clicking on links
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                mobileMenu.style.maxHeight = '0';
                menuBtn.setAttribute('aria-expanded', 'false');
                if (menuIcon) {
                    menuIcon.setAttribute('data-lucide', 'menu');
                    lucide.createIcons();
                }
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                mobileMenu.style.maxHeight = '0';
                menuBtn.setAttribute('aria-expanded', 'false');
                menuBtn.focus();
            }
        });

        // Close menu when window is resized to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768 && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                mobileMenu.style.maxHeight = '0';
                menuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // =========================================================================
    // Navigation Scroll Effect
    // =========================================================================
    const nav = document.querySelector('nav');

    if (nav) {
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }

            lastScrollY = currentScrollY;
        }, { passive: true });
    }

    // =========================================================================
    // Smooth Scroll for Anchor Links
    // =========================================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();

                const navHeight = nav?.offsetHeight || 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // =========================================================================
    // Initialize Lucide Icons
    // =========================================================================
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // =========================================================================
    // FAQ Accordion
    // =========================================================================
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length) {
        faqItems.forEach((item, index) => {
            const button = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');

            if (!button || !answer) return;

            const isFirst = index === 0;
            item.classList.toggle('is-open', isFirst);
            button.setAttribute('aria-expanded', isFirst ? 'true' : 'false');
            answer.setAttribute('aria-hidden', isFirst ? 'false' : 'true');

            button.addEventListener('click', () => {
                const isOpen = item.classList.contains('is-open');
                item.classList.toggle('is-open', !isOpen);
                button.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
                answer.setAttribute('aria-hidden', !isOpen ? 'false' : 'true');
            });
        });
    }

    // =========================================================================
    // Google Apps Script Form Submission
    // =========================================================================
    // REPLACE THIS URL with your deployed Web App URL from the plan (Phase 2)
    const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbw_vOeIcsv0lNh1O0LtLHShpwnzzQgpUm6f_jVPoPuoMG5Z7JEDHKp4Oy9Ug9MzZ0wlcQ/exec';

    /**
     * Generic form submission handler
     * @param {HTMLFormElement} form - The form element
     */
    async function handleFormSubmit(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        const originalClasses = submitBtn.className;

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Sending...';
        if (typeof lucide !== 'undefined') lucide.createIcons();

        // Collect form data
        const formData = new FormData(form);

        // Log for debugging
        console.log('Submitting form data:', Object.fromEntries(formData));

        try {
            // Send to Google Apps Script
            const response = await fetch(FORM_ENDPOINT, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            console.log('Response:', result);

            if (result.status === 'success') {
                // Show success message
                submitBtn.innerHTML = '<i data-lucide="check-circle" class="w-5 h-5"></i> Success!';
                submitBtn.classList.remove('bg-secondary', 'hover:bg-secondary-hover', 'bg-primary', 'hover:bg-primary-dark');
                submitBtn.classList.add('bg-green-500', 'hover:bg-green-600');
                if (typeof lucide !== 'undefined') lucide.createIcons();

                // Reset form
                form.reset();

                // Redirect to thank you page
                window.location.href = 'thank-you.html';
                return; // Stop execution after redirect
            } else {
                throw new Error(result.message || 'Submission failed');
            }

        } catch (error) {
            console.error('Form submission error:', error);

            // Show error state
            submitBtn.innerHTML = '<i data-lucide="alert-circle" class="w-5 h-5"></i> Error';
            submitBtn.classList.remove('bg-secondary', 'hover:bg-secondary-hover', 'bg-primary', 'hover:bg-primary-dark');
            submitBtn.classList.add('bg-red-500', 'hover:bg-red-600');
            if (typeof lucide !== 'undefined') lucide.createIcons();

            alert('Something went wrong. Please try again or call us at +91 92057 36946');

            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                submitBtn.className = originalClasses;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }, 3000);
        }
    }

    // =========================================================================
    // Form Handling - Hero Contact Form
    // =========================================================================
    const heroForm = document.getElementById('hero-contact-form');
    if (heroForm) {
        heroForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmit(heroForm);
        });
    }

    // =========================================================================
    // Form Handling - Homepage Contact Form
    // =========================================================================
    const homepageForm = document.getElementById('homepage-contact-form');
    if (homepageForm) {
        homepageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmit(homepageForm);
        });
    }

    // =========================================================================
    // Form Handling - Contact Page Form
    // =========================================================================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmit(contactForm);
        });
    }

    // =========================================================================
    // Form Handling - Web Dev Hero Form
    // =========================================================================
    const webdevHeroForm = document.getElementById('webdev-hero-form');
    if (webdevHeroForm) {
        webdevHeroForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmit(webdevHeroForm);
        });
    }

    // =========================================================================
    // Form Handling - Web Dev Bottom Form
    // =========================================================================
    const webdevBottomForm = document.getElementById('webdev-bottom-form');
    if (webdevBottomForm) {
        webdevBottomForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmit(webdevBottomForm);
        });
    }

    // =========================================================================
    // Form Handling - Google Ads Hero Form
    // =========================================================================
    const googleAdsHeroForm = document.getElementById('google-ads-hero-form');
    if (googleAdsHeroForm) {
        googleAdsHeroForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmit(googleAdsHeroForm);
        });
    }

    // =========================================================================
    // Form Handling - Google Ads Bottom Form
    // =========================================================================
    const googleAdsBottomForm = document.getElementById('google-ads-bottom-form');
    if (googleAdsBottomForm) {
        googleAdsBottomForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmit(googleAdsBottomForm);
        });
    }

    // =========================================================================
    // Form Handling - Meta Ads Hero Form
    // =========================================================================
    const metaAdsHeroForm = document.getElementById('meta-ads-hero-form');
    if (metaAdsHeroForm) {
        metaAdsHeroForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmit(metaAdsHeroForm);
        });
    }

    // =========================================================================
    // Form Handling - Meta Ads Bottom Form
    // =========================================================================
    const metaAdsBottomForm = document.getElementById('meta-ads-bottom-form');
    if (metaAdsBottomForm) {
        metaAdsBottomForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmit(metaAdsBottomForm);
        });
    }

    // =========================================================================
    // Console Welcome Message
    // =========================================================================
    console.log('%c MetaAdsWala ', 'background: #0F4C81; color: white; font-size: 16px; font-weight: bold; padding: 8px 16px; border-radius: 4px;');
    console.log('%c🚀 Ready to Scale Your Brand!', 'color: #FF4757; font-size: 12px;');
});
