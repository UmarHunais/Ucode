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
