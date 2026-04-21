// ===== ClanB Homepage — Script =====

document.addEventListener('DOMContentLoaded', () => {

    // ---- Navbar scroll behavior ----
    const navbar = document.getElementById('navbar');
    let lastScrollY = 0;
    let ticking = false;

    const handleNavbarScroll = () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Hide navbar on scroll down, show on scroll up
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }

        lastScrollY = currentScrollY;
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(handleNavbarScroll);
            ticking = true;
        }
    }, { passive: true });


    // ---- Mobile menu ----
    const hamburger = document.getElementById('nav-hamburger');
    const mobileMenu = document.getElementById('mobile-menu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            mobileMenu.classList.toggle('open');
            document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
        });

        // Close on link click
        mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                mobileMenu.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }


    // ---- Floating Elements Drag Logic ----
    const floatingElements = document.querySelectorAll('.floating-element');
    
    // Initial fade in shortly after page load
    setTimeout(() => {
        floatingElements.forEach(el => {
            // Stagger animation organically using negative delays so it doesn't wait to start
            el.style.animationDelay = `${(Math.random() * -6).toFixed(2)}s`;
            // Add slight random duration variation so they drift in and out of sync permanently
            el.style.animationDuration = `${(Math.random() * 2 + 5).toFixed(2)}s`;
            el.classList.add('fade-in');
        });
    }, 400);

    floatingElements.forEach(el => {
        let isDragging = false;
        let hasDragged = false;
        let startX, startY, initialLeft, initialTop;
        let mouseStartX, mouseStartY;

        const onMouseDown = (e) => {
            // Prevent interaction if it's a right click
            if(e.button === 2) return; 

            isDragging = true;
            hasDragged = false;
            el.classList.add('dragging');
            
            // Get initial mouse/touch position
            mouseStartX = e.clientX || (e.touches && e.touches[0].clientX);
            mouseStartY = e.clientY || (e.touches && e.touches[0].clientY);
            startX = mouseStartX;
            startY = mouseStartY;
            
            // Get element position relative to its container offset
            initialLeft = el.offsetLeft;
            initialTop = el.offsetTop;
            
            // Bring to very front
            el.style.zIndex = '1000';

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.addEventListener('touchmove', onMouseMove, {passive: false});
            document.addEventListener('touchend', onMouseUp);
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            e.preventDefault(); // Prevent standard page scroll while dragging a shape
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            const dx = clientX - startX;
            const dy = clientY - startY;

            // If moved more than 5px, consider it a drag
            if (Math.abs(clientX - mouseStartX) > 5 || Math.abs(clientY - mouseStartY) > 5) {
                hasDragged = true;
            }
            
            // Update physical coordinates
            el.style.left = `${initialLeft + dx}px`;
            el.style.top = `${initialTop + dy}px`;
        };

        const onMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                el.classList.remove('dragging');
                el.style.zIndex = ''; // Restore z-index
                
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                document.removeEventListener('touchmove', onMouseMove);
                document.removeEventListener('touchend', onMouseUp);
            }
        };

        el.addEventListener('mousedown', onMouseDown);
        el.addEventListener('touchstart', onMouseDown, {passive: false});
        
        // Prevent default browser ghost-dragging image behavior
        el.addEventListener('dragstart', (e) => e.preventDefault());

        // Prevent navigation if the element was dragged
        if (el.tagName === 'A') {
            el.addEventListener('click', (e) => {
                if (hasDragged) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        }
    });


    // ---- Quote word-by-word scroll reveal ----
    const quoteSection = document.getElementById('quote-section');
    let quoteWords = document.querySelectorAll('.quote-word');

    if (quoteSection && quoteWords.length > 0) {
        const updateQuoteWords = () => {
            const rect = quoteSection.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Calculate how far through the quote section the user has scrolled
            // The animation starts when the section enters the viewport
            // and completes when it reaches roughly the center
            const sectionTop = rect.top;
            const sectionHeight = rect.height;

            // Progress: 0 when section top hits bottom of viewport, 1 when section is centered
            const startOffset = windowHeight; // section top at viewport bottom
            const endOffset = windowHeight * 0.3; // section near top
            const progress = Math.min(Math.max(
                (startOffset - sectionTop) / (startOffset - endOffset),
                0
            ), 1);

            // Map progress to word indices
            const totalWords = quoteWords.length;
            const wordsToHighlight = Math.floor(progress * totalWords);

            quoteWords.forEach((word, index) => {
                if (index < wordsToHighlight) {
                    word.classList.add('highlighted');
                } else {
                    word.classList.remove('highlighted');
                }
            });
        };

        window.addEventListener('scroll', () => {
            requestAnimationFrame(updateQuoteWords);
        }, { passive: true });

        const quoteTextContainer = document.getElementById('quote-text');
        
        // Store original content to allow toggling back
        const originalQuoteHTML = quoteTextContainer ? quoteTextContainer.innerHTML : '';

        // Click to change quote
        quoteSection.addEventListener('click', () => {
            if (!quoteTextContainer) return;

            const isChanged = quoteTextContainer.dataset.changed === 'true';
            
            // Toggle state
            quoteTextContainer.dataset.changed = isChanged ? 'false' : 'true';
            
            // Fade out
            quoteTextContainer.style.opacity = '0';
            
            setTimeout(() => {
                if (isChanged) {
                    // Revert to original
                    quoteTextContainer.innerHTML = originalQuoteHTML;
                } else {
                    // Change to new quote
                    quoteTextContainer.innerHTML = `
                        <span class="quote-word">We</span>
                        <span class="quote-word">change</span>
                        <span class="quote-word">behavior.</span>
                    `;
                }

                // Re-query words and re-run highlight logic
                quoteWords = document.querySelectorAll('.quote-word');
                
                // Re-apply cursors to new words
                quoteWords.forEach(word => {
                    word.style.cursor = 'pointer';
                });

                updateQuoteWords();
                
                // Fade in
                quoteTextContainer.style.opacity = '1';
            }, 300);
        });

        if (quoteTextContainer) {
            quoteTextContainer.style.transition = 'opacity 0.3s ease';
            quoteTextContainer.style.cursor = 'pointer';
            
            // Update cursor for individual words as well since they have a default cursor in CSS
            quoteWords.forEach(word => {
                word.style.cursor = 'pointer';
            });
        }

        // Initial check
        updateQuoteWords();
    }


    // ---- Intersection Observer for project card animations ----
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe project cards
    document.querySelectorAll('.project-card').forEach(card => {
        observer.observe(card);
    });


    // ---- Smooth parallax on project images ----
    const projectImages = document.querySelectorAll('.placeholder-image');

    const handleParallax = () => {
        projectImages.forEach(img => {
            const rect = img.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            if (rect.top < windowHeight && rect.bottom > 0) {
                const scrollPercent = (windowHeight - rect.top) / (windowHeight + rect.height);
                const translateY = (scrollPercent - 0.5) * 30;
                img.style.transform = `translateY(${translateY}px)`;
            }
        });
    };

    window.addEventListener('scroll', () => {
        requestAnimationFrame(handleParallax);
    }, { passive: true });


    // ---- Category tag hover micro-interactions ----
    document.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('mouseenter', () => {
            tag.style.transform = 'translateY(-2px)';
            tag.style.borderColor = 'rgba(255, 255, 255, 0.7)';
        });
        tag.addEventListener('mouseleave', () => {
            tag.style.transform = 'translateY(0)';
            tag.style.borderColor = '';
        });
    });


    // ---- Footer tagline reveal ----
    const footerTagline = document.querySelector('.footer-tagline');
    
    if (footerTagline) {
        // Initial reveal setup
        footerTagline.style.opacity = '0';
        footerTagline.style.transform = 'translateY(30px)';

        const footerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    footerObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        footerObserver.observe(footerTagline);
    }

    // ---- Background Shaped Lines Canvas ----
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let mouseX = -1000;
        let mouseY = -1000;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            // Adjust particle count based on screen size for performance and visual density
            const numParticles = Math.floor((width * height) / 12000);
            for (let i = 0; i < numParticles; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4
                });
            }
        };

        const drawLines = () => {
            ctx.clearRect(0, 0, width, height);

            // update positions
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                // Bounce off edges
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;
            });

            // draw lines between close particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const p1 = particles[i];
                    const p2 = particles[j];
                    const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

                    if (dist < 150) {
                        const midX = (p1.x + p2.x) / 2;
                        const midY = (p1.y + p2.y) / 2;
                        const mouseDist = Math.hypot(mouseX - midX, mouseY - midY);

                        // Base opacity (low opacity, almost grey)
                        let opacity = (1 - (dist / 150)) * 0.15;

                        // Brighter on hover
                        if (mouseDist < 200) {
                            opacity += (1 - mouseDist / 200) * 0.4;
                        }

                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(180, 180, 180, ${opacity})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(drawLines);
        };

        window.addEventListener('resize', resize);
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Reset mouse position when leaving window
        document.addEventListener('mouseleave', () => {
            mouseX = -1000;
            mouseY = -1000;
        });

        resize();
        drawLines();
    }

});
