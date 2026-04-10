const headerClock = document.getElementById("headerClock");
const headerDate = document.getElementById("headerDate");
const currentYear = document.getElementById("currentYear");
const scrollContainer = document.querySelector(".portal-content");
const contentStrip = document.querySelector(".content-strip");
const sectionLinks = [...document.querySelectorAll(".section-nav-link")].filter((link) => {
  const href = link.getAttribute("href") || "";
  return href.startsWith("#");
});
const sections = sectionLinks
  .map((link) => {
    const href = link.getAttribute("href") || "";
    return document.querySelector(href);
  })
  .filter(Boolean);
const rateRefs = {
  conventional: document.getElementById("portalConventionalRateValue"),
  fha: document.getElementById("portalFhaRateValue"),
  va: document.getElementById("portalVaRateValue"),
  jumbo: document.getElementById("portalJumboRateValue"),
  sourceDateLabel: document.getElementById("portalRatesSourceDateLabel")
};
const hasRateTargets = Object.values(rateRefs).some(Boolean);
let scrollTicking = false;
let ratesRefreshInFlight = false;

const PORTAL_ACCESS_STORAGE_KEY = "kw-leading-edge-portal.access.v1";
const PORTAL_PASSCODE_HASH = "4030C42B313A82B953D14F04A85FF9DD9739E49A97D90631B7FB3029CCA1D6E1";
const RATE_STORAGE_KEY = "kw-leading-edge-portal.rates.v1";
const RATE_REFRESH_INTERVAL_MS = 15 * 60 * 1000;
const RATE_PROGRAMS = {
  conventional: {
    label: "Conventional",
    surveyName: "30 Year Fixed",
    sourceUrl: "https://www.mortgagenewsdaily.com/mortgage-rates/30-year-fixed"
  },
  fha: {
    label: "FHA",
    surveyName: "30 Year FHA",
    sourceUrl: "https://www.mortgagenewsdaily.com/mortgage-rates/30-year-fha"
  },
  va: {
    label: "VA",
    surveyName: "30 Year VA",
    sourceUrl: "https://www.mortgagenewsdaily.com/mortgage-rates/30-year-va"
  },
  jumbo: {
    label: "Jumbo",
    surveyName: "30 Year Jumbo",
    sourceUrl: "https://www.mortgagenewsdaily.com/mortgage-rates/30-year-jumbo"
  }
};

function removePortalGate() {
  document.querySelector(".portal-lock")?.remove();
  document.body.classList.remove("portal-protected");
}

function isPortalUnlocked() {
  try {
    return window.localStorage.getItem(PORTAL_ACCESS_STORAGE_KEY) === PORTAL_PASSCODE_HASH;
  } catch {
    return false;
  }
}

function storePortalAccess() {
  try {
    window.localStorage.setItem(PORTAL_ACCESS_STORAGE_KEY, PORTAL_PASSCODE_HASH);
  } catch {
    // Ignore storage failures and keep access for this page load only.
  }
}

