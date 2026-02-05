/**
 * Booking page token validation
 * Validates the booking token before showing Calendly
 */

(function() {
    'use strict';

    // Configuration
    const WORKER_URL = 'https://loganhealth-payments.misty-heart-ac54.workers.dev';

    // DOM Elements
    const loadingEl = document.getElementById('bookingLoading');
    const errorEl = document.getElementById('bookingError');
    const successEl = document.getElementById('bookingSuccess');
    const welcomeEl = document.getElementById('welcomeMessage');
    const calendlyWidget = document.getElementById('calendlyWidget');

    // Store token for later use
    let currentToken = null;

    /**
     * Show a specific state
     */
    function showState(state) {
        loadingEl.classList.remove('active');
        errorEl.classList.remove('active');
        successEl.classList.remove('active');

        if (state === 'loading') loadingEl.classList.add('active');
        if (state === 'error') errorEl.classList.add('active');
        if (state === 'success') successEl.classList.add('active');
    }

    /**
     * Get token from URL query parameter
     */
    function getTokenFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('token');
    }

    /**
     * Validate token with the Worker
     */
    async function validateToken(token) {
        try {
            const response = await fetch(`${WORKER_URL}/api/validate-token?token=${encodeURIComponent(token)}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                console.error('Validation request failed:', response.status);
                return { valid: false };
            }

            return await response.json();
        } catch (error) {
            console.error('Token validation error:', error);
            return { valid: false };
        }
    }

    /**
     * Mark token as used after booking
     */
    async function markTokenUsed(token) {
        try {
            await fetch(`${WORKER_URL}/api/mark-used?token=${encodeURIComponent(token)}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
            });
        } catch (error) {
            console.error('Failed to mark token as used:', error);
            // Don't block the user - they've already booked
        }
    }

    /**
     * Initialize Calendly with user data
     */
    function initializeCalendly(userData) {
        if (typeof Calendly === 'undefined') {
            // Wait for Calendly to load
            setTimeout(() => initializeCalendly(userData), 100);
            return;
        }

        // Pre-fill Calendly with user data if available
        const calendlyUrl = calendlyWidget.getAttribute('data-url');
        let prefillUrl = calendlyUrl;

        if (userData.name || userData.email) {
            const prefillParams = new URLSearchParams();
            if (userData.name) prefillParams.set('name', userData.name);
            if (userData.email) prefillParams.set('email', userData.email);
            prefillUrl = `${calendlyUrl}?${prefillParams.toString()}`;
        }

        // Reinitialize Calendly widget with prefilled data
        calendlyWidget.innerHTML = '';
        Calendly.initInlineWidget({
            url: prefillUrl,
            parentElement: calendlyWidget,
            prefill: {
                name: userData.name || '',
                email: userData.email || '',
            },
        });

        // Listen for Calendly events
        window.addEventListener('message', function(e) {
            if (e.data.event && e.data.event.indexOf('calendly') === 0) {
                if (e.data.event === 'calendly.event_scheduled') {
                    // Booking completed - mark token as used
                    if (currentToken) {
                        markTokenUsed(currentToken);
                    }
                }
            }
        });
    }

    /**
     * Main initialization
     */
    async function init() {
        const token = getTokenFromUrl();

        if (!token) {
            console.log('No token provided');
            showState('error');
            return;
        }

        // Basic token format validation (64 hex chars)
        if (token.length !== 64 || !/^[a-f0-9]+$/i.test(token)) {
            console.log('Invalid token format');
            showState('error');
            return;
        }

        currentToken = token;

        // Validate with server
        const result = await validateToken(token);

        if (!result.valid) {
            console.log('Token validation failed');
            showState('error');
            return;
        }

        // Show success state
        showState('success');

        // Personalize welcome message if we have the user's name
        if (result.name) {
            const firstName = result.name.split(' ')[0];
            welcomeEl.textContent = `Hi ${firstName}! Select a convenient time for your consultation with our pharmacist.`;
        }

        // Initialize Calendly with user data
        initializeCalendly({
            name: result.name,
            email: result.email,
        });
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
