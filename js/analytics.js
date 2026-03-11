/**
 * =============================================================================
 * METAADSWALA - ENTERPRISE-GRADE GOOGLE ANALYTICS 4 IMPLEMENTATION
 * =============================================================================
 * Version: 2.0.0
 * Last Updated: February 2026
 * 
 * This is a comprehensive analytics implementation covering:
 * - Page Views & Virtual Page Views
 * - Scroll Depth Tracking (10%, 25%, 50%, 75%, 90%, 100%)
 * - Click Tracking (All Elements)
 * - CTA & Button Tracking
 * - Form Tracking (Focus, Change, Submit, Validation)
 * - Link Click Tracking (Internal, External, Download, Tel, Email)
 * - Video Engagement (YouTube, HTML5)
 * - Element Visibility / Viewport Tracking
 * - User Engagement & Time on Page
 * - Error Tracking (JS Errors, Console Errors)
 * - Performance Metrics (Core Web Vitals)
 * - User Journey & Session Tracking
 * - Custom Dimensions & User Properties
 * - E-commerce Ready (Add to Cart, Purchase Events)
 * - Heat Map Ready Data Collection
 * =============================================================================
 */

(function () {
    'use strict';

    // ==========================================================================
    // AD BLOCKER DETECTION & GRACEFUL DEGRADATION
    // ==========================================================================
    let isBlocked = false;
    let blockCheckComplete = false;

    // Silent no-op function for when tracking is blocked
    const noop = function () { };
    const noopWithReturn = function () { return Promise.resolve(); };

    // Create safe gtag function that won't throw errors
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
        if (!isBlocked) {
            window.dataLayer.push(arguments);
        }
    };

    // ==========================================================================
    // CONFIGURATION
    // ==========================================================================
    const CONFIG = {
        GA_MEASUREMENT_ID: 'G-HHEH3F5RSD',
        CLARITY_PROJECT_ID: 'vbzhsq04yk', // Microsoft Clarity - Heatmaps & Session Recording
        DEBUG_MODE: false, // Set to true for console logging
        SCROLL_THRESHOLDS: [10, 25, 50, 75, 90, 100],
        ENGAGEMENT_TIME_INTERVALS: [15, 30, 60, 120, 300], // seconds
        IDLE_TIMEOUT: 90000, // 30 seconds
        SITE_NAME: 'MetaAdsWala',
        SITE_VERSION: '2.0.0',
        GRACEFUL_DEGRADATION: true // Enable silent failures when blocked
    };

    // ==========================================================================
    // UTILITY FUNCTIONS
    // ==========================================================================
    const Utils = {
        // Debug logger
        log: function (message, data) {
            if (CONFIG.DEBUG_MODE) {
                console.log(`[Analytics] ${message}`, data || '');
            }
        },

        // Get page path
        getPagePath: function () {
            return window.location.pathname + window.location.search;
        },

        // Get page title
        getPageTitle: function () {
            return document.title;
        },

        // Get element identifier
        getElementIdentifier: function (element) {
            if (!element) return 'unknown';

            // Priority: id > data-analytics > name > class > tag
            if (element.id) return `#${element.id}`;
            if (element.dataset && element.dataset.analytics) return element.dataset.analytics;
            if (element.name) return element.name;
            if (element.className && typeof element.className === 'string') {
                const classes = element.className.split(' ').filter(c => c).slice(0, 2).join('.');
                if (classes) return `.${classes}`;
            }
            return element.tagName ? element.tagName.toLowerCase() : 'unknown';
        },

        // Get element text (truncated)
        getElementText: function (element, maxLength = 100) {
            if (!element) return '';
            const text = (element.innerText || element.textContent || element.value || '').trim();
            return text.substring(0, maxLength);
        },

        // Get element href
        getElementHref: function (element) {
            if (!element) return '';
            // Check parent elements for links
            let el = element;
            while (el && el.tagName !== 'A') {
                el = el.parentElement;
            }
            return el ? el.href : '';
        },

        // Check if element is in viewport
        isInViewport: function (element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },

        // Throttle function
        throttle: function (func, limit) {
            let inThrottle;
            return function (...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // Debounce function
        debounce: function (func, wait) {
            let timeout;
            return function (...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        },

        // Get referrer domain
        getReferrerDomain: function () {
            if (!document.referrer) return 'direct';
            try {
                return new URL(document.referrer).hostname;
            } catch (e) {
                return 'unknown';
            }
        },

        // Get device type
        getDeviceType: function () {
            const width = window.innerWidth;
            if (width < 768) return 'mobile';
            if (width < 1024) return 'tablet';
            return 'desktop';
        },

        // Get UTM parameters
        getUTMParams: function () {
            const params = new URLSearchParams(window.location.search);
            return {
                utm_source: params.get('utm_source') || '',
                utm_medium: params.get('utm_medium') || '',
                utm_campaign: params.get('utm_campaign') || '',
                utm_term: params.get('utm_term') || '',
                utm_content: params.get('utm_content') || ''
            };
        },

        // Get first touch attribution (stored on first visit)
        getFirstTouchAttribution: function () {
            let firstTouch = localStorage.getItem('maw_first_touch');
            if (firstTouch) {
                try {
                    return JSON.parse(firstTouch);
                } catch (e) {
                    return null;
                }
            }
            return null;
        },

        // Store first touch attribution on first visit
        storeFirstTouchAttribution: function () {
            if (!localStorage.getItem('maw_first_touch')) {
                const utmParams = this.getUTMParams();
                const referrer = document.referrer;
                let source = 'direct';
                let medium = 'none';
                let campaign = '';

                if (utmParams.utm_source) {
                    source = utmParams.utm_source;
                    medium = utmParams.utm_medium || 'organic';
                    campaign = utmParams.utm_campaign || '';
                } else if (referrer) {
                    try {
                        const referrerHost = new URL(referrer).hostname;
                        if (referrerHost.includes('google.')) {
                            source = 'google';
                            medium = 'organic';
                        } else if (referrerHost.includes('facebook.') || referrerHost.includes('fb.') || referrerHost.includes('instagram.') || referrerHost.includes('ig.')) {
                            source = 'facebook';
                            medium = 'social';
                        } else if (referrerHost.includes('linkedin.')) {
                            source = 'linkedin';
                            medium = 'social';
                        } else if (referrerHost.includes('twitter.') || referrerHost.includes('x.')) {
                            source = 'twitter';
                            medium = 'social';
                        } else if (referrerHost.includes('youtube.')) {
                            source = 'youtube';
                            medium = 'social';
                        } else {
                            source = referrerHost;
                            medium = 'referral';
                        }
                    } catch (e) {
                        source = 'referral';
                        medium = 'referral';
                    }
                }

                const firstTouchData = {
                    source: source,
                    medium: medium,
                    campaign: campaign,
                    referrer: referrer,
                    landing_page: window.location.href,
                    timestamp: new Date().toISOString(),
                    utm_source: utmParams.utm_source,
                    utm_medium: utmParams.utm_medium,
                    utm_campaign: utmParams.utm_campaign,
                    utm_term: utmParams.utm_term,
                    utm_content: utmParams.utm_content
                };

                localStorage.setItem('maw_first_touch', JSON.stringify(firstTouchData));
                return firstTouchData;
            }
            return this.getFirstTouchAttribution();
        },

        // Generate session ID
        generateSessionId: function () {
            return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },

        // Get or create session ID
        getSessionId: function () {
            let sessionId = sessionStorage.getItem('maw_session_id');
            if (!sessionId) {
                sessionId = this.generateSessionId();
                sessionStorage.setItem('maw_session_id', sessionId);
            }
            return sessionId;
        },

        // Get user ID (anonymous)
        getUserId: function () {
            let userId = localStorage.getItem('maw_user_id');
            if (!userId) {
                userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('maw_user_id', userId);
            }
            return userId;
        }
    };

    // ==========================================================================
    // ANALYTICS CORE
    // ==========================================================================
    const Analytics = {
        initialized: false,
        sessionStart: Date.now(),
        maxScrollDepth: 0,
        scrollMilestones: {},
        engagementMilestones: {},
        activeTime: 0,
        lastActiveTime: Date.now(),
        isActive: true,
        clickCount: 0,
        formInteractions: {},
        viewedSections: new Set(),

        // Initialize GA4
        init: function () {
            if (this.initialized) return;

            // Initialize dataLayer
            window.dataLayer = window.dataLayer || [];
            window.gtag = function () { dataLayer.push(arguments); };
            gtag('js', new Date());

            // Configure GA4 with enhanced settings for proper attribution
            gtag('config', CONFIG.GA_MEASUREMENT_ID, {
                'send_page_view': true,
                'cookie_domain': 'auto',
                'cookie_flags': 'SameSite=Lax;Secure',
                'allow_google_signals': true,
                'allow_ad_personalization_signals': true,
                'link_attribution': true,
                'anonymize_ip': false,
                'transport_type': 'beacon',
                'page_referrer': document.referrer || undefined,
                'custom_map': {
                    'dimension1': 'user_type',
                    'dimension2': 'device_type',
                    'dimension3': 'session_id',
                    'dimension4': 'page_section',
                    'dimension5': 'scroll_depth'
                }
            });

            // Set user properties
            this.setUserProperties();

            // Initialize all trackers
            this.initScrollTracking();
            this.initClickTracking();
            this.initFormTracking();
            this.initLinkTracking();
            this.initEngagementTracking();
            this.initVisibilityTracking();
            this.initErrorTracking();
            this.initPerformanceTracking();
            this.initVideoTracking();
            this.initExitIntentTracking();

            // Track initial page view with enhanced data
            this.trackEnhancedPageView();

            this.initialized = true;
            Utils.log('Analytics initialized successfully');
        },

        // Set user properties
        setUserProperties: function () {
            const utmParams = Utils.getUTMParams();
            const firstTouch = Utils.storeFirstTouchAttribution();

            gtag('set', 'user_properties', {
                'user_id': Utils.getUserId(),
                'session_id': Utils.getSessionId(),
                'device_type': Utils.getDeviceType(),
                'referrer_domain': Utils.getReferrerDomain(),
                'site_version': CONFIG.SITE_VERSION,
                'first_visit_date': localStorage.getItem('maw_first_visit') || new Date().toISOString().split('T')[0],
                'visit_count': parseInt(localStorage.getItem('maw_visit_count') || '0') + 1,
                'first_traffic_source': firstTouch ? firstTouch.source : 'direct',
                'first_traffic_medium': firstTouch ? firstTouch.medium : 'none',
                'first_traffic_campaign': firstTouch ? firstTouch.campaign : ''
            });

            // Store first visit date
            if (!localStorage.getItem('maw_first_visit')) {
                localStorage.setItem('maw_first_visit', new Date().toISOString().split('T')[0]);
            }

            // Increment visit count
            localStorage.setItem('maw_visit_count', (parseInt(localStorage.getItem('maw_visit_count') || '0') + 1).toString());
        },

        // Track enhanced page view
        trackEnhancedPageView: function () {
            const utmParams = Utils.getUTMParams();
            const firstTouch = Utils.getFirstTouchAttribution();

            gtag('event', 'page_view_enhanced', {
                'page_path': Utils.getPagePath(),
                'page_title': Utils.getPageTitle(),
                'page_location': window.location.href,
                'page_referrer': document.referrer || undefined,
                'device_type': Utils.getDeviceType(),
                'screen_resolution': `${screen.width}x${screen.height}`,
                'viewport_size': `${window.innerWidth}x${window.innerHeight}`,
                'referrer': document.referrer,
                'referrer_domain': Utils.getReferrerDomain(),
                'session_id': Utils.getSessionId(),
                'user_id': Utils.getUserId(),
                'timestamp': new Date().toISOString(),
                'first_touch_source': firstTouch ? firstTouch.source : 'direct',
                'first_touch_medium': firstTouch ? firstTouch.medium : 'none',
                'first_touch_campaign': firstTouch ? firstTouch.campaign : '',
                ...utmParams
            });

            // Also send session_start event with attribution data for better GA4 tracking
            if (!sessionStorage.getItem('maw_session_tracked')) {
                sessionStorage.setItem('maw_session_tracked', 'true');
                gtag('event', 'session_start', {
                    'session_id': Utils.getSessionId(),
                    'first_touch_source': firstTouch ? firstTouch.source : 'direct',
                    'first_touch_medium': firstTouch ? firstTouch.medium : 'none',
                    'first_touch_campaign': firstTouch ? firstTouch.campaign : '',
                    'landing_page': window.location.href,
                    'referrer': document.referrer || undefined,
                    ...utmParams
                });
            }

            Utils.log('Enhanced page view tracked');
        },

        // =======================================================================
        // SCROLL TRACKING
        // =======================================================================
        initScrollTracking: function () {
            const self = this;

            // Initialize scroll milestones
            CONFIG.SCROLL_THRESHOLDS.forEach(threshold => {
                self.scrollMilestones[threshold] = false;
            });

            const trackScroll = Utils.throttle(function () {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercent = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;

                // Update max scroll depth
                if (scrollPercent > self.maxScrollDepth) {
                    self.maxScrollDepth = scrollPercent;
                }

                // Check milestones
                CONFIG.SCROLL_THRESHOLDS.forEach(threshold => {
                    if (scrollPercent >= threshold && !self.scrollMilestones[threshold]) {
                        self.scrollMilestones[threshold] = true;
                        self.trackEvent('scroll_depth', {
                            'scroll_depth': threshold,
                            'scroll_direction': 'down',
                            'page_path': Utils.getPagePath()
                        });
                        Utils.log(`Scroll milestone reached: ${threshold}%`);
                    }
                });
            }, 100);

            window.addEventListener('scroll', trackScroll, { passive: true });

            // Track max scroll on page unload
            window.addEventListener('beforeunload', function () {
                self.trackEvent('max_scroll_reached', {
                    'max_scroll_depth': self.maxScrollDepth,
                    'page_path': Utils.getPagePath()
                });
            });
        },

        // =======================================================================
        // CLICK TRACKING
        // =======================================================================
        initClickTracking: function () {
            const self = this;

            document.addEventListener('click', function (e) {
                const target = e.target;
                self.clickCount++;

                // Get click coordinates
                const clickX = e.clientX;
                const clickY = e.clientY;
                const pageX = e.pageX;
                const pageY = e.pageY;

                // Determine click type
                let clickType = 'general';
                let clickValue = '';

                // Button clicks
                if (target.matches('button, .btn, [role="button"], input[type="submit"], input[type="button"]') ||
                    target.closest('button, .btn, [role="button"]')) {
                    clickType = 'button';
                    clickValue = Utils.getElementText(target.closest('button') || target);
                }

                // CTA clicks
                if (target.matches('[class*="cta"], [data-cta], .get-audit, .contact-btn') ||
                    target.closest('[class*="cta"], [data-cta], .get-audit, .contact-btn')) {
                    clickType = 'cta';
                    clickValue = Utils.getElementText(target.closest('[class*="cta"]') || target);
                }

                // Navigation clicks
                if (target.matches('nav a, .nav-link, header a') || target.closest('nav a, .nav-link, header a')) {
                    clickType = 'navigation';
                    clickValue = Utils.getElementText(target);
                }

                // Menu clicks
                if (target.matches('[id*="menu"], [class*="menu"]') || target.closest('[id*="menu"], [class*="menu"]')) {
                    clickType = 'menu';
                    clickValue = Utils.getElementText(target);
                }

                // Social clicks
                if (target.matches('[class*="social"], [href*="facebook"], [href*="instagram"], [href*="linkedin"], [href*="twitter"], [href*="whatsapp"]') ||
                    target.closest('[class*="social"], [href*="facebook"], [href*="instagram"], [href*="linkedin"], [href*="twitter"], [href*="whatsapp"]')) {
                    clickType = 'social';
                    clickValue = Utils.getElementHref(target);
                }

                // Image clicks
                if (target.matches('img, picture, [class*="image"], [class*="gallery"]')) {
                    clickType = 'image';
                    clickValue = target.alt || target.src || 'image';
                }

                // Track click event
                self.trackEvent('element_click', {
                    'click_type': clickType,
                    'click_value': clickValue,
                    'element_id': Utils.getElementIdentifier(target),
                    'element_tag': target.tagName?.toLowerCase(),
                    'element_classes': target.className?.toString().substring(0, 100),
                    'click_x': clickX,
                    'click_y': clickY,
                    'page_x': pageX,
                    'page_y': pageY,
                    'viewport_width': window.innerWidth,
                    'viewport_height': window.innerHeight,
                    'click_count_session': self.clickCount,
                    'page_path': Utils.getPagePath()
                });

                // Track specific CTA clicks separately for conversion tracking
                if (clickType === 'cta' || clickType === 'button') {
                    self.trackEvent('cta_click', {
                        'cta_text': clickValue,
                        'cta_location': self.getElementSection(target),
                        'page_path': Utils.getPagePath()
                    });
                }
            });
        },

        // Get section of element
        getElementSection: function (element) {
            let el = element;
            while (el && el !== document.body) {
                if (el.tagName === 'SECTION' || el.hasAttribute('data-section')) {
                    return el.id || el.dataset.section || el.className.split(' ')[0] || 'unknown-section';
                }
                el = el.parentElement;
            }
            return 'page-body';
        },

        // =======================================================================
        // FORM TRACKING
        // =======================================================================
        initFormTracking: function () {
            const self = this;

            // Track form field focus
            document.addEventListener('focusin', function (e) {
                const target = e.target;
                if (target.matches('input, textarea, select')) {
                    const form = target.closest('form');
                    const formId = form ? (form.id || form.name || 'unnamed-form') : 'no-form';

                    if (!self.formInteractions[formId]) {
                        self.formInteractions[formId] = {
                            started: Date.now(),
                            fields: new Set(),
                            changes: 0
                        };

                        // Track form start
                        self.trackEvent('form_start', {
                            'form_id': formId,
                            'form_name': form?.name || '',
                            'page_path': Utils.getPagePath()
                        });
                    }

                    self.formInteractions[formId].fields.add(target.name || target.id || 'unnamed-field');

                    self.trackEvent('form_field_focus', {
                        'form_id': formId,
                        'field_name': target.name || target.id || 'unnamed',
                        'field_type': target.type || target.tagName.toLowerCase(),
                        'page_path': Utils.getPagePath()
                    });
                }
            });

            // Track form field changes
            document.addEventListener('change', function (e) {
                const target = e.target;
                if (target.matches('input, textarea, select')) {
                    const form = target.closest('form');
                    const formId = form ? (form.id || form.name || 'unnamed-form') : 'no-form';

                    if (self.formInteractions[formId]) {
                        self.formInteractions[formId].changes++;
                    }

                    self.trackEvent('form_field_change', {
                        'form_id': formId,
                        'field_name': target.name || target.id || 'unnamed',
                        'field_type': target.type || target.tagName.toLowerCase(),
                        'has_value': target.value.length > 0,
                        'page_path': Utils.getPagePath()
                    });
                }
            });

            // Track form submissions
            document.addEventListener('submit', function (e) {
                const form = e.target;
                const formId = form.id || form.name || 'unnamed-form';
                const interaction = self.formInteractions[formId];

                self.trackEvent('form_submit', {
                    'form_id': formId,
                    'form_name': form.name || '',
                    'form_action': form.action || '',
                    'form_method': form.method || 'GET',
                    'fields_filled': interaction ? interaction.fields.size : 0,
                    'total_changes': interaction ? interaction.changes : 0,
                    'time_to_submit': interaction ? Math.round((Date.now() - interaction.started) / 1000) : 0,
                    'page_path': Utils.getPagePath()
                });

                // Track as conversion
                self.trackEvent('generate_lead', {
                    'lead_source': formId,
                    'page_path': Utils.getPagePath()
                });

                Utils.log('Form submitted', formId);
            });

            // Track form validation errors
            document.addEventListener('invalid', function (e) {
                const target = e.target;
                const form = target.closest('form');

                self.trackEvent('form_validation_error', {
                    'form_id': form ? (form.id || form.name || 'unnamed-form') : 'no-form',
                    'field_name': target.name || target.id || 'unnamed',
                    'validation_message': target.validationMessage || 'invalid',
                    'page_path': Utils.getPagePath()
                });
            }, true);
        },

        // =======================================================================
        // LINK TRACKING
        // =======================================================================
        initLinkTracking: function () {
            const self = this;
            const currentDomain = window.location.hostname;

            document.addEventListener('click', function (e) {
                const link = e.target.closest('a');
                if (!link || !link.href) return;

                const href = link.href;
                let linkType = 'internal';
                let linkDomain = '';

                try {
                    const url = new URL(href);
                    linkDomain = url.hostname;

                    // Determine link type
                    if (url.protocol === 'tel:') {
                        linkType = 'phone';
                    } else if (url.protocol === 'mailto:') {
                        linkType = 'email';
                    } else if (url.protocol === 'whatsapp:' || href.includes('wa.me') || href.includes('whatsapp.com')) {
                        linkType = 'whatsapp';
                    } else if (linkDomain !== currentDomain) {
                        linkType = 'external';
                    }

                    // Check for file downloads
                    const downloadExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', 'csv'];
                    const extension = url.pathname.split('.').pop().toLowerCase();
                    if (downloadExtensions.includes(extension)) {
                        linkType = 'download';
                    }
                } catch (e) {
                    // Invalid URL
                }

                // Track link click
                self.trackEvent('link_click', {
                    'link_type': linkType,
                    'link_url': href.substring(0, 500),
                    'link_text': Utils.getElementText(link, 100),
                    'link_domain': linkDomain,
                    'link_id': link.id || '',
                    'link_classes': link.className?.toString().substring(0, 100),
                    'is_new_tab': link.target === '_blank',
                    'page_path': Utils.getPagePath()
                });

                // Track specific link types as separate events
                if (linkType === 'phone') {
                    self.trackEvent('phone_click', {
                        'phone_number': href.replace('tel:', ''),
                        'click_location': self.getElementSection(link)
                    });
                }

                if (linkType === 'email') {
                    self.trackEvent('email_click', {
                        'email_address': href.replace('mailto:', '').split('?')[0],
                        'click_location': self.getElementSection(link)
                    });
                }

                if (linkType === 'whatsapp') {
                    self.trackEvent('whatsapp_click', {
                        'whatsapp_url': href,
                        'click_location': self.getElementSection(link)
                    });
                }

                if (linkType === 'external') {
                    self.trackEvent('outbound_click', {
                        'outbound_url': href,
                        'outbound_domain': linkDomain
                    });
                }

                if (linkType === 'download') {
                    self.trackEvent('file_download', {
                        'file_url': href,
                        'file_name': href.split('/').pop(),
                        'file_extension': href.split('.').pop()
                    });
                }
            });
        },

        // =======================================================================
        // ENGAGEMENT TRACKING
        // =======================================================================
        initEngagementTracking: function () {
            const self = this;

            // Track active time on page
            setInterval(function () {
                if (self.isActive) {
                    self.activeTime++;

                    // Check engagement milestones
                    CONFIG.ENGAGEMENT_TIME_INTERVALS.forEach(seconds => {
                        if (self.activeTime === seconds && !self.engagementMilestones[seconds]) {
                            self.engagementMilestones[seconds] = true;
                            self.trackEvent('engagement_time', {
                                'engagement_seconds': seconds,
                                'engagement_label': self.getEngagementLabel(seconds),
                                'page_path': Utils.getPagePath()
                            });
                            Utils.log(`Engagement milestone: ${seconds} seconds`);
                        }
                    });
                }
            }, 1000);

            // Detect user activity
            const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
            const markActive = Utils.throttle(function () {
                self.isActive = true;
                self.lastActiveTime = Date.now();
            }, 1000);

            activityEvents.forEach(event => {
                document.addEventListener(event, markActive, { passive: true });
            });

            // Check for idle
            setInterval(function () {
                if (Date.now() - self.lastActiveTime > CONFIG.IDLE_TIMEOUT) {
                    if (self.isActive) {
                        self.isActive = false;
                        self.trackEvent('user_idle', {
                            'idle_after_seconds': Math.round((Date.now() - self.lastActiveTime) / 1000),
                            'total_active_time': self.activeTime
                        });
                    }
                }
            }, 5000);

            // Track total engagement on page unload
            window.addEventListener('beforeunload', function () {
                self.trackEvent('page_engagement_summary', {
                    'total_active_time': self.activeTime,
                    'total_time_on_page': Math.round((Date.now() - self.sessionStart) / 1000),
                    'max_scroll_depth': self.maxScrollDepth,
                    'total_clicks': self.clickCount,
                    'sections_viewed': Array.from(self.viewedSections).join(','),
                    'page_path': Utils.getPagePath()
                });
            });
        },

        getEngagementLabel: function (seconds) {
            if (seconds <= 15) return 'brief';
            if (seconds <= 30) return 'interested';
            if (seconds <= 60) return 'engaged';
            if (seconds <= 120) return 'highly_engaged';
            return 'very_highly_engaged';
        },

        // =======================================================================
        // VISIBILITY TRACKING (Section Views)
        // =======================================================================
        initVisibilityTracking: function () {
            const self = this;

            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function () {
                    self.setupVisibilityObserver();
                });
            } else {
                self.setupVisibilityObserver();
            }
        },

        setupVisibilityObserver: function () {
            const self = this;

            if (!('IntersectionObserver' in window)) {
                Utils.log('IntersectionObserver not supported');
                return;
            }

            const observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                        const section = entry.target;
                        const sectionId = section.id || section.dataset.section || section.className.split(' ')[0];

                        if (!self.viewedSections.has(sectionId)) {
                            self.viewedSections.add(sectionId);

                            self.trackEvent('section_view', {
                                'section_id': sectionId,
                                'section_index': Array.from(document.querySelectorAll('section, [data-section]')).indexOf(section),
                                'page_path': Utils.getPagePath()
                            });

                            Utils.log('Section viewed:', sectionId);
                        }
                    }
                });
            }, {
                threshold: 0.5,
                rootMargin: '0px'
            });

            // Observe all sections
            document.querySelectorAll('section, [data-section], .perf-section').forEach(function (section) {
                observer.observe(section);
            });
        },

        // =======================================================================
        // ERROR TRACKING
        // =======================================================================
        initErrorTracking: function () {
            const self = this;

            // Track JavaScript errors
            window.addEventListener('error', function (e) {
                self.trackEvent('js_error', {
                    'error_message': e.message || 'Unknown error',
                    'error_source': e.filename || 'unknown',
                    'error_line': e.lineno || 0,
                    'error_column': e.colno || 0,
                    'page_path': Utils.getPagePath()
                });
            });

            // Track unhandled promise rejections
            window.addEventListener('unhandledrejection', function (e) {
                self.trackEvent('promise_rejection', {
                    'error_reason': e.reason ? e.reason.toString() : 'Unknown',
                    'page_path': Utils.getPagePath()
                });
            });

            // Track console errors (if supported)
            const originalError = console.error;
            console.error = function (...args) {
                self.trackEvent('console_error', {
                    'error_message': args.map(a => String(a)).join(' ').substring(0, 500),
                    'page_path': Utils.getPagePath()
                });
                originalError.apply(console, args);
            };
        },

        // =======================================================================
        // PERFORMANCE TRACKING (Core Web Vitals)
        // =======================================================================
        initPerformanceTracking: function () {
            const self = this;

            // Track page load performance
            window.addEventListener('load', function () {
                setTimeout(function () {
                    if (window.performance && window.performance.timing) {
                        const timing = window.performance.timing;
                        const loadTime = timing.loadEventEnd - timing.navigationStart;
                        const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
                        const firstByte = timing.responseStart - timing.navigationStart;

                        self.trackEvent('page_performance', {
                            'page_load_time': loadTime,
                            'dom_ready_time': domReady,
                            'time_to_first_byte': firstByte,
                            'dns_lookup': timing.domainLookupEnd - timing.domainLookupStart,
                            'tcp_connection': timing.connectEnd - timing.connectStart,
                            'server_response': timing.responseEnd - timing.requestStart,
                            'page_path': Utils.getPagePath()
                        });

                        Utils.log('Performance tracked', { loadTime, domReady, firstByte });
                    }
                }, 0);
            });

            // Track Core Web Vitals using PerformanceObserver
            if ('PerformanceObserver' in window) {
                // Largest Contentful Paint (LCP)
                try {
                    const lcpObserver = new PerformanceObserver(function (entryList) {
                        const entries = entryList.getEntries();
                        const lastEntry = entries[entries.length - 1];
                        self.trackEvent('core_web_vital', {
                            'metric_name': 'LCP',
                            'metric_value': Math.round(lastEntry.startTime),
                            'metric_rating': lastEntry.startTime <= 2500 ? 'good' : lastEntry.startTime <= 4000 ? 'needs_improvement' : 'poor',
                            'page_path': Utils.getPagePath()
                        });
                    });
                    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
                } catch (e) { }

                // First Input Delay (FID)
                try {
                    const fidObserver = new PerformanceObserver(function (entryList) {
                        const entries = entryList.getEntries();
                        entries.forEach(function (entry) {
                            self.trackEvent('core_web_vital', {
                                'metric_name': 'FID',
                                'metric_value': Math.round(entry.processingStart - entry.startTime),
                                'metric_rating': (entry.processingStart - entry.startTime) <= 100 ? 'good' : (entry.processingStart - entry.startTime) <= 300 ? 'needs_improvement' : 'poor',
                                'page_path': Utils.getPagePath()
                            });
                        });
                    });
                    fidObserver.observe({ type: 'first-input', buffered: true });
                } catch (e) { }

                // Cumulative Layout Shift (CLS)
                try {
                    let clsValue = 0;
                    const clsObserver = new PerformanceObserver(function (entryList) {
                        entryList.getEntries().forEach(function (entry) {
                            if (!entry.hadRecentInput) {
                                clsValue += entry.value;
                            }
                        });
                    });
                    clsObserver.observe({ type: 'layout-shift', buffered: true });

                    // Report CLS on page hide
                    document.addEventListener('visibilitychange', function () {
                        if (document.visibilityState === 'hidden') {
                            self.trackEvent('core_web_vital', {
                                'metric_name': 'CLS',
                                'metric_value': Math.round(clsValue * 1000) / 1000,
                                'metric_rating': clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs_improvement' : 'poor',
                                'page_path': Utils.getPagePath()
                            });
                        }
                    });
                } catch (e) { }
            }
        },

        // =======================================================================
        // VIDEO TRACKING
        // =======================================================================
        initVideoTracking: function () {
            const self = this;

            // Track HTML5 videos
            document.querySelectorAll('video').forEach(function (video, index) {
                const videoId = video.id || `video_${index}`;

                video.addEventListener('play', function () {
                    self.trackEvent('video_start', {
                        'video_id': videoId,
                        'video_title': video.title || videoId,
                        'video_url': video.src || video.currentSrc,
                        'video_duration': Math.round(video.duration)
                    });
                });

                video.addEventListener('pause', function () {
                    self.trackEvent('video_pause', {
                        'video_id': videoId,
                        'video_current_time': Math.round(video.currentTime),
                        'video_percent': Math.round((video.currentTime / video.duration) * 100)
                    });
                });

                video.addEventListener('ended', function () {
                    self.trackEvent('video_complete', {
                        'video_id': videoId,
                        'video_duration': Math.round(video.duration)
                    });
                });

                // Track progress milestones
                let progressMilestones = { 25: false, 50: false, 75: false };
                video.addEventListener('timeupdate', Utils.throttle(function () {
                    const percent = Math.round((video.currentTime / video.duration) * 100);
                    [25, 50, 75].forEach(function (milestone) {
                        if (percent >= milestone && !progressMilestones[milestone]) {
                            progressMilestones[milestone] = true;
                            self.trackEvent('video_progress', {
                                'video_id': videoId,
                                'video_percent': milestone
                            });
                        }
                    });
                }, 1000));
            });

            // Track YouTube embeds (via postMessage API)
            window.addEventListener('message', function (e) {
                if (e.origin.includes('youtube.com')) {
                    try {
                        const data = JSON.parse(e.data);
                        if (data.event === 'onStateChange') {
                            const states = { 0: 'ended', 1: 'playing', 2: 'paused' };
                            if (states[data.info]) {
                                self.trackEvent('youtube_video_' + states[data.info], {
                                    'video_state': states[data.info]
                                });
                            }
                        }
                    } catch (err) { }
                }
            });
        },

        // =======================================================================
        // EXIT INTENT TRACKING
        // =======================================================================
        initExitIntentTracking: function () {
            const self = this;
            let exitIntentTriggered = false;

            document.addEventListener('mouseout', function (e) {
                if (e.clientY < 10 && !exitIntentTriggered) {
                    exitIntentTriggered = true;
                    self.trackEvent('exit_intent', {
                        'time_on_page': Math.round((Date.now() - self.sessionStart) / 1000),
                        'scroll_depth': self.maxScrollDepth,
                        'clicks': self.clickCount,
                        'page_path': Utils.getPagePath()
                    });
                    Utils.log('Exit intent detected');
                }
            });

            // Track tab/window visibility changes
            document.addEventListener('visibilitychange', function () {
                self.trackEvent('visibility_change', {
                    'visibility_state': document.visibilityState,
                    'time_on_page': Math.round((Date.now() - self.sessionStart) / 1000)
                });
            });
        },

        // =======================================================================
        // CORE EVENT TRACKING METHOD
        // =======================================================================
        trackEvent: function (eventName, eventParams) {
            try {
                if (isBlocked) return; // Skip if blocked

                const params = {
                    ...eventParams,
                    'event_timestamp': new Date().toISOString(),
                    'session_id': Utils.getSessionId(),
                    'device_type': Utils.getDeviceType()
                };

                gtag('event', eventName, params);
                Utils.log(`Event tracked: ${eventName}`, params);
            } catch (e) {
                // Silent fail - don't break the site
                if (CONFIG.DEBUG_MODE) {
                    console.warn('[Analytics] Event tracking failed:', e);
                }
            }
        }
    };

    // ==========================================================================
    // INITIALIZE
    // ==========================================================================

    // Load GA4 script with graceful error handling
    try {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.GA_MEASUREMENT_ID}`;

        script.onload = function () {
            try {
                Analytics.init();
                Utils.log('Google Analytics loaded successfully');
            } catch (e) {
                isBlocked = true;
                Utils.log('Analytics initialization failed (likely blocked)', e);
            }
        };

        script.onerror = function () {
            isBlocked = true;
            blockCheckComplete = true;
            Utils.log('Google Analytics blocked by browser/extension');
            // Still initialize basic tracking without GA
            try {
                Analytics.initialized = true;
                Analytics.initScrollTracking();
                Analytics.initClickTracking();
                Analytics.initFormTracking();
                Analytics.initEngagementTracking();
            } catch (e) {
                // Silent fail
            }
        };

        document.head.appendChild(script);
    } catch (e) {
        isBlocked = true;
        Utils.log('Failed to load analytics script', e);
    }

    // ==========================================================================
    // MICROSOFT CLARITY - HEATMAP & SESSION RECORDING
    // ==========================================================================
    // To enable: Replace 'YOUR_CLARITY_ID' in CONFIG with your Clarity project ID
    // Get your free ID at: https://clarity.microsoft.com
    if (CONFIG.CLARITY_PROJECT_ID && CONFIG.CLARITY_PROJECT_ID !== 'YOUR_CLARITY_ID') {
        try {
            (function (c, l, a, r, i, t, y) {
                c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
                t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
                t.onerror = function () {
                    Utils.log('Microsoft Clarity blocked by browser/extension');
                };
                y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
            })(window, document, "clarity", "script", CONFIG.CLARITY_PROJECT_ID);
            Utils.log('Microsoft Clarity initialized', { project_id: CONFIG.CLARITY_PROJECT_ID });
        } catch (e) {
            Utils.log('Failed to load Clarity', e);
        }
    }

    // Expose for external use
    window.MAWAnalytics = Analytics;

    // Expose blocking status for other scripts
    window.MAWAnalytics.isBlocked = function () { return isBlocked; };

})();
