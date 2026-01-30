// Services Carousel Module - Fluid Native Version
const getMotion = () => window.Motion || window.motion || null;

const getCategories = async () => {
  try {
    const res = await fetch("https://doctorrecetas.com/v3/api_categorias.php");
    if (!res.ok) throw new Error("API Error");
    const data = await res.json();
    return data.slice(0, 6).map((cat) => ({
      title: cat.nombre,
      description: cat.lead,
      imageSrc: cat.imagen,
      imageAlt: cat.nombre,
      tag: cat.tag || cat.nombre, // Robust fallback
    }));
  } catch (error) {
    return [
      {
        title: "Citas Medicas",
        description: "Agenda tu cita con doctores especializados.",
        imageSrc: "assets/images/citas.jpg",
        imageAlt: "Citas Medicas",
        tag: "Citas Medicas",
      },
      {
        title: "Membresias",
        description: "Planes de salud a tu medida.",
        imageSrc: "assets/images/membresia.jpg",
        imageAlt: "Membresias",
        tag: "Membresia",
      },
      {
        title: "Ordenes de laboratorio",
        description: "Gestiona tus órdenes de laboratorio online.",
        imageSrc: "assets/images/lab.jpg",
        imageAlt: "Laboratorio",
        tag: "lab",
      },
      {
        title: "Para el",
        description: "Salud masculina integral.",
        imageSrc: "assets/images/parael.jpg",
        imageAlt: "Para el",
        tag: "Para el",
      },
      {
        title: "Para ella",
        description: "Cuidado especializado para la mujer.",
        imageSrc: "assets/images/paraella.jpg",
        imageAlt: "Para ella",
        tag: "Para ella",
      },
      {
        title: "Otros",
        description: "Ver todos los servicios disponibles.",
        imageSrc: "assets/images/otros.jpg",
        imageAlt: "Otros",
        tag: "Otros",
      },
    ];
  }
};

