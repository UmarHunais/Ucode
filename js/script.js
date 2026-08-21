const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const backTop = document.querySelector(".back-top");

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const open = body.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    body.classList.remove("nav-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const currentPage = body.dataset.page || "home";
document.querySelectorAll(`[data-nav="${currentPage}"]`).forEach((link) => {
  link.classList.add("active");
  link.setAttribute("aria-current", "page");
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

document.querySelectorAll(".faq-button").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    document.querySelectorAll(".faq-item.open").forEach((openItem) => {
      if (openItem !== item) {
        openItem.classList.remove("open");
        openItem.querySelector(".faq-button")?.setAttribute("aria-expanded", "false");
      }
    });
    const isOpen = item.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
  });
});

window.addEventListener("scroll", () => {
  if (!backTop) return;
  backTop.classList.toggle("show", window.scrollY > 700);
});

backTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// Intercept form submissions for static preview to avoid HTTP 405 from POST
document.addEventListener('submit', (e) => {
  const form = e.target;
  if (!(form instanceof HTMLFormElement)) return;
  if (!form.classList.contains('feature')) return;
  e.preventDefault();
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Opening WhatsApp...';
  }

  const val = (name) => (form.querySelector(`[name="${name}"]`)?.value || '');
  const message = `Hello UCODE,\nName: ${val('name')}\nEmail: ${val('email')}\nCompany: ${val('company')}\nProject Type: ${val('type')}\nBudget: ${val('budget')}\nTimeline: ${val('timeline')}\n\nDescription:\n${val('description')}`;
  const waUrl = `https://wa.me/94760595115?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');

  // restore button state after short delay; do not reset form so user keeps their inputs
  setTimeout(() => {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Start a Conversation';
    }
  }, 1200);
});

/* ==================================================================== */
/* Theme System & Water Drop Ripple Transition                           */
/* ==================================================================== */
(function initThemeSystem() {
  const themeToggleButtons = document.querySelectorAll('.theme-toggle');

  function applyThemeState(isDark) {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ucode-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ucode-theme', 'light');
    }

    themeToggleButtons.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(isDark));
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  const isCurrentlyDark = document.documentElement.classList.contains('dark');
  themeToggleButtons.forEach((btn) => {
    btn.setAttribute('aria-pressed', String(isCurrentlyDark));
    btn.setAttribute('aria-label', isCurrentlyDark ? 'Switch to light mode' : 'Switch to dark mode');
  });

  let isAnimating = false;

  function performRippleTransition(event, btn) {
    if (isAnimating) return;

    const isDarkNow = document.documentElement.classList.contains('dark');
    const willBeDark = !isDarkNow;

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      applyThemeState(willBeDark);
      return;
    }

    isAnimating = true;

    let x, y;
    if (event && typeof event.clientX === 'number' && (event.clientX !== 0 || event.clientY !== 0)) {
      x = Math.round(event.clientX);
      y = Math.round(event.clientY);
    } else if (btn) {
      const rect = btn.getBoundingClientRect();
      x = Math.round(rect.left + rect.width / 2);
      y = Math.round(rect.top + rect.height / 2);
    } else {
      x = Math.round(window.innerWidth / 2);
      y = Math.round(window.innerHeight / 2);
    }

    const maxX = Math.max(x, window.innerWidth - x);
    const maxY = Math.max(y, window.innerHeight - y);
    const endRadius = Math.ceil(Math.hypot(maxX, maxY)) + 20;

    if (typeof document.startViewTransition === 'function') {
      try {
        const transition = document.startViewTransition(() => {
          applyThemeState(willBeDark);
        });

        transition.ready.then(() => {
          const animation = document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`
              ]
            },
            {
              duration: 650,
              easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
              pseudoElement: '::view-transition-new(root)'
            }
          );
          animation.onfinish = () => {
            isAnimating = false;
          };
        }).catch(() => {
          applyThemeState(willBeDark);
          isAnimating = false;
        });
      } catch (err) {
        applyThemeState(willBeDark);
        isAnimating = false;
      }
    } else {
      let overlay = document.getElementById('theme-ripple-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'theme-ripple-overlay';
        overlay.className = 'theme-ripple-overlay';
        document.body.appendChild(overlay);
      }

      const targetBgColor = willBeDark ? '#0C1512' : '#ffffff';
      overlay.style.backgroundColor = targetBgColor;
      overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
      overlay.style.opacity = '1';
      overlay.style.transition = 'none';

      void overlay.offsetWidth;

      overlay.style.transition = 'clip-path 0.65s cubic-bezier(0.25, 1, 0.5, 1)';
      overlay.style.clipPath = `circle(${endRadius}px at ${x}px ${y}px)`;

      setTimeout(() => {
        applyThemeState(willBeDark);
      }, 400);

      setTimeout(() => {
        overlay.style.transition = 'opacity 0.15s ease';
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.style.clipPath = 'circle(0px at 0 0)';
          isAnimating = false;
        }, 150);
      }, 650);
    }
  }

  themeToggleButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => performRippleTransition(e, btn));
  });
})();

/* Dynamic Button Radial Ripple Hover Tracker */
(function initButtonRipples() {
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);
      btn.style.setProperty('--x', x + 'px');
      btn.style.setProperty('--y', y + 'px');
    });
  });
})();

