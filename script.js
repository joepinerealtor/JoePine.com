const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const yearNode = document.querySelector("[data-current-year]");
const revealNodes = document.querySelectorAll("[data-reveal]");

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

const serviceAreaMapNode = document.getElementById("service-area-map");

if (serviceAreaMapNode) {
    if (window.L) {
        const serviceAreaMap = L.map(serviceAreaMapNode, {
            scrollWheelZoom: false,
            zoomControl: true
        });

        const coverageBounds = L.latLngBounds(
            [41.54, -71.95],
            [42.40, -70.68]
        );

        const serviceFootprint = [
            [42.33, -71.90],
            [42.34, -71.56],
            [42.15, -71.08],
            [41.96, -70.79],
            [41.58, -70.74],
            [41.57, -71.12],
            [41.64, -71.36],
            [41.62, -71.78],
            [41.87, -71.78]
        ];

        const heatZones = [
            { coords: [41.7001, -71.6828], radius: 22000, opacity: 0.15 },
            { coords: [41.8137, -71.3701], radius: 19000, opacity: 0.14 },
            { coords: [41.7677, -71.3534], radius: 14000, opacity: 0.1 },
            { coords: [41.9210, -71.4359], radius: 17000, opacity: 0.12 },
            { coords: [41.8959, -71.5484], radius: 18000, opacity: 0.11 },
            { coords: [41.9987, -71.5495], radius: 15000, opacity: 0.1 },
            { coords: [42.0029, -71.5148], radius: 18000, opacity: 0.13 },
            { coords: [41.7002, -71.4162], radius: 18000, opacity: 0.11 },
            { coords: [41.6982, -71.5167], radius: 16000, opacity: 0.1 },
            { coords: [42.2626, -71.8023], radius: 24000, opacity: 0.08 },
            { coords: [41.9904, -70.9750], radius: 20000, opacity: 0.07 },
            { coords: [41.6584, -70.8161], radius: 18000, opacity: 0.06 }
        ];

        const anchorMarkets = [
            {
                name: "Coventry",
                coords: [41.7001, -71.6828],
                direction: "top"
            },
            {
                name: "Woonsocket",
                coords: [42.0029, -71.5148],
                direction: "top"
            },
            {
                name: "Lincoln",
                coords: [41.9210, -71.4359],
                direction: "right"
            },
            {
                name: "East Providence",
                coords: [41.8137, -71.3701],
                direction: "right"
            },
            {
                name: "Warwick",
                coords: [41.7002, -71.4162],
                direction: "left"
            },
            {
                name: "Riverside",
                coords: [41.7677, -71.3534],
                direction: "left"
            },
            {
                name: "Smithfield",
                coords: [41.8959, -71.5484],
                direction: "right"
            }
        ];

        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 18
        }).addTo(serviceAreaMap);

        heatZones.forEach((zone) => {
            L.circle(zone.coords, {
                radius: zone.radius,
                stroke: false,
                fillColor: "#ce011f",
                fillOpacity: zone.opacity
            }).addTo(serviceAreaMap);
        });

        L.polygon(serviceFootprint, {
            color: "#8f0019",
            weight: 2,
            opacity: 0.7,
            fillColor: "#ce011f",
            fillOpacity: 0.09,
            dashArray: "8 8"
        }).addTo(serviceAreaMap);

        anchorMarkets.forEach((market) => {
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
                    offset: [0, -10]
                });
        });

        serviceAreaMap.fitBounds(coverageBounds, {
            padding: [24, 24]
        });
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