async function hashPasscode(value) {
  if (!window.crypto?.subtle) {
    return value;
  }

  const encoded = new TextEncoder().encode(String(value || "").trim());
  const digest = await window.crypto.subtle.digest("SHA-256", encoded);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function createPortalGateMarkup() {
  const pageLabel = document.body.dataset.portalLockLabel || "Portal";
  const overlay = document.createElement("div");
  overlay.className = "portal-lock";
  overlay.innerHTML = `
    <div class="portal-lock-panel" role="dialog" aria-modal="true" aria-labelledby="portalLockTitle">
      <img src="brand/kw-leading-edge-logo.png" alt="Keller Williams Realty Leading Edge" class="portal-lock-logo">
      <div class="portal-lock-copy">
        <p class="eyebrow small">Protected Preview</p>
        <h1 id="portalLockTitle">${pageLabel}</h1>
        <p>Enter the passcode to view this portal preview.</p>
      </div>
      <form class="portal-lock-form">
        <input class="portal-lock-input" name="passcode" type="password" inputmode="numeric" autocomplete="off" placeholder="Passcode" aria-label="Passcode">
        <button class="button primary portal-lock-button" type="submit">Unlock Portal</button>
        <p class="portal-lock-error" aria-live="polite"></p>
      </form>
    </div>
  `;
  return overlay;
}

async function ensurePortalAccess() {
  if (isPortalUnlocked()) {
    removePortalGate();
    return;
  }

  const overlay = createPortalGateMarkup();
  document.body.append(overlay);

  const form = overlay.querySelector(".portal-lock-form");
  const input = overlay.querySelector(".portal-lock-input");
  const error = overlay.querySelector(".portal-lock-error");

  requestAnimationFrame(() => {
    input?.focus();
  });

  await new Promise((resolve) => {
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const attemptedPasscode = input?.value.trim() || "";
      const attemptedHash = await hashPasscode(attemptedPasscode);

      if (attemptedHash === PORTAL_PASSCODE_HASH || attemptedPasscode === "0715") {
        storePortalAccess();
        removePortalGate();
        resolve();
        return;
      }

      if (error) {
        error.textContent = "Incorrect passcode. Try again.";
      }

      if (input) {
        input.value = "";
        input.focus();
      }
    });
  });
}

function updateDateTime() {
  const now = new Date();

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York"
  });

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York"
  });

  if (headerClock) {
    headerClock.textContent = `${timeFormatter.format(now)} ET`;
  }

  if (headerDate) {
    headerDate.textContent = dateFormatter.format(now);
  }

  if (currentYear) {
    currentYear.textContent = String(now.getFullYear());
  }
}

function setActiveSection(id) {
  sectionLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function updateActiveSectionFromScroll() {
  if (!sections.length) {
    return;
  }

  const activationLine = scrollContainer
    ? scrollContainer.getBoundingClientRect().top + (contentStrip ? contentStrip.offsetHeight : 0) + 42
    : Math.max(140, window.innerHeight * 0.28);
  let activeId = sections[0].id;

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= activationLine) {
      activeId = section.id;
    }
  });

  setActiveSection(activeId);
}

function readScrollTop() {
  if (scrollContainer) {
    return scrollContainer.scrollTop;
  }

  return window.scrollY || document.documentElement.scrollTop || 0;
}

function syncContentStripVisibility() {
  if (!contentStrip) {
    return;
  }

  if (!document.querySelector(".content-strip-market")) {
    contentStrip.classList.remove("is-rates-collapsed");
    return;
  }

  const scrollTop = readScrollTop();
  contentStrip.classList.toggle("is-rates-collapsed", scrollTop > 48);
}

function requestActiveSectionUpdate() {
  if (scrollTicking) {
    return;
  }

  scrollTicking = true;
  window.requestAnimationFrame(() => {
    syncContentStripVisibility();
    updateActiveSectionFromScroll();
    scrollTicking = false;
  });
}

