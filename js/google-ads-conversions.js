/**
 * =============================================================================
 * METAADSWALA - GOOGLE ADS CONVERSION TRACKING
 * =============================================================================
 * Version: 1.0.0
 * Google Ads ID: AW-18038332375
 * 
 * Features:
 * - Phone call conversion tracking
 * - WhatsApp click conversion tracking  
 * - Form submission conversion tracking
 * - Enhanced conversions ready
 * - Auto-detects all conversion points
 * =============================================================================
 */

(function () {
    'use strict';

    // ==========================================================================
    // CONFIGURATION
    // ==========================================================================
    const CONFIG = {
        CONVERSION_ID: 'AW-18038332375',
        PHONE_NUMBER: '+919797989421',
        WHATSAPP_NUMBER: '919797989421',
        CONVERSION_VALUES: {
            phone_call: 500,     // ₹500 per phone call
            whatsapp: 300,       // ₹300 per WhatsApp click
            form_submit: 1000    // ₹1000 per form submission
        },
        DEBUG: false
    };

    // ==========================================================================
    // UTILITY FUNCTIONS
    // ==========================================================================
    function log(message, data) {
        if (CONFIG.DEBUG) {
            console.log(`[Google Ads Conversion] ${message}`, data || '');
        }
    }

    function trackConversion(conversionType, value, details = {}) {
        try {
            if (typeof gtag !== 'function') {
                log('gtag not available');
                return;
            }

            const conversionValue = value || CONFIG.CONVERSION_VALUES[conversionType] || 500;

            // Track as Google Ads conversion
            gtag('event', 'conversion', {
                'send_to': `${CONFIG.CONVERSION_ID}/${conversionType}`,
                'value': conversionValue,
                'currency': 'INR',
                ...details
            });

            // Also track as GA4 event for dashboard integration
            gtag('event', `google_ads_${conversionType}`, {
                'event_category': 'google_ads_conversion',
                'event_label': conversionType,
                'value': conversionValue,
                'currency': 'INR',
                'page_path': window.location.pathname,
                'timestamp': new Date().toISOString(),
                ...details
            });

            log(`Conversion tracked: ${conversionType}`, {
                value: conversionValue,
                page: window.location.pathname
            });

        } catch (e) {
            log('Conversion tracking failed:', e);
        }
    }

    // ==========================================================================
    // PHONE CALL TRACKING
    // ==========================================================================
    function initPhoneTracking() {
        // Track all tel: links
        document.addEventListener('click', function (e) {
            const link = e.target.closest('a[href^="tel:"]');
            if (link) {
                const phoneNumber = link.href.replace('tel:', '');
                const linkText = link.textContent.trim().substring(0, 100);
                const section = getElementSection(link);

                trackConversion('phone_call', CONFIG.CONVERSION_VALUES.phone_call, {
                    'phone_number': phoneNumber,
                    'link_text': linkText,
                    'section': section,
                    'device_type': window.innerWidth < 768 ? 'mobile' : 'desktop'
                });

                log('Phone call tracked', { phoneNumber, section });
            }
        });

        // Track phone icon clicks (floating buttons, etc.)
        document.addEventListener('click', function (e) {
            const target = e.target.closest('[data-contact-type="phone"], .maw-call-btn, [data-lucide="phone"]');
            if (target) {
                const section = getElementSection(target);
                
                trackConversion('phone_call', CONFIG.CONVERSION_VALUES.phone_call, {
                    'phone_number': CONFIG.PHONE_NUMBER,
                    'section': section,
                    'device_type': window.innerWidth < 768 ? 'mobile' : 'desktop',
                    'click_source': 'icon_button'
                });

                log('Phone icon click tracked', { section });
            }
        });
    }

    // ==========================================================================
    // WHATSAPP TRACKING
    // ==========================================================================
    function initWhatsAppTracking() {
        // Track WhatsApp links
        document.addEventListener('click', function (e) {
            const link = e.target.closest('a[href*="wa.me"], a[href*="whatsapp.com"], a[href*="web.whatsapp.com"]');
            if (link) {
                const whatsappURL = link.href;
                const linkText = link.textContent.trim().substring(0, 100);
                const section = getElementSection(link);

                trackConversion('whatsapp', CONFIG.CONVERSION_VALUES.whatsapp, {
                    'whatsapp_url': whatsappURL,
                    'link_text': linkText,
                    'section': section,
                    'device_type': window.innerWidth < 768 ? 'mobile' : 'desktop'
                });

                log('WhatsApp click tracked', { whatsappURL, section });
            }
        });

        // Track WhatsApp icon clicks
        document.addEventListener('click', function (e) {
            const target = e.target.closest('[data-contact-type="whatsapp"], .maw-whatsapp-btn, [data-lucide="message-circle"]');
            if (target) {
                const section = getElementSection(target);
                
                trackConversion('whatsapp', CONFIG.CONVERSION_VALUES.whatsapp, {
                    'whatsapp_number': CONFIG.WHATSAPP_NUMBER,
                    'section': section,
                    'device_type': window.innerWidth < 768 ? 'mobile' : 'desktop',
                    'click_source': 'icon_button'
                });

                log('WhatsApp icon click tracked', { section });
            }
        });
    }

    // ==========================================================================
    // FORM SUBMISSION TRACKING
    // ==========================================================================
    function initFormTracking() {
        // Track form submissions (any form on page)
        document.addEventListener('submit', function (e) {
            const form = e.target;
            const formId = form.id || form.name || 'unnamed-form';
            const formAction = form.action || '';

            // Only track if it's a contact/lead form
            if (isLeadForm(form)) {
                trackConversion('form_submit', CONFIG.CONVERSION_VALUES.form_submit, {
                    'form_id': formId,
                    'form_action': formAction,
                    'form_fields': getFormFieldsCount(form),
                    'page_path': window.location.pathname
                });

                log('Form submission tracked', { formId, formAction });
            }
        });

        // Track thank-you page conversion (form already submitted)
        if (window.location.pathname.includes('thank-you') || 
            window.location.pathname.includes('thankyou') ||
            window.location.search.includes('success=true')) {
            
            setTimeout(function () {
                trackConversion('form_submit', CONFIG.CONVERSION_VALUES.form_submit, {
                    'page_path': window.location.pathname,
                    'conversion_source': 'thank_you_page',
                    'device_type': window.innerWidth < 768 ? 'mobile' : 'desktop'
                });

                log('Thank-you page conversion tracked');
            }, 1000);
        }
    }

    // ==========================================================================
    // UTILITY FUNCTIONS
    // ==========================================================================
    function getElementSection(element) {
        let el = element;
        while (el && el !== document.body) {
            if (el.tagName === 'SECTION' || el.hasAttribute('data-section') || el.id) {
                return el.id || el.dataset.section || el.className.split(' ')[0] || 'unknown-section';
            }
            el = el.parentElement;
        }
        return 'page-body';
    }

    function isLeadForm(form) {
        // Check if form contains typical lead generation fields
        const leadFields = ['email', 'phone', 'name', 'company', 'website'];
        const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="url"]');
        
        return inputs.length >= 2; // At least 2 fields = likely a lead form
    }

    function getFormFieldsCount(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        return inputs.length;
    }

    // ==========================================================================
    // INITIALIZE
    // ==========================================================================
    function init() {
        // Wait for gtag to be available
        if (typeof gtag !== 'function') {
            // Set up polyfill
            window.dataLayer = window.dataLayer || [];
            window.gtag = function () { dataLayer.push(arguments); };
        }

        // Initialize all trackers
        initPhoneTracking();
        initWhatsAppTracking();
        initFormTracking();

        log('Google Ads Conversion Tracking initialized');
        console.log('%c[Google Ads] Conversion tracking active - AW-18038332375', 
            'background: #0F4C81; color: white; padding: 4px 8px; border-radius: 4px;');
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for external use
    window.MetaAdsWalaConversions = {
        trackPhone: function (details) {
            trackConversion('phone_call', CONFIG.CONVERSION_VALUES.phone_call, details);
        },
        trackWhatsApp: function (details) {
            trackConversion('whatsapp', CONFIG.CONVERSION_VALUES.whatsapp, details);
        },
        trackForm: function (details) {
            trackConversion('form_submit', CONFIG.CONVERSION_VALUES.form_submit, details);
        },
        trackCustom: function (type, value, details) {
            trackConversion(type, value, details);
        }
    };

})();
