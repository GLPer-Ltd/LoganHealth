/* =============================================
   Logan Health - GSAP Animations
   ============================================= */

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const isMobile = window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window;

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ScrollTrigger config for mobile
ScrollTrigger.config({
    ignoreMobileResize: true
});

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    // Handle video loading errors gracefully
    initVideoErrorHandling();

    if (prefersReducedMotion.matches) {
        initReducedMotionFallback();
        return;
    }

    // Set initial states (prevent FOUC)
    setInitialStates();

    // Initialize all GSAP animations
    initHeroAnimation();
    initScrollReveal();
    initParallax();
    initCounterAnimation();
    initChartAnimation();
});

/* =============================================
   Video Error Handling
   ============================================= */
function initVideoErrorHandling() {
    const heroVideo = document.querySelector('.hero-video');
    if (!heroVideo) return;

    // Handle video loading errors
    heroVideo.addEventListener('error', function() {
        console.log('Hero video failed to load, using image fallback');
        heroVideo.style.display = 'none';
    });

    // Also check if video fails to play
    heroVideo.addEventListener('stalled', function() {
        console.log('Hero video stalled, using image fallback');
        heroVideo.style.display = 'none';
    });

    // Hide video if it fails to load within 5 seconds
    const videoTimeout = setTimeout(function() {
        if (heroVideo.readyState < 2) {
            console.log('Hero video loading too slow, using image fallback');
            heroVideo.style.display = 'none';
        }
    }, 5000);

    // Clear timeout if video loads successfully
    heroVideo.addEventListener('canplay', function() {
        clearTimeout(videoTimeout);
    });
}

// Listen for reduced motion changes
prefersReducedMotion.addEventListener('change', handleReducedMotionChange);

// Refresh ScrollTrigger on orientation change
window.addEventListener('orientationchange', () => {
    setTimeout(() => ScrollTrigger.refresh(), 100);
});

/* =============================================
   Initial States (prevent FOUC)
   ============================================= */
function setInitialStates() {
    // Hero video starts slightly zoomed in
    gsap.set('.hero-video', {
        scale: 1.1
    });

    // Hero elements start hidden
    gsap.set([
        '.hero-title',
        '.hero-subtitle',
        '.hero-cta .btn',
        '.trust-badge',
        '.hero-tile'
    ], {
        opacity: 0
    });

    // Scroll reveal elements start hidden
    gsap.set([
        '.section-header',
        '.step-card',
        '.step-connector',
        '.treatment-card',
        '.testimonial-card',
        '.included-item',
        '.story-card',
        '.faq-item',
        '.blog-card',
        '.comparison-table-wrapper',
        '.treatments-info',
        '.glper-text',
        '.glper-mockup',
        '.glper-features li',
        '.app-buttons',
        '.meet-team-content',
        '.about-content',
        '.about-image',
        '.steps-cta'
    ], {
        opacity: 0,
        y: 40
    });
}

/* =============================================
   Reduced Motion Handling
   ============================================= */
function initReducedMotionFallback() {
    // Make all elements visible immediately
    gsap.set([
        '.hero-title',
        '.hero-subtitle',
        '.hero-cta .btn',
        '.trust-badge',
        '.hero-tile',
        '.section-header',
        '.step-card',
        '.step-connector',
        '.treatment-card',
        '.testimonial-card',
        '.included-item',
        '.story-card',
        '.faq-item',
        '.blog-card',
        '.comparison-table-wrapper',
        '.treatments-info',
        '.glper-text',
        '.glper-mockup',
        '.glper-features li',
        '.app-buttons',
        '.meet-team-content',
        '.about-content',
        '.about-image',
        '.steps-cta'
    ], {
        opacity: 1,
        y: 0,
        scale: 1,
        clearProps: 'all'
    });

    // Still initialize counters (they're not motion-heavy)
    initCounterAnimation();
}

function handleReducedMotionChange(event) {
    if (event.matches) {
        // User enabled reduced motion - kill animations
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        gsap.killTweensOf('*');
        initReducedMotionFallback();
    } else {
        // User disabled reduced motion - reload to reinitialize
        window.location.reload();
    }
}

/* =============================================
   Hero Section Animation
   ============================================= */
