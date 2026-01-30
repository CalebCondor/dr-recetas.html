// Background Gradient Interaction & Header Logic
export const initHeader = () => {
    const header = document.querySelector('header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('py-3');
            header.classList.remove('py-4', 'lg:py-5');
        } else {
            header.classList.remove('py-3');
            header.classList.add('py-4', 'lg:py-5');
        }
    });
};

export const initBackground = () => {
    const interactiveBlob = document.getElementById("interactive-blob");
    if (!interactiveBlob) return;

    let tgX = 0;
    let tgY = 0;
    let curX = 0;
    let curY = 0;

    window.addEventListener("mousemove", (event) => {
        tgX = event.clientX;
        tgY = event.clientY;
    });

    const move = () => {
        curX += (tgX - curX) / 20;
        curY += (tgY - curY) / 20;
        
        interactiveBlob.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
        requestAnimationFrame(move);
    };
    move();
};
