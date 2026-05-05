const OMEGA_PAGE_TRANSITION_DELAY = 1200;

let omegaPageTransitionActive = false;

const getPageLoader = () => {
    let loader = document.querySelector(".page-loader");

    if (loader) {
        return loader;
    }

    loader = document.createElement("div");
    loader.className = "page-loader";
    loader.setAttribute("aria-hidden", "true");

    const bar = document.createElement("span");
    loader.append(bar);
    document.body.append(loader);

    return loader;
};

const shouldDelayNavigation = (event, anchor) => {
    if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        anchor.hasAttribute("download")
    ) {
        return false;
    }

    const target = anchor.getAttribute("target");

    if (target && target !== "_self") {
        return false;
    }

    const rawHref = anchor.getAttribute("href") || "";

    if (
        rawHref.startsWith("#") ||
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:") ||
        rawHref.startsWith("javascript:")
    ) {
        return false;
    }

    const url = new URL(anchor.href, window.location.href);
    const isSameOrigin = url.origin === window.location.origin;
    const isSameDocument = url.pathname === window.location.pathname && url.search === window.location.search;

    return isSameOrigin && !(isSameDocument && url.hash);
};

const goToWithTransition = (url) => {
    if (omegaPageTransitionActive) {
        return;
    }

    omegaPageTransitionActive = true;

    const loader = getPageLoader();
    document.body.classList.add("page-transitioning");
    loader.setAttribute("aria-hidden", "false");

    window.setTimeout(() => {
        window.location.href = url;
    }, OMEGA_PAGE_TRANSITION_DELAY);
};

document.addEventListener("click", (event) => {
    const anchor = event.target.closest("a[href]");

    if (!anchor || !shouldDelayNavigation(event, anchor)) {
        return;
    }

    event.preventDefault();
    goToWithTransition(anchor.href);
});

window.addEventListener("pageshow", () => {
    omegaPageTransitionActive = false;
    document.body.classList.remove("page-transitioning");
    document.querySelector(".page-loader")?.setAttribute("aria-hidden", "true");
});

window.OmegaPageTransition = {
    delay: OMEGA_PAGE_TRANSITION_DELAY,
    goTo: goToWithTransition
};
