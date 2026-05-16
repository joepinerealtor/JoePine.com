#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const REPO_ROOT = path.resolve(__dirname, "..");
const DEFAULT_DATA_PATH = path.join(REPO_ROOT, "listings", "listings-data.js");
const DEFAULT_PROFILE_URL = "https://www.homes.com/real-estate-agents/joseph-pine/r0tjpy1/";
const HOMES_HOST_RE = /(^|\.)homes\.com$/i;
const IMAGE_HOST_RE = /(^|\.)homes\.com$/i;

function parseArgs(argv) {
    const options = {
        apply: false,
        dataPath: DEFAULT_DATA_PATH,
        sourceUrls: [DEFAULT_PROFILE_URL],
        propertyUrls: [],
        noDiscovery: false,
        maxPages: 12,
        maxImages: 12,
        timeoutMs: 15000,
        today: new Date().toISOString().slice(0, 10)
    };

    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        const next = () => {
            index += 1;
            if (index >= argv.length) {
                throw new Error(`Missing value for ${arg}`);
            }
            return argv[index];
        };

        if (arg === "--apply") {
            options.apply = true;
        } else if (arg === "--no-discovery") {
            options.noDiscovery = true;
        } else if (arg === "--data") {
            options.dataPath = path.resolve(next());
        } else if (arg === "--source") {
            const value = next();
            options.sourceUrls = options.sourceUrls.filter((url) => url !== DEFAULT_PROFILE_URL);
            options.sourceUrls.push(value);
        } else if (arg === "--property-url") {
            options.propertyUrls.push(next());
        } else if (arg === "--max-pages") {
            options.maxPages = parsePositiveInteger(next(), "--max-pages");
        } else if (arg === "--max-images") {
            options.maxImages = parsePositiveInteger(next(), "--max-images");
        } else if (arg === "--timeout-ms") {
            options.timeoutMs = parsePositiveInteger(next(), "--timeout-ms");
        } else if (arg === "--today") {
            options.today = next();
        } else if (arg === "--help" || arg === "-h") {
            printHelp();
            process.exit(0);
        } else {
            throw new Error(`Unknown argument: ${arg}`);
        }
    }

    options.sourceUrls = unique(options.sourceUrls.map((url) => normalizeUrl(url)).filter(Boolean));
    options.propertyUrls = unique(options.propertyUrls.map((url) => normalizeUrl(url)).filter(Boolean));
    return options;
}

function parsePositiveInteger(value, label) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error(`${label} must be a positive integer`);
    }
    return parsed;
}

function printHelp() {
    console.log(`Usage: node scripts/sync-homes-listings.js [options]

Discovers Joe Pine Homes.com property pages, extracts Homes.com-visible facts,
compares them with listings/listings-data.js, and reports missing listing objects.

Options:
  --apply                 Append missing listings to listings/listings-data.js
  --no-discovery          Skip the default Joe Pine profile discovery fetch
  --source <url>          Homes.com profile/search page to discover property links
  --property-url <url>    Add a specific Homes.com property page to inspect
  --data <path>           Listing data file (default: listings/listings-data.js)
  --max-pages <n>         Maximum property pages to fetch (default: 12)
  --max-images <n>        Maximum Homes.com image URLs per listing (default: 12)
  --timeout-ms <n>        Fetch timeout per request (default: 15000)
  --today <yyyy-mm-dd>    Snapshot date override
`);
}

function loadListingData(dataPath) {
    const source = fs.readFileSync(dataPath, "utf8");
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(source, sandbox, { filename: dataPath, timeout: 1000 });
    const data = sandbox.window.JOE_PINE_LISTINGS;
    if (!data || !Array.isArray(data.listings)) {
        throw new Error(`Could not load window.JOE_PINE_LISTINGS.listings from ${dataPath}`);
    }
    return { source, data };
}

async function fetchText(url, timeoutMs) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "user-agent": "Mozilla/5.0 (compatible; JoePineListingSync/1.0; +https://joepine.com/)"
            },
            redirect: "follow"
        });
        const body = await response.text();
        return {
            ok: response.ok,
            status: response.status,
            finalUrl: response.url || url,
            body
        };
    } finally {
        clearTimeout(timeout);
    }
}

