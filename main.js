/* =========================================
   MĀT — DJ Website
   main.js
   ========================================= */

// --- GOOGLE SHEETS: Shows / Live Dates ---
// Anleitung: In Google Sheets → Datei → Freigeben → Im Web veröffentlichen
//            → "Gesamtes Dokument" + Format "CSV" → Link kopieren und hier einfügen
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQqewdsiiYibxIQSsb0U3JS7climTqrxJgTbDuBPDPIwks5a1nWymINsW_LG7EqInk_BYaOzSJ1YSZP/pub?output=csv';

async function loadShows() {
  const list = document.getElementById('gigs-list');
  const label = document.getElementById('shows-label');
  if (!list) return;

  // Kein Link konfiguriert → Fallback-Daten anzeigen
  if (!SHEET_CSV_URL || SHEET_CSV_URL.startsWith('HIER')) {
    renderGigs(list, label, [
      { Datum: '20 Mar', Venue: 'Piz Seteur',   Ort: 'Plan de Gralba',   Tag: 'Après-Ski' },
      { Datum: '21 Mar', Venue: 'Baita Sofie',  Ort: 'Seceda',           Tag: 'Mountain'  },
      { Datum: '21 Mar', Venue: 'Gaudi Snow',   Ort: 'Kronplatz',        Tag: 'Après-Ski' },
      { Datum: '22 Mar', Venue: 'La Spina',     Ort: 'St. Christina',    Tag: 'Club'      },
      { Datum: '1 Apr',  Venue: 'Snowbar',      Ort: 'Ruacia / Selva',   Tag: 'Après-Ski' },
      { Datum: '4 Apr',  Venue: 'Snowbar',      Ort: 'Ruacia / Selva',   Tag: 'Après-Ski' },
      { Datum: 'Apr',    Venue: 'Winter Finals', Ort: 'Selva · Panorama Hut', Tag: 'Festival' },
    ]);
    return;
  }

  try {
    const res = await fetch(SHEET_CSV_URL);
    const text = await res.text();
    const rows = parseCSV(text);
    renderGigs(list, label, rows);
  } catch (e) {
    list.innerHTML = '<p style="color:var(--w2);padding:2rem 1.5rem">Konnte Shows nicht laden.</p>';
  }
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = splitCSVLine(lines[0]);
  return lines.slice(1)
    .map(line => splitCSVLine(line))
    .filter(vals => vals.some(v => v))
    .map(vals => Object.fromEntries(headers.map((h, i) => [h.trim(), (vals[i] || '').trim()])));
}

function splitCSVLine(line) {
  const result = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQ = !inQ; }
    else if (c === ',' && !inQ) { result.push(cur); cur = ''; }
    else { cur += c; }
  }
  result.push(cur);
  return result;
}

function renderGigs(list, label, rows) {
  if (!rows.length) {
    list.innerHTML = '<p style="color:var(--w2);padding:2rem 1.5rem">Keine Shows geplant.</p>';
    return;
  }

  // Section-Label aus erstem Eintrag ableiten (optional: Spalte "Saison")
  const season = rows[0].Saison;
  if (label && season) label.textContent = season;

  list.innerHTML = rows.map(r => `
    <div class="gig reveal">
      <div class="gig-d">${r.Datum || ''}</div>
      <div class="gig-info">
        <div class="gig-v">${r.Venue || ''}</div>
        <div class="gig-l">${r.Ort || ''}</div>
      </div>
      <div class="gig-tag">${r.Tag || ''}</div>
    </div>
  `).join('');

  // Scroll-Reveal für neu eingefügte Elemente aktivieren
  list.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

// loadShows() wird am Ende der Datei aufgerufen (nach revealObserver)

// --- LOADER ---
const loader = document.getElementById('loader');

if (loader) {
  // Hide loader as soon as DOM + hero video can start playing (don't wait for all 350 MB)
  const heroVideo = document.getElementById('hero-video');
  let loaderHidden = false;

  function hideLoader() {
    if (loaderHidden) return;
    loaderHidden = true;
    setTimeout(() => loader.classList.add('hidden'), 400);
  }

  if (heroVideo) {
    heroVideo.addEventListener('canplay', hideLoader, { once: true });
    // Fallback: hide after 3s regardless
    setTimeout(hideLoader, 3000);
  } else {
    setTimeout(hideLoader, 1000);
  }
}

// --- CUSTOM CURSOR ---
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');

if (cursor && cursorRing && window.matchMedia('(hover: hover)').matches) {
  let mx = 0, my = 0;
  let rx = 0, ry = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  // Smooth ring follow
  function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();

  // Hover expand on interactive elements
  const hoverTargets = 'a, button, .mix-card, .gig, .gallery-item';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
  });
}