function initHeroAnimation() {
    // Subtle zoom animation on hero video
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        gsap.fromTo(heroVideo,
            { scale: 1.1 },
            {
                scale: 1,
                duration: 10,
                ease: 'power1.out'
            }
        );
    }

    const heroTl = gsap.timeline({
        defaults: {
            ease: 'power3.out',
            duration: 0.8
        }
    });

    heroTl
        // Title entrance
        .to('.hero-title', {
            opacity: 1,
            y: 0,
            duration: 1
        })
        // Subtitle
        .to('.hero-subtitle', {
            opacity: 1,
            y: 0,
            duration: 0.7
        }, '-=0.5')
        // CTA buttons (staggered)
        .to('.hero-cta .btn', {
            opacity: 1,
            y: 0,
            stagger: 0.15,
            duration: 0.5
        }, '-=0.3')
        // Trust badges (staggered)
        .to('.trust-badge', {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.4
        }, '-=0.2')
        // Hero tiles with bounce effect
        .to('.hero-tile', {
            opacity: 1,
            scale: 1,
            stagger: 0.1,
            duration: 0.6,
            ease: 'back.out(1.7)'
        }, '-=0.3');

    // Set initial scale for hero tiles
    gsap.set('.hero-tile', { scale: 0.8 });
}

/* =============================================
   Scroll Reveal Animations
   ============================================= */
function initScrollReveal() {
    const duration = isMobile ? 0.6 : 0.8;
    const distance = isMobile ? 30 : 40;

    // Section headers
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.to(header, {
            opacity: 1,
            y: 0,
            duration: duration,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: header,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });

    // Steps section
    const stepsGrid = document.querySelector('.steps-grid');
    if (stepsGrid) {
        gsap.to('.step-card', {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: stepsGrid,
                start: 'top 80%'
            }
        });

        gsap.to('.step-connector', {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.2,
            delay: 0.1,
            scrollTrigger: {
                trigger: stepsGrid,
                start: 'top 80%'
            }
        });
    }

    // Steps CTA
    const stepsCta = document.querySelector('.steps-cta');
    if (stepsCta) {
        gsap.to(stepsCta, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            scrollTrigger: {
                trigger: stepsCta,
                start: 'top 85%'
            }
        });
    }

    // What You Get section
    const includedGrid = document.querySelector('.included-grid');
    if (includedGrid) {
        gsap.to('.included-item', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: includedGrid,
                start: 'top 80%'
            }
        });
    }

    // Testimonials
    const testimonialsGrid = document.querySelector('.testimonials-grid');
    if (testimonialsGrid) {
        gsap.to('.testimonial-card', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: testimonialsGrid,
                start: 'top 80%'
            }
        });
    }

    // Treatment cards
    const treatmentsGrid = document.querySelector('.treatments-grid');
    if (treatmentsGrid) {
        gsap.to('.treatment-card', {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: treatmentsGrid,
                start: 'top 80%'
            }
        });

        // Set initial scale
        gsap.set('.treatment-card', { scale: 0.95 });
    }

    // Comparison table
    const comparisonTable = document.querySelector('.comparison-table-wrapper');
    if (comparisonTable) {
        gsap.to(comparisonTable, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            scrollTrigger: {
                trigger: comparisonTable,
                start: 'top 80%'
            }
        });
    }

    // Treatments info
    const treatmentsInfo = document.querySelector('.treatments-info');
    if (treatmentsInfo) {
        gsap.to(treatmentsInfo, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            scrollTrigger: {
                trigger: treatmentsInfo,
                start: 'top 85%'
            }
        });
    }

    // Story cards
    const storiesGrid = document.querySelector('.stories-grid');
    if (storiesGrid) {
        gsap.to('.story-card', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: storiesGrid,
                start: 'top 80%'
            }
        });
    }

    // GLPer App section
    const glperText = document.querySelector('.glper-text');
    if (glperText) {
        gsap.to(glperText, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            scrollTrigger: {
                trigger: glperText,
                start: 'top 80%'
            }
        });

        // Feature list items
        gsap.to('.glper-features li', {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            scrollTrigger: {
                trigger: '.glper-features',
                start: 'top 85%'
            }
        });

        // App buttons
        const appButtons = document.querySelector('.app-buttons');
        if (appButtons) {
            gsap.to(appButtons, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                scrollTrigger: {
                    trigger: appButtons,
                    start: 'top 90%'
                }
            });
        }
    }

    // GLPer mockup
    const glperMockup = document.querySelector('.glper-mockup');
    if (glperMockup) {
        gsap.to(glperMockup, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: glperMockup,
                start: 'top 80%'
            }
        });
    }

    // Meet the team
    const meetTeamContent = document.querySelector('.meet-team-content');
    if (meetTeamContent) {
        gsap.to(meetTeamContent, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            scrollTrigger: {
                trigger: meetTeamContent,
                start: 'top 80%'
            }
        });
    }

    // About section
    const aboutContent = document.querySelector('.about-content');
    if (aboutContent) {
        gsap.to(aboutContent, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            scrollTrigger: {
                trigger: aboutContent,
                start: 'top 80%'
            }
        });
    }

    const aboutImage = document.querySelector('.about-image');
    if (aboutImage) {
        gsap.to(aboutImage, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            scrollTrigger: {
                trigger: aboutImage,
                start: 'top 80%'
            }
        });
    }

    // FAQ items
    const faqGrid = document.querySelector('.faq-grid');
    if (faqGrid) {
        gsap.to('.faq-item', {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: faqGrid,
                start: 'top 80%'
            }
        });
    }

    // Blog cards
    const blogGrid = document.querySelector('.blog-grid');
    if (blogGrid) {
        gsap.to('.blog-card', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: blogGrid,
                start: 'top 80%'
            }
        });
    }
}

