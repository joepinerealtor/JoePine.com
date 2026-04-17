const slides = Array.from(document.querySelectorAll(".slide"));
const outlineLinks = Array.from(document.querySelectorAll(".outline-link"));
const progressCurrentNodes = Array.from(document.querySelectorAll("[data-progress-current]"));
const progressTitleNodes = Array.from(document.querySelectorAll("[data-progress-title]"));
const currentYearNodes = document.querySelectorAll("[data-current-year]");
const prevButtons = Array.from(document.querySelectorAll("[data-deck-prev]"));
const nextButtons = Array.from(document.querySelectorAll("[data-deck-next]"));
const resetButtons = Array.from(document.querySelectorAll("[data-deck-reset]"));
const openMenuButtons = Array.from(document.querySelectorAll("[data-open-menu]"));
const closeMenuButtons = Array.from(document.querySelectorAll("[data-close-menu]"));
const openSlidesButtons = Array.from(document.querySelectorAll("[data-open-slides]"));
const closeSlidesButtons = Array.from(document.querySelectorAll("[data-close-slides]"));
const openSourcesButtons = Array.from(document.querySelectorAll("[data-open-sources]"));
const closeSourcesButtons = Array.from(document.querySelectorAll("[data-close-sources]"));
const openContactButtons = Array.from(document.querySelectorAll("[data-open-contact]"));
const closeContactButtons = Array.from(document.querySelectorAll("[data-close-contact]"));
const shareButtons = Array.from(document.querySelectorAll("[data-share-workbook]"));
const overlayBackdrop = document.querySelector("[data-close-overlays]");
const mobileDrawer = document.getElementById("roadmap-mobile-menu");
const slideSheet = document.getElementById("roadmap-slide-sheet");
const sourcesPanel = document.querySelector(".page-notes");
const contactModal = document.querySelector(".contact-modal");
const desktopStage = document.querySelector(".roadmap-main");
const mobileStoryViewport = document.querySelector("[data-mobile-story-stage]");
const mobileStoryProgress = document.querySelector("[data-mobile-story-progress]");
const mobileStoryStep = document.querySelector("[data-mobile-story-step]");
const mobileStoryPage = document.querySelector("[data-mobile-story-page]");
const scrollUpButton = document.querySelector("[data-scroll-up]");
const scrollDownButton = document.querySelector("[data-scroll-down]");
const desktopScrollUpButton = document.querySelector("[data-desktop-scroll-up]");
const desktopScrollDownButton = document.querySelector("[data-desktop-scroll-down]");
const desktopOutlineList = document.querySelector(".roadmap-rail .outline-list");
const mobileAppMedia = window.matchMedia("(max-width: 980px)");
const tabletDeckMedia = window.matchMedia("(min-width: 981px) and (max-width: 1180px)");

const outlineLinkMap = new Map();
const slideIndexById = new Map();
const mobilePagesBySlide = [];

let activeIndex = 0;
let activeMobilePageIndex = 0;
let mobileStoriesBuilt = false;
let touchStartPoint = null;

const MOBILE_SCROLL_TOLERANCE = 6;
const DESKTOP_OVERFLOW_TOLERANCE = 6;
const DESKTOP_SCROLL_CUE_TOLERANCE = 24;

slides.forEach((slide, index) => {
    slideIndexById.set(slide.id, index);
});

outlineLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) {
        return;
    }

    if (!outlineLinkMap.has(href)) {
        outlineLinkMap.set(href, []);
    }

    outlineLinkMap.get(href).push(link);
});

function isMobileStoryMode() {
    return mobileAppMedia.matches;
}

function isTabletDeckMode() {
    return tabletDeckMedia.matches;
}

function normalizeText(value) {
    return (value || "").replace(/\s+/g, " ").trim();
}

function dedupeTexts(values) {
    const seen = new Set();

    return values.filter((value) => {
        const normalized = normalizeText(value);

        if (!normalized || seen.has(normalized)) {
            return false;
        }

        seen.add(normalized);
        return true;
    });
}

function createElement(tagName, className, text = "") {
    const node = document.createElement(tagName);

    if (className) {
        node.className = className;
    }

    if (text) {
        node.textContent = text;
    }

    return node;
}

function isPotentialCard(node) {
    if (!(node instanceof HTMLElement)) {
        return false;
    }

    const className = typeof node.className === "string" ? node.className : "";

    return node.matches("article, blockquote, a.contact-link")
        || /(card|panel|step|callout|bucket|risk|loan|timeline|payment|state|stat|check|contact-link|summary)/i.test(className);
}

function isSplitContainer(node) {
    if (!(node instanceof HTMLElement)) {
        return false;
    }

    if (node.matches(".slide__meta, .slide__takeaway, .cover-brandbar, .chip-row")) {
        return false;
    }

    if (node.matches(
        ".layout-cover, .layout-stack, .layout-split, .layout-balanced, .layout-sidebar, " +
        ".card-grid-2, .card-grid-3, .card-grid-4, .comparison-grid, .comparison-summary, " +
        ".payment-grid, .bucket-grid, .loan-columns, .contingency-grid, .action-plan, " +
        ".process-strip, .timeline-track, .self-check, .risk-grid, .timing-grid, .state-grid, " +
        ".stats-grid, .contact-panel"
    )) {
        return true;
    }

    const cardChildren = Array.from(node.children).filter((child) => isPotentialCard(child));
    return cardChildren.length > 1;
}

function collectAtomicBlocks(node, output) {
    if (!(node instanceof HTMLElement)) {
        return;
    }

    if (node.matches(".slide__meta, .slide__takeaway, .cover-brandbar, .chip-row")) {
        return;
    }

    if (isSplitContainer(node)) {
        Array.from(node.children).forEach((child) => {
            collectAtomicBlocks(child, output);
        });
        return;
    }

    if (!normalizeText(node.innerText)) {
        return;
    }

    output.push(node);
}

