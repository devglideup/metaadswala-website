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

            alert('Something went wrong. Please try again or call us at +91 97979 89421');

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
    // Lucky Spin Wheel
    // =========================================================================
    const spinCanvas = document.getElementById('spinWheel');
    const spinBtn = document.getElementById('spinBtn');
    const winModal = document.getElementById('winModal');
    const winModalContent = document.getElementById('winModalContent');
    const winModalOverlay = document.getElementById('winModalOverlay');
    const claimBtn = document.getElementById('claimBtn');

    if (spinCanvas && spinBtn) {
        const ctx = spinCanvas.getContext('2d');
        const size = 500;
        const center = size / 2;
        const radius = center - 4;

        // Segments - varied attractive offers, but ALWAYS lands on "5% OFF Any Service"
        const segments = [
            { label: 'Free\nSEO Audit', color: '#8B5CF6', textColor: '#ffffff' },
            { label: '10% OFF\nMeta Ads', color: '#FF4757', textColor: '#ffffff' },
            { label: 'Free\nConsultation', color: '#10B981', textColor: '#ffffff' },
            { label: '15% OFF\nGoogle Ads', color: '#0F4C81', textColor: '#ffffff' },
            { label: '5% OFF\nAny Service', color: '#F59E0B', textColor: '#ffffff' },
            { label: 'Free\nAd Creative', color: '#EC4899', textColor: '#ffffff' },
            { label: '20% OFF\nWeb Dev', color: '#6366F1', textColor: '#ffffff' },
            { label: 'Free\nStrategy Call', color: '#EF4444', textColor: '#ffffff' },
        ];

        // Index of the segment the wheel ALWAYS lands on
        const RIGGED_SEGMENT = 4; // "5% OFF Any Service"

        const segmentAngle = (2 * Math.PI) / segments.length;
        let currentAngle = 0;
        let isSpinning = false;
        let hasSpun = sessionStorage.getItem('maw_spin_done') === 'true';

        // Disable button if already spun
        if (hasSpun) {
            spinBtn.disabled = true;
            spinBtn.innerHTML = '<span class="flex items-center gap-3"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Already Spun!</span>';
            spinBtn.classList.add('opacity-60', 'cursor-not-allowed');
        }

        function drawWheel(rotation) {
            ctx.clearRect(0, 0, size, size);
            ctx.save();
            ctx.translate(center, center);
            ctx.rotate(rotation);

            segments.forEach((seg, i) => {
                const startAngle = i * segmentAngle;
                const endAngle = startAngle + segmentAngle;

                // Draw segment
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, radius, startAngle, endAngle);
                ctx.closePath();

                // Gradient fill for depth
                const grad = ctx.createRadialGradient(0, 0, 20, 0, 0, radius);
                grad.addColorStop(0, lightenColor(seg.color, 30));
                grad.addColorStop(1, seg.color);
                ctx.fillStyle = grad;
                ctx.fill();

                // Segment border
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Text
                ctx.save();
                ctx.rotate(startAngle + segmentAngle / 2);
                ctx.textAlign = 'right';
                ctx.fillStyle = seg.textColor;

                const lines = seg.label.split('\n');

                if (lines.length === 2) {
                    // Two-line label: bold first line, regular second line
                    ctx.font = 'bold 22px Montserrat, sans-serif';
                    ctx.shadowColor = 'rgba(0,0,0,0.3)';
                    ctx.shadowBlur = 4;
                    ctx.fillText(lines[0], radius - 20, -6);

                    ctx.font = '600 16px Inter, sans-serif';
                    ctx.fillText(lines[1], radius - 20, 18);
                } else {
                    // Single line
                    ctx.font = 'bold 20px Montserrat, sans-serif';
                    ctx.shadowColor = 'rgba(0,0,0,0.3)';
                    ctx.shadowBlur = 4;
                    ctx.fillText(seg.label, radius - 20, 6);
                }
                ctx.shadowBlur = 0;
                ctx.restore();
            });

            // Inner ring decoration
            ctx.beginPath();
            ctx.arc(0, 0, 52, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        }

        function lightenColor(hex, percent) {
            const num = parseInt(hex.replace('#', ''), 16);
            const r = Math.min(255, (num >> 16) + percent);
            const g = Math.min(255, ((num >> 8) & 0x00FF) + percent);
            const b = Math.min(255, (num & 0x0000FF) + percent);
            return `rgb(${r},${g},${b})`;
        }

        // Easing function: cubic ease-out with realistic deceleration
        function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        // Tick sound simulation via brief canvas flash
        let lastTickSegment = -1;
        function playTick() {
            // Visual tick: brief pulse on center hub
            const hub = spinCanvas.parentElement.querySelector('.absolute.top-1\\/2');
            if (hub) {
                hub.style.transform = 'translate(-50%, -50%) scale(1.08)';
                setTimeout(() => {
                    hub.style.transform = 'translate(-50%, -50%) scale(1)';
                }, 50);
            }
        }

        function spin() {
            if (isSpinning || hasSpun) return;
            isSpinning = true;
            hasSpun = true;
            sessionStorage.setItem('maw_spin_done', 'true');

            // Disable button
            spinBtn.disabled = true;
            spinBtn.innerHTML = '<svg class="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Spinning...';

            // The pointer is at the top of the wheel (canvas angle -π/2).
            // After rotating the wheel by `currentAngle`, the wheel-angle under the pointer is:
            //   θ = (-π/2 - currentAngle) mod 2π
            // We want θ to be the center of RIGGED_SEGMENT:
            //   θ = RIGGED_SEGMENT * segmentAngle + segmentAngle / 2
            // Solving: currentAngle = 3π/2 - (RIGGED_SEGMENT + 0.5) * segmentAngle  (mod 2π)

            const fullRotations = 5 + Math.floor(Math.random() * 4); // 5-8 full rotations

            // Base angle to land on rigged segment center
            let baseAngle = (3 * Math.PI / 2) - (RIGGED_SEGMENT + 0.5) * segmentAngle;
            // Normalize to [0, 2π]
            baseAngle = ((baseAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

            // Add small random jitter within segment (±30% of segment width) so it doesn't look dead-center
            const jitter = (Math.random() - 0.5) * segmentAngle * 0.6;

            const targetAngle = fullRotations * 2 * Math.PI + baseAngle + jitter;

            const duration = 5000 + Math.random() * 1500; // 5-6.5 seconds
            const startTime = performance.now();
            const startAngle = currentAngle;
            const totalRotation = targetAngle - startAngle;

            function animate(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = easeOutCubic(progress);

                currentAngle = startAngle + totalRotation * eased;
                drawWheel(currentAngle);

                // Tick effect
                const normalizedAngle = ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
                const currentSeg = Math.floor(normalizedAngle / segmentAngle) % segments.length;
                if (currentSeg !== lastTickSegment) {
                    lastTickSegment = currentSeg;
                    if (progress < 0.9) playTick();
                }

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Spin complete
                    isSpinning = false;
                    spinBtn.innerHTML = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Spun!';
                    spinBtn.classList.add('opacity-60', 'cursor-not-allowed');

                    // Show modal after brief delay
                    setTimeout(() => {
                        showWinModal();
                    }, 600);
                }
            }

            requestAnimationFrame(animate);
        }

        function showWinModal() {
            winModal.classList.add('active');
            winModalContent.style.transform = 'scale(0.9)';
            winModalContent.style.opacity = '0';

            requestAnimationFrame(() => {
                winModalContent.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease';
                winModalContent.style.transform = 'scale(1)';
                winModalContent.style.opacity = '1';
            });

            // Confetti
            setTimeout(() => {
                startConfetti();
            }, 300);

            // WhatsApp link with pre-filled message
            const message = encodeURIComponent('🎉 Hi MetaAdsWala! I spun the lucky wheel on your website and won 5% OFF on any service! I\'d like to claim my discount. Please share the details.');
            claimBtn.href = `https://wa.me/919797989421?text=${message}`;

            // Track event
            if (typeof gtag === 'function') {
                gtag('event', 'spin_wheel_win', {
                    'event_category': 'engagement',
                    'event_label': '5% off any service',
                    'page_path': window.location.pathname
                });
            }
        }

        function closeModal() {
            winModalContent.style.transform = 'scale(0.9)';
            winModalContent.style.opacity = '0';
            setTimeout(() => {
                winModal.classList.remove('active');
            }, 400);
        }

        spinBtn.addEventListener('click', spin);
        winModalOverlay.addEventListener('click', closeModal);

        // Draw initial wheel
        drawWheel(currentAngle);

        // Confetti system
        function startConfetti() {
            const canvas = document.getElementById('confettiCanvas');
            if (!canvas) return;
            const cCtx = canvas.getContext('2d');
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;

            const particles = [];
            const colors = ['#FF4757', '#0F4C81', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#FFD700', '#FF6B81'];

            for (let i = 0; i < 150; i++) {
                particles.push({
                    x: canvas.width / 2 + (Math.random() - 0.5) * 100,
                    y: canvas.height / 2,
                    vx: (Math.random() - 0.5) * 16,
                    vy: Math.random() * -18 - 4,
                    w: Math.random() * 10 + 4,
                    h: Math.random() * 6 + 2,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    rotation: Math.random() * 360,
                    rotSpeed: (Math.random() - 0.5) * 15,
                    gravity: 0.3 + Math.random() * 0.2,
                    opacity: 1,
                    decay: 0.005 + Math.random() * 0.008
                });
            }

            function animateConfetti() {
                cCtx.clearRect(0, 0, canvas.width, canvas.height);
                let alive = false;

                particles.forEach(p => {
                    if (p.opacity <= 0) return;
                    alive = true;

                    p.x += p.vx;
                    p.vy += p.gravity;
                    p.y += p.vy;
                    p.rotation += p.rotSpeed;
                    p.opacity -= p.decay;
                    p.vx *= 0.99;

                    cCtx.save();
                    cCtx.translate(p.x, p.y);
                    cCtx.rotate((p.rotation * Math.PI) / 180);
                    cCtx.globalAlpha = Math.max(0, p.opacity);
                    cCtx.fillStyle = p.color;
                    cCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                    cCtx.restore();
                });

                if (alive) {
                    requestAnimationFrame(animateConfetti);
                }
            }

            animateConfetti();
        }
    }

    // =========================================================================
    // Console Welcome Message
    // =========================================================================
    console.log('%c MetaAdsWala ', 'background: #0F4C81; color: white; font-size: 16px; font-weight: bold; padding: 8px 16px; border-radius: 4px;');
    console.log('%c🚀 Ready to Scale Your Brand!', 'color: #FF4757; font-size: 12px;');
});
