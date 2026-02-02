const getMotion = () => window.Motion || window.motion || { animate: () => {} };

// --- API Logic ---

const getProductBySlug = async (slug) => {
  console.log(`🔍 Fetching product: ${slug}`);
  try {
    const res = await fetch(
      "https://doctorrecetas.com/v3/api.php?action=getServices",
      {
        cache: "no-store",
      },
    );

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    // The API returns { "Category Name": [items...] }
    const allData = await res.json();
    let foundProduct = null;

    Object.entries(allData).forEach(([categoryName, items]) => {
      // Try to find the item in this category
      const match = items.find((item) => {
        const itemSlug = item.slug?.trim().toLowerCase();
        const targetSlug = slug?.trim().toLowerCase();

        if (itemSlug === targetSlug) return true;
        try {
          if (decodeURIComponent(itemSlug) === decodeURIComponent(targetSlug))
            return true;
        } catch {}
        return false;
      });

      if (match) {
        foundProduct = { ...match, category: categoryName };
      }
    });

    return foundProduct;
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    return null;
  }
};

const getRelatedProducts = async (categoryName, currentSlug) => {
  try {
    const res = await fetch(
      "https://doctorrecetas.com/v3/api.php?action=getServices",
    );
    if (!res.ok) throw new Error("Failed to fetch services");

    const allData = await res.json();
    const categoryItems = allData[categoryName] || [];

    return categoryItems
      .filter((item) => item.slug !== currentSlug)
      .slice(0, 3) // Changed to 3 as per React code (slice(0,3) in render)
      .map((item) => ({ ...item, category: categoryName }));
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
};

// --- DOM Rendering Components ---

const renderIcons = (name, className = "w-5 h-5") => {
  // Simple SVG mapping for the icons used in React
  const icons = {
    shoppingBag: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
    info: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    listCheck: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg>`,
    stethoscope: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v6"/><path d="M16 15v6"/><circle cx="12" cy="23" r="1"/></svg>`, // Approximation
    doctor: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    home: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    arrowRight: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  };
  return icons[name] || "";
};

const renderRelatedCard = (item, idx, currentCategorySlug) => {
  // BENTO Card Logic from Previous implementation, adapted
  const colors = [
    "bg-white text-[#0D4B4D]",
    "bg-[#0D4B4D] text-white",
    "bg-[#B0E5CC] text-[#0D4B4D]",
  ];
  const colorClass = colors[idx % colors.length];
  const isDark = colorClass.includes("bg-[#0D4B4D]");
  const priceColor = isDark ? "text-white" : "text-[#0D4B4D]";
  const descColor = isDark ? "text-white/70" : "text-slate-600";

  // Use slug from item or fallback
  const itemSlug = item.slug || "";
  const categorySlug = currentCategorySlug || "servicios";

  return `
    <article class="h-[420px] rounded-[2.5rem] overflow-hidden relative group transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${colorClass} border border-black/5">
        <a href="/detalle?slug=${itemSlug}" class="block h-full w-full p-8 flex flex-col relative z-20">
            <div class="mb-4">
                <span class="inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black ${isDark ? "bg-white/20 text-white" : "bg-[#0D4B4D]/10 text-[#0D4B4D]"}">
                    ${item.category}
                </span>
            </div>
            
            <h3 class="text-2xl font-black leading-tight mb-3 line-clamp-2">
                ${item.titulo}
            </h3>
            
            <p class="text-sm font-medium leading-relaxed mb-8 line-clamp-3 ${descColor}">
                ${item.resumen}
            </p>
            
            <div class="mt-auto flex items-end justify-between">
                <div>
                     <span class="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 block mb-1">Precio</span>
                     <span class="text-3xl font-black tracking-tighter ${priceColor}">$${item.precio}</span>
                </div>
                <div class="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:rotate-12 ${isDark ? "bg-white text-[#0D4B4D]" : "bg-[#0D4B4D] text-white"}">
                     ${renderIcons("arrowRight", "w-5 h-5")}
                </div>
            </div>
        </a>
        <!-- Background Image Faded -->
        <div class="absolute inset-0 z-0 opacity-10 mix-blend-overlay pointer-events-none">
             ${item.imagen ? `<img src="${item.imagen}" class="w-full h-full object-cover grayscale" loading="lazy" />` : ""}
        </div>
    </article>
  `;
};

// --- Main Init Function ---

export const initProductDetail = async () => {
  const container = document.getElementById("product-detail-container");
  if (!container) return;

  // 1. Get Slug
  const params = new URLSearchParams(window.location.search);
  let itemSlug = params.get("slug");

  // Fallback logic for extraction if needed, similar to service-detail
  if (!itemSlug) {
    // ... potentially parse path ...
  }

  if (!itemSlug) {
    container.innerHTML = `
            <div class="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFD] space-y-4">
                <h1 class="text-2xl font-bold text-[#0D4B4D]">Producto no encontrado</h1>
                <p class="text-slate-500">No se especificó un servicio.</p>
                <a href="/" class="px-6 py-3 bg-[#0D4B4D] text-white rounded-full">Volver al inicio</a>
            </div>
        `;
    return;
  }

  // 2. Fetch Data
  const product = await getProductBySlug(itemSlug);

  if (!product) {
    container.innerHTML = `
            <div class="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFD] space-y-4">
                <h1 class="text-2xl font-bold text-[#0D4B4D]">Producto no encontrado</h1>
                <div class="bg-red-50 p-4 rounded text-red-600 font-mono text-xs max-w-lg">
                    Debug: Buscando slug ${itemSlug} en la API.
                </div>
                <p class="text-slate-500">Lo sentimos, no pudimos encontrar el servicio que buscas.</p>
                <a href="/" class="px-6 py-3 bg-[#0D4B4D] text-white rounded-full">Volver al inicio</a>
            </div>
        `;
    return;
  }

  const categorySlug = product.slug; // Assuming fallback or mapping
  const relatedProducts = await getRelatedProducts(
    product.category || "",
    product.slug,
  );

  // 3. Render Template

  // Helper for title splitting (coloring logic)
  const titleWords = product.titulo.split(" ");
  const titleHtml = titleWords
    .map(
      (word, i) =>
        `<span class="${i % 3 === 2 ? "text-teal-600/30" : ""}">${word} </span>`,
    )
    .join("");

  const html = `
    <article class="min-h-auto bg-[#F0F9F5] pt-32 pb-40 md:pb-20 relative overflow-visible">
        <div class="max-w-7xl mx-auto px-6 md:px-12 lg:px-8">
            <div class="grid grid-cols-1 gap-8 lg:gap-12 items-start">
            
                <!-- Header Info -->
                <div class="w-full animate-fade-in-up opacity-0" style="animation-delay: 0.1s; animation-fill-mode: forwards;">
                    <header class="space-y-6 max-h-none overflow-visible">
                        <div class="space-y-4">
                            <div class="flex items-center gap-2 text-[#0D4B4D]/40 font-black text-xs tracking-[0.2em] uppercase">
                                <span>${product.category || "Servicio Digital"}</span>
                                <span class="w-1 h-1 rounded-full bg-teal-500/30"></span>
                                <span>Dr. Recetas</span>
                            </div>
                            <h1 class="text-4xl md:text-5xl lg:text-5xl font-black text-[#0D4B4D] leading-[0.95] tracking-tighter">
                                ${titleHtml}
                            </h1>
                        </div>

                        <p class="text-slate-600 text-base md:text-lg font-medium leading-relaxed">
                            ${product.resumen}
                        </p>

                        <div id="main-buy-button-container" class="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-8 lg:pt-12 border-t border-[#0D4B4D]/10">
                            <div class="flex flex-col md:flex-row md:items-center gap-8 lg:gap-12">
                                <!-- Price -->
                                <div class="flex flex-col items-start gap-1">
                                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Precio</span>
                                    <div class="flex items-baseline gap-2">
                                        <span class="text-4xl md:text-5xl lg:text-6xl font-black text-[#0D4B4D] tracking-tighter">
                                            $${product.precio || "0.00"}
                                        </span>
                                        <span class="text-sm font-bold text-slate-400 uppercase tracking-widest">USD</span>
                                    </div>
                                </div>

                                <!-- Main Button -->
                                <button class="w-full md:w-[280px] lg:w-[320px] h-auto py-4 px-8 md:py-6 md:px-10 rounded-2xl lg:rounded-[1.5rem] bg-[#0D4B4D] hover:bg-[#126467] text-white font-black text-base md:text-xl transition-all shadow-xl hover:shadow-[0_20px_50px_rgba(13,75,77,0.25)] hover:-translate-y-1 active:scale-[0.98] group flex items-center justify-center gap-3">
                                    <span>Comprar</span>
                                    <div class="w-6 h-6 group-hover:rotate-12 transition-transform">
                                        ${renderIcons("shoppingBag", "w-full h-full")}
                                    </div>
                                </button>
                            </div>
                        </div>
                    </header>
                </div>

                <!-- Tabs (Desktop) & Accordion (Mobile) Container -->
                <div class="mt-6 lg:mt-16 border-t border-[#0D4B4D]/10 pt-8 animate-fade-in-up opacity-0" style="animation-delay: 0.3s; animation-fill-mode: forwards;">
                    
                    <!-- Desktop Tabs -->
                    <div class="hidden md:block">
                        <div class="w-full">
                            <!-- Tab Triggers -->
                            <div class="bg-[#0D4B4D]/5 p-1 rounded-[2rem] h-auto gap-1 mb-12 flex flex-wrap justify-start w-fit border border-[#0D4B4D]/10" role="tablist">
                                <button type="button" role="tab" aria-selected="true" aria-controls="panel-description" id="tab-description" class="tab-trigger px-8 py-3.5 rounded-full text-[#0D4B4D]/60 font-bold text-sm hover:text-[#0D4B4D] transition-all flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#0D4B4D] data-[state=active]:shadow-sm">
                                    ${renderIcons("info", "w-4 h-4")}
                                    Descripción
                                </button>
                                <button type="button" role="tab" aria-selected="false" aria-controls="panel-details" id="tab-details" class="tab-trigger px-8 py-3.5 rounded-full text-[#0D4B4D]/60 font-bold text-sm hover:text-[#0D4B4D] transition-all flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#0D4B4D] data-[state=active]:shadow-sm">
                                    ${renderIcons("listCheck", "w-4 h-4")}
                                    Ficha Técnica
                                </button>
                            </div>

                            <!-- Tab Content -->
                            <div class="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-12 border border-[#0D4B4D]/10 shadow-[0_20px_50px_rgba(13,75,77,0.05)] min-h-[300px]">
                                <div id="panel-description" role="tabpanel" aria-labelledby="tab-description" class="tab-content block animate-fade-in-fast">
                                     <h3 class="text-2xl font-black text-[#0D4B4D] mb-6 tracking-tight">Descripción Detallada</h3>
                                     <p class="text-slate-600 text-lg font-medium leading-relaxed whitespace-pre-line text-left">
                                        ${product.detalle || product.resumen}
                                     </p>
                                </div>
                                <div id="panel-details" role="tabpanel" aria-labelledby="tab-details" class="tab-content hidden animate-fade-in-fast">
                                     <div class="space-y-12">
                                        <div>
                                            <h3 class="text-2xl font-black text-[#0D4B4D] mb-8 tracking-tight">Especificaciones del Servicio</h3>
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                                                ${renderSpecItem("Servicio", product.titulo, "stethoscope")}
                                                ${renderSpecItem("Categoría", product.category || "General", "doctor")}
                                                ${renderSpecItem("Disponibilidad", "24/7 Online", "home")}
                                                ${renderSpecItem("Tiempo de respuesta", "Inmediato", "info")}
                                                ${renderSpecItem("Código", (product.pq_codigo || "N/A").toUpperCase(), "listCheck")}
                                                ${renderSpecItem("Gestión", "Soporte Prioritario", "listCheck")}
                                            </div>
                                        </div>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Mobile Accordion -->
                    <div class="md:hidden space-y-4">
                        <!-- Accordion Item 1 -->
                        <div class="accordion-item group border border-[#0D4B4D]/10 rounded-3xl bg-white/60 backdrop-blur-sm overflow-hidden transition-all duration-300" data-state="open">
                            <button class="accordion-trigger w-full px-6 py-5 flex items-center justify-between text-left">
                                <div class="flex items-center gap-4">
                                     <div class="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 transition-all icon-container">
                                        ${renderIcons("info", "w-6 h-6")}
                                     </div>
                                     <div class="flex flex-col gap-0.5">
                                        <span class="text-[#0D4B4D] font-black text-lg tracking-tight title-text">Detalle Ampliado</span>
                                        <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">¿De qué trata?</span>
                                     </div>
                                </div>
                            </button>
                            <div class="accordion-content px-6 pb-6 pt-0 block">
                                <p class="text-slate-600 font-medium leading-relaxed text-base">
                                    ${product.detalle || product.resumen}
                                </p>
                            </div>
                        </div>

                        <!-- Accordion Item 2 -->
                        <div class="accordion-item group border border-[#0D4B4D]/10 rounded-3xl bg-white/60 backdrop-blur-sm overflow-hidden transition-all duration-300" data-state="closed">
                            <button class="accordion-trigger w-full px-6 py-5 flex items-center justify-between text-left">
                                <div class="flex items-center gap-4">
                                     <div class="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 transition-all icon-container">
                                        ${renderIcons("listCheck", "w-6 h-6")}
                                     </div>
                                     <div class="flex flex-col gap-0.5">
                                        <span class="text-[#0D4B4D] font-black text-lg tracking-tight title-text">Ficha Técnica</span>
                                        <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Detalles y specs</span>
                                     </div>
                                </div>
                            </button>
                            <div class="accordion-content px-6 pb-6 pt-0 hidden">
                                <div class="space-y-4">
                                    ${[
                                      { l: "Servicio", v: product.titulo },
                                      {
                                        l: "Categoría",
                                        v: product.category || "General",
                                      },
                                      { l: "Disponibilidad", v: "24/7 Online" },
                                      { l: "Respuesta", v: "Inmediato" },
                                    ]
                                      .map(
                                        (i) => `
                                        <div class="flex flex-col gap-0.5 py-2 border-b border-slate-50 last:border-0">
                                            <span class="text-slate-400 font-bold uppercase text-[9px] tracking-widest">${i.l}</span>
                                            <span class="text-[#0D4B4D] font-black text-sm">${i.v}</span>
                                        </div>
                                    `,
                                      )
                                      .join("")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sticky Bottom Bar (Mobile) -->
        <div id="sticky-bottom-bar" class="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200/60 shadow-[0_-20px_60px_rgba(0,0,0,0.08)] px-4 py-4 md:hidden transition-transform duration-500 translate-y-[200px]">
            <div class="max-w-7xl mx-auto flex items-center justify-between gap-6">
                <div class="flex flex-col items-start min-w-fit">
                    <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Total a pagar</span>
                    <div class="flex items-baseline gap-1">
                        <span class="text-2xl font-black text-[#0D4B4D] tracking-tight">$${product.precio || "0.00"}</span>
                        <span class="hidden sm:inline-block text-[10px] font-bold text-slate-400">USD</span>
                    </div>
                </div>
                <button class="flex-1 max-w-[200px] h-auto py-2.5 rounded-xl bg-[#0D4B4D] hover:bg-[#126467] text-white font-bold text-sm transition-all shadow-md group flex items-center justify-center gap-2">
                    <span>Comprar</span>
                    <div class="w-4 h-4 group-hover:rotate-12 transition-transform">
                         ${renderIcons("shoppingBag", "w-full h-full")}
                    </div>
                </button>
            </div>
        </div>

    </article>

    ${
      relatedProducts.length > 0
        ? `
        <section class="bg-[#F0F9F5] pb-24">
            <div class="max-w-7xl mx-auto px-6 md:px-12 lg:px-8">
                <div class="mb-12 text-center">
                    <h2 class="text-3xl md:text-4xl font-black text-[#0D4B4D] tracking-tighter">Servicios Relacionados</h2>
                    <p class="text-slate-500 font-medium mt-2">Otros servicios en la categoría ${product.category} que podrían interesarte.</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${relatedProducts.map((p, idx) => renderRelatedCard(p, idx, categorySlug)).join("")}
                </div>
            </div>
        </section>
    `
        : ""
    }
    `;

  container.innerHTML = html;

  // 4. Initialize Interactions
  initTabs();
  initAccordion();
  initStickyBar();

  // Add animations styles if needed
  addStyles();
};

// --- Helper Components & Styles ---

function renderSpecItem(label, value, iconName) {
  return `
    <div class="group flex flex-col py-5 border-b border-[#0D4B4D]/10 hover:border-teal-200 transition-colors">
        <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#0D4B4D]/40 group-hover:bg-teal-50 group-hover:text-teal-600 transition-all shrink-0 mt-0.5">
                ${renderIcons(iconName, "w-5 h-5")}
            </div>
            <div class="flex-1 min-w-0 flex flex-col gap-1">
                <span class="text-slate-400 font-bold uppercase text-[9px] tracking-widest block">${label}</span>
                <span class="text-[#0D4B4D] font-black text-sm leading-snug break-words">${value}</span>
            </div>
        </div>
    </div>
    `;
}

function initTabs() {
  const triggers = document.querySelectorAll(".tab-trigger");
  const panels = document.querySelectorAll(".tab-content");

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const targetId = trigger.getAttribute("aria-controls");

      // Updates Triggers
      triggers.forEach((t) => {
        t.setAttribute("aria-selected", "false");
        t.setAttribute("data-state", "inactive");
      });
      trigger.setAttribute("aria-selected", "true");
      trigger.setAttribute("data-state", "active");

      // Update Panels
      panels.forEach((p) => {
        if (p.id === targetId) {
          p.classList.remove("hidden");
          p.classList.add("block");
        } else {
          p.classList.add("hidden");
          p.classList.remove("block");
        }
      });
    });
  });

  // Set initial state
  document.getElementById("tab-description")?.click();
}