function getSlideLabel(slide) {
    if (!slide) {
        return "Cover";
    }

    return slide.dataset.nav
        || normalizeText(slide.querySelector(".slide__title, h1, h2")?.textContent)
        || "Slide";
}

function getSlideNumber(index) {
    return String(index + 1).padStart(2, "0");
}

function extractCssUrl(value) {
    const match = (value || "").match(/url\((['"]?)(.*?)\1\)/i);
    return match?.[2] || "";
}

function getSceneTone(slideIndex) {
    const tones = ["rose", "sand", "sage", "slate"];
    return tones[slideIndex % tones.length];
}

function truncateText(value, maxLength = 96) {
    const normalized = normalizeText(value);

    if (normalized.length <= maxLength) {
        return normalized;
    }

    return `${normalized.slice(0, maxLength - 1).trimEnd()}\u2026`;
}

function getImagePayload(node) {
    const image = node.matches("img") ? node : node.querySelector("img");

    if (!(image instanceof HTMLImageElement)) {
        return {
            imageSrc: "",
            imageAlt: ""
        };
    }

    return {
        imageSrc: image.currentSrc || image.getAttribute("src") || "",
        imageAlt: image.getAttribute("alt") || ""
    };
}

function getIconMarkup(node) {
    const icon = node.querySelector(".icon-badge svg, .icon-title svg, svg");
    return icon?.outerHTML || "";
}

function getSceneItem(node) {
    const label = dedupeTexts(
        Array.from(
            node.querySelectorAll(
                ".state-card__tag, .contingency-card__pill, .week-card__week, .timeline-node__day, " +
                ".score-band, .metric span, .muted-label, .eyebrow"
            )
        ).map((item) => item.textContent)
    )[0] || "";

    const title = dedupeTexts(
        Array.from(node.querySelectorAll("h3, h4, h5, h6, strong"))
            .map((item) => item.textContent)
    ).find((value) => value && value !== label) || "";

    const body = dedupeTexts(
        Array.from(node.querySelectorAll("p, li"))
            .map((item) => item.textContent)
    ).find((value) => value && value !== title && value !== label) || "";

    const { imageSrc, imageAlt } = getImagePayload(node);

    return {
        label: label !== title ? label : "",
        title: title || label,
        body: truncateText(body, 88),
        iconMarkup: getIconMarkup(node),
        imageSrc,
        imageAlt
    };
}

function getSceneItems(slide, selector, limit = 4) {
    return Array.from(slide.querySelectorAll(selector))
        .slice(0, limit)
        .map((node) => getSceneItem(node))
        .filter((item) => item.title || item.body || item.label);
}

function getCardPayload(node) {
    const rawText = normalizeText(node.innerText);
    const rawLines = dedupeTexts(
        rawText
            .split(/[.!?]\s+|\n+/)
            .map((line) => normalizeText(line))
    );

    const eyebrow = dedupeTexts(
        Array.from(node.querySelectorAll(".eyebrow, .muted-label, .stat-card__label"))
            .map((item) => item.textContent)
    )[0] || "";

    const title = dedupeTexts(
        Array.from(node.querySelectorAll("h3, h4, h5, h6, strong"))
            .map((item) => item.textContent)
    ).find((value) => value && value !== eyebrow) || "";

    const value = dedupeTexts(
        Array.from(
            node.querySelectorAll(
                ".stat-card__value, .metric-value, .stat-value, .big-number, " +
                ".score-band, .state-card__tag, .contingency-card__pill, .week-card__week, .timeline-node__day"
            )
        )
            .map((item) => item.textContent)
    ).find((entry) => entry && entry !== title && entry !== eyebrow && entry.length < 44) || "";

    const paragraphs = dedupeTexts(
        Array.from(node.querySelectorAll("p"))
            .map((item) => item.textContent)
    ).filter((entry) => entry !== eyebrow && entry !== title && entry !== value);

    const list = dedupeTexts(
        Array.from(node.querySelectorAll("li"))
            .map((item) => item.textContent)
    ).filter((entry) => entry !== eyebrow && entry !== title).slice(0, 4);

    const body = paragraphs.find((entry) => !list.includes(entry))
        || rawLines.find((entry) => entry !== eyebrow && entry !== title && entry !== value)
        || "";

    const fallbackTitle = rawLines.find((entry) => entry !== eyebrow && entry !== value) || "";
    const { imageSrc, imageAlt } = getImagePayload(node);
    const iconMarkup = getIconMarkup(node);

    return {
        eyebrow,
        title: title || fallbackTitle,
        value,
        body: body && body !== title ? body : "",
        list,
        imageSrc,
        imageAlt,
        iconMarkup
    };
}

function getStoryWeight(payload) {
    let weight = 1;

    if ((payload.body || "").length > 150) {
        weight += 1;
    }

    if ((payload.title || "").length > 58) {
        weight += 1;
    }

    if ((payload.list || []).length >= 4) {
        weight += 1;
    }

    return Math.min(weight, 3);
}

function buildStoryCard(payload, options = {}) {
    const hasContent = payload.eyebrow
        || payload.title
        || payload.value
        || payload.body
        || (payload.list || []).length
        || payload.imageSrc;

    if (!hasContent) {
        return null;
    }

    const card = createElement("article", "story-card");
    const hasIcon = Boolean(payload.iconMarkup) && !payload.imageSrc;

    if (options.takeaway) {
        card.classList.add("story-card--takeaway");
    }

    if (payload.imageSrc) {
        const media = createElement("figure", "story-card__media");
        const image = document.createElement("img");
        image.src = payload.imageSrc;
        image.alt = payload.imageAlt || payload.title || "";
        image.loading = "lazy";
        media.appendChild(image);
        card.appendChild(media);
    }

    if (hasIcon) {
        const head = createElement("div", "story-card__head");
        const badge = createElement("span", "story-card__icon");
        const copy = createElement("div", "story-card__heading");
        badge.innerHTML = payload.iconMarkup;

        if (payload.eyebrow) {
            copy.appendChild(createElement("p", "story-card__eyebrow", payload.eyebrow));
        }

        if (payload.title) {
            copy.appendChild(createElement("h3", "story-card__title", payload.title));
        }

        if (payload.value) {
            copy.appendChild(createElement("p", "story-card__value", payload.value));
        }

        head.appendChild(badge);
        head.appendChild(copy);
        card.appendChild(head);
    } else {
        if (payload.eyebrow) {
            card.appendChild(createElement("p", "story-card__eyebrow", payload.eyebrow));
        }

        if (payload.title) {
            card.appendChild(createElement("h3", "story-card__title", payload.title));
        }

        if (payload.value) {
            card.appendChild(createElement("p", "story-card__value", payload.value));
        }
    }

    if (payload.body) {
        card.appendChild(createElement("p", "story-card__body", payload.body));
    }

    if ((payload.list || []).length) {
        const list = createElement("ul", "story-card__list");
        payload.list.slice(0, 4).forEach((entry) => {
            list.appendChild(createElement("li", "", entry));
        });
        card.appendChild(list);
    }

    card.dataset.storyWeight = String(options.weight || getStoryWeight(payload));
    return card;
}

function buildTakeawayCard(node) {
    const label = normalizeText(node.querySelector("strong")?.textContent) || "What this means for you";
    const fullText = normalizeText(node.textContent);
    const body = normalizeText(fullText.replace(label, ""));

    return buildStoryCard(
        {
            eyebrow: "Takeaway",
            title: label,
            body
        },
        {
            takeaway: true,
            weight: 1
        }
    );
}

function buildStoryCardFromNode(node) {
    if (!(node instanceof HTMLElement)) {
        return null;
    }

    if (node.matches(".photo-card, .equity-chart")) {
        return null;
    }

    if (node.matches(".slide__takeaway")) {
        return buildTakeawayCard(node);
    }

    return buildStoryCard(getCardPayload(node));
}

function buildPhotoScene(figure, slideIndex) {
    const tone = getSceneTone(slideIndex);
    const scene = createElement("figure", "story-scene story-scene--photo");
    const image = figure.querySelector("img");
    const caption = figure.querySelector(".photo-card__overlay");
    const body = createElement("figcaption", "story-scene__caption");
    const { imageSrc, imageAlt } = getImagePayload(figure);
    const visual = document.createElement("img");
    const title = normalizeText(caption?.querySelector("h3")?.textContent);
    const copy = normalizeText(caption?.querySelector("p")?.textContent);
    const chipTexts = dedupeTexts(
        Array.from(caption?.querySelectorAll("h3, p") || [])
            .map((item) => item.textContent)
    ).filter((entry) => entry !== title && entry !== copy).slice(0, 2);

    scene.dataset.tone = tone;
    visual.src = imageSrc || image?.getAttribute("src") || "";
    visual.alt = imageAlt || title || "";
    visual.loading = "lazy";
    visual.className = "story-scene__image";
    scene.appendChild(visual);

    body.appendChild(createElement("p", "story-scene__eyebrow", "In Focus"));

    if (title) {
        body.appendChild(createElement("h3", "story-scene__title", title));
    }

    if (copy) {
        body.appendChild(createElement("p", "story-scene__body", copy));
    }

    if (chipTexts.length) {
        const chips = createElement("div", "story-scene__chips");
        chipTexts.slice(0, 2).forEach((entry) => {
            chips.appendChild(createElement("span", "story-scene__chip", entry));
        });
        body.appendChild(chips);
    }

    scene.appendChild(body);
    return scene;
}

function buildChartScene(slide, slideIndex) {
    const svg = slide.querySelector(".equity-chart svg");

    if (!(svg instanceof SVGElement)) {
        return null;
    }

    const scene = createElement("div", "story-scene story-scene--chart");
    const wrap = createElement("div", "story-scene__svg");
    const legend = slide.querySelector(".equity-legend");
    scene.dataset.tone = getSceneTone(slideIndex);
    wrap.innerHTML = svg.outerHTML;
    scene.appendChild(wrap);

    if (legend) {
        const chips = createElement("div", "story-scene__chips");
        Array.from(legend.querySelectorAll(".legend-item")).slice(0, 3).forEach((item) => {
            chips.appendChild(createElement("span", "story-scene__chip", normalizeText(item.textContent)));
        });
        scene.appendChild(chips);
    }

    return scene;
}

function buildCompareScene(items, slideIndex) {
    if (items.length < 2) {
        return null;
    }

    const scene = createElement("div", "story-scene story-scene--compare");
    const grid = createElement("div", "story-scene__compare");
    scene.dataset.tone = getSceneTone(slideIndex);

    items.slice(0, 2).forEach((item) => {
        const panel = createElement("article", "story-scene__panel");

        if (item.label) {
            panel.appendChild(createElement("p", "story-scene__eyebrow", item.label));
        }

        panel.appendChild(createElement("h3", "story-scene__title", item.title));

        if (item.body) {
            panel.appendChild(createElement("p", "story-scene__body", item.body));
        }

        grid.appendChild(panel);
    });

    scene.appendChild(grid);
    return scene;
}

function buildTimelineScene(items, slideIndex) {
    if (items.length < 3) {
        return null;
    }

    const scene = createElement("div", "story-scene story-scene--timeline");
    const rail = createElement("div", "story-scene__timeline");
    scene.dataset.tone = getSceneTone(slideIndex);

    items.slice(0, 4).forEach((item, index) => {
        const step = createElement("article", "story-scene__step");
        const dot = createElement("span", "story-scene__dot", String(index + 1).padStart(2, "0"));
        const copy = createElement("div", "story-scene__stepcopy");

        if (item.label) {
            copy.appendChild(createElement("p", "story-scene__eyebrow", item.label));
        }

        copy.appendChild(createElement("h3", "story-scene__title", item.title));
        step.appendChild(dot);
        step.appendChild(copy);
        rail.appendChild(step);
    });

    scene.appendChild(rail);
    return scene;
}

function buildMosaicScene(items, slideIndex) {
    if (items.length < 2) {
        return null;
    }

    const scene = createElement("div", "story-scene story-scene--mosaic");
    const grid = createElement("div", "story-scene__grid");
    scene.dataset.tone = getSceneTone(slideIndex);

    items.slice(0, 4).forEach((item) => {
        const tile = createElement("article", "story-scene__tile");

        if (item.label) {
            tile.appendChild(createElement("p", "story-scene__eyebrow", item.label));
        }

        if (item.iconMarkup) {
            const badge = createElement("span", "story-scene__icon");
            badge.innerHTML = item.iconMarkup;
            tile.appendChild(badge);
        }

        tile.appendChild(createElement("h3", "story-scene__title", item.title));

        if (item.body) {
            tile.appendChild(createElement("p", "story-scene__body", item.body));
        }

        grid.appendChild(tile);
    });

    scene.appendChild(grid);
    return scene;
}

function buildPillScene(slide, slideIndex) {
    const items = getSceneItems(slide, "article, .chip-row .chip", 4);
    const scene = createElement("div", "story-scene story-scene--pills");
    const orb = createElement("div", "story-scene__orb");
    const chips = createElement("div", "story-scene__chips");
    const iconMarkup = getIconMarkup(slide);
    scene.dataset.tone = getSceneTone(slideIndex);

    if (iconMarkup) {
        orb.innerHTML = iconMarkup;
    } else {
        orb.textContent = getSlideNumber(slideIndex);
    }

    scene.appendChild(orb);

    items.slice(0, 3).forEach((item) => {
        chips.appendChild(createElement("span", "story-scene__chip", item.title || item.body));
    });

    scene.appendChild(chips);
    return scene;
}

function buildStoryScene(slide, slideIndex) {
    if (slide.querySelector(".slide__surface--image")) {
        return null;
    }

    if (slide.querySelector(".equity-chart svg")) {
        return buildChartScene(slide, slideIndex);
    }

    const photoFigure = slide.querySelector(".photo-card");
    if (photoFigure) {
        return buildPhotoScene(photoFigure, slideIndex);
    }

    if (slide.querySelector(".comparison-grid, .timing-grid, .state-grid")) {
        const items = getSceneItems(slide, ".comparison-card, .timing-card, .state-card", 2);
        const scene = buildCompareScene(items, slideIndex);
        if (scene) {
            return scene;
        }
    }

    if (slide.querySelector(".timeline-track, .process-strip, .action-plan")) {
        const items = getSceneItems(slide, ".timeline-node, .process-step, .week-card", 4);
        const scene = buildTimelineScene(items, slideIndex);
        if (scene) {
            return scene;
        }
    }

    const mosaicItems = getSceneItems(
        slide,
        ".payment-piece, .loan-card, .contingency-card, .risk-item, .self-check > article, " +
        ".bucket-grid > article, .card-grid-2 > article, .card-grid-3 > article, " +
        ".layout-balanced > article, .layout-sidebar > article, .info-card",
        4
    );
    const mosaicScene = buildMosaicScene(mosaicItems, slideIndex);
    if (mosaicScene) {
        return mosaicScene;
    }

    return buildPillScene(slide, slideIndex);
}

function buildStoryHero(slide, slideIndex) {
    const meta = slide.querySelector(".slide__meta");
    const hero = createElement("div", "story-hero");
    const eyebrow = normalizeText(meta?.querySelector(".slide__eyebrow")?.textContent);
    const title = normalizeText(meta?.querySelector(".slide__title")?.textContent);
    const lede = normalizeText(meta?.querySelector(".slide__lede")?.textContent);
    const note = normalizeText(meta?.querySelector(".slide__note")?.textContent);
    const chips = Array.from(slide.querySelectorAll(".chip-row .chip"))
        .map((chip) => normalizeText(chip.textContent))
        .filter(Boolean);

    hero.appendChild(createElement("p", "story-hero__index", `Slide ${getSlideNumber(slideIndex)}`));

    if (eyebrow) {
        hero.appendChild(createElement("p", "story-hero__eyebrow", eyebrow));
    }

    if (title) {
        hero.appendChild(createElement("h2", "story-hero__title", title));
    }

    if (lede) {
        hero.appendChild(createElement("p", "story-hero__body", lede));
    }

    if (chips.length) {
        const chipRow = createElement("div", "story-chip-row");
        chips.forEach((chip) => {
            chipRow.appendChild(createElement("span", "story-chip", chip));
        });
        hero.appendChild(chipRow);
    }

    if (note) {
        hero.appendChild(createElement("p", "story-hero__note", note));
    }

    return hero;
}

function createMobilePage(slide, slideIndex, pageIndex, useImageSurface = false) {
    const page = createElement("section", "mobile-page");
    page.dataset.slideIndex = String(slideIndex);
    page.dataset.pageIndex = String(pageIndex);
    page.setAttribute("aria-hidden", "true");

    const surface = createElement("div", "mobile-page__surface");
    const inner = createElement("div", "mobile-page__inner");

    if (useImageSurface) {
        const slideSurface = slide.querySelector(".slide__surface");
        const slideImage = slideSurface?.style?.getPropertyValue("--slide-image");
        surface.classList.add("mobile-page__surface--image");

        if (slideImage) {
            surface.style.setProperty("--page-image", slideImage);
        }
    }

    surface.appendChild(inner);
    page.appendChild(surface);

    return { page, inner };
}

function getMobilePageSurface(page) {
    return page?.querySelector(".mobile-page__surface") || null;
}

function getMobilePageInner(page) {
    return page?.querySelector(".mobile-page__inner") || null;
}

function getActiveMobileSurface() {
    const activePage = mobilePagesBySlide[activeIndex]?.[0];
    return getMobilePageSurface(activePage);
}

function getActiveDesktopSurface() {
    return slides[activeIndex]?.querySelector(".slide__surface") || null;
}

function getSurfaceMaxScroll(surface) {
    if (!surface) {
        return 0;
    }

    return Math.max(0, Math.ceil(surface.scrollHeight - surface.clientHeight));
}

function resetActiveMobileSurfaceScroll() {
    const surface = getActiveMobileSurface();

    if (surface) {
        surface.scrollTop = 0;
    }
}

function updateMobileScrollIndicators() {
    const surface = getActiveMobileSurface();
    const tolerance = MOBILE_SCROLL_TOLERANCE;

    if (!surface || !isMobileStoryMode()) {
        scrollUpButton?.classList.remove("is-visible");
        scrollDownButton?.classList.remove("is-visible");
        return;
    }

    const maxScroll = getSurfaceMaxScroll(surface);
    const canScroll = maxScroll > tolerance;
    const isAtTop = surface.scrollTop <= tolerance;
    const isAtBottom = surface.scrollTop >= maxScroll - tolerance;

    scrollUpButton?.classList.toggle("is-visible", canScroll && !isAtTop);
    scrollDownButton?.classList.toggle("is-visible", canScroll && !isAtBottom);
}

function updateDesktopSlideDensity() {
    if (isMobileStoryMode()) {
        slides.forEach((slide) => {
            slide.classList.remove("is-dense", "is-compact", "is-tight");
        });
        return;
    }

    const tolerance = DESKTOP_OVERFLOW_TOLERANCE;
    const hasOverflow = (surface) => (
        getSurfaceMaxScroll(surface) > tolerance
        || surface.scrollWidth - surface.clientWidth > tolerance
    );

    slides.forEach((slide) => {
        const surface = slide.querySelector(".slide__surface");

        slide.classList.remove("is-dense", "is-compact", "is-tight");

        if (!surface) {
            return;
        }

        if (hasOverflow(surface)) {
            slide.classList.add("is-dense");
        }

        if (hasOverflow(surface)) {
            slide.classList.add("is-compact");
        }

        if (hasOverflow(surface)) {
            slide.classList.add("is-tight");
        }
    });
}

function updateDesktopScrollIndicators() {
    const surface = getActiveDesktopSurface();
    const edgeTolerance = DESKTOP_OVERFLOW_TOLERANCE;

    if (!surface || isMobileStoryMode()) {
        desktopScrollUpButton?.classList.remove("is-visible");
        desktopScrollDownButton?.classList.remove("is-visible");
        return;
    }

    const maxScroll = getSurfaceMaxScroll(surface);
    const canScroll = maxScroll > DESKTOP_SCROLL_CUE_TOLERANCE;
    const isAtTop = surface.scrollTop <= edgeTolerance;
    const isAtBottom = surface.scrollTop >= maxScroll - edgeTolerance;

    desktopScrollUpButton?.classList.toggle("is-visible", canScroll && !isAtTop);
    desktopScrollDownButton?.classList.toggle("is-visible", canScroll && !isAtBottom);
}

function buildMobilePagesForSlide(slide, slideIndex) {
    const surface = slide.querySelector(".slide__surface");
    const useImageSurface = surface?.classList.contains("slide__surface--image");
    const inner = slide.querySelector(".slide__inner");
    const takeawayNode = inner?.querySelector(".slide__takeaway");
    const atomicBlocks = [];

    Array.from(inner?.children || []).forEach((child) => {
        collectAtomicBlocks(child, atomicBlocks);
    });

    const cards = atomicBlocks
        .map((block) => buildStoryCardFromNode(block))
        .filter(Boolean);

    const takeawayCard = takeawayNode ? buildTakeawayCard(takeawayNode) : null;
    const firstPage = createMobilePage(slide, slideIndex, 0, useImageSurface);
    const scene = buildStoryScene(slide, slideIndex);

    firstPage.inner.appendChild(buildStoryHero(slide, slideIndex));

    if (scene) {
        firstPage.inner.appendChild(scene);
    }

    cards.forEach((card) => {
        firstPage.inner.appendChild(card);
    });

    if (takeawayCard) {
        firstPage.inner.appendChild(takeawayCard);
    }

    return [firstPage.page];
}

function buildMobileStories() {
    if (mobileStoriesBuilt || !mobileStoryViewport) {
        return;
    }

    mobileStoryViewport.replaceChildren();
    mobilePagesBySlide.length = 0;

    slides.forEach((slide, index) => {
        const pages = buildMobilePagesForSlide(slide, index);

        pages.forEach((page) => {
            mobileStoryViewport.appendChild(page);
        });

        mobilePagesBySlide[index] = pages;
    });

    mobileStoriesBuilt = true;
}

function rebuildMobileStories(options = {}) {
    if (!mobileStoryViewport) {
        return;
    }

    const previousScrollTop = options.preserveScroll ? getActiveMobileSurface()?.scrollTop || 0 : 0;
    mobileStoriesBuilt = false;
    buildMobileStories();
    activeMobilePageIndex = 0;

    if (options.preserveScroll) {
        const surface = getActiveMobileSurface();
        if (surface) {
            surface.scrollTop = previousScrollTop;
        }
    }

    updateMobileScrollIndicators();
}

function scheduleMobileStoryLayout(options = {}) {
    if (!isMobileStoryMode()) {
        return;
    }

    rebuildMobileStories({
        preserveScroll: Boolean(options.preserveScroll || options.preservePage)
    });
    syncMobilePages();
    updateChrome();
}

function syncDesktopSlides(options = {}) {
    slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", isActive ? "false" : "true");

        const surface = slide.querySelector(".slide__surface");
        if (surface && isActive && options.resetScroll !== false) {
            surface.scrollTop = 0;
        }
    });

    updateDesktopSlideDensity();
    updateDesktopScrollIndicators();
}

function syncMobilePages() {
    buildMobileStories();

    mobilePagesBySlide.forEach((pages, slideIndex) => {
        pages.forEach((page, pageIndex) => {
            const isActive = slideIndex === activeIndex && pageIndex === activeMobilePageIndex;
            page.classList.toggle("is-active", isActive);
            page.setAttribute("aria-hidden", isActive ? "false" : "true");
        });
    });

    slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
        slide.setAttribute("aria-hidden", slideIndex === activeIndex ? "false" : "true");
    });

    updateMobileScrollIndicators();
}

