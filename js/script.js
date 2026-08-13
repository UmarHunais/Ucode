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
  const waUrl = `https://wa.me/94778502118?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');

  // restore button state after short delay; do not reset form so user keeps their inputs
  setTimeout(() => {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Start a Conversation';
    }
  }, 1200);
});
