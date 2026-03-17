const siteFrameRoot = document.documentElement;
const siteFrameWrap = document.querySelector(".site-frame-wrap");

function normalizeSiteFramePath(pathname) {
    return pathname.replace(/\/+$/, "");
}

function getSiteFrameOffset() {
    if (!siteFrameWrap) {
        return 170;
    }

    const computedStyle = window.getComputedStyle(siteFrameWrap);
    const marginBottom = Number.parseFloat(computedStyle.marginBottom || "0") || 0;

    return Math.ceil(siteFrameWrap.offsetHeight + marginBottom + 8);
}

function updateSiteFrameOffset() {
    siteFrameRoot.style.setProperty("--site-frame-offset", `${getSiteFrameOffset()}px`);
}

function scrollToSiteFrameHash(hash, behavior = "smooth", updateHistory = false) {
    if (!hash || hash === "#") {
        return false;
    }

    const target = document.querySelector(hash);

    if (!target) {
        return false;
    }

    updateSiteFrameOffset();

    const top = target.getBoundingClientRect().top + window.scrollY - getSiteFrameOffset();

    window.scrollTo({
        top: Math.max(0, top),
        behavior
    });

    if (updateHistory) {
        window.history.pushState(null, "", hash);
    }

    return true;
}

updateSiteFrameOffset();

window.addEventListener("resize", updateSiteFrameOffset);
window.addEventListener("load", () => {
    updateSiteFrameOffset();

    if (window.location.hash) {
        window.requestAnimationFrame(() => {
            scrollToSiteFrameHash(window.location.hash, "auto", false);
        });
    }
});

window.addEventListener("pageshow", () => {
    updateSiteFrameOffset();
});

document.querySelectorAll("[data-site-nav-toggle]").forEach((toggle) => {
    const navId = toggle.getAttribute("aria-controls");
    const nav = navId ? document.getElementById(navId) : null;

    if (!nav) {
        return;
    }

    toggle.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
        updateSiteFrameOffset();
    });

    nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", (event) => {
            nav.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
            updateSiteFrameOffset();

            const linkUrl = new URL(link.href, window.location.href);
            const isSamePageHashLink =
                linkUrl.hash &&
                normalizeSiteFramePath(linkUrl.pathname) === normalizeSiteFramePath(window.location.pathname);

            if (isSamePageHashLink) {
                event.preventDefault();
                scrollToSiteFrameHash(linkUrl.hash, "smooth", true);
            }
        });
    });
});
