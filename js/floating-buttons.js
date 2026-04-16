/**
 * =============================================================================
 * METAADSWALA - FLOATING WHATSAPP & CALL BUTTONS
 * =============================================================================
 * Version: 1.0.0
 * Features:
 * - Floating WhatsApp button with tracking
 * - Floating Call button with tracking
 * - Mobile optimized
 * - All screen sizes supported
 * - Smooth animations
 * - Pulse effect for attention
 * - Smart positioning
 * - Accessibility compliant
 * =============================================================================
 */

(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        WHATSAPP_NUMBER: '919797989421',
        WHATSAPP_MESSAGE: 'Hi MetaAdsWala! I want to know more about your digital marketing services.',
        PHONE_NUMBER: '+919797989421',
        SHOW_DELAY: 2000, // Show buttons after 2 seconds
        HIDE_ON_SCROLL_UP: false,
        BUTTON_SIZE_DESKTOP: 60,
        BUTTON_SIZE_MOBILE: 52
    };

    // Track click events
    function trackClick(type, details) {
        if (typeof gtag === 'function') {
            // Track GA4 event
            gtag('event', `floating_${type}_click`, {
                'event_category': 'floating_buttons',
                'event_label': type,
                'button_type': type,
                'page_path': window.location.pathname,
                'timestamp': new Date().toISOString(),
                ...details
            });

            // Also track as specific event for easier filtering
            if (type === 'whatsapp') {
                gtag('event', 'whatsapp_click', {
                    'event_category': 'contact',
                    'contact_method': 'whatsapp',
                    'whatsapp_number': CONFIG.WHATSAPP_NUMBER,
                    'source': 'floating_button'
                });

                // Google Ads Conversion - WhatsApp Click (₹300)
                gtag('event', 'conversion', {
                    'send_to': 'AW-18038332375/whatsapp',
                    'value': 300,
                    'currency': 'INR'
                });

            } else if (type === 'call') {
                gtag('event', 'phone_click', {
                    'event_category': 'contact',
                    'contact_method': 'phone',
                    'phone_number': CONFIG.PHONE_NUMBER,
                    'source': 'floating_button'
                });

                // Google Ads Conversion - Phone Call (₹500)
                gtag('event', 'conversion', {
                    'send_to': 'AW-18038332375/phone_call',
                    'value': 500,
                    'currency': 'INR'
                });
            }

            // Track as conversion
            gtag('event', 'contact_initiated', {
                'contact_type': type,
                'value': type === 'whatsapp' ? 300 : 500,
                'currency': 'INR'
            });
        }

        console.log(`[Floating Buttons] ${type} clicked - Google Ads conversion tracked`);
    }

    // Create and inject styles
    function injectStyles() {
        const styles = `
            /* Floating Buttons Container */
            .maw-floating-buttons {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 12px;
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.4s ease, transform 0.4s ease;
            }

            .maw-floating-buttons.visible {
                opacity: 1;
                transform: translateY(0);
            }

            /* Individual Button Styles */
            .maw-floating-btn {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                text-decoration: none;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: visible;
            }

            .maw-floating-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 30px rgba(0, 0, 0, 0.35);
            }

            .maw-floating-btn:active {
                transform: scale(0.95);
            }

            /* WhatsApp Button */
            .maw-whatsapp-btn {
                background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
            }

            .maw-whatsapp-btn:hover {
                background: linear-gradient(135deg, #2EE370 0%, #159B8C 100%);
            }

            /* Call Button */
            .maw-call-btn {
                background: linear-gradient(135deg, #0F4C81 0%, #1E6BB8 100%);
            }

            .maw-call-btn:hover {
                background: linear-gradient(135deg, #1565A8 0%, #2B8CE0 100%);
            }

            /* Icons */
            .maw-floating-btn svg {
                width: 28px;
                height: 28px;
                fill: white;
                transition: transform 0.3s ease;
            }

            .maw-floating-btn:hover svg {
                transform: scale(1.1);
            }

            /* Pulse Animation */
            .maw-floating-btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border-radius: 50%;
                animation: maw-pulse 2s infinite;
            }

            .maw-whatsapp-btn::before {
                background: rgba(37, 211, 102, 0.4);
            }

            .maw-call-btn::before {
                background: rgba(15, 76, 129, 0.4);
            }

            @keyframes maw-pulse {
                0% {
                    transform: scale(1);
                    opacity: 0.7;
                }
                50% {
                    transform: scale(1.3);
                    opacity: 0;
                }
                100% {
                    transform: scale(1);
                    opacity: 0;
                }
            }

            /* Tooltip */
            .maw-tooltip {
                position: absolute;
                right: 70px;
                background: rgba(0, 0, 0, 0.85);
                color: white;
                padding: 8px 14px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 500;
                white-space: nowrap;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                pointer-events: none;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            }

            .maw-tooltip::after {
                content: '';
                position: absolute;
                right: -6px;
                top: 50%;
                transform: translateY(-50%);
                border: 6px solid transparent;
                border-left-color: rgba(0, 0, 0, 0.85);
            }

            .maw-floating-btn:hover .maw-tooltip {
                opacity: 1;
                visibility: visible;
                right: 75px;
            }

            /* Notification Badge */
            .maw-badge {
                position: absolute;
                top: -4px;
                right: -4px;
                width: 20px;
                height: 20px;
                background: #FF4757;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: 700;
                color: white;
                border: 2px solid white;
                animation: maw-bounce 1s infinite;
            }

            @keyframes maw-bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-3px); }
            }

            /* Mobile Optimization */
            @media (max-width: 768px) {
                .maw-floating-buttons {
                    bottom: 16px;
                    right: 16px;
                    gap: 10px;
                }

                .maw-floating-btn {
                    width: 52px;
                    height: 52px;
                }

                .maw-floating-btn svg {
                    width: 24px;
                    height: 24px;
                }

                .maw-tooltip {
                    display: none !important;
                }

                .maw-badge {
                    width: 18px;
                    height: 18px;
                    font-size: 10px;
                    top: -3px;
                    right: -3px;
                }
            }

            /* Small Mobile */
            @media (max-width: 375px) {
                .maw-floating-buttons {
                    bottom: 12px;
                    right: 12px;
                    gap: 8px;
                }

                .maw-floating-btn {
                    width: 48px;
                    height: 48px;
                }

                .maw-floating-btn svg {
                    width: 22px;
                    height: 22px;
                }
            }

            /* Landscape Mobile */
            @media (max-height: 500px) and (orientation: landscape) {
                .maw-floating-buttons {
                    flex-direction: row;
                    bottom: 10px;
                    right: 10px;
                }

                .maw-floating-btn {
                    width: 44px;
                    height: 44px;
                }

                .maw-floating-btn svg {
                    width: 20px;
                    height: 20px;
                }
            }

            /* Hide during printing */
            @media print {
                .maw-floating-buttons {
                    display: none !important;
                }
            }

            /* Reduced Motion */
            @media (prefers-reduced-motion: reduce) {
                .maw-floating-btn::before {
                    animation: none;
                }
                .maw-badge {
                    animation: none;
                }
                .maw-floating-buttons,
                .maw-floating-btn,
                .maw-tooltip {
                    transition: none;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'maw-floating-buttons-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    // Create and inject HTML
    function injectHTML() {
        const whatsappURL = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(CONFIG.WHATSAPP_MESSAGE)}`;

        const html = `
            <div class="maw-floating-buttons" id="mawFloatingButtons" role="complementary" aria-label="Contact buttons">
                <!-- Call Button -->
                <a href="tel:${CONFIG.PHONE_NUMBER}" 
                   class="maw-floating-btn maw-call-btn" 
                   id="mawCallBtn"
                   title="Call us now"
                   aria-label="Call MetaAdsWala"
                   data-analytics="floating-call-button">
                    <span class="maw-tooltip">Call Now</span>
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                    </svg>
                </a>

                <!-- WhatsApp Button -->
                <a href="${whatsappURL}" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   class="maw-floating-btn maw-whatsapp-btn" 
                   id="mawWhatsAppBtn"
                   title="Chat on WhatsApp"
                   aria-label="Chat with MetaAdsWala on WhatsApp"
                   data-analytics="floating-whatsapp-button">
                    <span class="maw-tooltip">WhatsApp Us</span>
                    <span class="maw-badge">1</span>
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                    </svg>
                </a>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }

    // Initialize event listeners
    function initEventListeners() {
        const whatsappBtn = document.getElementById('mawWhatsAppBtn');
        const callBtn = document.getElementById('mawCallBtn');

        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', function (e) {
                trackClick('whatsapp', {
                    'click_time': new Date().toISOString(),
                    'device_type': window.innerWidth < 768 ? 'mobile' : 'desktop',
                    'referrer': document.referrer
                });

                // Hide badge after click
                const badge = this.querySelector('.maw-badge');
                if (badge) {
                    badge.style.display = 'none';
                }
            });
        }

        if (callBtn) {
            callBtn.addEventListener('click', function (e) {
                trackClick('call', {
                    'click_time': new Date().toISOString(),
                    'device_type': window.innerWidth < 768 ? 'mobile' : 'desktop',
                    'referrer': document.referrer
                });
            });
        }

        // Track hover events for engagement analysis
        [whatsappBtn, callBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('mouseenter', function () {
                    const type = this.id === 'mawWhatsAppBtn' ? 'whatsapp' : 'call';
                    if (typeof gtag === 'function') {
                        gtag('event', `floating_${type}_hover`, {
                            'event_category': 'floating_buttons',
                            'event_label': `${type}_hover`
                        });
                    }
                });
            }
        });
    }

    // Show buttons with delay
    function showButtons() {
        const buttons = document.getElementById('mawFloatingButtons');
        if (buttons) {
            buttons.classList.add('visible');
        }
    }

    // Hide badge after certain time if not clicked
    function autoHideBadge() {
        setTimeout(function () {
            const badge = document.querySelector('.maw-whatsapp-btn .maw-badge');
            if (badge && badge.style.display !== 'none') {
                badge.style.opacity = '0';
                setTimeout(() => badge.style.display = 'none', 300);
            }
        }, 30000); // Hide after 30 seconds
    }

    // Track visibility on scroll
    function trackScrollVisibility() {
        let hasTrackedVisibility = false;

        window.addEventListener('scroll', function () {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);

            if (scrollPercent > 25 && !hasTrackedVisibility) {
                hasTrackedVisibility = true;
                if (typeof gtag === 'function') {
                    gtag('event', 'floating_buttons_visible_on_scroll', {
                        'scroll_percent': scrollPercent
                    });
                }
            }
        }, { passive: true });
    }

    // Initialize
    function init() {
        // Don't initialize if already done
        if (document.getElementById('mawFloatingButtons')) {
            return;
        }

        injectStyles();
        injectHTML();
        initEventListeners();
        trackScrollVisibility();

        // Show with delay for better UX
        setTimeout(showButtons, CONFIG.SHOW_DELAY);

        // Auto-hide notification badge
        autoHideBadge();

        console.log('[Floating Buttons] Initialized successfully');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for external control
    window.MAWFloatingButtons = {
        show: showButtons,
        hide: function () {
            const buttons = document.getElementById('mawFloatingButtons');
            if (buttons) buttons.classList.remove('visible');
        },
        trackClick: trackClick
    };

})();
