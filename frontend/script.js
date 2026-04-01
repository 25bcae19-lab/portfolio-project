/**
 * Cyril portfolio — theme, navigation, scroll reveal, particles, contact form
 */
(function () {
  'use strict';

  const THEME_KEY = 'cyril-theme';

  // --- Theme (dark / light) ---
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    if (saved === 'light' || (!saved && prefersLight)) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }

  function toggleTheme() {
    document.documentElement.classList.toggle('light');
    localStorage.setItem(THEME_KEY, document.documentElement.classList.contains('light') ? 'light' : 'dark');
  }

  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
  initTheme();

  // --- Year in footer ---
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // --- Smooth scroll for same-page links ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const headerOffset = 80;
        const y = target.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
        closeMobileNav();
      }
    });
  });

  // --- Mobile nav ---
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  function closeMobileNav() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  navToggle?.addEventListener('click', () => {
    const open = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  navMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileNav);
  });

  // --- Scroll reveal (IntersectionObserver) ---
  const revealEls = document.querySelectorAll('[data-reveal]');

  // --- Skill bars: set CSS variables when visible ---
  function animateSkillBars() {
    document.querySelectorAll('.skill-bars.is-visible .skill-bar').forEach((bar) => {
      const pct = bar.dataset.percent || '80';
      bar.style.setProperty('--target', pct + '%');
    });

    document.querySelectorAll('.skill-tile.is-visible').forEach((tile) => {
      const meter = tile.querySelector('.skill-meter');
      if (!meter) return;
      const pct = meter.dataset.percent || '80';
      meter.style.setProperty('--meter', pct + '%');
    });
  }

  const skillObserver = new MutationObserver(animateSkillBars);
  document.querySelectorAll('.skill-bars, .skill-tile').forEach((el) => {
    skillObserver.observe(el, { attributes: true, attributeFilter: ['class'] });
  });
  revealEls.forEach((el) => {
    skillObserver.observe(el, { attributes: true, attributeFilter: ['class'] });
  });

  // Re-run when reveal adds is-visible to children containers
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          animateSkillBars();
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -5% 0px' }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  requestAnimationFrame(() => animateSkillBars());

  // --- Contact form validation & submit ---
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');

  function setFieldError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const err = document.getElementById(fieldId + '-error');
    if (err) err.textContent = message || '';
    if (input) {
      if (message) input.classList.add('invalid');
      else input.classList.remove('invalid');
    }
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!statusEl || !submitBtn) return;

    const name = document.getElementById('name')?.value?.trim() || '';
    const email = document.getElementById('email')?.value?.trim() || '';
    const message = document.getElementById('message')?.value?.trim() || '';

    setFieldError('name', '');
    setFieldError('email', '');
    setFieldError('message', '');
    statusEl.textContent = '';
    statusEl.classList.remove('success', 'error');

    let valid = true;
    if (!name) {
      setFieldError('name', 'Please enter your name.');
      valid = false;
    }
    if (!email) {
      setFieldError('email', 'Please enter your email.');
      valid = false;
    } else if (!validateEmail(email)) {
      setFieldError('email', 'Please enter a valid email address.');
      valid = false;
    }
    if (!message) {
      setFieldError('message', 'Please enter a message.');
      valid = false;
    }
    if (!valid) return;

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    try {
      const res = await fetch('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        statusEl.textContent = data.message || 'Thanks — your message was sent.';
        statusEl.classList.add('success');
        form.reset();
      } else {
        statusEl.textContent = data.error || 'Could not send. Please try again.';
        statusEl.classList.add('error');
      }
    } catch {
      statusEl.textContent = 'Network error. Is the server running?';
      statusEl.classList.add('error');
    } finally {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
    }
  });

  // --- Lightweight particle canvas (hero background) ---
  function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    let w = 0;
    let h = 0;
    let particles = [];
    const count = 55;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 2.2 + 0.5,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          a: Math.random() * 0.5 + 0.15,
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      const isLight = document.documentElement.classList.contains('light');
      const fill = isLight ? '124, 58, 237' : '200, 200, 255';

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${fill},${p.a})`;
        ctx.fill();
      });

      requestAnimationFrame(tick);
    }

    window.addEventListener('resize', resize);
    resize();
    tick();
  }

  initParticles();
})();
