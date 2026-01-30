// Why Choose Us Section Module - Accordion & Animations
export const initAbout = () => {
    // Accordion Logic
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    accordionItems.forEach(item => {
        const trigger = item.querySelector('.accordion-trigger');
        
        trigger.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items
            accordionItems.forEach(i => i.classList.remove('active'));
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.contains('active') ? null : item.classList.add('active');
            }
        });
    });

    // Simple reveal animations using IntersectionObserver
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-left, .reveal-right').forEach(el => {
        // Add initial styles via JS to keep HTML clean
        el.style.opacity = '0';
        el.style.transition = 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
        
        if (el.classList.contains('reveal-left')) {
            el.style.transform = 'translateX(-30px)';
        } else {
            el.style.transform = 'scale(0.95)';
        }
        
        observer.observe(el);
    });
};

// Add active styles to handles reveals
const style = document.createElement('style');
style.textContent = `
    .reveal-left.active, .reveal-right.active {
        opacity: 1 !important;
        transform: translateX(0) scale(1) !important;
    }
`;
document.head.append(style);
