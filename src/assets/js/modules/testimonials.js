// Testimonials Section Module - Grid & Carousel with Autoplay & Fluid Dragging
export const initTestimonials = () => {
    const carousel = document.getElementById('testimonials-carousel');
    const dotsContainer = document.getElementById('testimonials-dots');
    const items = carousel?.querySelectorAll('.carousel-item');
    
    if (!carousel || !dotsContainer || !items) return;

    let currentIndex = 0;
    let autoplayInterval;
    let resumeTimeout;
    let isDragging = false;
    let startX;
    let scrollLeft;

    const updateDots = () => {
        dotsContainer.innerHTML = Array.from({ length: items.length }).map((_, i) => `
            <button class="transition-all duration-500 h-2 rounded-full ${
                i === currentIndex ? 'bg-[#0D4B4D] w-8' : 'bg-[#0D4B4D]/20 w-2'
            }" data-index="${i}" aria-label="Ver testimonio ${i + 1}"></button>
        `).join("");

        dotsContainer.querySelectorAll('button').forEach(dot => {
            dot.onclick = () => {
                stopAutoplay();
                const targetIdx = parseInt(dot.dataset.index);
                scrollToIndex(targetIdx);
                resetResumeTimeout();
            };
        });
    };

    const scrollToIndex = (index) => {
        const isDesktop = window.innerWidth >= 768;
        if (isDesktop) return;

        currentIndex = (index + items.length) % items.length;
        const itemWidth = items[0].offsetWidth;
        
        // Temporarily disable snap for programmatic scroll
        carousel.style.scrollSnapType = 'none';
        
        carousel.scrollTo({
            left: currentIndex * itemWidth,
            behavior: 'smooth'
        });

        // Re-enable snap after animation
        setTimeout(() => {
            carousel.style.scrollSnapType = 'x mandatory';
        }, 600);

        updateUI(currentIndex);
    };

    const updateUI = (activeIdx) => {
        items.forEach((item, i) => {
            if (i === activeIdx) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        updateDots();
    };

    const startAutoplay = () => {
        if (autoplayInterval || window.innerWidth >= 768) return;
        autoplayInterval = setInterval(() => {
            scrollToIndex(currentIndex + 1);
        }, 4000);
    };

    const stopAutoplay = () => {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    };

    const resetResumeTimeout = () => {
        if (resumeTimeout) clearTimeout(resumeTimeout);
        resumeTimeout = setTimeout(() => {
            startAutoplay();
        }, 3000);
    };

    // Dragging Logic
    const handleDragStart = (e) => {
        isDragging = true;
        carousel.style.scrollSnapType = 'none';
        carousel.style.scrollBehavior = 'auto';
        startX = (e.pageX || e.touches[0].pageX) - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
        stopAutoplay();
        if (resumeTimeout) clearTimeout(resumeTimeout);
    };

    const handleDragMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = (e.pageX || e.touches[0].pageX) - carousel.offsetLeft;
        const walk = (x - startX) * 1.5;
        carousel.scrollLeft = scrollLeft - walk;
    };

    const handleDragEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        carousel.style.scrollSnapType = 'x mandatory';
        carousel.style.scrollBehavior = 'smooth';
        
        // Calculate final index based on landing position
        const itemWidth = items[0].offsetWidth;
        const finalIdx = Math.round(carousel.scrollLeft / itemWidth);
        currentIndex = Math.max(0, Math.min(finalIdx, items.length - 1));
        
        updateUI(currentIndex);
        resetResumeTimeout();
    };

    carousel.addEventListener('mousedown', handleDragStart);
    carousel.addEventListener('mousemove', handleDragMove);
    carousel.addEventListener('mouseup', handleDragEnd);
    carousel.addEventListener('mouseleave', handleDragEnd);

    carousel.addEventListener('touchstart', handleDragStart, { passive: true });
    carousel.addEventListener('touchmove', handleDragMove, { passive: false });
    carousel.addEventListener('touchend', handleDragEnd);

    // Sync dots and active state on scroll (for momentum and direct touch scroll)
    carousel.addEventListener('scroll', () => {
        if (isDragging || window.innerWidth >= 768) return;
        
        const itemWidth = items[0].offsetWidth;
        const newIndex = Math.round(carousel.scrollLeft / itemWidth);
        
        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < items.length) {
            currentIndex = newIndex;
            updateUI(currentIndex);
        }
    });

    // Reveal animations for desktop
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.testimonial-reveal').forEach(el => observer.observe(el));

    // Initialize
    updateUI(0);
    if (window.innerWidth < 768) startAutoplay();
};