function updateOutlineState() {
    outlineLinks.forEach((link) => link.classList.remove("is-active"));
    (outlineLinkMap.get(`#${slides[activeIndex]?.id}`) || []).forEach((link) => link.classList.add("is-active"));

    const desktopActiveLink = (outlineLinkMap.get(`#${slides[activeIndex]?.id}`) || []).find((link) => link.closest(".roadmap-rail"));

    if (desktopActiveLink && desktopOutlineList) {
        desktopActiveLink.scrollIntoView({
            block: "nearest",
            inline: "nearest"
        });
    }
}

function updateMobileStoryChrome() {
    if (!mobileStoryProgress || !mobileStoryStep || !mobileStoryPage) {
        return;
    }

    const pageCount = mobilePagesBySlide[activeIndex]?.length || 1;
    const label = getSlideLabel(slides[activeIndex]);
    const isTabletMode = isTabletDeckMode();
    const totalSegments = isTabletMode ? slides.length : pageCount;
    const activeSegmentIndex = isTabletMode ? activeIndex : activeMobilePageIndex;

    mobileStoryStep.textContent = `${getSlideNumber(activeIndex)} ${label}`;
    mobileStoryPage.textContent = isMobileStoryMode()
        ? `Slide ${getSlideNumber(activeIndex)} of ${String(slides.length).padStart(2, "0")} • ${activeMobilePageIndex + 1}/${pageCount}`
        : `Slide ${activeIndex + 1} of ${slides.length}`;

    if (isMobileStoryMode()) {
        mobileStoryPage.textContent = `Slide ${getSlideNumber(activeIndex)} of ${String(slides.length).padStart(2, "0")}`;
    } else if (isTabletMode) {
        mobileStoryPage.textContent = `Slide ${getSlideNumber(activeIndex)} of ${String(slides.length).padStart(2, "0")} \u2022 Tap to browse all chapters`;
    }

    mobileStoryProgress.replaceChildren();

    for (let index = 0; index < totalSegments; index += 1) {
        const segment = createElement("span", "");
        segment.classList.toggle("is-complete", index < activeSegmentIndex);
        segment.classList.toggle("is-active", index === activeSegmentIndex);
        mobileStoryProgress.appendChild(segment);
    }
}

