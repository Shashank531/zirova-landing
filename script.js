// your code goes here/* ================================
   ZIROVA — Luxury Interaction Script
   Refined · Deliberate · Premium
   ================================ */

'use strict';

/* ─── CONFIG ─── */
const ZIROVA = {
  phone: '+917506847892',
  animStagger: 160,
  scrollOffset: 80,
};

/* ─── UTILITY ─── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─── 1. PAGE LOAD — Staggered Reveal ─── */
function initReveal() {
  const els = $$('.fade');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.delay ?? 0;
          setTimeout(() => {
            el.classList.add('fade--visible');
          }, Number(delay));
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.12 }
  );

  els.forEach((el, i) => {
    if (!el.dataset.delay) {
      el.dataset.delay = i * ZIROVA.animStagger;
    }
    observer.observe(el);
  });
}

/* ─── 2. SMOOTH SCROLL ─── */
function initSmoothScroll() {
  $$("a[href^='#']").forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const target = $(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top =
        target.getBoundingClientRect().top +
        window.scrollY -
        ZIROVA.scrollOffset;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ─── 3. COPY PHONE NUMBER ─── */
function copyNumber() {
  navigator.clipboard
    .writeText(ZIROVA.phone)
    .then(() => showToast('Number copied'))
    .catch(() => {
      const tmp = document.createElement('input');
      tmp.value = ZIROVA.phone;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand('copy');
      document.body.removeChild(tmp);
      showToast('Number copied');
    });
}

/* ─── 4. TOAST NOTIFICATION (replaces alert) ─── */
function showToast(message, duration = 2800) {
  const existing = $('.zirova-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'zirova-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;

  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '2rem',
    left: '50%',
    transform: 'translateX(-50%) translateY(12px)',
    background: 'rgba(18, 14, 10, 0.92)',
    color: '#c9b38a',
    padding: '0.75rem 1.75rem',
    borderRadius: '2px',
    fontSize: '0.75rem',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    border: '1px solid rgba(201,179,138,0.25)',
    backdropFilter: 'blur(12px)',
    zIndex: '9999',
    opacity: '0',
    transition: 'opacity 0.4s ease, transform 0.4s ease',
    pointerEvents: 'none',
  });

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(8px)';
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* ─── 5. HEADER SCROLL STATE ─── */
function initHeader() {
  const header = $('header') || $('.header') || $('.nav');
  if (!header) return;

  let lastScroll = 0;

  window.addEventListener(
    'scroll',
    () => {
      const current = window.scrollY;

      header.classList.toggle('header--scrolled', current > 60);

      if (current > 400) {
        header.classList.toggle('header--hidden', current > lastScroll);
      } else {
        header.classList.remove('header--hidden');
      }

      lastScroll = current;
    },
    { passive: true }
  );
}

/* ─── 6. PARALLAX (lightweight, opt-in) ─── */
function initParallax() {
  const els = $$('[data-parallax]');
  if (!els.length) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        els.forEach((el) => {
          const speed = parseFloat(el.dataset.parallax) || 0.3;
          el.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ─── 7. MARQUEE PAUSE ON HOVER ─── */
function initMarquee() {
  $$('.marquee, [data-marquee]').forEach((el) => {
    el.addEventListener('mouseenter', () => (el.style.animationPlayState = 'paused'));
    el.addEventListener('mouseleave', () => (el.style.animationPlayState = 'running'));
  });
}

/* ─── 8. MAGNETIC BUTTONS (subtle luxury pull) ─── */
function initMagnetic() {
  $$('[data-magnetic]').forEach((btn) => {
    btn.style.willChange = 'transform';
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      btn.style.transform = 'translate(0, 0)';
      setTimeout(() => (btn.style.transition = ''), 500);
    });
  });
}

/* ─── 9. CONSOLE EASTER EGG ─── */
function initConsole() {
  const gold = 'color: #c9b38a; font-weight: 300; letter-spacing: 0.2em;';
  const dim  = 'color: #5a4f3e; font-size: 10px; letter-spacing: 0.1em;';

  console.log('%cZ I R O V A', 'font-size: 22px; ' + gold);
  console.log('%cMinimal Luxury Jewellery', gold);
  console.log('%cPrivate Unveiling — Soon', dim);
  console.log('%c──────────────────────────', dim);
  console.log('%cYou have excellent taste.', dim);
}

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initSmoothScroll();
  initHeader();
  initParallax();
  initMarquee();
  initMagnetic();
  initConsole();
});

/* ─── EXPORTS (if using modules) ─── */
// export { copyNumber, showToast };

/* ─── GLOBAL EXPOSURE for inline HTML onclick="" ─── */
window.copyNumber = copyNumber;
window.showToast  = showToast;