function initAccordion() {
  const items = document.querySelectorAll(".accordion-item");

  items.forEach((item) => {
    const trigger = item.querySelector(".accordion-trigger");
    const content = item.querySelector(".accordion-content");

    trigger.addEventListener("click", () => {
      const isOpen = item.getAttribute("data-state") === "open";
      const newState = isOpen ? "closed" : "open";

      item.setAttribute("data-state", newState);

      // Visual logic
      if (newState === "open") {
        content.classList.remove("hidden");
        item.classList.add("shadow-lg", "border-teal-500/20");
        // Icon active state logic could go here
      } else {
        content.classList.add("hidden");
        item.classList.remove("shadow-lg", "border-teal-500/20");
      }
    });
  });
}

function initStickyBar() {
  const mainBtn = document.getElementById("main-buy-button-container");
  const stickyBar = document.getElementById("sticky-bottom-bar");

  if (!mainBtn || !stickyBar) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // If main button is NOT intersecting (scrolled past), show sticky bar
        // Actually logic is: if main button is visible, hide sticky bar.
        if (entry.isIntersecting) {
          stickyBar.classList.add("translate-y-[200px]");
        } else {
          stickyBar.classList.remove("translate-y-[200px]");
        }
      });
    },
    {
      rootMargin: "0px 0px -100px 0px",
    },
  );

  observer.observe(mainBtn);
}

function addStyles() {
  const styleId = "product-detail-styles";
  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out;
        }
         @keyframes fade-in-fast {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-fast {
            animation: fade-in-fast 0.4s ease-out;
        }
    `;
  document.head.appendChild(style);
}