function updateChrome() {
    const countText = `${getSlideNumber(activeIndex)} / ${String(slides.length).padStart(2, "0")}`;
    const titleText = getSlideLabel(slides[activeIndex]);
    const isFirstMobilePage = activeIndex === 0;
    const isLastMobilePage = activeIndex === slides.length - 1;

    progressCurrentNodes.forEach((node) => {
        node.textContent = countText;
    });

    progressTitleNodes.forEach((node) => {
        node.textContent = titleText;
    });

    prevButtons.forEach((button) => {
        button.disabled = isMobileStoryMode() ? isFirstMobilePage : activeIndex === 0;
    });

    nextButtons.forEach((button) => {
        button.disabled = isMobileStoryMode() ? isLastMobilePage : activeIndex === slides.length - 1;
    });

    resetButtons.forEach((button) => {
        button.disabled = isMobileStoryMode() ? isFirstMobilePage : activeIndex === 0;
    });

    updateOutlineState();
    updateMobileStoryChrome();
}

function syncHash(slideId) {
    if (!window.history || typeof window.history.replaceState !== "function") {
        return;
    }

    const url = new URL(window.location.href);
    url.hash = slideId;
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function resetDeckViewportPosition() {
    if (isMobileStoryMode()) {
        return;
    }

    window.scrollTo(0, 0);
}

function setActiveSlide(index, options = {}) {
    if (!slides.length) {
        return;
    }

    const safeIndex = Math.max(0, Math.min(index, slides.length - 1));
    activeIndex = safeIndex;

    if (isMobileStoryMode()) {
        buildMobileStories();
        activeMobilePageIndex = 0;
        syncMobilePages();

        if (options.resetScroll !== false) {
            resetActiveMobileSurfaceScroll();
            updateMobileScrollIndicators();
        }
    } else {
        activeMobilePageIndex = 0;
        syncDesktopSlides(options);
    }

    updateChrome();

    if (options.updateHash !== false) {
        syncHash(slides[safeIndex].id);
    }
}

function goToRelativeSlide(direction) {
    if (isMobileStoryMode()) {
        if (direction > 0) {
            if (activeIndex < slides.length - 1) {
                setActiveSlide(activeIndex + 1, { mobilePage: 0 });
            }

            return;
        }

        if (activeIndex > 0) {
            setActiveSlide(activeIndex - 1, { mobilePage: 0 });
        }

        return;
    }

    setActiveSlide(activeIndex + direction);
}

function setBodyOverlayState() {
    document.body.classList.toggle("is-menu-open", mobileDrawer?.getAttribute("aria-hidden") === "false");
    document.body.classList.toggle("is-slides-open", slideSheet?.getAttribute("aria-hidden") === "false");
    document.body.classList.toggle("is-sources-open", sourcesPanel?.getAttribute("aria-hidden") === "false");
    document.body.classList.toggle("is-contact-open", contactModal?.getAttribute("aria-hidden") === "false");
}

function closeMenu() {
    if (!mobileDrawer) {
        return;
    }

    mobileDrawer.setAttribute("aria-hidden", "true");
    openMenuButtons.forEach((button) => button.setAttribute("aria-expanded", "false"));
    setBodyOverlayState();
}

function openMenu() {
    if (!mobileDrawer) {
        return;
    }

    closeSlides();
    closeSources();
    closeContact();
    mobileDrawer.setAttribute("aria-hidden", "false");
    openMenuButtons.forEach((button) => button.setAttribute("aria-expanded", "true"));
    setBodyOverlayState();
}

function closeSlides() {
    if (!slideSheet) {
        return;
    }

    slideSheet.setAttribute("aria-hidden", "true");
    openSlidesButtons.forEach((button) => button.setAttribute("aria-expanded", "false"));
    setBodyOverlayState();
}

function openSlides() {
    if (!slideSheet) {
        return;
    }

    closeMenu();
    closeSources();
    closeContact();
    slideSheet.setAttribute("aria-hidden", "false");
    openSlidesButtons.forEach((button) => button.setAttribute("aria-expanded", "true"));
    setBodyOverlayState();
}

function closeSources() {
    if (!sourcesPanel) {
        return;
    }

    sourcesPanel.setAttribute("aria-hidden", "true");
    setBodyOverlayState();
}

function openSources() {
    if (!sourcesPanel) {
        return;
    }

    closeMenu();
    closeSlides();
    closeContact();
    sourcesPanel.setAttribute("aria-hidden", "false");
    setBodyOverlayState();
}

function closeContact() {
    if (!contactModal) {
        return;
    }

    contactModal.setAttribute("aria-hidden", "true");
    setBodyOverlayState();
}

function openContact() {
    if (!contactModal) {
        return;
    }

    closeMenu();
    closeSlides();
    closeSources();
    contactModal.setAttribute("aria-hidden", "false");
    setBodyOverlayState();
}

async function shareWorkbook() {
    const firstSlide = slides[0];
    const canonicalHref = document.querySelector('link[rel="canonical"]')?.href;
    const shareUrl = new URL(canonicalHref || `${window.location.origin}${window.location.pathname}`);

    if (firstSlide?.id) {
        shareUrl.hash = firstSlide.id;
    }

    const payload = {
        title: "Joe Pine Realtors First-Time Homebuyer Roadmap",
        text: "Joe Pine Realtors first-time homebuyer roadmap",
        url: shareUrl.toString()
    };

    if (navigator.share) {
        try {
            await navigator.share(payload);
            return;
        } catch (error) {
            if (error?.name === "AbortError") {
                return;
            }
        }
    }

    try {
        await navigator.clipboard.writeText(payload.url);
        window.alert("Link copied.");
    } catch (error) {
        window.prompt("Copy this link:", payload.url);
    }
}

outlineLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");
        if (!href || !href.startsWith("#")) {
            return;
        }

        const targetIndex = slideIndexById.get(href.slice(1));
        if (typeof targetIndex !== "number") {
            return;
        }

        event.preventDefault();
        closeMenu();
        closeSlides();
        setActiveSlide(targetIndex, { mobilePage: 0 });
    });
});

