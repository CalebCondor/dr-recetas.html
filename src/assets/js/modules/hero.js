// Hero Animations & Interactions Module
const getMotion = () => window.Motion || window.motion;

export const initTyping = () => {
  const typingText = document.getElementById("typing-text");
  if (!typingText) return;

  const words = ["consulta médica", "Excusa Medica", "Prueba Covid"];
  let wordIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  const animate = (getMotion() || {}).animate;

  const type = () => {
    const currentWord = words[wordIdx];

    if (isDeleting) {
      typingText.textContent = currentWord.substring(0, charIdx - 1);
      charIdx--;
    } else {
      typingText.textContent = currentWord.substring(0, charIdx + 1);
      charIdx++;
    }

    let typeSpeed = isDeleting ? 50 : 100;

    if (!isDeleting && charIdx === currentWord.length) {
      typeSpeed = 2000;
      isDeleting = true;
      if (animate)
        animate(typingText, { scale: [1, 1.05, 1] }, { duration: 0.3 });
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      wordIdx = (wordIdx + 1) % words.length;
      typeSpeed = 500;
      if (animate) animate(typingText, { opacity: [0, 1] }, { duration: 0.3 });
    }

    setTimeout(type, typeSpeed);
  };
  type();
};

const consultations = [
  { id: 1, name: 'Receta de medicamentos o "Refill"' },
  { id: 2, name: "Consultas Médicas Generales" },
  { id: 3, name: "Consulta por Covid" },
  { id: 4, name: "Prueba de sangre ETH" },
  { id: 5, name: "Evaluacion Medica del sueño" },
  { id: 6, name: "Receta de medicamentos o 'refill'" },
];

let activeIndex = 0;
const ITEM_HEIGHT = 90;
const WINDOW_SIZE = 3;

const renderCards = () => {
  const animate = (getMotion() || {}).animate;
  // We limit the start index so we don't scroll past the end of the visual list "window"
  // The "window" shows `WINDOW_SIZE` items.
  // However, the user logic seemed to just slide items.
  // Let's stick to the visual logic: only 3 items are shown, but we scroll through the list.
  // The "windowStartIndex" tracks which item is at the top of the 3-item view.

  // In the user's React code:
  // windowStartIndex = Math.max(0, Math.min(activeIndex, consultations.length - WINDOW_SIZE));
  const windowStartIndex = Math.max(
    0,
    Math.min(activeIndex, consultations.length - WINDOW_SIZE),
  );

  consultations.forEach((_, index) => {
    const card = document.getElementById(`card-${index}`);
    if (!card) return;

    const inner = card.querySelector(".card-inner");
    const text = card.querySelector(".card-text");

    // globalIndex is just 'index' here.
    // localIndex is position relative to the start of the window
    const localIndex = index - windowStartIndex;

    const isActive = index === activeIndex;
    // Item is visible if it's within [windowStartIndex, windowStartIndex + WINDOW_SIZE)
    const isVisible =
      index >= windowStartIndex && index < windowStartIndex + WINDOW_SIZE;
    const distance = Math.abs(index - activeIndex);

    if (animate) {
      animate(
        card,
        {
          y: localIndex * ITEM_HEIGHT,
          scale: isActive ? 1.025 : 1,
          opacity: isVisible ? (isActive ? 1 : 0.9) : 0,
          zIndex: 100 - distance,
        },
        {
          duration: 0.3,
          type: "spring",
          stiffness: 200,
          damping: 25,
        },
      );
    } else {
      card.style.transform = `translateY(${localIndex * ITEM_HEIGHT}px) scale(${isActive ? 1.025 : 1})`;
      card.style.opacity = isVisible ? (isActive ? 1 : 0.9) : 0;
      card.style.zIndex = 100 - distance;
    }

    if (isActive) {
      inner.className =
        "card-inner relative overflow-hidden rounded-2xl p-4 lg:p-5 px-5 lg:px-10 bg-white flex flex-col justify-center min-h-[70px] shadow-sm ring-1 ring-black/5";
      text.className =
        "card-text text-base lg:text-lg font-bold text-left tracking-tight transition-colors duration-300 text-[#0D4B4D]";
    } else {
      inner.className =
        "card-inner relative overflow-hidden rounded-2xl p-4 lg:p-5 px-5 lg:px-10 bg-white flex flex-col justify-center min-h-[70px] shadow-sm";
      text.className =
        "card-text text-base lg:text-lg font-bold text-left tracking-tight transition-colors duration-300 text-slate-600";
    }
  });
};

