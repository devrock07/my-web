// --- Strict Mode for Robustness ---
"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 768px)").matches || 'ontouchstart' in window;
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

      if (document.startViewTransition && !prefersReducedMotion && !isMobile) {
        window.__lastThemeTransitionMode = 'view-transition';
        document.startViewTransition(commitTheme);
      } else if (themeGifOverlay && !prefersReducedMotion && !isMobile) {
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

  // --- Lanyard Discord Profile ---
  async function fetchLanyardData() {
    try {
      const response = await fetch('https://api.lanyard.rest/v1/users/959733702609494076');
      const { success, data } = await response.json();
      
      if (success) {
        updateDiscordProfile(data);
      }
    } catch (error) {
      console.error('Error fetching Lanyard data:', error);
    }
  }

  function formatElapsedTime(startTimestampMs) {
    const now = Date.now();
    const elapsed = now - startTimestampMs;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return 'Just started';
    }
  }

  function updateDiscordProfile(data) {
    const { discord_user, activities, discord_status, spotify } = data;
    
    // Update avatar
    const avatarEl = document.getElementById('discord-avatar');
    if (avatarEl && discord_user.avatar) {
      avatarEl.src = `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.png?size=256`;
    }

    // Update display name and username
    const displayNameEl = document.getElementById('discord-display-name');
    const usernameEl = document.getElementById('discord-username');
    if (displayNameEl) {
      displayNameEl.textContent = discord_user.global_name || discord_user.username;
    }
    if (usernameEl) {
      usernameEl.textContent = `@${discord_user.username}`;
    }

    // Update status indicator
    const statusIndicatorEl = document.getElementById('discord-status-indicator');
    if (statusIndicatorEl) {
      statusIndicatorEl.className = 'discord-status-indicator';
      statusIndicatorEl.classList.add(discord_status);
    }

    // Update activity
    const activityContainer = document.getElementById('discord-activity-container');
    const activityIconEl = document.getElementById('discord-activity-icon');
    const activityNameEl = document.getElementById('discord-activity-name');
    const activityDetailsEl = document.getElementById('discord-activity-details');
    const activityStateEl = document.getElementById('discord-activity-state');
    const activityTimeEl = document.getElementById('discord-activity-time');
    
    if (activities && activities.length > 0) {
      const activity = activities[0];
      
      if (activityContainer) activityContainer.style.display = 'flex';
      
      if (activityIconEl && activity.assets) {
        let largeImageUrl = null;
        if (activity.assets.large_image) {
          if (activity.assets.large_image.startsWith('mp:external')) {
            // It's an external image URL, extract the actual URL
            const externalUrlPart = activity.assets.large_image.split('/https/')[1];
            if (externalUrlPart) {
              largeImageUrl = 'https://' + externalUrlPart;
            }
          } else {
            // It's a Discord application asset
            largeImageUrl = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
          }
        }
        
        if (largeImageUrl) {
          activityIconEl.style.backgroundImage = `url('${largeImageUrl}')`;
        } else {
          activityIconEl.style.backgroundImage = '';
        }
      }
      
      if (activityNameEl) activityNameEl.textContent = activity.name || 'No activity';
      if (activityDetailsEl) activityDetailsEl.textContent = activity.details || '';
      if (activityStateEl) activityStateEl.textContent = activity.state || '';
      
      // Update elapsed time if we have a start timestamp
      if (activityTimeEl && activity.timestamps && activity.timestamps.start) {
        const elapsed = formatElapsedTime(activity.timestamps.start);
        activityTimeEl.textContent = `for ${elapsed}`;
        activityTimeEl.style.display = 'block';
      } else if (activityTimeEl) {
        activityTimeEl.style.display = 'none';
      }
    } else {
      // No active activity
      if (activityContainer) activityContainer.style.display = 'none';
    }

    // Update Spotify
    updateSpotify(spotify);
  }

  function updateSpotify(spotifyData) {
    const spotifyCard = document.getElementById('spotify-card');
    const spotifyOffline = document.getElementById('spotify-offline');
    const spotifyAlbumArt = document.getElementById('spotify-album-art');
    const spotifyTrack = document.getElementById('spotify-track');
    const spotifyArtist = document.getElementById('spotify-artist');
    const spotifyProgress = document.getElementById('spotify-progress');

    if (spotifyData) {
      spotifyCard.style.display = 'flex';
      spotifyOffline.style.display = 'none';

      if (spotifyAlbumArt) {
        spotifyAlbumArt.style.backgroundImage = `url('${spotifyData.album_art_url}')`;
        spotifyAlbumArt.classList.add('has-album-art');
      }
      if (spotifyTrack) {
        spotifyTrack.textContent = spotifyData.song;
      }
      if (spotifyArtist) {
        spotifyArtist.textContent = spotifyData.artist;
      }

      // Calculate progress
      if (spotifyProgress && spotifyData.timestamps) {
        const now = Date.now();
        const start = spotifyData.timestamps.start;
        const end = spotifyData.timestamps.end;
        const duration = end - start;
        const elapsed = now - start;
        const progressPercent = Math.min(100, Math.max(0, (elapsed / duration) * 100));
        spotifyProgress.style.width = `${progressPercent}%`;
      }
    } else {
      spotifyCard.style.display = 'none';
      spotifyOffline.style.display = 'flex';
      if (spotifyAlbumArt) {
        spotifyAlbumArt.classList.remove('has-album-art');
      }
    }
  }

  // Scroll animations
  function initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.scroll-animate').forEach(el => {
      observer.observe(el);
    });
  }

  // Fetch data immediately and every 15 seconds
  fetchLanyardData();
  setInterval(fetchLanyardData, 15000);
  initScrollAnimations();

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