prevButtons.forEach((button) => {
    button.addEventListener("click", () => {
        goToRelativeSlide(-1);
    });
});

nextButtons.forEach((button) => {
    button.addEventListener("click", () => {
        goToRelativeSlide(1);
    });
});

resetButtons.forEach((button) => {
    button.addEventListener("click", () => {
        setActiveSlide(0, { mobilePage: 0 });
    });
});

openMenuButtons.forEach((button) => {
    button.addEventListener("click", () => {
        if (mobileDrawer?.getAttribute("aria-hidden") === "false") {
            closeMenu();
            return;
        }

        openMenu();
    });
});

closeMenuButtons.forEach((button) => {
    button.addEventListener("click", () => {
        closeMenu();
    });
});

openSlidesButtons.forEach((button) => {
    button.addEventListener("click", () => {
        if (slideSheet?.getAttribute("aria-hidden") === "false") {
            closeSlides();
            return;
        }

        openSlides();
    });
});

closeSlidesButtons.forEach((button) => {
    button.addEventListener("click", () => {
        closeSlides();
    });
});

openSourcesButtons.forEach((button) => {
    button.addEventListener("click", () => {
        openSources();
    });
});

closeSourcesButtons.forEach((button) => {
    button.addEventListener("click", () => {
        closeSources();
    });
});

