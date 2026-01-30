import { initHeader, initBackground } from './modules/layout.js';
import { initTyping, initCards, initHandlers } from './modules/hero.js';
import { initServices } from './modules/services.js';
import { initChatbot } from './modules/chatbot.js';
import { initAbout } from './modules/about.js';
import { initSteps } from './modules/steps.js';
import { initFAQ } from './modules/faq.js';
import { initTestimonials } from './modules/testimonials.js';
import { initBenefits } from './modules/benefits.js';

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initBackground();
    initTyping();
    initCards();
    initHandlers();
    initServices();
    initChatbot();
    initAbout();
    initSteps();
    initFAQ();
    initTestimonials();
    initBenefits();
});
