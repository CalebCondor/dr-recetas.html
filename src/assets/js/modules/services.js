// Services Carousel Module - Swiper Version
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
      tag: cat.tag || cat.nombre,
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
  try {
    const carousel = document.getElementById("services-carousel");
    console.log("🔍 Carousel element:", carousel);
    if (!carousel) {
      console.error("❌ Carousel element not found");
      return;
    }

    const wrapper = carousel.querySelector(".swiper-wrapper");
    console.log("🔍 Wrapper element:", wrapper);
    if (!wrapper) {
      console.error("❌ Wrapper element not found");
      return;
    }

    wrapper.innerHTML =
      '<div style="width: 100%; text-align: center; padding: 40px; color: rgba(107, 114, 128, 0.6);">Cargando servicios...</div>';

    const servicesData = await getCategories();
    console.log("📊 Services data received:", servicesData);

    // Render Cards with Swiper structure
    wrapper.innerHTML = servicesData
      .map((service) => {
        const rawTag = service.tag || service.title || "servicio";
        const slug = encodeURIComponent(
          rawTag.trim().toLowerCase().replace(/\s+/g, "-"),
        );

        return `
        <div class="swiper-slide">
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
                  <div class="relative w-full flex items-center justify-between px-6 py-4 rounded-3xl font-bold text-sm bg-white/20 text-white border border-white/20 backdrop-blur-md transition-transform active:scale-95 mb-6">
                    <span>Ver servicios</span>
                    <div class="w-8 h-8 rounded-full flex items-center justify-center bg-white/30">
                      <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19 5h-14c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-12c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2v-4h2v4zm5 4h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
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

    // Initialize Swiper
    const swiper = new window.Swiper("#services-carousel", {
      slidesPerView: 1.1,
      spaceBetween: 16,
      grabCursor: true,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
        dynamicBullets: false,
      },
      breakpoints: {
        640: {
          slidesPerView: 2,
          spaceBetween: 20,
          centeredSlides: false,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 24,
          centeredSlides: false,
        },
      },
      observer: true,
      observeParents: true,
      on: {
        init: function () {
          // Update pagination on init
          updatePagination(this);
        },
        slideChange: function () {
          updatePagination(this);
        },
      },
    });

    function updatePagination(swiper) {
      const isDesktop = window.innerWidth >= 1024;
      const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;
      const bullets = document.querySelectorAll(".swiper-pagination-bullet");
      let totalPages = swiper.slides.length;

      // Calculate total pages based on slides per view
      if (isDesktop && swiper.slides.length > 3) {
        totalPages = Math.ceil((swiper.slides.length - 3) / 1) + 1;
      } else if (isTablet && swiper.slides.length > 2) {
        totalPages = Math.ceil((swiper.slides.length - 2) / 1) + 1;
      }

      // Show/hide bullets based on total pages
      bullets.forEach((bullet, index) => {
        bullet.style.display = index < totalPages ? "inline-block" : "none";
      });

      // Highlight the active bullet based on current slide
      const currentSlide = swiper.activeIndex;
      bullets.forEach((bullet, index) => {
        if (index === currentSlide) {
          bullet.classList.add("swiper-pagination-bullet-active");
        } else {
          bullet.classList.remove("swiper-pagination-bullet-active");
        }
      });

      // Mark the active slide to show hover effect automatically
      swiper.slides.forEach((slide, index) => {
        if (index === currentSlide) {
          slide.classList.add("active-card");
        } else {
          slide.classList.remove("active-card");
        }
      });
    }

    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        swiper.update();
        updatePagination(swiper);
      }, 150);
    });

    console.log("✅ Services carousel initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing services:", error);
  }
};