openContactButtons.forEach((button) => {
    button.addEventListener("click", () => {
        openContact();
    });
});

closeContactButtons.forEach((button) => {
    button.addEventListener("click", () => {
        closeContact();
    });
});

shareButtons.forEach((button) => {
    button.addEventListener("click", () => {
        closeMenu();
        closeSlides();
        shareWorkbook();
    });
});

function scrollActiveMobileSurface(direction) {
    const surface = getActiveMobileSurface();

    if (!surface) {
        return;
    }

    const distance = Math.max(180, Math.round(surface.clientHeight * 0.72));
    surface.scrollBy({
        top: direction > 0 ? distance : -distance,
        behavior: "smooth"
    });
}

function scrollActiveDesktopSurface(direction) {
    const surface = getActiveDesktopSurface();

    if (!surface) {
        return;
    }

    const distance = Math.max(220, Math.round(surface.clientHeight * 0.72));
    surface.scrollBy({
        top: direction > 0 ? distance : -distance,
        behavior: "smooth"
    });
}

scrollUpButton?.addEventListener("click", () => {
    scrollActiveMobileSurface(-1);
});

scrollDownButton?.addEventListener("click", () => {
    scrollActiveMobileSurface(1);
});

desktopScrollUpButton?.addEventListener("click", () => {
    scrollActiveDesktopSurface(-1);
});

