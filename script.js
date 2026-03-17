const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const yearNode = document.querySelector("[data-current-year]");
const revealNodes = document.querySelectorAll("[data-reveal]");
const photoCarousels = document.querySelectorAll("[data-photo-carousel]");

if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
}

if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("is-open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            nav.classList.remove("is-open");
            navToggle.setAttribute("aria-expanded", "false");
        });
    });
}

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.18,
            rootMargin: "0px 0px -40px 0px"
        }
    );

    revealNodes.forEach((node) => observer.observe(node));
} else {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
}

photoCarousels.forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll("[data-carousel-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-carousel-dot]"));
    const prevButton = carousel.querySelector("[data-carousel-prev]");
    const nextButton = carousel.querySelector("[data-carousel-next]");

    if (slides.length < 2 || !prevButton || !nextButton) {
        return;
    }

    let currentIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));

    if (currentIndex < 0) {
        currentIndex = 0;
    }

    const setActiveSlide = (nextIndex) => {
        currentIndex = (nextIndex + slides.length) % slides.length;

        slides.forEach((slide, index) => {
            const isActive = index === currentIndex;
            slide.classList.toggle("is-active", isActive);
            slide.setAttribute("aria-hidden", String(!isActive));
            slide.tabIndex = isActive ? 0 : -1;
        });

        dots.forEach((dot, index) => {
            const isActive = index === currentIndex;
            dot.classList.toggle("is-active", isActive);
            dot.setAttribute("aria-pressed", String(isActive));
        });
    };

    prevButton.addEventListener("click", () => {
        setActiveSlide(currentIndex - 1);
    });

    nextButton.addEventListener("click", () => {
        setActiveSlide(currentIndex + 1);
    });

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            setActiveSlide(index);
        });
    });

    setActiveSlide(currentIndex);
});

const serviceAreaMapNode = document.getElementById("service-area-map");

if (serviceAreaMapNode) {
    if (window.L) {
        const serviceAreaMap = L.map(serviceAreaMapNode, {
            attributionControl: true,
            scrollWheelZoom: false,
            zoomControl: false,
            dragging: false,
            touchZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false,
            tap: false
        });

        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
            subdomains: "abcd",
            maxZoom: 20,
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }).addTo(serviceAreaMap);

        const soldMarkets = [
            {
                name: "Rehoboth",
                coords: [41.8404, -71.2495],
                direction: "right",
                offset: [14, -2]
            },
            {
                name: "Taunton",
                coords: [41.9001, -71.0898],
                direction: "top",
                offset: [0, -14]
            },
            {
                name: "Attleboro",
                coords: [41.9445, -71.2856],
                direction: "top",
                offset: [0, -14]
            },
            {
                name: "Mattapoisett",
                coords: [41.6358, -70.7858],
                direction: "left",
                offset: [-14, -4]
            },
            {
                name: "Rochester",
                coords: [41.7458, -70.8369],
                direction: "right",
                offset: [14, -4]
            },
            {
                name: "Coventry",
                coords: [41.7001, -71.6828],
                direction: "left",
                offset: [-14, 0]
            },
            {
                name: "Woonsocket",
                coords: [42.0029, -71.5148],
                direction: "top",
                offset: [0, -14]
            },
            {
                name: "Burrillville",
                coords: [41.9668, -71.6781],
                direction: "left",
                offset: [-14, -6]
            },
            {
                name: "East Providence",
                coords: [41.8137, -71.3701],
                direction: "left",
                offset: [-14, -2]
            },
            {
                name: "Barrington",
                coords: [41.7407, -71.3083],
                direction: "bottom",
                offset: [8, 14]
            },
            {
                name: "Warwick",
                coords: [41.7002, -71.4162],
                direction: "left",
                offset: [-14, 8]
            },
            {
                name: "Pawtucket",
                coords: [41.8787, -71.3826],
                direction: "right",
                offset: [14, -12]
            }
        ];

        const soldMarketRadius = 12000;
        const soldMarketBounds = L.latLngBounds(soldMarkets.map((market) => market.coords));

        soldMarkets.forEach((market) => {
            L.circle(market.coords, {
                radius: soldMarketRadius,
                color: "#ce011f",
                weight: 1.5,
                opacity: 0.28,
                fillColor: "#ce011f",
                fillOpacity: 0.12
            }).addTo(serviceAreaMap);

            L.circleMarker(market.coords, {
                radius: 7,
                color: "#ffffff",
                weight: 2,
                fillColor: "#ce011f",
                fillOpacity: 1
            })
                .addTo(serviceAreaMap)
                .bindTooltip(market.name, {
                    permanent: true,
                    direction: market.direction,
                    className: "service-area-label",
                    offset: market.offset || [0, -10]
                });
        });

        const resetSoldMarketView = () => {
            serviceAreaMap.invalidateSize();
            serviceAreaMap.fitBounds(soldMarketBounds, {
                padding: [36, 36]
            });
        };

        resetSoldMarketView();
        window.addEventListener("load", resetSoldMarketView);
        window.addEventListener("resize", resetSoldMarketView);
        setTimeout(resetSoldMarketView, 250);
        setTimeout(resetSoldMarketView, 1000);

        // Keep the map as a static visual on both desktop and touch devices.
        serviceAreaMap.dragging.disable();
        serviceAreaMap.touchZoom.disable();
        serviceAreaMap.doubleClickZoom.disable();
        serviceAreaMap.boxZoom.disable();
        serviceAreaMap.keyboard.disable();
        if (serviceAreaMap.tap) {
            serviceAreaMap.tap.disable();
        }
    } else {
        serviceAreaMapNode.classList.add("is-fallback");
        serviceAreaMapNode.innerHTML = [
            '<div class="service-area-map-fallback">',
            "<strong>Service area map</strong>",
            "<span>Joe Pine serves the full corridor from Rhode Island into Massachusetts, with especially strong focus in markets where he has visible sales activity, including Coventry, East Providence, Riverside, Lincoln, Smithfield, Woonsocket, Warwick, and nearby communities.</span>",
            "</div>"
        ].join("");
    }
}