// --- MOBILE MENU ---
const burger = document.querySelector('.nav-burger');
const mobileMenu = document.getElementById('mobile-menu');

if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
    });
  });
}

// --- SCROLL REVEAL ---
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // Stagger delay based on index within parent
      const siblings = [...entry.target.parentElement.querySelectorAll('.reveal')];
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${idx * 0.06}s`;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

revealEls.forEach(el => revealObserver.observe(el));

// --- NAV: hide/show on scroll ---
let lastScroll = 0;
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  const current = window.scrollY;
  if (current > 80 && current > lastScroll) {
    nav.style.transform = 'translateY(-100%)';
  } else {
    nav.style.transform = 'translateY(0)';
  }
  lastScroll = current;
}, { passive: true });

nav.style.transition = 'transform 0.3s ease';

// --- SMOOTH ANCHOR SCROLL (fallback for older browsers) ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// --- STATS COUNTER ---
const statNums = document.querySelectorAll('.hstat-n[data-target]');

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';

    // Non-numeric target: just show the value without animation
    if (isNaN(target)) {
      el.textContent = el.dataset.target + suffix;
      counterObserver.unobserve(el);
      return;
    }

    const isDecimal = target % 1 !== 0;
    const duration = 1400;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const value = target * ease;
      el.textContent = (isDecimal ? value.toFixed(1) : Math.floor(value)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
    }

    requestAnimationFrame(step);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

statNums.forEach(el => counterObserver.observe(el));

// --- GALLERY DRAG SCROLL ---
const galleryTrack = document.getElementById('gallery-track');

if (galleryTrack) {
  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;
  let lastX = 0;
  let lastDx = 0;
  let rafId = null;
  let pendingX = null;
  let rafScheduled = false;

  function applyInertia() {
    if (Math.abs(lastDx) < 0.4) { lastDx = 0; return; }
    galleryTrack.scrollLeft += lastDx;
    lastDx *= 0.93;
    rafId = requestAnimationFrame(applyInertia);
  }

  galleryTrack.addEventListener('mousedown', (e) => {
    if (rafId) cancelAnimationFrame(rafId);
    isDragging = true;
    lastDx = 0;
    startX = e.pageX;
    lastX = e.pageX;
    startScrollLeft = galleryTrack.scrollLeft;
    galleryTrack.classList.add('dragging');
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    galleryTrack.classList.remove('dragging');
    rafId = requestAnimationFrame(applyInertia);
  });

  galleryTrack.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    lastDx = lastX - e.pageX;
    lastX = e.pageX;
    pendingX = startScrollLeft + (startX - e.pageX) * 1.6;
    if (!rafScheduled) {
      rafScheduled = true;
      requestAnimationFrame(() => {
        galleryTrack.scrollLeft = pendingX;
        rafScheduled = false;
      });
    }
  });

  // Touch: let browser handle natively (passive), just track velocity for inertia
  let touchStartX = 0;
  let touchScrollLeft = 0;
  let touchLastX = 0;
  let touchLastDx = 0;

  galleryTrack.addEventListener('touchstart', (e) => {
    if (rafId) cancelAnimationFrame(rafId);
    touchStartX = e.touches[0].pageX;
    touchLastX = touchStartX;
    touchScrollLeft = galleryTrack.scrollLeft;
    touchLastDx = 0;
  }, { passive: true });

  galleryTrack.addEventListener('touchmove', (e) => {
    const x = e.touches[0].pageX;
    touchLastDx = touchLastX - x;
    touchLastX = x;
    galleryTrack.scrollLeft = touchScrollLeft + (touchStartX - x);
  }, { passive: true });

  galleryTrack.addEventListener('touchend', () => {
    lastDx = touchLastDx;
    rafId = requestAnimationFrame(applyInertia);
  }, { passive: true });
}

// --- REEL VIDEOS: play only when visible ---
const reelVideos = document.querySelectorAll('video[data-reel]');

const reelObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const video = entry.target;
    if (entry.isIntersecting) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}, { threshold: 0.2 });

reelVideos.forEach((video) => reelObserver.observe(video));

// Shows aus Google Sheets laden (nach revealObserver-Definition)
loadShows();
