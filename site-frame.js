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
const siteContactModalEnabled =
    Boolean(document.querySelector(".site-frame-wrap"))
    && document.body.getAttribute("data-site-contact-modal") !== "false";
let siteContactModal = null;

function setSiteHeadLink(rel, href, options = {}) {
    let selector = `link[rel="${rel}"]`;

    if (options.sizes) {
        selector += `[sizes="${options.sizes}"]`;
    }

    let link = document.head.querySelector(selector);

    if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        document.head.appendChild(link);
    }

    link.href = href;

    if (options.type) {
        link.type = options.type;
    } else {
        link.removeAttribute("type");
    }

    if (options.sizes) {
        link.sizes = options.sizes;
    } else {
        link.removeAttribute("sizes");
    }
}

function ensureSiteFrameFavicon() {
    document.head
        .querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]')
        .forEach((link) => link.remove());

    setSiteHeadLink("icon", new URL("favicon-16.png", siteFrameAssetBase).href, {
        type: "image/png",
        sizes: "16x16"
    });
    setSiteHeadLink("icon", new URL("favicon-32.png", siteFrameAssetBase).href, {
        type: "image/png",
        sizes: "32x32"
    });
    setSiteHeadLink("icon", new URL("favicon-192.png", siteFrameAssetBase).href, {
        type: "image/png",
        sizes: "192x192"
    });
    setSiteHeadLink("shortcut icon", new URL("favicon.ico", siteFrameAssetBase).href, {
        type: "image/x-icon"
    });
    setSiteHeadLink("apple-touch-icon", new URL("apple-touch-icon.png", siteFrameAssetBase).href);
}

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

        if (!nav.querySelector('a[href*="listings"]')) {
            const listingsLink = document.createElement("a");
            listingsLink.href = normalizeLocalFileUrl(new URL("listings/", siteFrameAssetBase).href);
            listingsLink.textContent = "Listings";

            const searchLink = Array.from(nav.querySelectorAll("a")).find((link) => {
                return link.textContent.trim().toLowerCase() === "search homes";
            });

            if (searchLink?.parentNode) {
                searchLink.parentNode.insertBefore(listingsLink, searchLink);
            } else {
                nav.insertBefore(listingsLink, nav.querySelector(".site-frame-cta") || null);
            }
        }

        nav.querySelectorAll('a[href*="listings"]').forEach((link) => {
            const linkUrl = new URL(link.href, window.location.href);
            const isListingsPage = normalizeSiteFramePath(window.location.pathname).startsWith(
                normalizeSiteFramePath(linkUrl.pathname)
            );

            if (isListingsPage) {
                link.setAttribute("aria-current", "page");
            }
        });

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

        nav.querySelectorAll('[data-site-portal-link="agent"]').forEach((link) => link.remove());

        let actionList = nav.querySelector(".site-frame-action-list");
        if (!actionList) {
            actionList = document.createElement("div");
            actionList.className = "site-frame-action-list";
            nav.appendChild(actionList);
        }

        let clientPortalLink = nav.querySelector('[data-site-portal-link="client"]');
        if (!clientPortalLink) {
            clientPortalLink = document.createElement("a");
            clientPortalLink.href = "https://client.joepine.com/";
            clientPortalLink.textContent = "Client Login";
            clientPortalLink.className = "site-frame-portal-link site-frame-portal-link--client";
            clientPortalLink.setAttribute("data-site-portal-link", "client");
            clientPortalLink.setAttribute("aria-label", "Open the Joe Pine client portal");
        }

        if (cta) {
            actionList.append(clientPortalLink, cta);
        } else {
            actionList.appendChild(clientPortalLink);
        }

        if (top && !top.querySelector("[data-site-mobile-client-login]")) {
            const mobileClientLink = clientPortalLink.cloneNode(true);
            mobileClientLink.className = "site-frame-mobile-client-login";
            mobileClientLink.setAttribute("data-site-mobile-client-login", "");
            top.insertBefore(mobileClientLink, top.querySelector("[data-site-nav-toggle]") || top.querySelector(".site-frame-right") || null);
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
            "images/branding/platinum-logo-black.png",
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

function ensureSiteContactModal() {
    if (!siteContactModalEnabled) {
        return null;
    }

    if (siteContactModal instanceof HTMLElement) {
        return siteContactModal;
    }

    siteContactModal = document.querySelector(".site-contact-modal");

    if (siteContactModal instanceof HTMLElement) {
        return siteContactModal;
    }

    const modal = document.createElement("section");
    modal.className = "site-contact-modal";
    modal.setAttribute("aria-label", "Contact Joe Pine");
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
        <div class="site-contact-modal__card">
            <div class="site-contact-modal__media">
                <img class="site-contact-modal__photo" src="${new URL("images/photos/joe-front-steps.jpg", siteFrameAssetBase).href}" alt="Joe Pine sitting on the front steps of a home" loading="lazy">
            </div>
            <div class="site-contact-modal__body">
                <div class="site-contact-modal__head">
                    <div>
                        <p class="site-contact-modal__eyebrow">Contact Joe</p>
                        <h2>Talk with Joe Pine</h2>
                    </div>
                    <button class="site-contact-modal__close" type="button" data-site-contact-close aria-label="Close contact card">Close</button>
                </div>
                <img class="site-contact-modal__logo" src="${new URL("Joe Pine Realtor Red.png", siteFrameAssetBase).href}" alt="Joe Pine Realtor logo">
                <p class="site-contact-modal__lede">Platinum Real Estate Group at Keller Williams Leading Edge</p>
                <p class="site-contact-modal__copy">If you want help understanding your next step, you can reach out directly. Questions are welcome whether you are ready now or still figuring out where to begin.</p>
                <div class="site-contact-modal__links">
                    <a class="site-contact-link" href="tel:4013270888">
                        <strong>Call or text</strong>
                        <span>401.327.0888</span>
                    </a>
                    <a class="site-contact-link" href="mailto:JoePine@KW.com?subject=I%20Would%20Like%20To%20Talk%20About%20Buying">
                        <strong>Email</strong>
                        <span>JoePine@KW.com</span>
                    </a>
                    <a class="site-contact-link" href="${normalizeLocalFileUrl(new URL("index.html#about", siteFrameAssetBase).href)}">
                        <strong>Learn more about Joe</strong>
                        <span>Read more on JoePine.com</span>
                    </a>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    syncLocalFilePreviewUrls(modal);
    siteContactModal = modal;
    return siteContactModal;
}

function closeSiteContactModal() {
    const modal = ensureSiteContactModal();

    if (!(modal instanceof HTMLElement)) {
        return;
    }

    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-site-contact-open");
}

function openSiteContactModal() {
    const modal = ensureSiteContactModal();

    if (!(modal instanceof HTMLElement)) {
        return;
    }

    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-site-contact-open");
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
ensureSiteFrameFavicon();
ensureSiteFrameShellLayout();
ensureSiteContactModal();

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

            const isContactCta = link.classList.contains("site-frame-cta") && siteContactModalEnabled;

            if (isContactCta) {
                event.preventDefault();
                openSiteContactModal();
                return;
            }

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

document.querySelectorAll(".site-frame-cta").forEach((link) => {
    link.addEventListener("click", (event) => {
        if (!siteContactModalEnabled) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (window.location.hash === "#contact") {
            const cleanUrl = new URL(window.location.href);
            cleanUrl.hash = "";
            window.history.replaceState(null, "", `${cleanUrl.pathname}${cleanUrl.search}`);
        }

        document.querySelectorAll(".site-frame-nav.is-open").forEach((nav) => {
            nav.classList.remove("is-open");
        });

        document.querySelectorAll("[data-site-nav-toggle]").forEach((toggle) => {
            toggle.setAttribute("aria-expanded", "false");
        });

        if (window.location.hash === "#contact" && window.history?.replaceState) {
            const url = new URL(window.location.href);
            url.hash = "";
            window.history.replaceState(null, "", `${url.pathname}${url.search}`);
        }

        updateSiteFrameOffset();
        openSiteContactModal();
    });
});

siteContactModal?.addEventListener("click", (event) => {
    if (event.target === siteContactModal || event.target.closest("[data-site-contact-close]")) {
        closeSiteContactModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && siteContactModal?.getAttribute("aria-hidden") === "false") {
        closeSiteContactModal();
    }
});
