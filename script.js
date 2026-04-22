/* ============================================================
   LIQUID COURAGE CONSULTANTS — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ── Navbar: scroll behaviour ── */
  const navbar    = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

  function onScroll() {
    const y = window.scrollY;

    if (y > 60) {
      navbar.classList.add('scrolled');
      backToTop.classList.add('visible');
    } else {
      navbar.classList.remove('scrolled');
      backToTop.classList.remove('visible');
    }

    highlightActiveLink();
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Back to top ── */
  backToTop.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );

  /* ── Mobile hamburger ── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const [bar1, bar2, bar3] = hamburger.querySelectorAll('span');

  function setHamburger(open) {
    if (open) {
      bar1.style.transform  = 'rotate(45deg) translate(5px, 5px)';
      bar2.style.opacity    = '0';
      bar3.style.transform  = 'rotate(-45deg) translate(5px, -5px)';
      document.body.style.overflow = 'hidden';
    } else {
      bar1.style.transform  = '';
      bar2.style.opacity    = '1';
      bar3.style.transform  = '';
      document.body.style.overflow = '';
    }
  }

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    setHamburger(isOpen);
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      setHamburger(false);
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        !hamburger.contains(e.target)) {
      navLinks.classList.remove('open');
      setHamburger(false);
    }
  });

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Active nav link highlighting ── */
  function highlightActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY  = window.scrollY + 100;

    sections.forEach(section => {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = navLinks.querySelector(`a[href="#${id}"]`);
      if (!link) return;

      if (scrollY >= top && scrollY < bottom) {
        navLinks.querySelectorAll('a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }

  /* ── Counter animation ── */
  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800;
    const steps    = 60;
    const stepVal  = target / steps;
    let current    = 0;
    let frame      = 0;

    const timer = setInterval(() => {
      frame++;
      // ease-out: slow down near the end
      const progress = frame / steps;
      const eased    = 1 - Math.pow(1 - progress, 3);
      current        = Math.round(eased * target);
      el.textContent = current;

      if (frame >= steps) {
        el.textContent = target;
        clearInterval(timer);
      }
    }, duration / steps);
  }

  /* ── Intersection Observer: scroll animations ── */
  const aosObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.getAttribute('data-delay') || '0', 10);
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, delay);
          aosObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px 0px 0px' }
  );

  document.querySelectorAll('[data-aos]').forEach(el => aosObserver.observe(el));

  /* ── Counter trigger ── */
  const statsEl     = document.querySelector('.hero-stats');
  let countersRun   = false;

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersRun) {
          countersRun = true;
          document.querySelectorAll('.stat-number').forEach(animateCounter);
          statsObserver.disconnect();
        }
      });
    },
    { threshold: 0.5 }
  );

  if (statsEl) statsObserver.observe(statsEl);

  /* ── Contact form → WhatsApp redirect ── */
  const form = document.getElementById('contactForm');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name        = (document.getElementById('name').value        || '').trim();
    const email       = (document.getElementById('email').value       || '').trim();
    const phone       = (document.getElementById('phone').value       || '').trim();
    const province    = (document.getElementById('province').value    || '').trim();
    const service     = (document.getElementById('service').value     || '').trim();
    const licenceType = (document.getElementById('licenceType').value || '').trim();
    const message     = (document.getElementById('message').value     || '').trim();

    // Basic validation
    if (!name) {
      shakeField('name');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      shakeField('email');
      return;
    }
    if (!province) {
      shakeField('province');
      return;
    }

    // Build WhatsApp message
    let text = `Hello Liquid Courage Consultants!\n\n`;
    text    += `My name is *${name}*.\n`;
    if (province) text += `Province: *${province}*.\n`;
    if (service)  text += `I'm interested in: *${service}*.\n`;
    if (licenceType) text += `Licence type: *${licenceType}*.\n`;
    if (message)  text += `\nMessage: ${message}\n`;
    text    += `\nContact details:\n`;
    text    += `• Email: ${email}\n`;
    if (phone) text += `• Phone: ${phone}\n`;
    text    += `\nPlease get back to me at your earliest convenience. Thank you!`;

    const url = `https://wa.me/27670117602?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener');

    // Success feedback
    showFormSuccess();
    form.reset();
  });

  function shakeField(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.borderColor = '#ef4444';
    el.style.animation   = 'shake 0.4s ease';
    el.focus();
    setTimeout(() => {
      el.style.animation   = '';
      el.style.borderColor = '';
    }, 600);
  }

  function showFormSuccess() {
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Message Sent to WhatsApp!';
    btn.style.background = 'linear-gradient(135deg, #25D366, #128C7E)';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = original;
      btn.style.background  = '';
      btn.disabled = false;
    }, 4000);
  }

  /* ── Inject shake keyframes ── */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-8px); }
      40%       { transform: translateX(8px); }
      60%       { transform: translateX(-5px); }
      80%       { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);

  /* ── Service card stagger fix: apply delay from HTML attr ── */
  document.querySelectorAll('.service-card[data-delay]').forEach(card => {
    const d = card.getAttribute('data-delay');
    if (d) card.style.transitionDelay = `${d}ms`;
  });

  /* ── Pricing card stagger ── */
  document.querySelectorAll('.pricing-card[data-delay]').forEach(card => {
    const d = card.getAttribute('data-delay');
    if (d) card.style.transitionDelay = `${d}ms`;
  });

  /* ── Pre-select service + scroll to form (service cards & footer links) ── */
  function preSelectService(serviceName) {
    const serviceSelect = document.getElementById('service');
    if (serviceSelect) {
      for (const opt of serviceSelect.options) {
        if (opt.text === serviceName) {
          opt.selected = true;
          serviceSelect.dispatchEvent(new Event('change'));
          break;
        }
      }
    }
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  document.querySelectorAll('.service-card[data-service]').forEach(card => {
    card.addEventListener('click', () => preSelectService(card.getAttribute('data-service')));
  });

  document.querySelectorAll('a[data-service]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      preSelectService(link.getAttribute('data-service'));
    });
  });

  /* ── Conditional Type of Licence field ── */
  const serviceSelect    = document.getElementById('service');
  const licenceTypeGroup = document.getElementById('licenceTypeGroup');

  const LICENCE_SERVICES = new Set([
    'Liquor License Application',
    'Transfer of Liquor Licence',
    'Renewals & Compliance',
    'Temporary License Applications',
  ]);

  function toggleLicenceType() {
    if (!serviceSelect || !licenceTypeGroup) return;
    const needsLicence = LICENCE_SERVICES.has(serviceSelect.value);
    licenceTypeGroup.classList.toggle('visible', needsLicence);
    const licenceSelect = document.getElementById('licenceType');
    if (licenceSelect) licenceSelect.required = needsLicence;
  }

  if (serviceSelect) {
    serviceSelect.addEventListener('change', toggleLicenceType);
    toggleLicenceType(); // run on page load in case pre-selected
  }

  /* ── Lazy-load CSS background images ── */
  const bgObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el  = entry.target;
          const src = el.getAttribute('data-bg');
          if (src) el.style.backgroundImage = `url('${src}')`;
          bgObserver.unobserve(el);
        }
      });
    },
    { rootMargin: '200px 0px' }
  );

  document.querySelectorAll('[data-bg]').forEach(el => bgObserver.observe(el));

  /* ── Run once on load ── */
  onScroll();

})();
