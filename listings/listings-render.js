(function () {
    const dataStore = window.JOE_PINE_LISTINGS;
    const listings = Array.isArray(dataStore?.listings) ? dataStore.listings.slice() : [];
    const statusOrder = {
        active: 0,
        "coming-soon": 1,
        "under-contract": 2,
        sold: 3
    };

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function formatPrice(value) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0
        }).format(value);
    }

    function formatNumber(value) {
        return new Intl.NumberFormat("en-US").format(value);
    }

    function formatBaths(value) {
        return Number.isInteger(value) ? `${value}` : `${value}`;
    }

    function buildPropertyHref(prefix, slug) {
        return `${prefix}${encodeURIComponent(slug)}`;
    }

    function sortListings(collection) {
        return collection.slice().sort((left, right) => {
            const leftStatusOrder = statusOrder[left.status] ?? 99;
            const rightStatusOrder = statusOrder[right.status] ?? 99;

            if (left.featured !== right.featured) {
                return left.featured ? -1 : 1;
            }

            if (leftStatusOrder !== rightStatusOrder) {
                return leftStatusOrder - rightStatusOrder;
            }

            return String(right.listedDate).localeCompare(String(left.listedDate));
        });
    }

    function getFeaturedListing() {
        return sortListings(listings).find((listing) => listing.featured) || sortListings(listings)[0] || null;
    }

    function getHubListings() {
        return sortListings(listings);
    }

    function buildFactChips(listing) {
        const primaryOpenHouse = getPrimaryOpenHouse(listing);
        const chips = [
            `${listing.beds} beds`,
            `${formatBaths(listing.baths)} baths`,
            `${formatNumber(listing.sqft)} sq ft`,
            `${formatNumber(listing.lotSqft)} sq ft lot`
        ];

        if (primaryOpenHouse?.chipLabel) {
            chips.push(primaryOpenHouse.chipLabel);
        }

        return chips;
    }

    function buildButton(href, label, className, extraAttributes) {
        if (!href) {
            return "";
        }

        return `<a class="button ${className}" href="${escapeHtml(href)}"${extraAttributes || ""}>${escapeHtml(label)}</a>`;
    }

    function renderDetailCard(section) {
        if (!section) {
            return "";
        }

        const itemsMarkup = Array.isArray(section.items)
            ? [
                  '<ul class="feature-list">',
                  section.items.map((item) => `    <li>${escapeHtml(item)}</li>`).join(""),
                  "</ul>"
              ].join("")
            : "";
        const paragraphsMarkup = Array.isArray(section.paragraphs)
            ? section.paragraphs.map((paragraph, index) => {
                  const styleAttr = index > 0 ? ' style="margin-top: 12px;"' : "";
                  return `<p${styleAttr}>${escapeHtml(paragraph)}</p>`;
              }).join("")
            : "";

        return [
            '<article class="detail-card">',
            `    <p class="eyebrow">${escapeHtml(section.eyebrow)}</p>`,
            `    <h2>${escapeHtml(section.title)}</h2>`,
            itemsMarkup,
            paragraphsMarkup,
            "</article>"
        ].join("");
    }

    function getOpenHouseCollection(listing) {
        if (Array.isArray(listing.openHouses)) {
            return listing.openHouses
                .filter((entry) => entry && entry.startIso && entry.endIso)
                .slice()
                .sort((left, right) => String(left.startIso).localeCompare(String(right.startIso)));
        }

        if (listing.openHouse?.dateLabel) {
            return [listing.openHouse];
        }

        return [];
    }

    function getUpcomingOpenHouses(listing, now = new Date()) {
        return getOpenHouseCollection(listing).filter((entry) => {
            if (!entry.endIso) {
                return true;
            }

            return new Date(entry.endIso).getTime() >= now.getTime();
        });
    }

    function getPrimaryOpenHouse(listing, now = new Date()) {
        return getUpcomingOpenHouses(listing, now)[0] || null;
    }

    function buildOpenHousePanelMarkup(listing) {
        const upcomingOpenHouses = getUpcomingOpenHouses(listing);

        if (!upcomingOpenHouses.length) {
            return [
                '        <p class="eyebrow">Showing Info</p>',
                '        <h2>No open house is currently scheduled.</h2>',
                '        <p>Private showings and timing questions can still go straight to Joe.</p>',
                '        <p style="margin-top: 10px;">Sale is subject to seller finding suitable housing.</p>'
            ].join("");
        }

        const heading = upcomingOpenHouses.length > 1 ? "Upcoming Open Houses" : "Open House";
        const cards = upcomingOpenHouses
            .map((entry) => {
                return [
                    '<div class="open-house-entry">',
                    `    <strong>${escapeHtml(entry.dateLabel)}</strong>`,
                    `    <span>${escapeHtml(entry.timeLabel)}</span>`,
                    "</div>"
                ].join("");
            })
            .join("");

        return [
            `        <p class="eyebrow">${heading}</p>`,
            `        <h2>${escapeHtml(upcomingOpenHouses[0].dateLabel.replace(/^[A-Za-z]+, /, ""))}</h2>`,
            `        <div class="open-house-stack">${cards}</div>`,
            '        <p style="margin-top: 10px;">Sale is subject to seller finding suitable housing.</p>'
        ].join("");
    }

    function getCarouselImages(listing) {
        if (Array.isArray(listing.featuredImageIndexes) && listing.featuredImageIndexes.length) {
            const selectedImages = listing.featuredImageIndexes.map((index) => listing.images[index]).filter(Boolean);
            if (selectedImages.length) {
                return selectedImages;
            }
        }

        return listing.images;
    }

    function buildCarouselMarkup(listing) {
        const carouselImages = getCarouselImages(listing);
        const slides = carouselImages
            .map((image, index) => {
                const activeClass = index === 0 ? " is-active" : "";
                return [
                    `<figure class="featured-photo-slide${activeClass}" data-featured-slide>`,
                    `    <img src="${escapeHtml(image.src)}" referrerpolicy="no-referrer" alt="${escapeHtml(image.alt)}">`,
                    "</figure>"
                ].join("");
            })
            .join("");

        const dots = carouselImages
            .map((image, index) => {
                const activeClass = index === 0 ? " is-active" : "";
                const activePressed = index === 0 ? "true" : "false";
                return `<button class="featured-photo-dot${activeClass}" type="button" data-featured-dot aria-label="Show photo ${index + 1}" aria-pressed="${activePressed}"></button>`;
            })
            .join("");

        return [
            `<div class="featured-photo-carousel" data-featured-carousel aria-label="${escapeHtml(listing.title)} photo carousel">`,
            '    <div class="featured-photo-viewport">',
            '        <button class="featured-photo-arrow featured-photo-arrow-prev" type="button" data-featured-prev aria-label="Show previous photo">&larr;</button>',
            slides,
            '        <button class="featured-photo-arrow featured-photo-arrow-next" type="button" data-featured-next aria-label="Show next photo">&rarr;</button>',
            "    </div>",
            '    <div class="featured-photo-controls">',
            '        <div class="featured-photo-dots" aria-label="Choose a listing photo">',
            dots,
            "        </div>",
            "    </div>",
            "</div>"
        ].join("");
    }

    function buildGalleryLightboxMarkup(listing) {
        const firstImage = listing.images[0];

        if (!firstImage) {
            return "";
        }

        return [
            '<div class="gallery-lightbox" data-gallery-lightbox hidden>',
            `    <div class="gallery-lightbox-shell" role="dialog" aria-modal="true" aria-label="${escapeHtml(`${listing.title} photo viewer`)}">`,
            '        <button class="gallery-lightbox-close" type="button" data-gallery-close aria-label="Close photo viewer">Close</button>',
            '        <div class="gallery-lightbox-stage">',
            '            <button class="gallery-lightbox-nav gallery-lightbox-nav-prev" type="button" data-gallery-prev aria-label="Show previous photo">&larr;</button>',
            '            <figure class="gallery-lightbox-figure">',
            `                <img src="${escapeHtml(firstImage.src)}" alt="${escapeHtml(firstImage.alt)}" data-gallery-lightbox-image>`,
            '                <figcaption class="gallery-lightbox-caption">',
            `                    <span class="gallery-lightbox-count" data-gallery-lightbox-count>Photo 1 of ${listing.images.length}</span>`,
            `                    <strong data-gallery-lightbox-caption>${escapeHtml(firstImage.caption || firstImage.alt)}</strong>`,
            "                </figcaption>",
            "            </figure>",
            '            <button class="gallery-lightbox-nav gallery-lightbox-nav-next" type="button" data-gallery-next aria-label="Show next photo">&rarr;</button>',
            "        </div>",
            "    </div>",
            "</div>"
        ].join("");
    }

    function initializeFeaturedCarousels(root) {
        const scope = root || document;
        const carousels = scope.querySelectorAll("[data-featured-carousel]");

        carousels.forEach((carousel) => {
            if (carousel.dataset.carouselReady === "true") {
                return;
            }

            const slides = Array.from(carousel.querySelectorAll("[data-featured-slide]"));
            const dots = Array.from(carousel.querySelectorAll("[data-featured-dot]"));
            const viewport = carousel.querySelector(".featured-photo-viewport");
            const previousButtons = Array.from(carousel.querySelectorAll("[data-featured-prev]"));
            const nextButtons = Array.from(carousel.querySelectorAll("[data-featured-next]"));

            if (!slides.length) {
                return;
            }

            let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));

            if (activeIndex < 0) {
                activeIndex = 0;
            }

            const syncCarousel = () => {
                slides.forEach((slide, index) => {
                    slide.classList.toggle("is-active", index === activeIndex);
                });

                dots.forEach((dot, index) => {
                    const isActive = index === activeIndex;
                    dot.classList.toggle("is-active", isActive);
                    dot.setAttribute("aria-pressed", String(isActive));
                });
            };

            const setSlide = (nextIndex) => {
                activeIndex = (nextIndex + slides.length) % slides.length;
                syncCarousel();
            };

            previousButtons.forEach((button) => {
                button.addEventListener("click", () => {
                    setSlide(activeIndex - 1);
                });
            });

            nextButtons.forEach((button) => {
                button.addEventListener("click", () => {
                    setSlide(activeIndex + 1);
                });
            });

            dots.forEach((dot, index) => {
                dot.addEventListener("click", () => {
                    setSlide(index);
                });
            });

            viewport?.addEventListener("click", (event) => {
                if (event.target.closest("button")) {
                    return;
                }

                const bounds = viewport.getBoundingClientRect();
                const clickX = event.clientX - bounds.left;
                const midpoint = bounds.width / 2;

                if (clickX < midpoint) {
                    setSlide(activeIndex - 1);
                    return;
                }

                setSlide(activeIndex + 1);
            });

            syncCarousel();
            carousel.dataset.carouselReady = "true";
        });
    }

    function initializeListingGallery(root, listing) {
        const lightbox = root.querySelector("[data-gallery-lightbox]");
        const triggerButtons = Array.from(root.querySelectorAll("[data-gallery-trigger]"));
        const galleryActivationReadyAt = Date.now() + 700;

        if (!lightbox || !triggerButtons.length || lightbox.dataset.galleryReady === "true") {
            return;
        }

        const lightboxShell = lightbox.querySelector(".gallery-lightbox-shell");
        const lightboxImage = lightbox.querySelector("[data-gallery-lightbox-image]");
        const lightboxCaption = lightbox.querySelector("[data-gallery-lightbox-caption]");
        const lightboxCount = lightbox.querySelector("[data-gallery-lightbox-count]");
        const previousButton = lightbox.querySelector("[data-gallery-prev]");
        const nextButton = lightbox.querySelector("[data-gallery-next]");
        const closeButtons = Array.from(lightbox.querySelectorAll("[data-gallery-close]"));
        const totalImages = listing.images.length;
        let activeIndex = 0;
        let lastTrigger = null;

        const syncLightbox = () => {
            const activeImage = listing.images[activeIndex];

            if (!activeImage) {
                return;
            }

            lightboxImage.setAttribute("src", activeImage.src);
            lightboxImage.setAttribute("alt", activeImage.alt);
            lightboxCaption.textContent = activeImage.caption || activeImage.alt;
            lightboxCount.textContent = `Photo ${activeIndex + 1} of ${totalImages}`;

            const disabled = totalImages < 2;
            previousButton.disabled = disabled;
            nextButton.disabled = disabled;
        };

        const moveLightbox = (direction) => {
            if (totalImages < 2) {
                return;
            }

            activeIndex = (activeIndex + direction + totalImages) % totalImages;
            syncLightbox();
        };

        const openLightbox = (index, triggerNode) => {
            activeIndex = Math.min(Math.max(index, 0), totalImages - 1);
            lastTrigger = triggerNode || document.activeElement;
            syncLightbox();
            lightbox.hidden = false;
            document.body.classList.add("listing-lightbox-open");
            lightbox.querySelector(".gallery-lightbox-close")?.focus();
        };

        const closeLightbox = () => {
            if (lightbox.hidden) {
                return;
            }

            lightbox.hidden = true;
            document.body.classList.remove("listing-lightbox-open");

            if (lastTrigger && typeof lastTrigger.focus === "function") {
                lastTrigger.focus();
            }
        };

        triggerButtons.forEach((buttonNode) => {
            buttonNode.addEventListener("click", (event) => {
                // Prevent the navigation click from the previous page from opening the gallery on load.
                if (Date.now() < galleryActivationReadyAt) {
                    event.preventDefault();
                    return;
                }

                const requestedIndex = Number.parseInt(buttonNode.dataset.galleryIndex || "0", 10);
                openLightbox(Number.isNaN(requestedIndex) ? 0 : requestedIndex, buttonNode);
            });
        });

        closeButtons.forEach((buttonNode) => {
            buttonNode.addEventListener("click", closeLightbox);
        });

        previousButton?.addEventListener("click", () => moveLightbox(-1));
        nextButton?.addEventListener("click", () => moveLightbox(1));

        lightbox.addEventListener("click", (event) => {
            if (event.target === lightbox) {
                closeLightbox();
            }
        });

        lightboxShell?.addEventListener("click", (event) => {
            event.stopPropagation();
        });

        lightbox.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                closeLightbox();
                return;
            }

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                moveLightbox(-1);
                return;
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                moveLightbox(1);
            }
        });

        lightbox.dataset.galleryReady = "true";
    }

    function renderHomeFeatured() {
        const root = document.querySelector("[data-listings-home-featured]");
        const listing = getFeaturedListing();
        const primaryOpenHouse = listing ? getPrimaryOpenHouse(listing) : null;

        if (!root || !listing) {
            return;
        }

        const propertyHref = buildPropertyHref("./listings/property/?slug=", listing.slug);

        root.innerHTML = [
            '<div class="featured-listing-shell">',
            '    <div class="featured-listing-copy">',
            '        <p class="eyebrow">Featured Listing</p>',
            `        <h2>${escapeHtml(listing.headline)}</h2>`,
            `        <p class="featured-listing-price">${escapeHtml(formatPrice(listing.price))}</p>`,
            `        <div class="featured-listing-stats" aria-label="${escapeHtml(listing.title)} home facts">`,
            buildFactChips(listing).map((chip) => `            <span>${escapeHtml(chip)}</span>`).join(""),
            "        </div>",
            `        <p class="featured-listing-text">${escapeHtml(listing.summary)}</p>`,
            '        <ul class="featured-listing-highlights">',
            listing.highlights.map((item) => `            <li>${escapeHtml(item)}</li>`).join(""),
            "        </ul>",
            '        <div class="featured-listing-actions">',
            buildButton(propertyHref, "Open Listing Page", "button-primary"),
            buildButton(listing.links.tour3d, "Open 3D Tour", "button-secondary", ' target="_blank" rel="noreferrer"'),
            buildButton(listing.links.homes, "View On Homes.com", "button-secondary", ' target="_blank" rel="noreferrer"'),
            "        </div>",
            primaryOpenHouse
                ? `        <p class="featured-listing-note">Open house is scheduled for ${escapeHtml(primaryOpenHouse.dateLabel)} from ${escapeHtml(primaryOpenHouse.timeLabel)}. Seller plans to pay off the solar loan at closing.</p>`
                : '        <p class="featured-listing-note">Seller plans to pay off the solar loan at closing. Reach out to Joe for the latest showing availability.</p>',
            "    </div>",
            '    <div class="featured-media-card">',
            '        <div class="featured-media-heading">',
            `            <p>${escapeHtml(listing.areaLabel)}</p>`,
            `            <strong>${escapeHtml(listing.teaser)}</strong>`,
            "        </div>",
            buildCarouselMarkup(listing),
            '        <div class="featured-media-actions">',
            buildButton(`mailto:JoePine@KW.com?subject=${encodeURIComponent(`${listing.title} Showing Request`)}`, "Email Joe About This Home", "button-ink"),
            "        </div>",
            `        <p class="featured-media-note">${escapeHtml(listing.locationBlurb)}</p>`,
            "    </div>",
            "</div>"
        ].join("");

        initializeFeaturedCarousels(root);
    }

    function renderListingsFeatured() {
        const root = document.querySelector("[data-listings-page-featured]");
        const listing = getFeaturedListing();
        const primaryOpenHouse = listing ? getPrimaryOpenHouse(listing) : null;

        if (!root || !listing) {
            return;
        }

        const propertyHref = buildPropertyHref("./property/?slug=", listing.slug);

        root.innerHTML = [
            '<div class="featured-property">',
            '    <div class="featured-property-media">',
            `        <img src="${escapeHtml(listing.images[0].src)}" referrerpolicy="no-referrer" alt="${escapeHtml(listing.images[0].alt)}">`,
            "    </div>",
            '    <div class="featured-property-copy">',
            '        <p class="section-kicker">Featured Listing</p>',
            `        <h2>${escapeHtml(`${listing.title}, ${listing.city}, ${listing.state} ${listing.zip}`)}</h2>`,
            `        <p class="featured-property-price">${escapeHtml(formatPrice(listing.price))}</p>`,
            `        <div class="featured-property-chips" aria-label="${escapeHtml(listing.title)} home facts">`,
            buildFactChips(listing).map((chip) => `            <span>${escapeHtml(chip)}</span>`).join(""),
            "        </div>",
            `        <p>${escapeHtml(listing.hubSummary)}</p>`,
            '        <ul class="featured-property-highlights">',
            listing.highlights.map((item) => `            <li>${escapeHtml(item)}</li>`).join(""),
            "        </ul>",
            '        <div class="featured-property-actions">',
            buildButton(propertyHref, "View Property Page", "button-primary"),
            buildButton(listing.links.tour3d, "Open 3D Tour", "button-secondary", ' target="_blank" rel="noreferrer"'),
            buildButton(`mailto:JoePine@KW.com?subject=${encodeURIComponent(`${listing.title} Showing Request`)}`, "Email Joe", "button-secondary"),
            "        </div>",
            primaryOpenHouse
                ? `        <p class="featured-property-note">${escapeHtml(`${primaryOpenHouse.dateLabel} from ${primaryOpenHouse.timeLabel}. ${listing.sourceNote}`)}</p>`
                : `        <p class="featured-property-note">${escapeHtml(listing.sourceNote)}</p>`,
            "    </div>",
            "</div>"
        ].join("");
    }

    function renderListingsGrid() {
        const root = document.querySelector("[data-listings-page-grid]");
        const collection = getHubListings();
        const secondaryListings = collection.filter((listing) => !listing.featured);

        if (!root || !collection.length) {
            return;
        }

        const cards = secondaryListings
            .map((listing) => {
                const propertyHref = buildPropertyHref("./property/?slug=", listing.slug);
                const detailChip = getPrimaryOpenHouse(listing)?.chipLabel || listing.statusLabel;

                return [
                    '<article class="listing-card">',
                    '    <div class="listing-card-media">',
                    `        <img src="${escapeHtml(listing.images[0].src)}" referrerpolicy="no-referrer" alt="${escapeHtml(listing.images[0].alt)}">`,
                    "    </div>",
                    '    <div class="listing-card-body">',
                    '        <div class="listing-card-status-row">',
                    `            <span class="listing-card-status">${escapeHtml(listing.statusLabel)}</span>`,
                    listing.neighborhood
                        ? `            <span class="listing-card-status listing-card-status-muted">${escapeHtml(listing.neighborhood)}</span>`
                        : "",
                    "        </div>",
                    `        <h3>${escapeHtml(listing.title)}</h3>`,
                    `        <p class="listing-card-address">${escapeHtml(`${listing.city}, ${listing.state} ${listing.zip}`)}</p>`,
                    `        <p class="listing-card-price">${escapeHtml(formatPrice(listing.price))}</p>`,
                    '        <div class="listing-card-meta">',
                    `            <span>${escapeHtml(`${listing.beds} beds`)}</span>`,
                    `            <span>${escapeHtml(`${formatBaths(listing.baths)} baths`)}</span>`,
                    `            <span>${escapeHtml(`${formatNumber(listing.sqft)} sq ft`)}</span>`,
                    `            <span>${escapeHtml(detailChip)}</span>`,
                    "        </div>",
                    `        <p class="listing-card-text">${escapeHtml(listing.hubSummary)}</p>`,
                    '        <div class="listing-card-actions">',
                    buildButton(propertyHref, "Open Listing", "button-primary"),
                    buildButton(listing.links.tour3d, "3D Tour", "button-secondary", ' target="_blank" rel="noreferrer"'),
                    buildButton(listing.links.homes, "Homes.com", "button-secondary", ' target="_blank" rel="noreferrer"'),
                    "        </div>",
                    "    </div>",
                    "</article>"
                ].join("");
            })
            .join("");

        root.innerHTML = [
            '<section class="listing-hub-section">',
            '    <div class="listing-hub-header">',
            '        <p class="section-kicker">Current Listings</p>',
            '        <h2>Keep every listing in one organized place.</h2>',
            '        <p>As new listings go live, they can be added to the shared listings data and will appear here automatically without rebuilding this page by hand.</p>',
            "    </div>",
            secondaryListings.length
                ? `    <div class="listing-hub-grid">${cards}</div>`
                : '    <div class="listing-hub-empty">The site is ready for the next listing. As soon as another property is added to the shared data file, it will appear here automatically.</div>',
            "</section>"
        ].join("");
    }

    function updateListingMeta(listing) {
        const primaryOpenHouse = getPrimaryOpenHouse(listing);
        const openHouseFragment = primaryOpenHouse ? `, next open house ${primaryOpenHouse.dateLabel}` : "";
        const title = `${listing.title}, ${listing.city} ${listing.state} ${listing.zip} | Joe Pine Real Estate`;
        const description = `Featured listing at ${listing.title} in ${listing.city}, ${listing.state}. ${formatPrice(listing.price)}, ${listing.beds} bedrooms, ${formatBaths(listing.baths)} baths, ${formatNumber(listing.sqft)} square feet, fenced yard, porch, patio, and solar${openHouseFragment}.`;
        const image = listing.images[0];
        const canonicalHref = `https://joepine.com/listings/property/?slug=${encodeURIComponent(listing.slug)}`;
        const schemaNode = document.querySelector("[data-listing-schema]");

        document.title = title;

        const metaUpdates = [
            { selector: 'meta[name="description"]', value: description },
            { selector: 'meta[property="og:title"]', value: title },
            { selector: 'meta[property="og:description"]', value: description },
            { selector: 'meta[property="og:image"]', value: image.src },
            { selector: 'meta[property="og:image:alt"]', value: image.alt },
            { selector: 'meta[name="twitter:title"]', value: title },
            { selector: 'meta[name="twitter:description"]', value: description },
            { selector: 'meta[name="twitter:image"]', value: image.src }
        ];

        metaUpdates.forEach((update) => {
            const node = document.querySelector(update.selector);
            if (node) {
                node.setAttribute("content", update.value);
            }
        });

        const canonicalNode = document.querySelector('link[rel="canonical"]');
        if (canonicalNode) {
            canonicalNode.setAttribute("href", canonicalHref);
        }

        if (schemaNode) {
            schemaNode.textContent = JSON.stringify(
                {
                    "@context": "https://schema.org",
                    "@type": "SingleFamilyResidence",
                    name: `${listing.title}, ${listing.city}, ${listing.state} ${listing.zip}`,
                    url: canonicalHref,
                    image: listing.images.slice(0, 3).map((imageItem) => imageItem.src),
                    description: listing.schemaDescription,
                    address: {
                        "@type": "PostalAddress",
                        streetAddress: listing.title,
                        addressLocality: listing.city,
                        addressRegion: listing.state,
                        postalCode: listing.zip,
                        addressCountry: "US"
                    },
                    floorSize: {
                        "@type": "QuantitativeValue",
                        value: listing.sqft,
                        unitCode: "FTK"
                    },
                    numberOfBedrooms: listing.beds,
                    numberOfBathroomsTotal: listing.baths,
                    yearBuilt: listing.yearBuilt,
                    offers: {
                        "@type": "Offer",
                        priceCurrency: "USD",
                        price: listing.price,
                        availability: "https://schema.org/InStock",
                        url: canonicalHref
                    }
                },
                null,
                2
            );
        }
    }

    function renderListingDetail() {
        const root = document.querySelector("[data-listing-detail-root]");

        if (!root) {
            return;
        }

        const slug = new URLSearchParams(window.location.search).get("slug");
        const listing = listings.find((item) => item.slug === slug) || null;

        if (!listing) {
            root.innerHTML = [
                '<section class="listing-fallback-card">',
                '    <p class="eyebrow">Listing Not Found</p>',
                "    <h1>That property is not in the site data yet.</h1>",
                "    <p>If you were expecting a listing here, go back to the listings page and choose one of the active properties, or send over the new listing link so it can be added.</p>",
                '    <div class="listing-actions">',
                buildButton("../", "Back to Listings", "button-primary"),
                "    </div>",
                "</section>"
            ].join("");
            return;
        }

        updateListingMeta(listing);

        const primaryOpenHouse = getPrimaryOpenHouse(listing);
        const heroImage = listing.images[0];
        const imageFigures = listing.images
            .map((image, index) => {
                const photoLabel = `Open photo ${index + 1} of ${listing.images.length}: ${image.caption || image.alt}`;
                return [
                    "<figure>",
                    `    <button class="gallery-tile-button" type="button" data-gallery-trigger data-gallery-index="${index}" aria-label="${escapeHtml(photoLabel)}">`,
                    `        <img src="${escapeHtml(image.src)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" alt="${escapeHtml(image.alt)}">`,
                    '        <span class="gallery-tile-overlay">Click To Enlarge</span>',
                    "    </button>",
                    `    <figcaption><span>Photo ${index + 1}</span>${escapeHtml(image.caption)}</figcaption>`,
                    "</figure>"
                ].join("");
            })
            .join("");

        const factsMarkup = listing.facts
            .map((fact) => {
                return [
                    '<div class="fact">',
                    `    <span>${escapeHtml(fact.label)}</span>`,
                    `    <strong>${escapeHtml(fact.value)}</strong>`,
                    "</div>"
                ].join("");
            })
            .join("");

        const firstDetailSection = listing.detailSections[0];
        const secondDetailSection = listing.detailSections[1];
        const thirdDetailSection = listing.detailSections[2];

        root.innerHTML = [
            '<section class="listing-hero">',
            '    <div class="listing-copy">',
            '        <div class="status-row">',
            '            <span class="status-pill">Featured Listing</span>',
            primaryOpenHouse ? `            <span class="status-pill">Open House: ${escapeHtml(primaryOpenHouse.fullLabel)}</span>` : "",
            "        </div>",
            `        <p class="eyebrow">${escapeHtml(listing.areaLabel)}</p>`,
            `        <h1>${escapeHtml(listing.title)}</h1>`,
            `        <p class="listing-price">${escapeHtml(formatPrice(listing.price))}</p>`,
            `        <div class="listing-stat-pills" aria-label="${escapeHtml(listing.title)} home facts">`,
            [
                `${listing.beds} bedrooms`,
                `${formatBaths(listing.baths)} bathrooms`,
                `${formatNumber(listing.sqft)} sq ft`,
                `${formatNumber(listing.lotSqft)} sq ft lot`,
                `Built in ${listing.yearBuilt}`,
                `${listing.neighborhood} neighborhood`
            ]
                .map((chip) => `            <span>${escapeHtml(chip)}</span>`)
                .join(""),
            "        </div>",
            listing.detailIntro.map((paragraph) => `        <p>${escapeHtml(paragraph)}</p>`).join(""),
            '        <div class="listing-actions">',
            buildButton(`mailto:JoePine@KW.com?subject=${encodeURIComponent(`${listing.title} Showing Request`)}`, "Book a Showing", "button-primary"),
            buildButton(listing.links.tour3d, "Open 3D Tour", "button-secondary", ' target="_blank" rel="noreferrer"'),
            buildButton("tel:4013270888", "Call Joe", "button-secondary"),
            buildButton(listing.links.homes, "View On Homes.com", "button-ghost", ' target="_blank" rel="noreferrer"'),
            "        </div>",
            `        <p class="source-note">${escapeHtml(listing.sourceNote)}</p>`,
            "    </div>",
            '    <div class="listing-hero-media">',
            `        <button class="listing-hero-media-button" type="button" data-gallery-trigger data-gallery-index="0" aria-label="${escapeHtml(`Open photo gallery for ${listing.title}`)}">`,
            `            <img src="${escapeHtml(heroImage.src)}" referrerpolicy="no-referrer" alt="${escapeHtml(heroImage.alt)}">`,
            '            <span class="listing-hero-media-badge">View Full Slideshow</span>',
            "        </button>",
            "    </div>",
            "</section>",
            '<section class="detail-grid">',
            renderDetailCard(firstDetailSection),
            '<article class="detail-card"><p class="eyebrow">Quick Facts</p><h2>Core home details at a glance.</h2><div class="facts-grid">',
            factsMarkup,
            "</div></article>",
            renderDetailCard(secondDetailSection),
            renderDetailCard(thirdDetailSection),
            "</section>",
            '<section class="gallery-card">',
            '    <p class="eyebrow">Photo Gallery</p>',
            `    <h2>A quick look around ${escapeHtml(listing.title)}.</h2>`,
            "    <p>Click any photo to open a larger slideshow and move through the full gallery without leaving the page.</p>",
            `    <div class="gallery-grid">${imageFigures}</div>`,
            "</section>",
            buildGalleryLightboxMarkup(listing),
            '<section class="cta-band">',
            '    <div class="cta-band-copy">',
            '        <p class="eyebrow">Next Step</p>',
            `        <h2>${escapeHtml(listing.cta.title)}</h2>`,
            `        <p>${escapeHtml(listing.cta.body)}</p>`,
            '        <div class="cta-actions">',
            buildButton(`mailto:JoePine@KW.com?subject=${encodeURIComponent(`${listing.title} Question`)}`, "Email Joe", "button-primary"),
            buildButton("tel:4013270888", "Call 401.327.0888", "button-secondary"),
            "        </div>",
            "    </div>",
            '    <div class="cta-band-detail">',
            buildOpenHousePanelMarkup(listing),
            "    </div>",
            "</section>"
        ].join("");

        initializeListingGallery(root, listing);
    }

    renderHomeFeatured();
    renderListingsFeatured();
    renderListingsGrid();
    renderListingDetail();
    initializeFeaturedCarousels(document);

    window.JoePineListings = {
        listings,
        getFeaturedListing,
        getHubListings,
        initializeFeaturedCarousels
    };
})();
