// How It Works Module - Timeline & Steps Animations
export const initSteps = () => {
    const stepsSection = document.getElementById('how-it-works');
    const scrollLine = document.getElementById('timeline-progress-line');
    const progressArrow = document.getElementById('timeline-arrow');
    const stepCards = document.querySelectorAll('.step-card-wrapper');
    const stepNumbers = document.querySelectorAll('.step-number-circle');
    
    if (!stepsSection || !scrollLine) return;

    let visibleSteps = new Set();

    const updateTimeline = () => {
        if (visibleSteps.size === 0) {
            scrollLine.style.height = '0%';
            if (progressArrow) progressArrow.style.opacity = '0';
            return;
        }

        const maxIndex = Math.max(...Array.from(visibleSteps));
        const progress = ((maxIndex + 1) / stepCards.length) * 100;
        
        scrollLine.style.height = `${progress}%`;
        
        if (progressArrow) {
            progressArrow.style.opacity = '1';
            progressArrow.style.top = `${progress}%`;
        }
    };

    const observerOptions = {
        threshold: 0.4
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const index = parseInt(entry.target.getAttribute('data-index'));
            
            if (entry.isIntersecting) {
                visibleSteps.add(index);
                entry.target.classList.add('visible');
                // Also highlight the number circle
                if (stepNumbers[index]) stepNumbers[index].classList.add('visible');
            }
            
            updateTimeline();
        });
    }, observerOptions);

    stepCards.forEach(card => observer.observe(card));

    // Initial check
    updateTimeline();
};