export const initCards = () => {
  const cardsContainer = document.getElementById("cards-container");
  if (!cardsContainer) return;

  cardsContainer.innerHTML = "";
  consultations.forEach((item, index) => {
    const card = document.createElement("div");
    card.id = `card-${index}`;
    card.className =
      "absolute top-0 left-0 w-full cursor-pointer will-change-transform";
    card.style.opacity = "0";

    card.innerHTML = `
            <div class="card-inner relative overflow-hidden rounded-2xl p-4 lg:p-5 px-5 lg:px-10 bg-white flex flex-col justify-center min-h-[70px] transition-all duration-500">
                <div class="relative z-10">
                    <p class="card-text text-base lg:text-lg font-bold text-left tracking-tight transition-colors duration-500">
                        ${item.name}
                    </p>
                </div>
            </div>
        `;

    card.onclick = () => {
      activeIndex = index;
      renderCards();
    };
    cardsContainer.appendChild(card);
  });
  renderCards();
};

export const initHandlers = () => {
  let lastTime = 0;
  const COOLDOWN = 80; // reduced to match request

  // Check strict visibility of hero to engage scroll hijacking
  const isHeroVisible = () => {
    const hero = document.getElementById("hero-container");
    if (!hero) return false;
    const rect = hero.getBoundingClientRect();
    // If the top of the hero is near the viewport top (scrolled into view)
    // And we haven't scrolled past it completely
    // Actually, logic: if more than 50% of hero is visible?
    // Or if the top is within the window?
    // Let's use IntersectionObserver-like logic:
    // If the element is covering a significant portion of the screen, engage logic.

    // Simpler: if top of hero is > -height/2 and bottom is > height/2
    // But for strict "scroll hero first", we usually check if it occupies the viewport.
    // Assuming hero is at the top or near it.
    return rect.bottom > 100 && rect.top < window.innerHeight - 100;
  };

  window.addEventListener(
    "wheel",
    (e) => {
      if (!isHeroVisible()) return;

      const isScrollDown = e.deltaY > 0;
      const isScrollUp = e.deltaY < 0;
      const isAtEnd = activeIndex >= consultations.length - 1;
      const isAtStart = activeIndex === 0;

      if ((isScrollDown && !isAtEnd) || (isScrollUp && !isAtStart)) {
        if (e.cancelable) e.preventDefault();

        const now = Date.now();
        if (now - lastTime > COOLDOWN && Math.abs(e.deltaY) > 15) {
          if (isScrollDown && !isAtEnd) {
            activeIndex++;
            renderCards();
          } else if (isScrollUp && !isAtStart) {
            activeIndex--;
            renderCards();
          }
          lastTime = now;
        }
      }
    },
    { passive: false },
  );

  let touchStartY = 0;
  window.addEventListener(
    "touchstart",
    (e) => {
      touchStartY = e.touches[0].clientY;
    },
    { passive: true },
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (!isHeroVisible()) return;

      const touchEndY = e.touches[0].clientY;
      const delta = touchStartY - touchEndY; // Positive is swipe up (scroll down)
      const absDelta = Math.abs(delta);
      const now = Date.now();

      const isMovingDown = delta > 0;
      const isMovingUp = delta < 0;
      const isAtEnd = activeIndex >= consultations.length - 1;
      const isAtStart = activeIndex === 0;

      if ((isMovingDown && !isAtEnd) || (isMovingUp && !isAtStart)) {
        if (e.cancelable) e.preventDefault();

        const THRESHOLD = 25;
        // Mobile cooldown usually same as wheel
        if (now - lastTime > COOLDOWN && absDelta > THRESHOLD) {
          if (isMovingDown && !isAtEnd) {
            activeIndex++;
            renderCards();
          } else if (isMovingUp && !isAtStart) {
            activeIndex--;
            renderCards();
          }
          touchStartY = touchEndY; // reset start to avoid continuous triggers on one swipe?
          // Actually React code does: touchStartRef.current = touchEnd;
          // This makes it incremental.
          touchStartY = touchEndY;
          lastTime = now;
        }
      }
    },
    { passive: false },
  );
};
