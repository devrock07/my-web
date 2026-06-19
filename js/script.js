// --- Strict Mode for Robustness ---
"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const themeToggle = document.querySelector('#theme-toggle');
  const themeGifOverlay = document.querySelector('.theme-gif-overlay');
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const initialTheme = savedTheme || (systemPrefersLight ? 'light' : 'dark');

  function applyTheme(theme) {
    const isLight = theme === 'light';
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;

    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(isLight));
      themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    }
  }

  applyTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
      const commitTheme = () => {
        localStorage.setItem('theme', nextTheme);
        applyTheme(nextTheme);
      };

      if (document.startViewTransition && !prefersReducedMotion) {
        window.__lastThemeTransitionMode = 'view-transition';
        document.startViewTransition(commitTheme);
      } else if (themeGifOverlay && !prefersReducedMotion) {
        window.__lastThemeTransitionMode = 'gif-fallback';
        themeGifOverlay.classList.remove('is-running');
        void themeGifOverlay.offsetWidth;
        themeGifOverlay.classList.add('is-running');
        setTimeout(commitTheme, 120);
        setTimeout(() => {
          themeGifOverlay.classList.remove('is-running');
        }, 1800);
      } else {
        window.__lastThemeTransitionMode = 'plain';
        commitTheme();
      }
    });
  }
  
  // --- Custom Cursor & Aura Overlay ---
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorOutline = document.querySelector('.cursor-outline');
  
  // Update mouse position for custom cursor and bento shimmer
  window.addEventListener('mousemove', (e) => {
    if (prefersReducedMotion) return;
    // Crosshair logic
    if(cursorDot && cursorOutline) {
      cursorDot.style.left = `${e.clientX}px`;
      cursorDot.style.top = `${e.clientY}px`;
      
      // Add slight delay for the outline (trailing effect)
      cursorOutline.animate({
        left: `${e.clientX}px`,
        top: `${e.clientY}px`
      }, { duration: 500, fill: "forwards" });
    }
  });

  // Hover effects for the custom cursor
  document.querySelectorAll('a, button, i').forEach(el => {
    el.addEventListener('pointerenter', () => {
      if(cursorOutline) {
        cursorOutline.style.width = '60px';
        cursorOutline.style.height = '60px';
        cursorOutline.style.backgroundColor = 'rgba(56, 189, 248, 0.12)';
      }
    });
    el.addEventListener('pointerleave', () => {
      if(cursorOutline) {
        cursorOutline.style.width = '40px';
        cursorOutline.style.height = '40px';
        cursorOutline.style.backgroundColor = 'transparent';
      }
    });
  });

  // --- Mobile Navigation ---
  const menuIcon = document.querySelector('#menu-icon');
  const menuGlyph = menuIcon ? menuIcon.querySelector('i') : null;
  const navbar = document.querySelector('.navbar');

  if(menuIcon && navbar) {
    menuIcon.onclick = () => {
      const isOpen = navbar.classList.toggle('active');
      menuIcon.setAttribute('aria-expanded', String(isOpen));
      menuIcon.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
      if (menuGlyph) menuGlyph.classList.toggle('bx-x', isOpen);
    };
  }

  // --- Update Active Nav Link on Scroll ---
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.navbar a');

  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      // If we've scrolled past the top of the section (with some offset for the header)
      if (window.scrollY >= sectionTop - 150) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });

    // Close mobile menu when scrolling past
    if(menuIcon && navbar && window.scrollY > 0) {
      navbar.classList.remove('active');
      menuIcon.setAttribute('aria-expanded', 'false');
      menuIcon.setAttribute('aria-label', 'Open navigation menu');
      if (menuGlyph) menuGlyph.classList.remove('bx-x');
    }
  });

  // --- Typing Text Animation ---
  const textArray = ["Web Developer", "Node.js Enthusiast", "Python Programmer", "Student"];
  const typingDelay = 100;
  const erasingDelay = 100;
  const newTextDelay = 2000;
  let textArrayIndex = 0;
  let charIndex = 0;
  const typedTextSpan = document.querySelector(".typed-text");
  const cursorSpan = document.querySelector(".cursor");

  function type() {
    if (!typedTextSpan || !cursorSpan) return;
    if (charIndex < textArray[textArrayIndex].length) {
      if (!cursorSpan.classList.contains("typing")) cursorSpan.classList.add("typing");
      typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
      charIndex++;
      setTimeout(type, typingDelay);
    } else {
      cursorSpan.classList.remove("typing");
      setTimeout(erase, newTextDelay);
    }
  }

  function erase() {
    if (!typedTextSpan || !cursorSpan) return;
    if (charIndex > 0) {
      if (!cursorSpan.classList.contains("typing")) cursorSpan.classList.add("typing");
      typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
      charIndex--;
      setTimeout(erase, erasingDelay);
    } else {
      cursorSpan.classList.remove("typing");
      textArrayIndex++;
      if (textArrayIndex >= textArray.length) textArrayIndex = 0;
      setTimeout(type, typingDelay + 1100);
    }
  }

  if (textArray.length && !prefersReducedMotion) {
    setTimeout(type, newTextDelay + 250);
  } else if (typedTextSpan) {
    typedTextSpan.textContent = textArray[0];
  }

  // --- 3D Tilted Card & Bento Shimmer Effect ---
  // Using querySelectorAll for all cards tagged with data-tilt
  const tiltElements = document.querySelectorAll('.bento-card[data-tilt]');

  tiltElements.forEach(el => {
    if (prefersReducedMotion) return;
    el.addEventListener('mousemove', handleTilt);
    el.addEventListener('mouseleave', resetTilt);
  });

  function handleTilt(e) {
    const el = this;
    const rect = el.getBoundingClientRect();
    const width = el.clientWidth;
    const height = el.clientHeight;

    // Mouse coordinates relative to card
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update CSS variables for Shimmer before element
    el.style.setProperty('--mouse-x', `${x}px`);
    el.style.setProperty('--mouse-y', `${y}px`);

    // Mouse position relative to center for Tilt
    const centerX = x - width / 2;
    const centerY = y - height / 2;

    // Constrain the rotation to a small angle (smooth ReactBits feel)
    const rotateX = -(centerY / height) * 10;
    const rotateY = (centerX / width) * 10;

    requestAnimationFrame(() => {
      // Scale slightly up and apply 3D transform
      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
  }

  function resetTilt() {
    const el = this;
    requestAnimationFrame(() => {
      el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  }


});