function normalizeUrl(value, baseUrl) {
    if (!value || typeof value !== "string") {
        return "";
    }
    const cleaned = htmlDecode(value)
        .replace(/\\u002F/g, "/")
        .replace(/\\\//g, "/")
        .trim();
    try {
        const url = new URL(cleaned, baseUrl);
        url.hash = "";
        return url.toString();
    } catch {
        return "";
    }
}

function isHomesUrl(url) {
    try {
        return HOMES_HOST_RE.test(new URL(url).hostname);
    } catch {
        return false;
    }
}

function normalizePropertyUrl(value, baseUrl) {
    const normalized = normalizeUrl(value, baseUrl);
    if (!normalized || !isHomesUrl(normalized)) {
        return "";
    }
    const url = new URL(normalized);
    if (!/^\/property\//i.test(url.pathname)) {
        return "";
    }
    url.search = "";
    url.hash = "";
    return url.toString();
}

function extractPropertyUrls(html, baseUrl) {
    const urls = new Set();
    const hrefRe = /\bhref=["']([^"']+)["']/gi;
    let match;
    while ((match = hrefRe.exec(html)) !== null) {
        const propertyUrl = normalizePropertyUrl(match[1], baseUrl);
        if (propertyUrl) {
            urls.add(propertyUrl);
        }
    }

    const rawUrlRe = /https?:\\?\/\\?\/(?:www\.)?homes\.com\\?\/property\\?\/[^"' <>)\\]+/gi;
    while ((match = rawUrlRe.exec(html)) !== null) {
        const propertyUrl = normalizePropertyUrl(match[0], baseUrl);
        if (propertyUrl) {
            urls.add(propertyUrl);
        }
    }

    return Array.from(urls);
}

function parseListingPage(html, pageUrl, options) {
    const meta = extractMeta(html);
    const jsonLdNodes = extractJsonLd(html);
    const jsonText = extractScriptJsonText(html);
    const visibleText = compactText(stripScriptsAndStyles(html).replace(/<[^>]+>/g, " "));
    const titleText = firstNonEmpty(
        meta["og:title"],
        meta["twitter:title"],
        findDeepValue(jsonLdNodes, ["name"]),
        matchText(visibleText, /([^|]+?)\s+\|\s+Homes\.com/i),
        ""
    );
    const description = cleanDescription(firstNonEmpty(
        meta.description,
        meta["og:description"],
        meta["twitter:description"],
        findDeepValue(jsonLdNodes, ["description"]),
        matchText(visibleText, /Description\s+(.+?)(?:Property Details|Open House|Schools|$)/i),
        ""
    ));

    const address = extractAddress(jsonLdNodes, titleText, visibleText, pageUrl);
    const slug = slugFromPropertyUrl(pageUrl) || slugify(`${address.title} ${address.city} ${address.state}`);
    const numbers = extractNumbers(jsonLdNodes, visibleText);
    const status = extractStatus(visibleText);
    const images = extractHomesImages(html, jsonLdNodes, meta, options.maxImages, address, slug);
    const openHouses = extractOpenHouses(visibleText, options.today);
    const snapshotLabel = formatSnapshotLabel(options.today);
    const sourceNote = `Listing facts were reviewed from Homes.com on ${snapshotLabel}.`;
    const facts = buildFacts(numbers);
    const highlights = buildHighlights(description, numbers, openHouses);
    const areaLabel = [address.city, stateName(address.state)].filter(Boolean).join(", ");
    const statusLabel = toTitle(status === "under-contract" ? "under contract" : status);

    return {
        slug,
        title: address.title,
        city: address.city,
        state: address.state,
        zip: address.zip,
        neighborhood: address.neighborhood || address.city,
        areaLabel,
        headline: `${address.title}${address.city ? ` in ${address.city}` : ""} is ${statusLabel.toLowerCase()}.`,
        teaser: description ? truncateSentence(description, 132) : "Homes.com listing details are ready for review.",
        summary: description || `${address.title} is a ${statusLabel.toLowerCase()} listing sourced from Homes.com.`,
        hubSummary: description || `${address.title} listing facts were sourced from Homes.com.`,
        locationBlurb: areaLabel || "Location details sourced from Homes.com.",
        status,
        statusLabel,
        featured: false,
        listedDate: options.today,
        sourceSnapshotDate: options.today,
        sourceSnapshotLabel: snapshotLabel,
        price: numbers.price || 0,
        pricePerSqFt: numbers.pricePerSqFt || calculatePricePerSqFt(numbers.price, numbers.sqft),
        beds: numbers.beds || 0,
        baths: numbers.baths || 0,
        sqft: numbers.sqft || 0,
        lotSqft: numbers.lotSqft || 0,
        lotAcres: numbers.lotAcres || 0,
        yearBuilt: numbers.yearBuilt || 0,
        taxes: numbers.taxes || 0,
        parking: numbers.parking || "",
        homeType: numbers.homeType || "",
        homeDesign: numbers.homeDesign || "",
        links: {
            homes: pageUrl,
            tour3d: extractTourUrl(html)
        },
        openHouses,
        highlights,
        detailIntro: buildDetailIntro(address, description, sourceNote),
        detailSections: buildDetailSections(address, facts, description),
        facts,
        cta: {
            title: `Want to see ${shortAddress(address.title)} in person?`,
            body: `Call, text, or email Joe for showing options, open house details, or questions about ${address.city || "this listing"}.`
        },
        sourceNote,
        schemaDescription: description || `${address.title} listing facts sourced from Homes.com.`,
        featuredImageIndexes: images.slice(0, 6).map((_, index) => index),
        images
    };
}

function extractMeta(html) {
    const result = {};
    const re = /<meta\b([^>]+)>/gi;
    let match;
    while ((match = re.exec(html)) !== null) {
        const attrs = parseAttributes(match[1]);
        const key = attrs.property || attrs.name;
        if (key && attrs.content) {
            result[key.toLowerCase()] = htmlDecode(attrs.content);
        }
    }
    return result;
}

function parseAttributes(attrText) {
    const attrs = {};
    const re = /([a-zA-Z_:.-]+)\s*=\s*(["'])(.*?)\2/g;
    let match;
    while ((match = re.exec(attrText)) !== null) {
        attrs[match[1].toLowerCase()] = htmlDecode(match[3]);
    }
    return attrs;
}

function extractJsonLd(html) {
    const nodes = [];
    const re = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = re.exec(html)) !== null) {
        const text = htmlDecode(match[1]).trim();
        if (!text) {
            continue;
        }
        try {
            nodes.push(JSON.parse(text));
        } catch {
            // Homes.com can emit incomplete JSON-LD during bot-denied responses.
        }
    }
    return nodes;
}

function extractScriptJsonText(html) {
    return htmlDecode(html)
        .replace(/\\u002F/g, "/")
        .replace(/\\u0026/g, "&")
        .replace(/\\\//g, "/");
}

function stripScriptsAndStyles(html) {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ");
}

function extractAddress(jsonLdNodes, titleText, visibleText, pageUrl) {
    const addressNode = findDeepObject(jsonLdNodes, ["streetAddress", "addressLocality", "addressRegion"]);
    const fromJson = {
        title: cleanAddressTitle(addressNode?.streetAddress || ""),
        city: addressNode?.addressLocality || "",
        state: addressNode?.addressRegion || "",
        zip: addressNode?.postalCode || ""
    };

    const titleMatch = firstNonEmpty(titleText, visibleText).match(/^\s*(.+?),\s*([^,]+),\s*([A-Z]{2})\s*(\d{5})?/);
    const fromTitle = titleMatch
        ? {
              title: cleanAddressTitle(titleMatch[1]),
              city: cleanWords(titleMatch[2]),
              state: titleMatch[3],
              zip: titleMatch[4] || ""
          }
        : {};

    const slugParts = slugFromPropertyUrl(pageUrl).split("-");
    const state = fromJson.state || fromTitle.state || slugParts.at(-1)?.toUpperCase() || "";
    const city = fromJson.city || fromTitle.city || toTitle(slugParts.at(-2) || "");
    const title = fromJson.title || fromTitle.title || cleanAddressTitle(slugParts.slice(0, -2).join(" "));

    return {
        title,
        city,
        state,
        zip: fromJson.zip || fromTitle.zip || matchText(visibleText, new RegExp(`\\b${state}\\s+(\\d{5})\\b`)) || "",
        neighborhood: matchText(visibleText, /Neighborhood\s+([A-Za-z0-9 .'-]+?)(?:\s{2,}| Property|$)/i) || city
    };
}

function extractNumbers(jsonLdNodes, text) {
    const floorSize = findDeepValue(jsonLdNodes, ["floorSize", "value"]);
    const lotSize = findDeepValue(jsonLdNodes, ["lotSize", "value"]);
    const offerPrice = findDeepValue(jsonLdNodes, ["offers", "price"]);
    const result = {
        price: toNumber(offerPrice) || moneyAfter(text, /(?:\$|Price\s+\$)([\d,]+)/i),
        pricePerSqFt: moneyAfter(text, /\$([\d,]+)\s*\/\s*sq\s*ft/i),
        beds: toNumber(findDeepValue(jsonLdNodes, ["numberOfBedrooms"])) || decimalAfter(text, /(\d+(?:\.\d+)?)\s*(?:beds?|bedrooms?)\b/i),
        baths: toNumber(findDeepValue(jsonLdNodes, ["numberOfBathroomsTotal"])) || decimalAfter(text, /(\d+(?:\.\d+)?)\s*(?:baths?|bathrooms?)\b/i),
        sqft: toNumber(floorSize) || numberAfter(text, /([\d,]+)\s*(?:sq\.?\s*ft|square feet)\b/i),
        lotSqft: toNumber(lotSize) || numberAfter(text, /([\d,]+)\s*(?:sq\.?\s*ft|square feet)\s+lot\b/i),
        lotAcres: decimalAfter(text, /(\d+(?:\.\d+)?)\s*acre/i),
        yearBuilt: numberAfter(text, /(?:built in|year built)\s*(\d{4})/i),
        taxes: moneyAfter(text, /(?:taxes|property taxes)[^\$]{0,30}\$([\d,]+)/i),
        parking: matchText(text, /Parking\s+(.+?)(?:\s{2,}| Heating| Cooling| Year Built| Lot|$)/i),
        homeType: matchText(text, /(?:Property Type|Home Type)\s+(.+?)(?:\s{2,}| Year Built| Lot|$)/i),
        homeDesign: matchText(text, /(?:Architectural Style|Home Design)\s+(.+?)(?:\s{2,}| Year Built| Lot|$)/i)
    };
    if (!result.lotSqft && result.lotAcres) {
        result.lotSqft = Math.round(result.lotAcres * 43560);
    }
    if (!result.lotAcres && result.lotSqft) {
        result.lotAcres = Number((result.lotSqft / 43560).toFixed(2));
    }
    return result;
}

function extractHomesImages(html, jsonLdNodes, meta, maxImages, address, slug) {
    const candidates = [];
    const add = (value) => {
        if (Array.isArray(value)) {
            value.forEach(add);
            return;
        }
        const normalized = normalizeImageUrl(String(value || ""));
        if (normalized) {
            candidates.push(normalized);
        }
    };

    add(meta["og:image"]);
    add(meta["twitter:image"]);
    add(findAllDeepValues(jsonLdNodes, ["image"]));

    const imageRe = /https?:\\?\/\\?\/(?:[^"' <>)\\]+?)homes\.com[^"' <>)\\]+?\.(?:jpg|jpeg|png|webp|svg)(?:\?[^"' <>)\\]+)?/gi;
    let match;
    while ((match = imageRe.exec(extractScriptJsonText(html))) !== null) {
        add(match[0]);
    }

    return unique(candidates)
        .filter(isHomesImageUrl)
        .slice(0, maxImages)
        .map((src, index) => {
            const isFloorPlan = /floorplan|floor-plan/i.test(src);
            const photoNumber = index + 1;
            return {
                src,
                alt: `${address.title}, ${address.city}, ${address.state}${address.zip ? ` ${address.zip}` : ""} - photo ${photoNumber}`,
                caption: isFloorPlan
                    ? `Homes.com floor plan for ${address.title}.`
                    : `Homes.com listing photo ${photoNumber} for ${address.title}.`
            };
        });
}

function normalizeImageUrl(value) {
    const normalized = normalizeUrl(value);
    if (!normalized) {
        return "";
    }
    try {
        const url = new URL(normalized);
        if (!/\.(?:jpg|jpeg|png|webp|svg)$/i.test(url.pathname)) {
            return "";
        }
        return url.toString();
    } catch {
        return "";
    }
}

function isHomesImageUrl(value) {
    try {
        const host = new URL(value).hostname;
        return IMAGE_HOST_RE.test(host);
    } catch {
        return false;
    }
}

function extractOpenHouses(text, todayIso) {
    const entries = [];
    const currentYear = Number(todayIso.slice(0, 4));
    const re = /\b(?:Open(?:\s+House)?[: ]*)?(Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?)\.?,?\s+((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}|\d{1,2}\/\d{1,2})?[^A-Za-z0-9]{0,12}(\d{1,2}(?::\d{2})?\s*(?:AM|PM))\s*(?:-|to|–)\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM))/gi;
    let match;
    while ((match = re.exec(text)) !== null) {
        const weekday = normalizeWeekday(match[1]);
        const date = parseOpenHouseDate(match[2], weekday, todayIso, currentYear);
        const start = normalizeTime(match[3]);
        const end = normalizeTime(match[4]);
        if (!date || !start || !end) {
            continue;
        }
        entries.push({
            startIso: `${date}T${start.iso}:00-04:00`,
            endIso: `${date}T${end.iso}:00-04:00`,
            chipLabel: `Open ${weekday.slice(0, 3)} ${start.chip}-${end.chip}`,
            dateLabel: formatDateLabel(date),
            timeLabel: `${start.label}-${end.label}`,
            fullLabel: `${formatDateLabel(date)}, ${start.label}-${end.label}`
        });
    }
    return uniqueBy(entries, (entry) => `${entry.startIso}|${entry.endIso}`);
}

function parseOpenHouseDate(raw, weekday, todayIso, year) {
    if (raw) {
        const cleaned = raw.replace(/\./g, "");
        const monthDay = cleaned.match(/^([A-Za-z]+)\s+(\d{1,2})$/);
        if (monthDay) {
            const month = monthIndex(monthDay[1]);
            if (month >= 0) {
                return isoDate(year, month + 1, Number(monthDay[2]));
            }
        }
        const numeric = cleaned.match(/^(\d{1,2})\/(\d{1,2})$/);
        if (numeric) {
            return isoDate(year, Number(numeric[1]), Number(numeric[2]));
        }
    }

    const today = parseIsoDate(todayIso);
    const target = weekdayIndex(weekday);
    if (!today || target < 0) {
        return "";
    }
    const day = new Date(Date.UTC(today.year, today.month - 1, today.day));
    const current = day.getUTCDay();
    const delta = (target - current + 7) % 7;
    day.setUTCDate(day.getUTCDate() + delta);
    return day.toISOString().slice(0, 10);
}

function normalizeTime(raw) {
    const match = String(raw).trim().toUpperCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);
    if (!match) {
        return null;
    }
    let hour = Number(match[1]);
    const minute = match[2] || "00";
    const period = match[3];
    const labelHour = hour;
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return {
        iso: `${String(hour).padStart(2, "0")}:${minute}`,
        label: `${labelHour}:${minute} ${period}`,
        chip: minute === "00" ? `${labelHour}${period}` : `${labelHour}:${minute}${period}`
    };
}

function buildFacts(numbers) {
    const facts = [];
    if (numbers.homeType) facts.push({ label: "Home Type", value: numbers.homeType });
    if (numbers.parking) facts.push({ label: "Parking", value: numbers.parking });
    if (numbers.taxes) facts.push({ label: "Taxes", value: `$${formatNumber(numbers.taxes)} annually` });
    if (numbers.lotSqft) facts.push({ label: "Lot", value: `${formatNumber(numbers.lotSqft)} sq ft` });
    if (numbers.yearBuilt) facts.push({ label: "Year Built", value: String(numbers.yearBuilt) });
    if (numbers.pricePerSqFt) facts.push({ label: "Price Per Sq Ft", value: `$${formatNumber(numbers.pricePerSqFt)}` });
    return facts;
}

function buildHighlights(description, numbers, openHouses) {
    const highlights = [];
    if (numbers.beds || numbers.baths || numbers.sqft) {
        highlights.push(`${numbers.beds || 0}-bedroom, ${numbers.baths || 0}-bath listing with ${formatNumber(numbers.sqft || 0)} square feet`);
    }
    if (numbers.lotSqft) {
        highlights.push(`${formatNumber(numbers.lotSqft)} square foot lot`);
    }
    if (numbers.yearBuilt) {
        highlights.push(`Built in ${numbers.yearBuilt}`);
    }
    if (openHouses.length) {
        highlights.push(`Open house listed on Homes.com: ${openHouses[0].fullLabel}`);
    }
    splitSentences(description).slice(0, 2).forEach((sentence) => {
        if (sentence.length <= 150) {
            highlights.push(sentence);
        }
    });
    return unique(highlights).slice(0, 5);
}

function buildDetailIntro(address, description, sourceNote) {
    return [
        description || `${address.title} in ${address.city || address.state} is a Homes.com-sourced listing ready for editorial review.`,
        sourceNote
    ];
}

function buildDetailSections(address, facts, description) {
    return [
        {
            eyebrow: "Homes.com Snapshot",
            title: `Current public facts for ${address.title}.`,
            items: facts.length ? facts.map((fact) => `${fact.label}: ${fact.value}`) : ["Homes.com public facts were imported for review."]
        },
        {
            eyebrow: "Description",
            title: "Public listing description.",
            paragraphs: [description || "Add a fuller marketing description after reviewing the Homes.com listing."]
        },
        {
            eyebrow: "Source",
            title: "Review before publishing.",
            paragraphs: ["This object was generated from Homes.com-visible URLs, facts, open house text, and image URLs only."]
        }
    ];
}

function extractStatus(text) {
    if (/\bPending\b/i.test(text)) return "pending";
    if (/\bUnder Contract\b/i.test(text)) return "under-contract";
    if (/\bSold\b|\bClosed\b/i.test(text)) return "sold";
    if (/\bComing Soon\b/i.test(text)) return "coming-soon";
    return "active";
}

function extractTourUrl(html) {
    const decoded = extractScriptJsonText(html);
    const match = decoded.match(/https?:\/\/(?:tour\.riliving\.com|my\.matterport\.com|www\.zillow\.com\/view-imx)[^"' <>)]+/i);
    return match ? match[0] : "";
}

function appendListingsToData(source, dataPath, listings) {
    if (!listings.length) {
        return false;
    }
    const marker = "\n        ],\n        recentSales:";
    if (!source.includes(marker)) {
        throw new Error(`Could not find listings array insertion point in ${dataPath}`);
    }
    const serialized = listings.map((listing) => indentObject(listing, 12)).join(",\n");
    const nextSource = source.replace(marker, `,\n${serialized}${marker}`);
    fs.writeFileSync(dataPath, nextSource, "utf8");
    return true;
}

function indentObject(value, spaces) {
    return JSON.stringify(value, null, 4)
        .split("\n")
        .map((line) => " ".repeat(spaces) + line)
        .join("\n");
}

function summarizeComparison(currentListings, discoveredListings) {
    const currentSlugs = new Set(currentListings.map((listing) => listing.slug).filter(Boolean));
    const currentHomesUrls = new Set(currentListings.map((listing) => listing.links?.homes).filter(Boolean).map(normalizeUrl));
    const missing = [];
    const existing = [];
    for (const listing of discoveredListings) {
        const homesUrl = normalizeUrl(listing.links?.homes || "");
        if (currentSlugs.has(listing.slug) || currentHomesUrls.has(homesUrl)) {
            existing.push(listing);
        } else {
            missing.push(listing);
        }
    }
    return { missing, existing };
}

function validateGeneratedListing(listing) {
    const warnings = [];
    if (!listing.title || !listing.city || !listing.state) {
        warnings.push("address fields are incomplete");
    }
    if (!listing.images.length) {
        warnings.push("no Homes.com image URLs found");
    }
    const localImages = listing.images.filter((image) => !/^https?:\/\/.+homes\.com\//i.test(image.src));
    if (localImages.length) {
        warnings.push("non-Homes.com image URLs were discarded");
        listing.images = listing.images.filter((image) => /^https?:\/\/.+homes\.com\//i.test(image.src));
    }
    if (!listing.price || !listing.beds || !listing.baths || !listing.sqft) {
        warnings.push("some core facts are missing; review before publishing");
    }
    return warnings;
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    const { source, data } = loadListingData(options.dataPath);
    const fetchWarnings = [];
    const propertyUrls = new Set(options.propertyUrls);

    for (const sourceUrl of options.noDiscovery ? [] : options.sourceUrls) {
        const response = await fetchText(sourceUrl, options.timeoutMs);
        if (!response.ok) {
            fetchWarnings.push(`Discovery failed for ${sourceUrl}: HTTP ${response.status}`);
            continue;
        }
        if (looksAccessDenied(response.body)) {
            fetchWarnings.push(`Discovery blocked for ${sourceUrl}: Homes.com returned an access denied page`);
            continue;
        }
        const discovered = extractPropertyUrls(response.body, response.finalUrl);
        if (!discovered.length) {
            fetchWarnings.push(`Discovery found no property links at ${sourceUrl}`);
        }
        discovered.forEach((url) => propertyUrls.add(url));
    }

    const limitedPropertyUrls = Array.from(propertyUrls).slice(0, options.maxPages);
    const discoveredListings = [];
    for (const propertyUrl of limitedPropertyUrls) {
        const response = await fetchText(propertyUrl, options.timeoutMs);
        if (!response.ok) {
            fetchWarnings.push(`Property fetch failed for ${propertyUrl}: HTTP ${response.status}`);
            continue;
        }
        if (looksAccessDenied(response.body)) {
            fetchWarnings.push(`Property fetch blocked for ${propertyUrl}: Homes.com returned an access denied page`);
            continue;
        }
        const listing = parseListingPage(response.body, response.finalUrl || propertyUrl, options);
        listing.syncWarnings = validateGeneratedListing(listing);
        discoveredListings.push(listing);
    }

    const { missing, existing } = summarizeComparison(data.listings, discoveredListings);
    printReport({
        options,
        fetchWarnings,
        discoveredListings,
        existing,
        missing,
        propertyUrls: limitedPropertyUrls
    });

    if (options.apply) {
        if (!missing.length) {
            console.log("\n--apply: no missing listings to append.");
        } else {
            appendListingsToData(source, options.dataPath, missing.map(({ syncWarnings, ...listing }) => listing));
            console.log(`\n--apply: appended ${missing.length} listing object(s) to ${path.relative(REPO_ROOT, options.dataPath)}.`);
        }
    } else {
        console.log("\nDry run only. Re-run with --apply to append missing listing objects.");
    }
}

function printReport({ options, fetchWarnings, discoveredListings, existing, missing, propertyUrls }) {
    console.log("Homes.com listing sync report");
    console.log(`Mode: ${options.apply ? "apply" : "dry-run"}`);
    console.log(`Data file: ${path.relative(REPO_ROOT, options.dataPath)}`);
    console.log(`Snapshot date: ${options.today}`);
    console.log(`Property URLs queued: ${propertyUrls.length}`);
    console.log(`Listings parsed: ${discoveredListings.length}`);
    console.log(`Existing matches: ${existing.length}`);
    console.log(`Missing listings: ${missing.length}`);

    if (fetchWarnings.length) {
        console.log("\nFetch warnings:");
        fetchWarnings.forEach((warning) => console.log(`- ${warning}`));
    }

    if (existing.length) {
        console.log("\nExisting listings:");
        existing.forEach((listing) => console.log(`- ${listing.title} (${listing.slug})`));
    }

    if (missing.length) {
        console.log("\nMissing listing objects:");
        missing.forEach((listing) => {
            console.log(`- ${listing.title} (${listing.slug})`);
            console.log(`  Homes.com: ${listing.links.homes}`);
            console.log(`  Facts: ${formatPrice(listing.price)}, ${listing.beds} beds, ${listing.baths} baths, ${formatNumber(listing.sqft)} sq ft`);
            console.log(`  Images: ${listing.images.length}`);
            if (listing.openHouses.length) {
                console.log(`  Open houses: ${listing.openHouses.map((entry) => entry.fullLabel).join("; ")}`);
            }
            if (listing.syncWarnings.length) {
                console.log(`  Warnings: ${listing.syncWarnings.join("; ")}`);
            }
            console.log(indentObject(stripInternalFields(listing), 2));
        });
    }
}

function stripInternalFields(listing) {
    const { syncWarnings, ...cleaned } = listing;
    return cleaned;
}

function findDeepValue(value, keyPath) {
    const values = findAllDeepValues(value, keyPath);
    return values.find((item) => item !== undefined && item !== null && item !== "") || "";
}

function findAllDeepValues(value, keyPath) {
    const results = [];
    const visit = (node) => {
        if (!node || typeof node !== "object") {
            return;
        }
        if (Array.isArray(node)) {
            node.forEach(visit);
            return;
        }
        if (hasKeyPath(node, keyPath)) {
            results.push(getKeyPath(node, keyPath));
        }
        Object.values(node).forEach(visit);
    };
    visit(value);
    return results.flat();
}

function findDeepObject(value, keys) {
    let found = null;
    const visit = (node) => {
        if (found || !node || typeof node !== "object") {
            return;
        }
        if (Array.isArray(node)) {
            node.forEach(visit);
            return;
        }
        if (keys.some((key) => Object.prototype.hasOwnProperty.call(node, key))) {
            found = node;
            return;
        }
        Object.values(node).forEach(visit);
    };
    visit(value);
    return found || {};
}

function hasKeyPath(node, keyPath) {
    return getKeyPath(node, keyPath) !== undefined;
}

function getKeyPath(node, keyPath) {
    let current = node;
    for (const key of keyPath) {
        if (!current || typeof current !== "object" || !Object.prototype.hasOwnProperty.call(current, key)) {
            return undefined;
        }
        current = current[key];
    }
    return current;
}

function htmlDecode(value) {
    return String(value)
        .replace(/&quot;/g, "\"")
        .replace(/&#34;/g, "\"")
        .replace(/&#x27;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#58;/g, ":")
        .replace(/&#47;/g, "/")
        .replace(/&#x2F;/gi, "/");
}

function compactText(value) {
    return htmlDecode(value).replace(/\s+/g, " ").trim();
}

function cleanDescription(value) {
    return compactText(value).replace(/\s*\|\s*Homes\.com.*$/i, "");
}

function cleanAddressTitle(value) {
    return toTitle(String(value).replace(/-/g, " ").replace(/\s+/g, " ").trim());
}

function cleanWords(value) {
    return toTitle(String(value).replace(/\s+/g, " ").trim());
}

function toTitle(value) {
    return String(value)
        .replace(/[-_]+/g, " ")
        .toLowerCase()
        .replace(/\b([a-z])/g, (letter) => letter.toUpperCase())
        .replace(/\b(Ri|Ma|Ct|Nh|Me|Vt)\b/g, (state) => state.toUpperCase());
}

function slugFromPropertyUrl(pageUrl) {
    try {
        const url = new URL(pageUrl);
        const parts = url.pathname.split("/").filter(Boolean);
        return parts[0] === "property" ? parts[1] || "" : "";
    } catch {
        return "";
    }
}

function slugify(value) {
    return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function firstNonEmpty(...values) {
    return values.find((value) => value !== undefined && value !== null && String(value).trim() !== "") || "";
}

function matchText(text, re) {
    const match = String(text).match(re);
    return match ? compactText(match[1] || match[0]) : "";
}

function toNumber(value) {
    if (value && typeof value === "object" && "value" in value) {
        return toNumber(value.value);
    }
    const match = String(value ?? "").replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : 0;
}

function numberAfter(text, re) {
    const match = String(text).match(re);
    return match ? Number(match[1].replace(/,/g, "")) : 0;
}

function moneyAfter(text, re) {
    return numberAfter(text, re);
}

function decimalAfter(text, re) {
    const match = String(text).match(re);
    return match ? Number(match[1].replace(/,/g, "")) : 0;
}

function calculatePricePerSqFt(price, sqft) {
    return price && sqft ? Math.round(price / sqft) : 0;
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString("en-US");
}

function formatPrice(value) {
    return value ? `$${formatNumber(value)}` : "$0";
}

function splitSentences(value) {
    return compactText(value)
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean);
}

function truncateSentence(value, maxLength) {
    const text = compactText(value);
    if (text.length <= maxLength) {
        return text;
    }
    return `${text.slice(0, maxLength - 1).replace(/\s+\S*$/, "")}.`;
}

function shortAddress(title) {
    return String(title).replace(/\b(Avenue|Street|Road|Drive|Lane|Court|Circle|Boulevard)\b/i, (word) => {
        const map = { Avenue: "Ave", Street: "St", Road: "Rd", Drive: "Dr", Lane: "Ln", Court: "Ct", Circle: "Cir", Boulevard: "Blvd" };
        return map[toTitle(word)] || word;
    });
}

function stateName(state) {
    const map = { RI: "Rhode Island", MA: "Massachusetts", CT: "Connecticut", NH: "New Hampshire", ME: "Maine", VT: "Vermont" };
    return map[String(state).toUpperCase()] || state;
}

function formatSnapshotLabel(iso) {
    const date = parseIsoDate(iso);
    if (!date) return iso;
    const jsDate = new Date(Date.UTC(date.year, date.month - 1, date.day));
    return jsDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC"
    });
}

function formatDateLabel(iso) {
    const date = parseIsoDate(iso);
    if (!date) return iso;
    const jsDate = new Date(Date.UTC(date.year, date.month - 1, date.day));
    return jsDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone: "UTC"
    });
}

function parseIsoDate(iso) {
    const match = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function isoDate(year, month, day) {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function normalizeWeekday(value) {
    const normalized = String(value).slice(0, 3).toLowerCase();
    const map = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };
    return map[normalized] || value;
}

function weekdayIndex(value) {
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(value);
}

function monthIndex(value) {
    return ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(String(value).slice(0, 3).toLowerCase());
}

function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
}

function uniqueBy(values, getKey) {
    const seen = new Set();
    return values.filter((value) => {
        const key = getKey(value);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function looksAccessDenied(html) {
    return /Access Denied/i.test(html) && /edgesuite|permission to access|akamai/i.test(html);
}

main().catch((error) => {
    console.error(`Homes.com listing sync failed: ${error.message}`);
    process.exitCode = 1;
});
