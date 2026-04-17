const siteFrameRoot = document.documentElement;
const siteFrameWrap = document.querySelector(".site-frame-wrap");
const siteFrameScript = document.currentScript;
const siteFrameAssetBase = siteFrameScript
    ? new URL(".", siteFrameScript.src)
    : new URL(".", window.location.href);
const SITE_FRAME_SIDEBAR_OFFSET = 28;
const SITE_FRAME_SCROLL_THRESHOLD_ENTER = 120;
const SITE_FRAME_SCROLL_THRESHOLD_EXIT = 56;
let siteFrameIsCondensed = false;
let siteFrameScrollTicking = false;

function normalizeSiteFramePath(pathname) {
    return pathname.replace(/\/+$/, "");
}

function normalizeLocalFileUrl(value) {
    if (window.location.protocol !== "file:" || !value) {
        return value;
    }

    if (/^(mailto:|tel:|https?:|javascript:|#)/i.test(value)) {
        return value;
    }

    const url = new URL(value, window.location.href);

    if (url.protocol !== "file:" || !url.pathname.endsWith("/")) {
        return value;
    }

    url.pathname = `${url.pathname}index.html`;
    return url.href;
}

function syncLocalFilePreviewUrls(root = document) {
    if (window.location.protocol !== "file:") {
        return;
    }

    root.querySelectorAll("a[href], iframe[src]").forEach((node) => {
        const attr = node.tagName === "IFRAME" ? "src" : "href";
        const originalValue = node.getAttribute(attr);
        const normalizedValue = normalizeLocalFileUrl(originalValue);

        if (normalizedValue && normalizedValue !== originalValue) {
            node.setAttribute(attr, normalizedValue);
        }
    });
}

window.syncLocalFilePreviewUrls = syncLocalFilePreviewUrls;

function getSiteFrameOffset() {
    if (!siteFrameWrap) {
        return 170;
    }

    if (siteFrameWrap.classList.contains("is-workbook-hidden")) {
        return 0;
    }

    if (siteFrameWrap.classList.contains("is-workbook-sidebar")) {
        return SITE_FRAME_SIDEBAR_OFFSET;
    }

    const computedStyle = window.getComputedStyle(siteFrameWrap);
    const marginBottom = Number.parseFloat(computedStyle.marginBottom || "0") || 0;

    return Math.ceil(siteFrameWrap.offsetHeight + marginBottom + 8);
}

function updateSiteFrameOffset() {
    siteFrameRoot.style.setProperty("--site-frame-offset", `${getSiteFrameOffset()}px`);
}

window.getSiteFrameOffset = getSiteFrameOffset;
window.updateSiteFrameOffset = updateSiteFrameOffset;

function ensureSiteFrameShellLayout() {
    document.querySelectorAll(".site-frame-wrap").forEach((wrap) => {
        const top = wrap.querySelector(".site-frame-top");
        const nav = wrap.querySelector(".site-frame-nav");

        if (!nav) {
            return;
        }

        let linkList = nav.querySelector(".site-frame-link-list");
        const cta = nav.querySelector(".site-frame-cta");

        if (!linkList) {
            linkList = document.createElement("div");
            linkList.className = "site-frame-link-list";

            Array.from(nav.children).forEach((child) => {
                if (child !== cta) {
                    linkList.appendChild(child);
                }
            });

            nav.insertBefore(linkList, cta || null);
        }

        nav.querySelectorAll(".site-frame-broker-strip").forEach((strip) => strip.remove());

        if (!top || top.querySelector(".site-frame-broker-strip")) {
            return;
        }

        const brokerStrip = document.createElement("div");
        brokerStrip.className = "site-frame-broker-strip";
        brokerStrip.setAttribute("aria-label", "Brokerage logos");

        const platinumLogo = document.createElement("img");
        platinumLogo.className = "site-frame-broker-logo site-frame-broker-logo-platinum";
        platinumLogo.src = new URL(
            "Monthly%20Payment/Platinum%20Logo%20Black%20Transparent%20%281%29.png",
            siteFrameAssetBase
        ).href;
        platinumLogo.alt = "Platinum Real Estate Group";

        const separator = document.createElement("span");
        separator.className = "site-frame-broker-separator";
        separator.setAttribute("aria-hidden", "true");

        const kwLogo = document.createElement("img");
        kwLogo.className = "site-frame-broker-logo site-frame-broker-logo-kw";
        kwLogo.src = new URL(
            "Monthly%20Payment/KellerWilliams_Realty_LeadingEdge_Logo_RGB.png",
            siteFrameAssetBase
        ).href;
        kwLogo.alt = "Keller Williams Leading Edge";

        brokerStrip.append(platinumLogo, separator, kwLogo);
        const rightBlock = top.querySelector(".site-frame-right");
        top.insertBefore(brokerStrip, rightBlock || null);
    });
}

function setSiteFrameCondensed(condensed) {
    if (!siteFrameWrap || siteFrameIsCondensed === condensed) {
        return;
    }

    siteFrameIsCondensed = condensed;
    siteFrameWrap.classList.toggle("is-condensed", condensed);
    updateSiteFrameOffset();
}

function syncSiteFrameCondensed() {
    const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    const shouldCondense = siteFrameIsCondensed
        ? scrollTop > SITE_FRAME_SCROLL_THRESHOLD_EXIT
        : scrollTop > SITE_FRAME_SCROLL_THRESHOLD_ENTER;

    setSiteFrameCondensed(shouldCondense);
    siteFrameScrollTicking = false;
}

function queueSiteFrameScrollSync() {
    if (siteFrameScrollTicking) {
        return;
    }

    siteFrameScrollTicking = true;
    window.requestAnimationFrame(syncSiteFrameCondensed);
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

syncSiteFrameCondensed();
updateSiteFrameOffset();
syncLocalFilePreviewUrls();
ensureSiteFrameShellLayout();

window.addEventListener("resize", () => {
    syncSiteFrameCondensed();
    updateSiteFrameOffset();
});
window.addEventListener("scroll", queueSiteFrameScrollSync, { passive: true });
window.addEventListener("load", () => {
    syncSiteFrameCondensed();
    updateSiteFrameOffset();

    if (window.location.hash) {
        window.requestAnimationFrame(() => {
            scrollToSiteFrameHash(window.location.hash, "auto", false);
        });
    }
});

window.addEventListener("pageshow", () => {
    syncSiteFrameCondensed();
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
