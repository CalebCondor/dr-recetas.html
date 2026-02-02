const getMotion = () => window.Motion || window.motion || { animate: () => {} };

// --- API & Data Logic (Ported from useServiceDetails) ---

const fetchServiceData = async (slug) => {
  try {
    const [servicesRes, catsRes] = await Promise.all([
      fetch("https://doctorrecetas.com/v3/api.php?action=getServices"),
      fetch("https://doctorrecetas.com/v3/api_categorias.php"),
    ]);

    if (!servicesRes.ok || !catsRes.ok) throw new Error("Fetch failed");

    const allData = await servicesRes.json(); // { categoryName: [items...] }
    const categories = await catsRes.json();

    return { allData, categories };
  } catch (e) {
    console.error(e);
    return null;
  }
};

const getServiceInfo = (slug, categories) => {
  // Special case for 'otros'
  if (slug === "otros") {
    return {
      id: "otros",
      slug: "otros",
      title: "Otros Servicios",
      description:
        "Explora nuestra amplia gama de servicios médicos adicionales.",
      longDescription:
        "En Doctor Recetas ofrecemos una variedad de servicios complementarios para cubrir todas tus necesidades de salud.",
      imageSrc: "/citas-medicas/1.png",
      apiTag: "ALL",
    };
  }

  // Match by tag-slug or name-slug
  const catMatch = categories.find((c) => {
    const tagSlug = (c.tag || "").toLowerCase().replace(/\s+/g, "-");
    const nameSlug = (c.nombre || "").toLowerCase().replace(/\s+/g, "-");

    return tagSlug === slug || nameSlug === slug;
  });

  if (catMatch) {
    return {
      id: catMatch.id,
      slug: slug,
      title: catMatch.nombre,
      description: catMatch.lead,
      longDescription: catMatch.lead,
      imageSrc: catMatch.imagen,
      apiTag: catMatch.tag,
    };
  }
  return null;
};

const getRelevantItems = (slug, serviceInfo, allData) => {
  let relevantItems = [];
  const flattenedItems = [];

  // Flatten all items
  Object.entries(allData).forEach(([catName, items]) => {
    items.forEach((item) =>
      flattenedItems.push({ ...item, category: catName }),
    );
  });

  if (slug === "otros") {
    return flattenedItems;
  }

  if (serviceInfo) {
    // 1. Try strict tag match
    if (serviceInfo.apiTag) {
      const targetTag = serviceInfo.apiTag.toLowerCase();
      const tagItems = flattenedItems.filter((item) => {
        const itemTags =
          item.pq_tag?.split(",").map((t) => t.trim().toLowerCase()) || [];
        return itemTags.includes(targetTag);
      });
      if (tagItems.length > 0) return tagItems;
    }

    // 2. Try Category Name match
    const catItems = flattenedItems.filter(
      (item) =>
        item.category?.toLowerCase() === serviceInfo.title.toLowerCase(),
    );
    if (catItems.length > 0) return catItems;

    // 3. Try Title/Slug fuzzy match
    relevantItems = flattenedItems.filter(
      (item) =>
        item.titulo.toLowerCase().includes(serviceInfo.title.toLowerCase()) ||
        item.slug.includes(slug),
    );
  }

  // Return what we found (even if empty), DO NOT fall back to random "All" category unless explicitly requested
  return relevantItems;
};

// --- grid Logic (Ported from React component) ---
const calculateGridClasses = (items) => {
  const gridClasses = [];
  // 200 rows, 3 cols
  const slots = Array.from({ length: 200 }, () => [false, false, false]);

  items.forEach((_, i) => {
    const isLast = i === items.length - 1;
    const cSpan = i % 3 === 0 ? 2 : 1;
    let rSpan = 1;

    // Randomly make some small ones tall
    if (cSpan === 1 && i % 4 === 0 && i < items.length - 2) {
      rSpan = 2;
    }

    let placed = false;
    // Find fit
    for (let r = 0; r < 200 && !placed; r++) {
      for (let c = 0; c < 3 && !placed; c++) {
        if (!slots[r][c]) {
          let actualCSpan = Math.min(cSpan, 3 - c);
          if (isLast) actualCSpan = 3 - c;

          // Check vertical fit
          const canFitVertical =
            rSpan === 1 || (r + 1 < 200 && !slots[r + 1][c]);
          const finalRSpan = canFitVertical ? rSpan : 1;

          // Mark slots
          for (let dr = 0; dr < finalRSpan; dr++) {
            for (let dc = 0; dc < actualCSpan; dc++) {
              if (slots[r + dr] && slots[r + dr][c + dc] !== undefined) {
                slots[r + dr][c + dc] = true;
              }
            }
          }

          const colClass =
            actualCSpan === 1
              ? "md:col-span-1"
              : actualCSpan === 2
                ? "md:col-span-2"
                : "md:col-span-3";
          const rowClass = finalRSpan === 1 ? "md:row-span-1" : "md:row-span-2";

          gridClasses.push(`${colClass} ${rowClass}`);
          placed = true;
        }
      }
    }
    if (!placed) gridClasses.push("md:col-span-3 md:row-span-1"); // Fallback
  });
  return gridClasses;
};

