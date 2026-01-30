// FAQ Section Module - BG Color Swapping Accordions
export const initFAQ = () => {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        
        trigger.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Note: The React code used two independent columns, 
            // but usually in a FAQ you'd want only one open at a time.
            // However, to match the React logic where they were separate Accordion components,
            // we'll only close items WITHIN the same column context or allow multi-open if desired.
            // Following 'type="single"' from React:
            const parentSection = item.closest('.faq-column');
            parentSection.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Handle initial state (item-1 open)
    const firstItem = document.querySelector('.faq-item[data-id="1"]');
    if (firstItem) firstItem.classList.add('active');
};