/* =============================================
   Parallax Effects (Desktop Only)
   ============================================= */
function initParallax() {
    // Skip parallax on mobile for performance
    if (isMobile) return;

    // Hero video parallax - slower scroll creates depth
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        gsap.to(heroVideo, {
            y: 100,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            }
        });
    }


    // Section tags subtle parallax
    gsap.utils.toArray('.section-tag').forEach(tag => {
        gsap.to(tag, {
            y: -15,
            ease: 'none',
            scrollTrigger: {
                trigger: tag,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.5
            }
        });
    });

    // Phone mockup parallax
    const phoneMockup = document.querySelector('.phone-frame');
    if (phoneMockup) {
        gsap.to(phoneMockup, {
            y: -30,
            ease: 'none',
            scrollTrigger: {
                trigger: '.glper-app',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            }
        });
    }

    // Hero tiles subtle float on scroll
    gsap.utils.toArray('.hero-tile').forEach((card, i) => {
        gsap.to(card, {
            y: -10 - (i * 5),
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            }
        });
    });
}

/* =============================================
   Counter Animation
   ============================================= */
function initCounterAnimation() {
    const counters = document.querySelectorAll('[data-count]');

    if (counters.length === 0) return;

    counters.forEach(counter => {
        const target = parseInt(counter.dataset.count);

        ScrollTrigger.create({
            trigger: counter,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.to(counter, {
                    innerHTML: target,
                    duration: 2,
                    ease: 'power2.out',
                    snap: { innerHTML: 1 },
                    onUpdate: function() {
                        counter.textContent = Math.round(counter.innerHTML);
                    }
                });
            }
        });
    });
}

/* =============================================
   Chart Drawing Animation
   ============================================= */
function initChartAnimation() {
    const chartPath = document.querySelector('.app-chart svg path:first-child');
    if (!chartPath) return;

    const pathLength = chartPath.getTotalLength ? chartPath.getTotalLength() : 400;

    gsap.set(chartPath, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength
    });

    gsap.to(chartPath, {
        strokeDashoffset: 0,
        duration: 2,
        ease: 'power2.inOut',
        scrollTrigger: {
            trigger: '.glper-app',
            start: 'top 60%',
            once: true
        }
    });
}

/* =============================================
   Export for other modules
   ============================================= */
window.gsapAnimations = {
    refresh: () => ScrollTrigger.refresh(),
    kill: () => {
        ScrollTrigger.getAll().forEach(t => t.kill());
        gsap.killTweensOf('*');
    }
};
