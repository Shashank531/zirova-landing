/* ================================
   ZIROVA — Luxury Interaction Script
   Refined · Deliberate · Premium
   ================================ */

'use strict';

/* ─── CONFIG ─── */
const ZIROVA = {
  phone: '+91XXXXXXXXXX',
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

  // Use IntersectionObserver for scroll-triggered reveals too
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
    // Assign stagger delay if not already set manually
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

/* ─── 3. CURSOR GLOW ─── */
function initCursorGlow() {
  const glow = $('.cursor-glow');
  if (!glow) return;

  let mouseX = -200, mouseY = -200;
  let currentX = -200, currentY = -200;
  let rafId;

  // Lerp for silky trailing motion
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function animate() {
    currentX = lerp(currentX, mouseX, 0.1);
    currentY = lerp(currentY, mouseY, 0.1);
    glow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
    rafId = requestAnimationFrame(animate);
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Pause when mouse leaves viewport
  document.addEventListener('mouseleave', () => cancelAnimationFrame(rafId));
  document.addEventListener('mouseenter', () => { rafId = requestAnimationFrame(animate); });

  // Scale on hover over interactive elements
  const interactiveEls = $$('a, button, [data-hover]');
  interactiveEls.forEach((el) => {
    el.addEventListener('mouseenter', () => glow.classList.add('cursor-glow--hover'));
    el.addEventListener('mouseleave', () => glow.classList.remove('cursor-glow--hover'));
  });

  rafId = requestAnimationFrame(animate);
}

/* ─── 4. COPY PHONE NUMBER ─── */
function copyNumber() {
  navigator.clipboard
    .writeText(ZIROVA.phone)
    .then(() => showToast('Number copied'))
    .catch(() => {
      // Fallback for older browsers
      const tmp = document.createElement('input');
      tmp.value = ZIROVA.phone;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand('copy');
      document.body.removeChild(tmp);
      showToast('Number copied');
    });
}

/* ─── 5. TOAST NOTIFICATION (replaces alert) ─── */
function showToast(message, duration = 2800) {
  // Remove existing toast if any
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

  // Trigger animation
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

/* ─── 6. HEADER SCROLL STATE ─── */
function initHeader() {
  const header = $('header') || $('.header') || $('.nav');
  if (!header) return;

  let lastScroll = 0;

  window.addEventListener(
    'scroll',
    () => {
      const current = window.scrollY;

      // Add scrolled class after 60px
      header.classList.toggle('header--scrolled', current > 60);

      // Hide on scroll down, reveal on scroll up (> 400px from top)
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

/* ─── 7. PARALLAX (lightweight, opt-in) ─── */
function initParallax() {
  const els = $$('[data-parallax]');
  if (!els.length) return;

  window.addEventListener(
    'scroll',
    () => {
      const scrollY = window.scrollY;
      els.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.3;
        el.style.transform = `translateY(${scrollY * speed}px)`;
      });
    },
    { passive: true }
  );
}

/* ─── 8. MARQUEE PAUSE ON HOVER ─── */
function initMarquee() {
  $$('.marquee, [data-marquee]').forEach((el) => {
    el.addEventListener('mouseenter', () => (el.style.animationPlayState = 'paused'));
    el.addEventListener('mouseleave', () => (el.style.animationPlayState = 'running'));
  });
}

/* ─── 9. MAGNETIC BUTTONS (subtle luxury pull) ─── */
function initMagnetic() {
  $$('[data-magnetic]').forEach((btn) => {
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

/* ─── 10. CONSOLE EASTER EGG ─── */
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
  initCursorGlow();
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