export const initServices = async () => {
  const carousel = document.getElementById("services-carousel");
  const dotsContainer = document.getElementById("carousel-dots");
  if (!carousel || !dotsContainer) return;

  carousel.innerHTML =
    '<div class="w-full text-center py-20 text-teal-800/40 font-medium animate-pulse">Cargando servicios...</div>';

  const servicesData = await getCategories();
  const motion = getMotion();
  const animate = motion ? motion.animate : null;

  // Render Cards
  carousel.innerHTML = servicesData
    .map((service, index) => {
      const rawTag = service.tag || service.title || "servicio";
      const slug = encodeURIComponent(
        rawTag.trim().toLowerCase().replace(/\s+/g, "-"),
      );
      console.log(
        `Service: ${service.title} -> Tag: ${rawTag} -> Slug: ${slug}`,
      );

      return `
        <div class="carousel-item flex-shrink-0 w-[300px] h-[420px] p-2" data-index="${index}">
            <a href="servicio?slug=${slug}" class="service-card group relative block overflow-hidden rounded-[2.5rem] cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-sm w-full h-full">
                <div class="card-image absolute inset-0 z-0">
                    <img src="${service.imageSrc}" alt="${service.imageAlt}" class="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75" loading="lazy">
                </div>
                <div class="card-overlay absolute inset-0 z-10 opacity-30 bg-black transition-all duration-500 group-hover:opacity-50 group-hover:backdrop-blur-[2px]"></div>
                
                <div class="card-initial absolute inset-x-0 bottom-0 p-8 lg:p-12 z-20 pointer-events-none transition-all duration-500 group-hover:opacity-0 group-hover:-translate-y-4">
                    <h3 class="font-black text-white text-3xl lg:text-4xl leading-tight tracking-tight drop-shadow-2xl">
                        ${service.title}
                    </h3>
                </div>

                <div class="card-hover-content absolute inset-0 z-30 flex flex-col justify-end p-8 lg:p-12 gap-6 opacity-0 translate-y-8 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                    <div class="space-y-6">
                        <h3 class="font-black text-white text-4xl lg:text-5xl leading-[0.95] tracking-tighter">
                            ${service.title}
                        </h3>
                        <p class="text-base lg:text-lg font-medium leading-relaxed text-white/95 line-clamp-4">
                            ${service.description}
                        </p>
                        <div class="pt-2">
                            <div class="relative w-full flex items-center justify-between px-6 py-4 rounded-3xl font-bold text-sm bg-white/20 text-white border border-white/20 backdrop-blur-md transition-transform active:scale-95">
                                <span>Ver servicios</span>
                                <div class="w-8 h-8 rounded-full flex items-center justify-center bg-white/30">
                                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19 5h-14c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-12c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2v-4h2v4zm5 4h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </a>
        </div>
        `;
    })
    .join("");

  const items = carousel.querySelectorAll(".carousel-item");
  let currentPageIdx = -1;

  // Fluid UI Update Logic
  const updateUI = () => {
    const isDesktop = window.innerWidth >= 1024;
    const scrollLeft = carousel.scrollLeft;
    const carouselWidth = carousel.clientWidth;
    const maxScroll = carousel.scrollWidth - carouselWidth;

    let activePage;
    let totalPages;

    if (isDesktop) {
      totalPages = 2;
      activePage = scrollLeft > maxScroll / 2 ? 1 : 0;
    } else {
      totalPages = items.length;
      const itemWidth = items[0].offsetWidth + 24;
      activePage = Math.min(
        items.length - 1,
        Math.max(0, Math.round(scrollLeft / itemWidth)),
      );
    }

    if (activePage !== currentPageIdx) {
      currentPageIdx = activePage;

      dotsContainer.innerHTML = Array.from({ length: totalPages })
        .map(
          (_, i) => `
                <button class="carousel-dot h-2 rounded-full transition-all duration-300 ${i === activePage ? "bg-teal-600 w-8" : "bg-teal-600/20 w-2"}" data-page="${i}" aria-label="Page ${i + 1}"></button>
            `,
        )
        .join("");

      dotsContainer.querySelectorAll(".carousel-dot").forEach((dot, i) => {
        dot.onclick = () => {
          const target = isDesktop
            ? i === 0
              ? 0
              : maxScroll
            : i * (items[0].offsetWidth + 24);
          carousel.style.scrollBehavior = "smooth";
          carousel.scrollTo({ left: target });
        };
      });
    }

    // Active State & Mobile Reveal
    items.forEach((item, i) => {
      const card = item.querySelector(".service-card");
      if (!isDesktop) {
        const isActive = i === activePage;
        if (isActive) {
          card?.classList.add("active-card");
          item.style.opacity = "1";
          item.style.transform = "scale(1) translateZ(0)";
        } else {
          card?.classList.remove("active-card");
          // More subtle scale effect
          item.style.opacity = "0.5";
          item.style.transform = "scale(0.95) translateZ(0)";
        }
      } else {
        item.style.opacity = "1";
        item.style.transform = "scale(1) translateZ(0)";
        card?.classList.remove("active-card");
      }
    });
  };

  // --- Interaction Logic ---
  let isDown = false;
  let startX;
  let scrollLeftState;
  let draggedItemIdx = -1;

  const startDragging = (e) => {
    if (e.touches) return; // Allow native touch on mobile for best performance
    isDown = true;
    carousel.classList.add("grabbing");
    carousel.style.scrollSnapType = "none";
    carousel.style.scrollBehavior = "auto";

    startX = e.pageX - carousel.offsetLeft;
    scrollLeftState = carousel.scrollLeft;

    // Apply hover effect to current item on mobile during drag
    const isDesktop = window.innerWidth >= 1024;
    if (!isDesktop) {
      draggedItemIdx = currentPageIdx;
      const draggedCard = items[draggedItemIdx]?.querySelector(".service-card");
      draggedCard?.classList.add("active-card");
    }
  };

  const moveDragging = (e) => {
    if (!isDown) return;
    e.preventDefault();

    const x = e.pageX - carousel.offsetLeft;
    carousel.scrollLeft = scrollLeftState - (x - startX);
  };

  const stopDragging = () => {
    if (!isDown) return;
    isDown = false;
    carousel.classList.remove("grabbing");

    const isDesktop = window.innerWidth >= 1024;
    const itemWidth = items[0].offsetWidth + 24;
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    const currentScroll = carousel.scrollLeft;

    let target;

    if (isDesktop) {
      // Desktop: snap to one of two visible sections
      target = currentScroll > maxScroll / 2 ? maxScroll : 0;
    } else {
      // Mobile: determine next item based on current scroll position
      let currentIdx = Math.round(currentScroll / itemWidth);
      let nextIdx = currentIdx;

      // If user dragged significantly or has velocity, move to next/previous
      const distanceMoved = Math.abs(currentScroll - scrollLeftState);
      const threshold = itemWidth * 0.05; // Only 5% threshold for ultra-responsive

      if (distanceMoved > threshold) {
        // Determine direction and move one item
        nextIdx =
          currentScroll > scrollLeftState ? currentIdx + 1 : currentIdx - 1;
      }

      // Clamp to valid range
      nextIdx = Math.min(items.length - 1, Math.max(0, nextIdx));
      target = nextIdx * itemWidth;
    }

    // Fast smooth animation using requestAnimationFrame
    const startScroll = carousel.scrollLeft;
    const distance = target - startScroll;
    const duration = 150; // Ultra-fast animation: 150ms
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easing: cubic-bezier(0.34, 1.56, 0.64, 1)
      let easeProgress;
      if (progress < 0.5) {
        easeProgress = 2 * progress * progress;
      } else {
        easeProgress = -1 + (4 - 2 * progress) * progress;
      }

      carousel.scrollLeft = startScroll + distance * easeProgress;

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        // Ensure exact position
        carousel.scrollLeft = target;

        // Remove active class from previously dragged item
        if (draggedItemIdx >= 0) {
          const oldCard = items[draggedItemIdx]?.querySelector(".service-card");
          oldCard?.classList.remove("active-card");
          draggedItemIdx = -1;
        }

        // Re-enable snap
        carousel.style.scrollSnapType = "x mandatory";
        updateUI();
      }
    };

    requestAnimationFrame(animateScroll);
  };

  carousel.addEventListener("mousedown", startDragging);
  window.addEventListener("mousemove", moveDragging);
  window.addEventListener("mouseup", stopDragging);

  // High-performance scroll observer for UI sync
  carousel.addEventListener(
    "scroll",
    () => {
      requestAnimationFrame(updateUI);
    },
    { passive: true },
  );

  // Initial Trigger
  updateUI();
  window.addEventListener("resize", updateUI);
};
