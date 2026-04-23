/* ============================================================
   LIQUID COURAGE CONSULTANTS — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ── Fullpage panel controller ── */
  const PANEL_SELECTORS = [
    '.hero',
    '.services',
    '.how-it-works',
    '.industries',
    '.pricing',
    '.pricing-brackets',
    '.brand-showcase',
    '.contact',
    '.footer',
  ];

  const panels    = PANEL_SELECTORS.map(s => document.querySelector(s)).filter(Boolean);
  const navbar    = document.getElementById('navbar');
  const navLinks  = document.getElementById('navLinks');
  const backToTop = document.getElementById('backToTop');

  let currentIndex = 0;
  let isAnimating  = false;
  const ANIM_MS    = 700;

  /* -- Apply fixed-panel styles to every section -- */
  panels.forEach((panel, i) => {
    Object.assign(panel.style, {
      position:   'fixed',
      top:        '0',
      left:       '0',
      width:      '100%',
      height:     '100%',
      overflowY:  'auto',
      overflowX:  'hidden',
      transition: `transform ${ANIM_MS}ms cubic-bezier(0.77, 0, 0.175, 1),
                   opacity   ${ANIM_MS}ms ease`,
      willChange: 'transform, opacity',
    });

    if (i === 0) {
      panel.style.transform    = 'translateY(0) scale(1)';
      panel.style.opacity      = '1';
      panel.style.zIndex       = '100';
      panel.style.pointerEvents = 'auto';
    } else {
      panel.style.transform    = 'translateY(100%)';
      panel.style.opacity      = '1';
      panel.style.zIndex       = '50';
      panel.style.pointerEvents = 'none';
    }
  });

  /* -- Prevent body scroll (all scrolling is inside panels) -- */
  document.documentElement.style.overflow = 'hidden';
  document.documentElement.style.height   = '100%';
  document.body.style.overflow             = 'hidden';
  document.body.style.height               = '100%';

  /* -- Hide the thin brand-strip (lives between panels in the DOM) -- */
  const brandStrip = document.querySelector('.brand-strip');
  if (brandStrip) brandStrip.style.display = 'none';

  /* -- Preload all lazy-bg images (can't use IntersectionObserver with fixed panels) -- */
  document.querySelectorAll('[data-bg]').forEach(el => {
    const src = el.getAttribute('data-bg');
    if (src) el.style.backgroundImage = `url('${src}')`;
  });

  /* -- Trigger pop-in animations for a panel's [data-aos] elements -- */
  function triggerPanelAnimations(panel) {
    const els = panel.querySelectorAll('[data-aos]');
    els.forEach(el => el.classList.remove('is-visible'));
    requestAnimationFrame(() => {
      els.forEach(el => {
        const delay = parseInt(el.getAttribute('data-delay') || '0', 10) + 150;
        setTimeout(() => el.classList.add('is-visible'), delay);
      });
    });
  }

  /* -- Update navbar active link & scrolled state -- */
  function updateNavState(index) {
    const panel = panels[index];
    const id    = panel ? panel.id : null;

    /* scrolled class: always on except hero (index 0) */
    if (index === 0) {
      navbar.classList.remove('scrolled');
      backToTop.classList.remove('visible');
    } else {
      navbar.classList.add('scrolled');
      backToTop.classList.add('visible');
    }

    /* active link */
    navLinks.querySelectorAll('a').forEach(a => a.classList.remove('active'));
    if (id) {
      const match = navLinks.querySelector(`a[href="#${id}"]`);
      if (match) match.classList.add('active');
    }
  }

  /* -- Go to panel by index -- */
  function goTo(index, force) {
    if (!force && (isAnimating || index === currentIndex)) return;
    if (index < 0 || index >= panels.length) return;

    isAnimating = true;
    const from      = panels[currentIndex];
    const to        = panels[index];
    const goingDown = index > currentIndex;

    if (goingDown) {
      /* Incoming slides up on top; outgoing shrinks & fades behind */
      to.style.zIndex       = '200';
      to.style.transform    = 'translateY(100%)';
      to.style.pointerEvents = 'none';
      from.style.zIndex     = '150';

      /* Force reflow so the starting transform is painted */
      to.getBoundingClientRect();

      to.style.transform    = 'translateY(0) scale(1)';
      to.style.opacity      = '1';
      from.style.transform  = 'scale(0.85) translateY(-4%)';
      from.style.opacity    = '0.2';
    } else {
      /* Going up: reveal panel from behind as current slides back down */
      to.style.transform    = 'scale(0.85) translateY(-4%)';
      to.style.opacity      = '0.2';
      to.style.zIndex       = '200';
      from.style.zIndex     = '150';
      to.style.pointerEvents = 'none';

      to.getBoundingClientRect();

      to.style.transform    = 'translateY(0) scale(1)';
      to.style.opacity      = '1';
      from.style.transform  = 'translateY(100%)';
      from.style.opacity    = '1';
    }

    currentIndex = index;
    triggerPanelAnimations(to);
    updateNavState(index);

    setTimeout(() => {
      isAnimating = false;
      from.style.pointerEvents = 'none';
      to.style.zIndex          = '100';
      to.style.pointerEvents   = 'auto';
      from.style.zIndex        = '50';

      /* Settle all panels to clean state */
      panels.forEach((p, i) => {
        if (i === currentIndex) return;
        if (i < currentIndex) {
          p.style.transform = 'scale(0.85) translateY(-4%)';
          p.style.opacity   = '0';
        } else {
          p.style.transform = 'translateY(100%)';
          p.style.opacity   = '1';
        }
      });
    }, ANIM_MS + 60);
  }

  /* -- Wheel: navigate between panels, allow internal scroll within a panel -- */
  window.addEventListener('wheel', (e) => {
    const panel   = panels[currentIndex];
    const atBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 5;
    const atTop    = panel.scrollTop <= 0;

    if (e.deltaY > 0) {
      if (!atBottom) return;           /* let panel scroll */
      e.preventDefault();
      goTo(currentIndex + 1);
    } else {
      if (!atTop) return;
      e.preventDefault();
      goTo(currentIndex - 1);
    }
  }, { passive: false });

  /* -- Touch swipe -- */
  let touchStartY = 0;
  window.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchend', e => {
    const delta = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(delta) < 40) return;
    const panel    = panels[currentIndex];
    const atBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 5;
    const atTop    = panel.scrollTop <= 0;
    if (delta > 0 && atBottom) goTo(currentIndex + 1);
    if (delta < 0 && atTop)    goTo(currentIndex - 1);
  }, { passive: true });

  /* -- Keyboard -- */
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(currentIndex + 1); }
    if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); goTo(currentIndex - 1); }
  });

  /* -- Back to top -- */
  backToTop.addEventListener('click', () => goTo(0));

  /* -- Anchor link navigation (navbar, footer links) -- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').replace('#', '');
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      const idx = panels.indexOf(target);
      if (idx !== -1) {
        e.preventDefault();
        goTo(idx);
      }
    });
  });

  /* ── Mobile hamburger ── */
  const hamburger = document.getElementById('hamburger');
  const [bar1, bar2, bar3] = hamburger.querySelectorAll('span');

  function setHamburger(open) {
    if (open) {
      bar1.style.transform = 'rotate(45deg) translate(5px, 5px)';
      bar2.style.opacity   = '0';
      bar3.style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      bar1.style.transform = '';
      bar2.style.opacity   = '1';
      bar3.style.transform = '';
    }
  }

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    setHamburger(isOpen);
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      setHamburger(false);
    });
  });

  document.addEventListener('click', e => {
    if (navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        !hamburger.contains(e.target)) {
      navLinks.classList.remove('open');
      setHamburger(false);
    }
  });

  /* ── Counter animation ── */
  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800;
    const steps    = 60;
    let frame      = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / steps;
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (frame >= steps) { el.textContent = target; clearInterval(timer); }
    }, duration / steps);
  }

  /* Run counters once hero is active (already active on load) */
  let countersRun = false;
  function runCounters() {
    if (countersRun) return;
    countersRun = true;
    document.querySelectorAll('.stat-number').forEach(animateCounter);
  }
  setTimeout(runCounters, 800);

  /* ── Contact form → WhatsApp redirect ── */
  const form = document.getElementById('contactForm');

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name        = (document.getElementById('name').value        || '').trim();
    const email       = (document.getElementById('email').value       || '').trim();
    const phone       = (document.getElementById('phone').value       || '').trim();
    const province    = (document.getElementById('province').value    || '').trim();
    const service     = (document.getElementById('service').value     || '').trim();
    const licenceType = (document.getElementById('licenceType').value || '').trim();
    const message     = (document.getElementById('message').value     || '').trim();

    if (!name)  { shakeField('name');  return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { shakeField('email'); return; }
    if (!province) { shakeField('province'); return; }

    let text  = `Hello Liquid Courage Consultants!\n\nMy name is *${name}*.\n`;
    if (province)    text += `Province: *${province}*.\n`;
    if (service)     text += `I'm interested in: *${service}*.\n`;
    if (licenceType) text += `Licence type: *${licenceType}*.\n`;
    if (message)     text += `\nMessage: ${message}\n`;
    text += `\nContact details:\n• Email: ${email}\n`;
    if (phone) text += `• Phone: ${phone}\n`;
    text += `\nPlease get back to me at your earliest convenience. Thank you!`;

    window.open(`https://wa.me/27670117602?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    showFormSuccess();
    form.reset();
  });

  function shakeField(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.borderColor = '#ef4444';
    el.style.animation   = 'shake 0.4s ease';
    el.focus();
    setTimeout(() => { el.style.animation = ''; el.style.borderColor = ''; }, 600);
  }

  function showFormSuccess() {
    const btn      = form.querySelector('button[type="submit"]');
    const original = btn.innerHTML;
    btn.innerHTML  = '<i class="fas fa-check"></i> Message Sent to WhatsApp!';
    btn.style.background = 'linear-gradient(135deg, #25D366, #128C7E)';
    btn.disabled   = true;
    setTimeout(() => { btn.innerHTML = original; btn.style.background = ''; btn.disabled = false; }, 4000);
  }

  /* ── Shake keyframes ── */
  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-8px); }
      40%       { transform: translateX(8px); }
      60%       { transform: translateX(-5px); }
      80%       { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(shakeStyle);

  /* ── Pre-select service + jump to contact panel ── */
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
    /* Navigate to the contact panel */
    const contactPanel = document.getElementById('contact');
    const idx = panels.indexOf(contactPanel);
    if (idx !== -1) goTo(idx);
  }

  document.querySelectorAll('.service-card[data-service]').forEach(card => {
    card.addEventListener('click', () => preSelectService(card.getAttribute('data-service')));
  });

  document.querySelectorAll('a[data-service]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      preSelectService(link.getAttribute('data-service'));
    });
  });

  /* ── Conditional licence type field ── */
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
    const needs = LICENCE_SERVICES.has(serviceSelect.value);
    licenceTypeGroup.classList.toggle('visible', needs);
    const licenceSelect = document.getElementById('licenceType');
    if (licenceSelect) licenceSelect.required = needs;
  }

  if (serviceSelect) {
    serviceSelect.addEventListener('change', toggleLicenceType);
    toggleLicenceType();
  }

  /* ── Stagger: apply data-delay as CSS transition-delay ── */
  document.querySelectorAll('[data-delay]').forEach(el => {
    el.style.transitionDelay = `${el.getAttribute('data-delay')}ms`;
  });

  /* ── Boot: trigger first panel animations ── */
  triggerPanelAnimations(panels[0]);
  updateNavState(0);

})();
