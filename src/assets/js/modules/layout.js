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
  const heroBackground = document.getElementById("hero-background");
  const servicesSection = document.getElementById("servicios");

  if (!interactiveBlob || !heroBackground || !servicesSection) return;

  // --- Blob Animation Logic ---
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

  // --- Background Sizing Logic ---

  const updateBackgroundHeight = () => {
    // Calculate the position where the services background ends (visually)
    // We want it to go halfway through the services carousel.

    const carousel = document.getElementById("services-carousel");
    // Fallback to servicesSection if carousel not found for some reason, though it should be there.
    const targetElement = carousel || servicesSection;
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const absoluteTop = rect.top + window.scrollY;
    const height = targetElement.offsetHeight;

    // Height = Distance to top of element + half of element height
    const targetHeight = absoluteTop + height / 2;

    heroBackground.style.height = `${targetHeight}px`;
  };

  // Initial update
  updateBackgroundHeight();

  // Update on resize
  window.addEventListener("resize", updateBackgroundHeight);

  // Update when content might change (e.g. carousel loads)
  const resizeObserver = new ResizeObserver(() => {
    updateBackgroundHeight();
  });

  if (servicesSection) resizeObserver.observe(servicesSection);
  resizeObserver.observe(document.body); // Backup in case layout shifts mainly body height

  // --- Additional Decorative Elements ---
  addDecorativeBlobs();
};

// Function to add more decorative blobs with the specified colors
const addDecorativeBlobs = () => {
  const colors = {
    gradientBackgroundStart: "rgb(200, 220, 250)",
    gradientBackgroundEnd: "rgb(230, 245, 250)",
    firstColor: "100, 160, 255",
    secondColor: "220, 235, 250",
    thirdColor: "120, 210, 180",
    fourthColor: "130, 180, 250",
    fifthColor: "200, 220, 240",
    pointerColor: "80, 140, 255"
  };

  // Add floating blobs to different sections
  const sections = [
    { id: "servicios", count: 3 },
    { id: "chatbot", count: 2 },
    { id: "nosotros", count: 4 }
  ];

  sections.forEach(section => {
    const element = document.getElementById(section.id);
    if (!element) return;

    for (let i = 0; i < section.count; i++) {
      const blob = document.createElement("div");
      const colorKeys = Object.keys(colors).filter(key => key.includes("Color"));
      const randomColor = colors[colorKeys[Math.floor(Math.random() * colorKeys.length)]];
      
      blob.className = "absolute rounded-full blur-[60px] pointer-events-none opacity-30";
      blob.style.background = `radial-gradient(circle, rgba(${randomColor}, 0.8) 0%, rgba(${randomColor}, 0) 70%)`;
      
      // Random positioning
      const size = Math.random() * 200 + 100; // 100px to 300px
      const posX = Math.random() * 80 + 10; // 10% to 90%
      const posY = Math.random() * 80 + 10; // 10% to 90%
      
      blob.style.width = `${size}px`;
      blob.style.height = `${size}px`;
      blob.style.left = `${posX}%`;
      blob.style.top = `${posY}%`;
      blob.style.transform = "translate(-50%, -50%)";
      
      // Add subtle animation
      const duration = Math.random() * 10 + 15; // 15s to 25s
      const delay = Math.random() * 5; // 0s to 5s
      blob.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
      
      element.style.position = "relative";
      element.style.overflow = "hidden";
      element.appendChild(blob);
    }
  });

  // Add CSS animation for floating effect
  const style = document.createElement("style");
  style.textContent = `
    @keyframes float {
      0%, 100% {
        transform: translate(-50%, -50%) translateY(0px) scale(1);
      }
      25% {
        transform: translate(-50%, -50%) translateY(-20px) scale(1.05);
      }
      50% {
        transform: translate(-50%, -50%) translateY(10px) scale(0.95);
      }
      75% {
        transform: translate(-50%, -50%) translateY(-15px) scale(1.02);
      }
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 0.3;
        transform: translate(-50%, -50%) scale(1);
      }
      50% {
        opacity: 0.5;
        transform: translate(-50%, -50%) scale(1.1);
      }
    }
  `;
  document.head.appendChild(style);
};
