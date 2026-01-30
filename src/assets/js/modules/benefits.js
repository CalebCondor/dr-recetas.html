// Benefits Section Module - Interactive Stacked Cards
export const initBenefits = () => {
    const cards = document.querySelectorAll('.benefit-card');
    let order = [1, 2];

    const updateStack = () => {
        cards.forEach(card => {
            const id = parseInt(card.dataset.id);
            const index = order.indexOf(id);
            const isFirst = index === 0;

            if (isFirst) {
                card.classList.add('is-front');
                card.classList.remove('is-back');
                card.style.zIndex = '20';
            } else {
                card.classList.add('is-back');
                card.classList.remove('is-front');
                card.style.zIndex = '10';
            }
        });
    };

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            if (order[0] === id) return; // Already in front

            // Simple swap for 2 cards
            order = [id, order.find(item => item !== id)];
            updateStack();
        });
    });

    // Initialize
    updateStack();
};