// --- DOM Rendering ---

const renderCard = (item, idx, className, slug) => {
  // Colors logic
  const cardColors = [
    "bg-white text-[#0D4B4D] border-white/40",
    "bg-[#0D4B4D] text-white border-white/10",
    "bg-[#B0E5CC] text-[#0D4B4D] border-white/40",
    "bg-[#F8FAFC] text-slate-900 border-white/40",
    "bg-[#1E293B] text-white border-white/10",
    "bg-[#E0F2F1] text-teal-900 border-white/40",
  ];
  const currentBg = cardColors[idx % cardColors.length];
  const isDark =
    currentBg.includes("text-white") ||
    currentBg.includes("bg-[#0D4B4D]") ||
    currentBg.includes("bg-[#1E293B]");

  const categoryTag = item.category || "Servicio";

  return `
    <div class="${className} h-full opacity-0 scale-90 will-change-transform" id="item-${idx}">
        <a href="/servicios/${slug}/${item.slug}" class="group relative rounded-[3rem] overflow-hidden ${currentBg} h-full flex flex-col p-8 md:p-12 transition-all duration-700 shadow-[0_10px_40px_rgba(0,0,0,0.05)] hover:shadow-[0_45px_90px_rgba(13,75,77,0.15)] border backdrop-blur-md block">
            
            <!-- Shine Effect -->
            <div class="absolute inset-0 transition-opacity duration-1000 pointer-events-none opacity-0 group-hover:opacity-100">
                <div class="absolute inset-x-0 -top-full bottom-0 bg-gradient-to-b from-white/20 via-transparent to-transparent rotate-45 translate-x-full group-hover:animate-[shine_1.5s_ease-in-out_infinite] transition-transform duration-1000"></div>
            </div>

            <!-- BG Image -->
             <div class="absolute inset-0 z-0 transition-transform duration-700">
                <div class="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-700 ease-out group-hover:scale-110 grayscale-0" style="background-image: url('${item.imagen || ""}')"></div>
                <div class="absolute inset-0 transition-opacity duration-500 ${isDark ? "bg-gradient-to-t from-black/95 via-black/40 to-black/20" : "bg-gradient-to-t from-white/95 via-white/40 to-white/20"}"></div>
             </div>

             <!-- Content -->
             <div class="relative z-20 space-y-4 transition-transform duration-500 mb-6 w-full lg:max-w-[85%]">
                <div class="inline-block px-3 py-1.5 rounded-full border backdrop-blur-md uppercase font-black text-[10px] tracking-widest pointer-events-none md:hidden ${isDark ? "bg-white/10 text-white/90 border-white/10" : "bg-black/5 text-slate-900/60 border-black/10"}">
                    ${categoryTag}
                </div>
                
                <div class="space-y-3">
                    <h3 class="text-xl md:text-3xl font-black leading-tight tracking-tight line-clamp-2 overflow-hidden">
                        ${item.titulo}
                    </h3>
                    <p class="text-sm md:text-base leading-relaxed line-clamp-3 md:line-clamp-4 overflow-hidden font-medium ${isDark ? "text-white/70" : "text-slate-600"}">
                        ${item.resumen || item.detalle || item.titulo}
                    </p>
                </div>
             </div>

             <!-- Price -->
             <div class="mt-auto relative z-20">
                ${
                  item.precio
                    ? `
                <div class="flex flex-col">
                    <span class="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-40 ${isDark ? "text-white" : "text-[#0D4B4D]"}">Precio base</span>
                    <div class="text-3xl md:text-4xl font-black leading-none tracking-tighter">$${item.precio}</div>
                </div>`
                    : ""
                }
             </div>

             <!-- Category Tag Desktop -->
             <div class="absolute top-8 right-8 z-10 px-3 py-1.5 rounded-full border backdrop-blur-md uppercase font-black text-[10px] tracking-widest pointer-events-none transition-all duration-500 hidden md:block ${isDark ? "bg-white/10 text-white/90 border-white/10" : "bg-black/5 text-slate-900/60 border-black/10"} opacity-40 group-hover:opacity-100">
                ${categoryTag}
             </div>

             <!-- Arrow Button -->
             <div class="absolute bottom-8 right-8 z-20">
                <div class="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${isDark ? "bg-white text-[#0D4B4D]" : "bg-[#0D4B4D] text-white"} group-hover:scale-110 group-hover:rotate-6">
                    <svg class="w-6 h-6 md:w-8 md:h-8 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
             </div>
        </a>
    </div>
    `;
};

// --- Other Services Carousel ---
const renderOtherServices = (categories, currentSlug) => {
  if (!categories || !Array.isArray(categories)) return "";

  // Filter to remove current category
  const filtered = categories
    .filter((c) => {
      const itemSlug = (c.nombre || c.tag || "otros")
        .toLowerCase()
        .replace(/\s+/g, "-");
      return itemSlug !== currentSlug;
    })
    .slice(0, 12);

  if (filtered.length === 0) return "";

  const carouselId = `carousel-${Math.random().toString(36).substring(2, 11)}`;

  return `
    <section class="w-full py-20 bg-transparent relative overflow-hidden">
        <div class="w-full px-6 md:px-12 lg:px-[8%]">
            <div class="flex justify-center mb-16 px-2">
                <div class="space-y-4 text-center">
                    <h2 class="text-4xl md:text-5xl lg:text-7xl font-extrabold text-[#0D4B4D] tracking-tighter leading-none">
                        Explora más Categorías
                    </h2>
                    <p class="text-teal-900/60 font-medium text-lg">
                        Descubre todos nuestros servicios
                    </p>
                </div>
            </div>

            <!-- Carousel Container -->
            <div class="relative group/carousel">
                <div id="${carouselId}" class="carousel-container flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 pb-8" style="scroll-behavior: smooth;">
                    ${filtered
                      .map((cat, index) => {
                        const slug = (cat.nombre || cat.tag || "otros")
                          .toLowerCase()
                          .replace(/\s+/g, "-");
                        return `
                        <div class="carousel-item flex-none w-[85%] md:w-[350px] snap-center px-4" data-index="${index}">
                            <a href="/servicio?slug=${encodeURIComponent(slug)}" class="service-card group relative block overflow-hidden rounded-[2.5rem] cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-sm w-full h-[460px]">
                                <div class="card-image absolute inset-0 z-0">
                                    <img src="${cat.imagen}" alt="${cat.nombre}" class="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75" loading="lazy">
                                </div>
                                <div class="card-overlay absolute inset-0 z-10 opacity-30 bg-black transition-all duration-500 group-hover:opacity-50 group-hover:backdrop-blur-[2px]"></div>

                                <div class="card-initial absolute inset-x-0 bottom-0 p-8 lg:p-10 z-20 pointer-events-none transition-all duration-500 group-hover:opacity-0 group-hover:-translate-y-4">
                                    <h3 class="font-black text-white text-3xl leading-tight tracking-tight drop-shadow-2xl">
                                        ${cat.nombre}
                                    </h3>
                                </div>

                                <div class="card-hover-content absolute inset-0 z-30 flex flex-col justify-end p-8 lg:p-10 gap-6 opacity-0 translate-y-8 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                                    <div class="space-y-4">
                                        <h3 class="font-black text-white text-3xl lg:text-4xl leading-[0.95] tracking-tighter">
                                            ${cat.nombre}
                                        </h3>
                                        <p class="text-base font-medium leading-relaxed text-white/95 line-clamp-4">
                                            ${cat.lead || ""}
                                        </p>
                                        <div class="pt-2">
                                            <div class="relative w-full flex items-center justify-between px-6 py-3 rounded-full font-bold text-sm bg-white/20 text-white border border-white/20 backdrop-blur-md transition-transform active:scale-95">
                                                <span>Ver categoría</span>
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
                      .join("")}
                </div>

                <!-- Dots Navigation -->
                <div id="carousel-dots-${carouselId}" class="flex justify-center gap-3 mt-4">
                </div>
            </div>
        </div>

        <!-- Carousel Logic Script -->
        <script>
            (function() {
                const carousel = document.getElementById('${carouselId}');
                const dotsContainer = document.getElementById('carousel-dots-${carouselId}');
                if (!carousel || !dotsContainer) return;

                const items = carousel.querySelectorAll('.carousel-item');
                let currentIndex = 0;

                const updateDots = () => {
                    const totalDots = items.length;
                     // Only show dots if there are items
                    if (totalDots === 0) return;

                    dotsContainer.innerHTML = Array.from({ length: totalDots }).map((_, i) => \`
                        <button class="transition-all duration-500 h-2 rounded-full \${i === currentIndex ? 'bg-[#0D4B4D] w-8' : 'bg-[#0D4B4D]/20 w-2'}" data-index="\${i}" aria-label="Ver servicio \${i + 1}"></button>
                    \`).join("");

                    dotsContainer.querySelectorAll('button').forEach(dot => {
                        dot.onclick = () => {
                            const targetIdx = parseInt(dot.dataset.index);
                            scrollToIndex(targetIdx);
                        };
                    });
                };

                 const scrollToIndex = (index) => {
                    const itemWidth = items[0].offsetWidth; // Approximate width including gap
                    // For better precision we can calculate specifically
                    const left = items[index].offsetLeft - carousel.offsetLeft - (window.innerWidth - items[index].offsetWidth)/2 + 16; 
                    
                    carousel.scrollTo({
                        left: items[index].offsetLeft - (carousel.clientWidth - items[index].clientWidth) / 2, // Center the item
                        behavior: 'smooth'
                    });
                };

                const updateUI = () => {
                     // Find the center item
                    const centerPoint = carousel.scrollLeft + (carousel.clientWidth / 2);
                    
                    let bestCandidate = 0;
                    let minDistance = Infinity;

                    items.forEach((item, i) => {
                        const itemCenter = item.offsetLeft + (item.clientWidth / 2) - carousel.offsetLeft; // Adjust for carousel offset
                        const dist = Math.abs(centerPoint - itemCenter);
                        
                        if (dist < minDistance) {
                            minDistance = dist;
                            bestCandidate = i;
                        }
                    });

                    if (currentIndex !== bestCandidate) {
                        currentIndex = bestCandidate;
                        updateDots();
                        
                        // Optional: Add active class for scaling like testimonials if desired
                        items.forEach((item, idx) => {
                             const card = item.querySelector('.service-card');
                             if (idx === currentIndex && window.innerWidth < 768) {
                                  card.classList.add('active-card');
                                  item.style.opacity = '1';
                                  item.style.transform = 'scale(1)';
                             } else if (window.innerWidth < 768) {
                                  card.classList.remove('active-card');
                                  item.style.opacity = '0.7';
                                  item.style.transform = 'scale(0.95)';
                             } else {
                                  // Desktop reset
                                  item.style.opacity = '1';
                                  item.style.transform = 'scale(1)';
                             }
                        });
                    }
                };

                // Listen for scroll
                carousel.addEventListener('scroll', () => {
                   requestAnimationFrame(updateUI); 
                }, { passive: true });

                updateUI(); // Initial call
                updateDots();
                
                // Add CSS for active card transition scaling
                const itemStyle = items[0]?.style;
                if(itemStyle) {
                    items.forEach(item => {
                        item.style.transition = 'all 0.4s ease';
                    });
                }
            })();
        </script>
    </section>
    `;
};

export const initServiceDetail = async () => {
  const container = document.getElementById("service-page-container");
  const params = new URLSearchParams(window.location.search);
  let slug = params.get("slug");

  // PATHNAME SUPPORT: Extract from /servicios/slug
  if (!slug) {
    const pathMatch = window.location.pathname.match(/\/servicios\/([^/]+)/);
    if (pathMatch && pathMatch[1]) {
      slug = decodeURIComponent(pathMatch[1]);
      console.log(`Extracted slug from path: ${slug}`);
    }
  }

  // Backup: Check LocalStorage if URL failed
  if (!slug) {
    const storedSlug = localStorage.getItem("currentServiceSlug");
    if (storedSlug) {
      slug = storedSlug;
      // Restore URL
      const newUrl = new URL(window.location);
      newUrl.searchParams.set("slug", slug);
      window.history.replaceState({}, "", newUrl);
    }
  }

  if (slug) {
    slug = slug.trim().toLowerCase();
    // Clear for next time, but keep in URL
    localStorage.removeItem("currentServiceSlug");
  }

  if (!slug) {
    console.warn('No slug provided, defaulting to "otros"');
    slug = "otros";
  }

  const data = await fetchServiceData(slug);

  if (!data) {
    container.innerHTML = `<div class="p-20 text-center text-xl text-gray-400">Error cargando servicio</div>`;
    return;
  }

  const { categories, allData } = data;
  const serviceInfo = getServiceInfo(slug, categories);
  const apiItems = getRelevantItems(slug, serviceInfo, allData);

  if (!serviceInfo) {
    container.innerHTML = `<div class="p-20 text-center text-xl text-gray-400">Servicio no encontrado</div>`;
    return;
  }

  // --- Render Main Content ---
  let html = `
    <!-- Header Section -->
    <div class="relative mb-12 overflow-hidden">
         <!-- BG Decor -->
         <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-[#E0F3F1]/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
         <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#EEF5F4]/50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

         <div class="container mx-auto px-6 text-center relative z-10 pt-12">
             <div class="inline-block mb-6 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-100/50 text-teal-700 text-sm font-bold tracking-wide uppercase opacity-0 animate-fade-in-up" style="animation-delay: 0.1s; animation-fill-mode: forwards;">
                Nuestros Servicios
             </div>
             <h1 class="text-5xl md:text-6xl lg:text-8xl font-black text-[#0D4B4D] mb-8 tracking-tighter leading-[0.9] opacity-0 animate-fade-in-up" style="animation-delay: 0.2s; animation-fill-mode: forwards;">
                ${serviceInfo.title}
             </h1>
             <p class="text-teal-900/60 text-lg md:text-2xl font-medium leading-relaxed max-w-3xl mx-auto opacity-0 animate-fade-in-up" style="animation-delay: 0.3s; animation-fill-mode: forwards;">
                ${serviceInfo.longDescription || serviceInfo.description}
             </p>
         </div>
    </div>

    <!-- Loading / Grid Container -->
    <div class="container mx-auto px-4 md:px-6 mb-16 relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[340px] grid-flow-dense" id="bento-grid">
            <!-- Items injected here -->
        </div>
        
        <div id="load-more-container" class="mt-16 text-center hidden">
             <button id="btn-load-more" class="px-10 py-4 bg-[#0D4B4D] text-white rounded-full font-bold text-lg shadow-xl hover:bg-[#0E6063] hover:scale-105 transition-all">
              Ver más opciones
            </button>
        </div>
    </div>

    ${renderOtherServices(categories, slug)}
    `;

  container.innerHTML = html;

  // --- Render Grid Items ---
  const gridContainer = container.querySelector("#bento-grid");
  const loadMoreBtn = document.getElementById("btn-load-more");
  const loadMoreContainer = document.getElementById("load-more-container");

  if (!gridContainer) {
    console.error(
      "CRITICAL: #bento-grid not found in container!",
      container.innerHTML,
    );
    return;
  }

  const ITEMS_PER_PAGE = 4;
  let visibleCount = ITEMS_PER_PAGE;

  const renderItems = () => {
    if (!gridContainer) return;

    if (apiItems.length === 0) {
      gridContainer.innerHTML = `
                <div class="col-span-1 md:col-span-3 text-center py-20">
                    <p class="text-xl text-teal-800/60 font-medium">No hay servicios disponibles en esta categoría por el momento.</p>
                    <a href="/" class="mt-4 inline-block text-teal-600 font-bold hover:underline">Volver al inicio</a>
                </div>
            `;
      if (loadMoreContainer) loadMoreContainer.classList.add("hidden");
      return;
    }

    const visibleItems = apiItems.slice(0, visibleCount);
    const gridClasses = calculateGridClasses(visibleItems);

    const itemsHtml = visibleItems
      .map((item, i) => renderCard(item, i, gridClasses[i], slug))
      .join("");
    gridContainer.innerHTML = itemsHtml;

    // Animate them in
    visibleItems.forEach((_, i) => {
      const el = document.getElementById(`item-${i}`);
      if (el)
        getMotion().animate(
          el,
          { opacity: 1, scale: 1 },
          { delay: i * 0.05, duration: 0.5 },
        );
    });

    if (loadMoreContainer) {
      if (visibleCount < apiItems.length) {
        loadMoreContainer.classList.remove("hidden");
      } else {
        loadMoreContainer.classList.add("hidden");
      }
    }
  };

  renderItems();

  if (loadMoreBtn) {
    loadMoreBtn.onclick = () => {
      visibleCount += ITEMS_PER_PAGE;
      renderItems();
    };
  }

  // Simple custom CSS for animations
  const style = document.createElement("style");
  style.innerHTML = `
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .grabbing {
            cursor: grabbing !important;
            user-select: none;
        }
    `;
  document.head.appendChild(style);
};
