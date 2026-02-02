// Testimonials Carousel Module - Swiper Version

export const initTestimonials = () => {
  const carousel = document.getElementById("testimonials-carousel");
  if (!carousel) return;

  // Initialize Swiper for testimonials carousel (mobile only)
  new window.Swiper("#testimonials-carousel", {
    slidesPerView: 1,
    spaceBetween: 24,
    grabCursor: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    autoplay: {
      delay: 4000,
      disableOnInteraction: true,
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 24,
      },
      768: {
        slidesPerView: "auto",
      },
    },
  });

  // Reveal animations for desktop testimonials
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    },
    { threshold: 0.1 },
  );

  document
    .querySelectorAll(".testimonial-reveal")
    .forEach((el) => observer.observe(el));
};
