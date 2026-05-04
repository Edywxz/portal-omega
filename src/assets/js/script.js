const navWrap = document.querySelector(".main-nav-wrap");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const dropdownItems = document.querySelectorAll(".has-dropdown");
const revealItems = document.querySelectorAll(".reveal");
const searchForm = document.querySelector(".search-form");

const closeDropdowns = (exceptItem = null) => {
    dropdownItems.forEach((item) => {
        if (item === exceptItem) {
            return;
        }

        const trigger = item.querySelector(".nav-trigger");
        item.classList.remove("is-open");
        trigger?.setAttribute("aria-expanded", "false");
    });
};

dropdownItems.forEach((item) => {
    const trigger = item.querySelector(".nav-trigger");

    trigger?.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");
        closeDropdowns(item);
        item.classList.toggle("is-open", !isOpen);
        trigger.setAttribute("aria-expanded", String(!isOpen));
    });

    item.addEventListener("mouseleave", () => {
        if (window.innerWidth <= 1023) {
            return;
        }

        item.classList.remove("is-open");
        trigger?.setAttribute("aria-expanded", "false");
    });
});

document.addEventListener("click", (event) => {
    if (!event.target.closest(".main-nav")) {
        closeDropdowns();
    }

    if (!event.target.closest(".nav-inner") && mainNav?.classList.contains("is-open")) {
        mainNav.classList.remove("is-open");
        menuToggle?.setAttribute("aria-expanded", "false");
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeDropdowns();
        mainNav?.classList.remove("is-open");
        menuToggle?.setAttribute("aria-expanded", "false");
        menuToggle?.focus();
    }
});

menuToggle?.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    mainNav?.classList.toggle("is-open", !expanded);
    closeDropdowns();
});

const stickyObserver = new IntersectionObserver(
    ([entry]) => {
        navWrap?.classList.toggle("is-stuck", !entry.isIntersecting);
    },
    { threshold: 1 }
);

if (navWrap) {
    const sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    navWrap.before(sentinel);
    stickyObserver.observe(sentinel);
}

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.16 }
);

revealItems.forEach((item) => revealObserver.observe(item));

searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = searchForm.querySelector("input");

    if (!input?.value.trim()) {
        input?.focus();
        return;
    }

    window.alert(`Busca simulada por: ${input.value.trim()}`);
});