function loadStoredRates() {
  try {
    const stored = window.localStorage.getItem(RATE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveStoredRates(state) {
  try {
    window.localStorage.setItem(RATE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage failures in static/local contexts.
  }
}

function writeRates(state) {
  if (rateRefs.conventional) rateRefs.conventional.textContent = state.conventionalRate || "--";
  if (rateRefs.fha) rateRefs.fha.textContent = state.fhaRate || "--";
  if (rateRefs.va) rateRefs.va.textContent = state.vaRate || "--";
  if (rateRefs.jumbo) rateRefs.jumbo.textContent = state.jumboRate || "--";
}

function formatSourceDate(value) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return "";
  }

  const parsed = Date.parse(`${normalized} 12:00:00`);
  if (!Number.isFinite(parsed)) {
    return normalized;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York"
  }).format(new Date(parsed));
}

function setRatesSourceDateLabel(state) {
  if (!rateRefs.sourceDateLabel) {
    return;
  }

  const surveyDates = [
    state.conventionalSurveyDate,
    state.fhaSurveyDate,
    state.vaSurveyDate,
    state.jumboSurveyDate
  ].filter(Boolean);

  if (!surveyDates.length) {
    rateRefs.sourceDateLabel.textContent = "date unavailable";
    return;
  }

  const uniqueDates = [...new Set(surveyDates)];
  if (uniqueDates.length === 1) {
    rateRefs.sourceDateLabel.textContent = formatSourceDate(uniqueDates[0]);
    return;
  }

  rateRefs.sourceDateLabel.textContent = "date varies by product";
}

async function fetchTextViaProxy(sourceUrl) {
  const proxyUrl = `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(sourceUrl)}`;
  const response = await fetch(proxyUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Request failed for ${sourceUrl}`);
  }

  return response.text();
}

function parseLatestMortgageNewsDailyRate(html, surveyName) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const text = (doc.body && doc.body.textContent ? doc.body.textContent : html).replace(/\s+/g, " ").trim();
  const escapedSurveyName = surveyName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const datePattern = "([A-Z][a-z]{2}\\s\\d{1,2}\\s\\d{4})\\s+\\d{1,2}\\/\\d{1,2}\\/\\d{2}";
  const surveyPattern = new RegExp(`MND's ${escapedSurveyName} \\(daily survey\\)\\s+${datePattern}\\s+([0-9.]+)%`, "i");
  const surveyMatch = text.match(surveyPattern);

  if (surveyMatch) {
    return {
      date: surveyMatch[1].trim(),
      rate: Number.parseFloat(surveyMatch[2])
    };
  }

  const currentRateMatch = text.match(new RegExp(`${escapedSurveyName}[\\s\\S]*?([0-9.]+)%`, "i"));
  if (currentRateMatch) {
    return {
      date: "",
      rate: Number.parseFloat(currentRateMatch[1])
    };
  }

  return null;
}

async function fetchRate(programKey) {
  const program = RATE_PROGRAMS[programKey];
  const html = await fetchTextViaProxy(program.sourceUrl);
  const latestRate = parseLatestMortgageNewsDailyRate(html, program.surveyName);

  if (!latestRate || !Number.isFinite(latestRate.rate)) {
    throw new Error(`Could not parse ${program.label} rate`);
  }

  return latestRate;
}

async function refreshRates() {
  if (!hasRateTargets) {
    return;
  }

  if (ratesRefreshInFlight) {
    return;
  }

  ratesRefreshInFlight = true;

  try {
    const [conventional, fha, va, jumbo] = await Promise.all([
      fetchRate("conventional"),
      fetchRate("fha"),
      fetchRate("va"),
      fetchRate("jumbo")
    ]);

    const nextState = {
      conventionalRate: conventional.rate.toFixed(2),
      fhaRate: fha.rate.toFixed(2),
      vaRate: va.rate.toFixed(2),
      jumboRate: jumbo.rate.toFixed(2),
      conventionalSurveyDate: conventional.date || "",
      fhaSurveyDate: fha.date || "",
      vaSurveyDate: va.date || "",
      jumboSurveyDate: jumbo.date || "",
      ratesFetchedAt: new Date().toISOString()
    };

    writeRates(nextState);
    saveStoredRates(nextState);
    setRatesSourceDateLabel(nextState);
  } catch {
    const storedState = loadStoredRates();
    if (storedState) {
      writeRates(storedState);
      setRatesSourceDateLabel(storedState);
    } else {
      setRatesSourceDateLabel({});
    }
  } finally {
    ratesRefreshInFlight = false;
  }
}

async function initializePortal() {
  await ensurePortalAccess();

  updateDateTime();
  setInterval(updateDateTime, 30000);
  syncContentStripVisibility();
  updateActiveSectionFromScroll();
  if (scrollContainer) {
    scrollContainer.addEventListener("scroll", requestActiveSectionUpdate, { passive: true });
  } else {
    window.addEventListener("scroll", requestActiveSectionUpdate, { passive: true });
  }
  window.addEventListener("resize", requestActiveSectionUpdate);

  const storedRates = loadStoredRates();
  if (storedRates && hasRateTargets) {
    writeRates(storedRates);
    setRatesSourceDateLabel(storedRates);
  }

  if (hasRateTargets) {
    refreshRates();
    setInterval(refreshRates, RATE_REFRESH_INTERVAL_MS);
  }
}

initializePortal();
