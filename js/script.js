'use strict';

const header = document.querySelector('.header');
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav');
const navigationLinks = document.querySelectorAll('.nav a');
const revealElements = document.querySelectorAll('.reveal');
const currentYear = document.querySelector('#current-year');
const lightbox = document.querySelector('#lightbox');
const lightboxImage = lightbox?.querySelector('img');
const lightboxClose = lightbox?.querySelector('.lightbox__close');
const lightboxTriggers = document.querySelectorAll('.lightbox-trigger');

function updateHeaderState() {
  header?.classList.toggle('is-scrolled', window.scrollY > 12);
}

function closeMenu() {
  if (!menuToggle || !navigation) return;

  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu de navegação');
  navigation.classList.remove('is-open');
  document.body.classList.remove('menu-open');
}

function toggleMenu() {
  if (!menuToggle || !navigation) return;

  const willOpen = menuToggle.getAttribute('aria-expanded') !== 'true';

  menuToggle.setAttribute('aria-expanded', String(willOpen));
  menuToggle.setAttribute(
    'aria-label',
    willOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'
  );
  navigation.classList.toggle('is-open', willOpen);
  document.body.classList.toggle('menu-open', willOpen);
}

function setupRevealAnimation() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function setupActiveNavigation() {
  if (!('IntersectionObserver' in window)) return;

  const sections = [...navigationLinks]
    .map((link) => {
      const target = document.querySelector(link.getAttribute('href'));
      return target ? { link, target } : null;
    })
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navigationLinks.forEach((link) => link.classList.remove('is-active'));
        const current = sections.find(({ target }) => target === entry.target);
        current?.link.classList.add('is-active');
      });
    },
    {
      threshold: 0.18,
      rootMargin: '-20% 0px -65% 0px'
    }
  );

  sections.forEach(({ target }) => observer.observe(target));
}

function openLightbox(trigger) {
  if (!lightbox || !lightboxImage) return;

  const imageSource = trigger.dataset.image;
  const imageAlt = trigger.dataset.alt || 'Armação ampliada';

  lightboxImage.src = imageSource;
  lightboxImage.alt = imageAlt;

  if (typeof lightbox.showModal === 'function') {
    lightbox.showModal();
  }
}

function closeLightbox() {
  if (!lightbox?.open) return;
  lightbox.close();
}

menuToggle?.addEventListener('click', toggleMenu);

navigationLinks.forEach((link) => {
  link.addEventListener('click', closeMenu);
});

window.addEventListener('scroll', updateHeaderState, { passive: true });
window.addEventListener('resize', () => {
  if (window.innerWidth > 860) closeMenu();
});

lightboxTriggers.forEach((trigger) => {
  trigger.addEventListener('click', () => openLightbox(trigger));
});

lightboxClose?.addEventListener('click', closeLightbox);

lightbox?.addEventListener('click', (event) => {
  const dialogBounds = lightbox.getBoundingClientRect();
  const clickIsOutside =
    event.clientX < dialogBounds.left ||
    event.clientX > dialogBounds.right ||
    event.clientY < dialogBounds.top ||
    event.clientY > dialogBounds.bottom;

  if (clickIsOutside) closeLightbox();
});

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

updateHeaderState();
setupRevealAnimation();
setupActiveNavigation();