desktopScrollDownButton?.addEventListener("click", () => {
    scrollActiveDesktopSurface(1);
});

overlayBackdrop?.addEventListener("click", () => {
    closeMenu();
    closeSlides();
    closeSources();
    closeContact();
});

sourcesPanel?.addEventListener("click", (event) => {
    if (event.target === sourcesPanel) {
        closeSources();
    }
});

contactModal?.addEventListener("click", (event) => {
    if (event.target === contactModal) {
        closeContact();
    }
});

const swipeSurface = mobileStoryViewport || desktopStage;

swipeSurface?.addEventListener("touchstart", (event) => {
    if (
        document.body.classList.contains("is-menu-open")
        || document.body.classList.contains("is-slides-open")
        || document.body.classList.contains("is-sources-open")
        || document.body.classList.contains("is-contact-open")
    ) {
        touchStartPoint = null;
        return;
    }

    if (event.touches.length !== 1) {
        touchStartPoint = null;
        return;
    }

    if (event.target.closest("a, button, input, textarea, select, summary, details")) {
        touchStartPoint = null;
        return;
    }

    const touch = event.touches[0];
    touchStartPoint = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
    };
}, { passive: true });

swipeSurface?.addEventListener("touchend", (event) => {
    if (!touchStartPoint || event.changedTouches.length !== 1) {
        touchStartPoint = null;
        return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartPoint.x;
    const deltaY = touch.clientY - touchStartPoint.y;
    const elapsed = Date.now() - touchStartPoint.time;

    touchStartPoint = null;

    if (elapsed > 700 || Math.abs(deltaX) < 70 || Math.abs(deltaY) > 48) {
        return;
    }

    goToRelativeSlide(deltaX < 0 ? 1 : -1);
}, { passive: true });

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeMenu();
        closeSlides();
        closeSources();
        closeContact();
        return;
    }

    if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
    }

    const tagName = event.target?.tagName;
    if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT" || event.target?.isContentEditable) {
        return;
    }

    if (
        document.body.classList.contains("is-menu-open")
        || document.body.classList.contains("is-slides-open")
        || document.body.classList.contains("is-sources-open")
    ) {
        return;
    }

    if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        goToRelativeSlide(1);
    }

    if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        goToRelativeSlide(-1);
    }

    if (event.key === "Home") {
        event.preventDefault();
        setActiveSlide(0, { mobilePage: 0 });
    }

    if (event.key === "End") {
        event.preventDefault();
        if (isMobileStoryMode()) {
            setActiveSlide(slides.length - 1, { mobilePage: 0 });
            return;
        }

        setActiveSlide(slides.length - 1);
    }
});

