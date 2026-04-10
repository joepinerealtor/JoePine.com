const headerClock = document.getElementById("headerClock");
const headerDate = document.getElementById("headerDate");
const currentYear = document.getElementById("currentYear");
const scrollContainer = document.querySelector(".portal-content");
const contentStrip = document.querySelector(".content-strip");
const sectionLinks = [...document.querySelectorAll(".section-nav-link")].filter((link) => {
  const href = link.getAttribute("href") || "";
  return href.startsWith("#");
});
const sections = [...document.querySelectorAll("main section[id]")];
const rateRefs = {
  conventional: document.getElementById("portalConventionalRateValue"),
  fha: document.getElementById("portalFhaRateValue"),
  va: document.getElementById("portalVaRateValue"),
  jumbo: document.getElementById("portalJumboRateValue"),
  updatedLabel: document.getElementById("portalRatesUpdatedLabel")
};
const hasRateTargets = Object.values(rateRefs).some(Boolean);
let scrollTicking = false;
let ratesRefreshInFlight = false;

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

function formatRatesUpdatedLabel(value) {
  const parsed = Date.parse(String(value || ""));
  if (!Number.isFinite(parsed)) {
    return "Unavailable";
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York"
  });

  return `${formatter.format(new Date(parsed))} ET`;
}

function setRatesUpdatedLabel(value) {
  if (rateRefs.updatedLabel) {
    rateRefs.updatedLabel.textContent = formatRatesUpdatedLabel(value);
  }
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
      ratesFetchedAt: new Date().toISOString()
    };

    writeRates(nextState);
    saveStoredRates(nextState);
    setRatesUpdatedLabel(nextState.ratesFetchedAt);
  } catch {
    const storedState = loadStoredRates();
    if (storedState) {
      writeRates(storedState);
      setRatesUpdatedLabel(storedState.ratesFetchedAt);
    } else {
      setRatesUpdatedLabel("");
    }
  } finally {
    ratesRefreshInFlight = false;
  }
}

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
  setRatesUpdatedLabel(storedRates.ratesFetchedAt);
}

if (hasRateTargets) {
  refreshRates();
  setInterval(refreshRates, RATE_REFRESH_INTERVAL_MS);
}
