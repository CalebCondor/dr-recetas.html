// Background Gradient Interaction & Header Logic
export const initHeader = () => {
  const header = document.querySelector("header");
  if (!header) return;

  const updateHeaderStyle = () => {
    if (window.scrollY > 50) {
      // When scrolling, add white background with shadow
      header.style.backgroundColor = "white";
      header.classList.add("shadow-md");
    } else {
      // At top, transparent
      header.style.backgroundColor = "transparent";
      header.classList.remove("shadow-md");
    }
  };

  // Set initial state
  updateHeaderStyle();

  // Update on scroll
  window.addEventListener("scroll", updateHeaderStyle, { passive: true });
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
