/**
 * ZIROVA — Premium Diwali Catalogue Viewer Engine
 * Continuous high-resolution page stream with interactive zoom,
 * back/forth page jump, live page counter, fullscreen & minimize,
 * new tab, download, and keyboard navigation.
 */

(function () {
  'use strict';

  // State
  let currentPage = 1;
  let zoomPercent = 100;
  let isFullscreen = false;

  // DOM Elements
  const pagesStream = document.getElementById('pages-stream');
  const curPageInput = document.getElementById('cur-page-num');
  const totalPagesSpan = document.getElementById('total-pages-count');
  const zoomLevelSpan = document.getElementById('zoom-level');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const fsLabel = document.getElementById('fs-label');
  const prevPageBtn = document.getElementById('prev-page-btn');
  const nextPageBtn = document.getElementById('next-page-btn');
  const zoomInBtn = document.getElementById('zoom-in-btn');
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  const zoomResetBtn = document.getElementById('zoom-reset-btn');

  // Config from body data attributes
  const pdfSrc = document.body.dataset.pdfSrc;
  const pdfTitle = document.body.dataset.pdfTitle || 'Catalogue';
  const totalPages = parseInt(document.body.dataset.expectedPages || '1', 10);
  const pagesDir = document.body.dataset.pagesDir;

  if (!pagesDir) {
    console.error('No pages directory specified.');
    return;
  }

  // Set total pages count in header
  if (totalPagesSpan) {
    totalPagesSpan.textContent = totalPages;
  }

  // Build Continuous Page Cards Stream
  function buildPageStream() {
    if (!pagesStream) return;
    pagesStream.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
      const card = document.createElement('article');
      card.className = 'cat-page-card';
      card.id = `page-card-${i}`;
      card.dataset.pageNum = i;

      const img = document.createElement('img');
      img.src = `${pagesDir}/page_${i}.jpg`;
      img.alt = `${pdfTitle} — Page ${i}`;
      // Load first 2 pages immediately, lazy load the rest for smooth performance
      img.loading = i <= 2 ? 'eager' : 'lazy';
      img.decoding = 'async';
      card.appendChild(img);

      const tag = document.createElement('span');
      tag.className = 'cat-page-num-tag';
      tag.textContent = `Page ${i} of ${totalPages}`;
      card.appendChild(tag);

      pagesStream.appendChild(card);
    }

    setupScrollObserver();
  }

  // Intersection Observer to track current visible page
  let scrollObserver = null;
  function setupScrollObserver() {
    if (scrollObserver) scrollObserver.disconnect();

    scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNum = parseInt(entry.target.dataset.pageNum, 10);
            currentPage = pageNum;
            if (curPageInput) curPageInput.value = pageNum;

            document.querySelectorAll('.cat-page-card').forEach((c) => {
              c.classList.remove('active-page');
            });
            entry.target.classList.add('active-page');
          }
        });
      },
      {
        root: null,
        rootMargin: '-20% 0px -55% 0px',
        threshold: 0
      }
    );

    document.querySelectorAll('.cat-page-card').forEach((card) => {
      scrollObserver.observe(card);
    });
  }

  // Page Navigation (Back & Forth)
  function goToPage(num) {
    const target = Math.max(1, Math.min(totalPages, num));
    currentPage = target;
    if (curPageInput) curPageInput.value = currentPage;

    const targetCard = document.getElementById(`page-card-${currentPage}`);
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function nextPage() {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }

  // Zoom Controls (Scales up to 200% max, exact 10% increments)
  const BASE_PAGE_WIDTH = 1200;

  function updatePageStreamWidth() {
    if (!pagesStream) return;
    const targetWidth = Math.round(BASE_PAGE_WIDTH * (zoomPercent / 100));
    if (zoomPercent <= 100) {
      pagesStream.style.width = `${targetWidth}px`;
      pagesStream.style.maxWidth = '100%';
    } else {
      pagesStream.style.width = `${targetWidth}px`;
      pagesStream.style.maxWidth = 'none';
    }
  }

  function applyZoom(deltaPercent) {
    const targetPercent = zoomPercent + deltaPercent;
    // Cap strictly at 200% maximum, and 50% minimum
    const clampedPercent = Math.min(200, Math.max(50, targetPercent));
    zoomPercent = Math.round(clampedPercent / 10) * 10;

    if (zoomLevelSpan) {
      zoomLevelSpan.textContent = `${zoomPercent}%`;
    }

    updatePageStreamWidth();

    // Visual feedback for min/max
    if (zoomInBtn) {
      zoomInBtn.title = zoomPercent >= 200 ? 'Maximum Zoom Reached (200%)' : 'Zoom In (+)';
      zoomInBtn.style.opacity = zoomPercent >= 200 ? '0.45' : '1';
    }
    if (zoomOutBtn) {
      zoomOutBtn.title = zoomPercent <= 50 ? 'Minimum Zoom Reached (50%)' : 'Zoom Out (-)';
      zoomOutBtn.style.opacity = zoomPercent <= 50 ? '0.45' : '1';
    }
  }

  function resetZoom() {
    zoomPercent = 100;
    if (zoomLevelSpan) zoomLevelSpan.textContent = '100%';

    updatePageStreamWidth();

    if (zoomInBtn) {
      zoomInBtn.title = 'Zoom In (+)';
      zoomInBtn.style.opacity = '1';
    }
    if (zoomOutBtn) {
      zoomOutBtn.title = 'Zoom Out (-)';
      zoomOutBtn.style.opacity = '1';
    }
  }

  // Fullscreen & Minimize Toggle
  function updateFullscreenUI(active) {
    isFullscreen = active;
    const enterIcon = fullscreenBtn ? fullscreenBtn.querySelector('.fs-enter-icon') : null;
    const exitIcon = fullscreenBtn ? fullscreenBtn.querySelector('.fs-exit-icon') : null;

    if (active) {
      document.body.classList.add('fullscreen-mode');
      if (enterIcon) enterIcon.style.display = 'none';
      if (exitIcon) exitIcon.style.display = 'inline-block';
      if (fsLabel) fsLabel.textContent = 'Minimize';
      if (fullscreenBtn) fullscreenBtn.title = 'Minimize / Exit Fullscreen (Esc)';
    } else {
      document.body.classList.remove('fullscreen-mode');
      if (enterIcon) enterIcon.style.display = 'inline-block';
      if (exitIcon) exitIcon.style.display = 'none';
      if (fsLabel) fsLabel.textContent = 'Fullscreen';
      if (fullscreenBtn) fullscreenBtn.title = 'Fullscreen (F)';
    }
  }

  function toggleFullscreen() {
    const isCurrentlyFS = !!(document.fullscreenElement || document.body.classList.contains('fullscreen-mode'));

    if (!isCurrentlyFS) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().then(() => {
          updateFullscreenUI(true);
        }).catch(() => {
          // CSS fallback
          updateFullscreenUI(true);
        });
      } else {
        updateFullscreenUI(true);
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          updateFullscreenUI(false);
        }).catch(() => {
          updateFullscreenUI(false);
        });
      } else {
        updateFullscreenUI(false);
      }
    }
  }

  // Event Listeners
  if (prevPageBtn) prevPageBtn.addEventListener('click', prevPage);
  if (nextPageBtn) nextPageBtn.addEventListener('click', nextPage);

  const prevDockBtn = document.getElementById('prev-dock-btn');
  const nextDockBtn = document.getElementById('next-dock-btn');
  if (prevDockBtn) prevDockBtn.addEventListener('click', prevPage);
  if (nextDockBtn) nextDockBtn.addEventListener('click', nextPage);

  if (curPageInput) {
    curPageInput.addEventListener('change', (e) => {
      let val = parseInt(e.target.value, 10);
      if (isNaN(val)) val = 1;
      goToPage(val);
    });
    curPageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        curPageInput.blur();
      }
    });
  }

  if (zoomInBtn) zoomInBtn.addEventListener('click', () => applyZoom(10));
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => applyZoom(-10));
  if (zoomResetBtn) zoomResetBtn.addEventListener('click', resetZoom);
  if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

  // Sync with browser fullscreen state (e.g. Esc key pressed)
  ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange'].forEach((evt) => {
    document.addEventListener(evt, () => {
      const active = !!document.fullscreenElement;
      updateFullscreenUI(active);
    });
  });

  // Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      nextPage();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      prevPage();
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      applyZoom(10);
    } else if (e.key === '-') {
      e.preventDefault();
      applyZoom(-10);
    } else if (e.key === '0') {
      e.preventDefault();
      resetZoom();
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.key === 'Escape' && isFullscreen) {
      updateFullscreenUI(false);
    }
  });

  // Scroll Listener: transform top header to left sidebar when scrolled down
  function handleScroll() {
    if (window.scrollY > 60) {
      document.body.classList.add('is-scrolled');
    } else {
      document.body.classList.remove('is-scrolled');
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Background Audio Controller
  function initBackgroundAudio() {
    const audio = document.getElementById('zirovaBgAudio');
    const widget = document.getElementById('zirovaAudioWidget');
    const toggleBtn = document.getElementById('zirovaAudioToggle');
    const label = document.getElementById('zirovaAudioLabel');
    if (!audio || !widget || !toggleBtn) return;

    audio.volume = 0.05;

    let isPlaying = false;
    let hasUserInteracted = false;

    try {
      const savedTime = parseFloat(sessionStorage.getItem('zirova_audio_current_time') || '0');
      if (savedTime && isFinite(savedTime)) {
        audio.currentTime = savedTime;
      }
    } catch(e) {}

    audio.addEventListener('timeupdate', () => {
      try {
        sessionStorage.setItem('zirova_audio_current_time', audio.currentTime);
      } catch(e) {}
    });

    function updateUI(playing) {
      isPlaying = playing;
      if (playing) {
        widget.classList.add('is-playing');
        widget.classList.remove('is-muted');
        if (label) label.textContent = 'Music On';
        toggleBtn.setAttribute('aria-label', 'Mute background music');
      } else {
        widget.classList.remove('is-playing');
        widget.classList.add('is-muted');
        if (label) label.textContent = 'Muted';
        toggleBtn.setAttribute('aria-label', 'Unmute background music');
      }
    }

    function playMusic() {
      const p = audio.play();
      if (p !== undefined) {
        p.then(() => {
          updateUI(true);
          try { sessionStorage.setItem('zirova_music_muted', 'false'); } catch(e) {}
        }).catch(() => {
          updateUI(false);
        });
      }
    }

    function pauseMusic() {
      audio.pause();
      updateUI(false);
      try { sessionStorage.setItem('zirova_music_muted', 'true'); } catch(e) {}
    }

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      hasUserInteracted = true;
      if (isPlaying) {
        pauseMusic();
      } else {
        playMusic();
      }
    });

    function handleFirstInteraction() {
      if (hasUserInteracted) return;
      hasUserInteracted = true;
      let userExplicitMuted = false;
      try {
        userExplicitMuted = sessionStorage.getItem('zirova_music_muted') === 'true';
      } catch(e) {}
      if (!userExplicitMuted) {
        playMusic();
      }
      ['click', 'touchstart', 'scroll', 'keydown'].forEach(evt => {
        window.removeEventListener(evt, handleFirstInteraction, { passive: true, capture: true });
      });
    }

    ['click', 'touchstart', 'scroll', 'keydown'].forEach(evt => {
      window.addEventListener(evt, handleFirstInteraction, { passive: true, capture: true });
    });

    try {
      if (sessionStorage.getItem('zirova_music_muted') === 'false') {
        playMusic();
      }
    } catch(e) {}
  }

  // Boot viewer
  document.addEventListener('DOMContentLoaded', () => {
    buildPageStream();
    handleScroll();
    initBackgroundAudio();
  });

})();
