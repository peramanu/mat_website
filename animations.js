/* =========================================
   MĀT — animations.js
   Magnetic buttons · Parallax · Ticker
   ========================================= */

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --- HERO PARALLAX --- */
if (!prefersReduced) {
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y < window.innerHeight * 1.2) {
            heroBg.style.transform = `translateY(${y * 0.28}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
}

/* --- MAGNETIC BUTTONS --- */
if (!prefersReduced && window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r   = btn.getBoundingClientRect();
      const x   = (e.clientX - r.left - r.width  / 2) * 0.22;
      const y   = (e.clientY - r.top  - r.height / 2) * 0.22;
      btn.style.transform    = `translate(${x}px, ${y}px)`;
      btn.style.transition   = 'transform 0.1s ease, background 0.25s ease, color 0.25s ease, border-color 0.25s ease';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform  = '';
      btn.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.25s ease, color 0.25s ease, border-color 0.25s ease';
    });
  });
}

/* --- TICKER PAUSE ON HOVER --- */
const tickerEl    = document.querySelector('.ticker');
const tickerInner = document.querySelector('.ticker-inner');
if (tickerEl && tickerInner) {
  tickerEl.addEventListener('mouseenter', () => {
    tickerInner.style.animationPlayState = 'paused';
  });
  tickerEl.addEventListener('mouseleave', () => {
    tickerInner.style.animationPlayState = 'running';
  });
}

/* --- NAV ACTIVE SECTION INDICATOR --- */
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const sections = [...navLinks]
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

if (navLinks.length && sections.length) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => sectionObserver.observe(s));
}