window.addEventListener("hashchange", () => {
    const targetIndex = slideIndexById.get(window.location.hash.replace(/^#/, ""));
    if (typeof targetIndex === "number" && targetIndex !== activeIndex) {
        setActiveSlide(targetIndex, { updateHash: false, mobilePage: 0 });
        resetDeckViewportPosition();
    }
});

window.addEventListener("resize", () => {
    if (!isMobileStoryMode()) {
        syncDesktopSlides({ resetScroll: false });
        return;
    }

    scheduleMobileStoryLayout({ preserveScroll: true });
});

function handleViewportModeChange() {
    closeMenu();
    closeSlides();
    closeSources();

    if (isMobileStoryMode()) {
        rebuildMobileStories({ preserveScroll: false });
    }

    setActiveSlide(activeIndex, { updateHash: false, mobilePage: 0, resetScroll: false });
}

if (typeof mobileAppMedia.addEventListener === "function") {
    mobileAppMedia.addEventListener("change", handleViewportModeChange);
}

if (typeof tabletDeckMedia.addEventListener === "function") {
    tabletDeckMedia.addEventListener("change", handleViewportModeChange);
}

if (typeof mobileAppMedia.addEventListener !== "function" && typeof mobileAppMedia.addListener === "function") {
    mobileAppMedia.addListener(handleViewportModeChange);
}

if (typeof tabletDeckMedia.addEventListener !== "function" && typeof tabletDeckMedia.addListener === "function") {
    tabletDeckMedia.addListener(handleViewportModeChange);
}

currentYearNodes.forEach((node) => {
    node.textContent = new Date().getFullYear();
});

setBodyOverlayState();
buildMobileStories();

mobileStoryViewport?.addEventListener("scroll", (event) => {
    if (!(event.target instanceof HTMLElement) || !event.target.classList.contains("mobile-page__surface")) {
        return;
    }

    if (event.target !== getActiveMobileSurface()) {
        return;
    }

    updateMobileScrollIndicators();
}, { passive: true, capture: true });

desktopStage?.addEventListener("scroll", (event) => {
    if (!(event.target instanceof HTMLElement) || !event.target.classList.contains("slide__surface")) {
        return;
    }

    if (event.target !== getActiveDesktopSurface()) {
        return;
    }

    updateDesktopScrollIndicators();
}, { passive: true, capture: true });

window.addEventListener("load", () => {
    resetDeckViewportPosition();

    if (!isMobileStoryMode()) {
        syncDesktopSlides({ resetScroll: false });
    }
});

document.fonts?.ready?.then(() => {
    resetDeckViewportPosition();

    if (!isMobileStoryMode()) {
        syncDesktopSlides({ resetScroll: false });
    }
});

if (slides.length) {
    const initialIndex = slideIndexById.get(window.location.hash.replace(/^#/, "")) ?? 0;
    setActiveSlide(initialIndex, { updateHash: false, mobilePage: 0 });
    resetDeckViewportPosition();
}
