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

const wealthSection = document.querySelector(".wealth-section");
const wealthPreviewSection = document.querySelector(".wealth-preview-section");

if (wealthSection || wealthPreviewSection) {
    // Centralized example inputs so the section is easy to update later.
    const RENT_VS_BUY_CONFIG = {
        locationLabel: "Rhode Island",
        propertyLabel: "Average 2-bedroom rental vs. average 2-bedroom home example",
        comparisonMonths: 60,
        rent: {
            monthly2021: 1510.76,
            monthlyCurrent: 1979.6,
            annualGrowthRate: 0.04,
            stockMarketAnnualReturn: 0.126986661012222,
            fiveYearBaseTotal: 90645.6,
            fiveYearMidpointTotal: 98193.16
        },
        home: {
            value2021: 240872.56,
            valueCurrent: 385925.56,
            downPaymentRate: 0.035,
            downPaymentAmount: 8430.54,
            loanAmount: 232442.02,
            mortgageRate2021: 0.04125,
            mortgageRateCurrent: 0.0611,
            propertyTaxRateAnnual: 0.0125,
            propertyTaxGrowthRateAnnual: 0.03,
            homeownersInsuranceRateAnnual: 0.005,
            homeownersInsuranceGrowthRateAnnual: 0.05,
            loanTermMonths: 360,
            monthlyPrincipalInterest: 1126.53,
            principalInterestPaidFiveYears: 67591.78,
            principalPaidDownFiveYears: 21782.48,
            interestPaidFiveYears: 45809.3,
            appreciationFiveYears: 145053,
            totalWealthGainedFiveYears: 166835.48
        },
        nextPurchase: {
            targetHomePrice: 475000,
            buyerToday: {
                monthlyMortgage: 3650,
                downPayment: 16634,
                closingCosts: 14258,
                cashToClose: 30892,
                riHousingAssistance: 20000
            },
            ownerToday: {
                saleProceedsAvailable: 135214.07,
                downPayment: 95000,
                monthlyMortgage: 2905,
                closingCosts: 27326,
                cashToCloseBase: 109254,
                pointsCost: 13072,
                cashToClose: 122326
            }
        }
    };

    const wealthChartNode = wealthSection ? wealthSection.querySelector("[data-wealth-chart]") : null;
    const wealthChartReadout = wealthSection ? wealthSection.querySelector("[data-wealth-chart-readout]") : null;
    const wealthRenterBreakdown = wealthSection ? wealthSection.querySelector("[data-wealth-renter-breakdown]") : null;
    const wealthOwnerBreakdown = wealthSection ? wealthSection.querySelector("[data-wealth-owner-breakdown]") : null;

    const wealthValueNodes = wealthSection ? {
        rent2021: wealthSection.querySelector("[data-wealth-rent-2021]"),
        rentCurrent: wealthSection.querySelector("[data-wealth-rent-current]"),
        home2021: wealthSection.querySelector("[data-wealth-home-2021]"),
        homeCurrent: wealthSection.querySelector("[data-wealth-home-current]"),
        rate2021: wealthSection.querySelector("[data-wealth-rate-2021]"),
        rateCurrent: wealthSection.querySelector("[data-wealth-rate-current]"),
        taxRate: wealthSection.querySelector("[data-wealth-tax-rate]"),
        taxGrowth: wealthSection.querySelector("[data-wealth-tax-growth]"),
        insuranceRate: wealthSection.querySelector("[data-wealth-insurance-rate]"),
        insuranceGrowth: wealthSection.querySelector("[data-wealth-insurance-growth]"),
        pmiRate: wealthSection.querySelector("[data-wealth-pmi-rate]"),
        rentGrowth: wealthSection.querySelector("[data-wealth-rent-growth]"),
        stockReturn: wealthSection.querySelector("[data-wealth-stock-return]"),
        rentMonthlyStart: wealthSection.querySelector("[data-wealth-rent-monthly-start]"),
        rentTotal: wealthSection.querySelector("[data-wealth-rent-total]"),
        rentMonthlyEnd: wealthSection.querySelector("[data-wealth-rent-monthly-end]"),
        rentMidpoint: wealthSection.querySelector("[data-wealth-rent-midpoint]"),
        renterWealth: wealthSection.querySelector("[data-wealth-renter-wealth]"),
        renterNet: wealthSection.querySelector("[data-wealth-renter-net]"),
        renterNetRow: wealthSection.querySelector("[data-wealth-renter-net-row]"),
        renterNote: wealthSection.querySelector("[data-wealth-renter-note]"),
        diff2021Row: wealthSection.querySelector("[data-wealth-diff-2021-row]"),
        diff2026Row: wealthSection.querySelector("[data-wealth-diff-2026-row]"),
        diffTotalRow: wealthSection.querySelector("[data-wealth-diff-total-row]"),
        diffWealthRow: wealthSection.querySelector("[data-wealth-diff-wealth-row]"),
        diffNetRow: wealthSection.querySelector("[data-wealth-diff-net-row]"),
        diff2021: wealthSection.querySelector("[data-wealth-diff-2021]"),
        diff2026: wealthSection.querySelector("[data-wealth-diff-2026]"),
        diffTotal: wealthSection.querySelector("[data-wealth-diff-total]"),
        diffWealth: wealthSection.querySelector("[data-wealth-diff-wealth]"),
        diffNet: wealthSection.querySelector("[data-wealth-diff-net]"),
        ownerMonthly: wealthSection.querySelector("[data-wealth-owner-monthly]"),
        ownerMonthlyTotal: wealthSection.querySelector("[data-wealth-owner-monthly-total]"),
        ownerCarry: wealthSection.querySelector("[data-wealth-owner-carry]"),
        ownerCarryEnd: wealthSection.querySelector("[data-wealth-owner-carry-end]"),
        ownerMonthlyEnd: wealthSection.querySelector("[data-wealth-owner-monthly-end]"),
        ownerCarryNote: wealthSection.querySelector("[data-wealth-owner-carry-note]"),
        ownerPaid: wealthSection.querySelector("[data-wealth-owner-paid]"),
        ownerPrincipal: wealthSection.querySelector("[data-wealth-owner-principal]"),
        ownerAppreciation: wealthSection.querySelector("[data-wealth-owner-appreciation]"),
        ownerWealthRow: wealthSection.querySelector("[data-wealth-owner-wealth-row]"),
        ownerWealth: wealthSection.querySelector("[data-wealth-owner-wealth]"),
        ownerNet: wealthSection.querySelector("[data-wealth-owner-net]"),
        nextBuyerMonthly: wealthSection.querySelector("[data-wealth-next-buyer-monthly]"),
        nextBuyerCompareRow: wealthSection.querySelector("[data-wealth-next-buyer-compare-row]"),
        nextBuyerCompare: wealthSection.querySelector("[data-wealth-next-buyer-compare]"),
        nextBuyerPriorRow: wealthSection.querySelector("[data-wealth-next-buyer-prior-row]"),
        nextBuyerPrior: wealthSection.querySelector("[data-wealth-next-buyer-prior]"),
        nextBuyerDown: wealthSection.querySelector("[data-wealth-next-buyer-down]"),
        nextBuyerClosing: wealthSection.querySelector("[data-wealth-next-buyer-closing]"),
        nextBuyerClose: wealthSection.querySelector("[data-wealth-next-buyer-close]"),
        nextBuyerGapRow: wealthSection.querySelector("[data-wealth-next-buyer-gap-row]"),
        nextBuyerGap: wealthSection.querySelector("[data-wealth-next-buyer-gap]"),
        nextBuyerNote: wealthSection.querySelector("[data-wealth-next-buyer-note]"),
        nextOwnerMonthly: wealthSection.querySelector("[data-wealth-next-owner-monthly]"),
        nextOwnerCompareRow: wealthSection.querySelector("[data-wealth-next-owner-compare-row]"),
        nextOwnerCompare: wealthSection.querySelector("[data-wealth-next-owner-compare]"),
        nextOwnerPriorRow: wealthSection.querySelector("[data-wealth-next-owner-prior-row]"),
        nextOwnerPrior: wealthSection.querySelector("[data-wealth-next-owner-prior]"),
        nextOwnerDown: wealthSection.querySelector("[data-wealth-next-owner-down]"),
        nextOwnerClosing: wealthSection.querySelector("[data-wealth-next-owner-closing]"),
        nextOwnerClose: wealthSection.querySelector("[data-wealth-next-owner-close]"),
        nextOwnerLeftRow: wealthSection.querySelector("[data-wealth-next-owner-left-row]"),
        nextOwnerLeft: wealthSection.querySelector("[data-wealth-next-owner-left]"),
        nextOwnerNote: wealthSection.querySelector("[data-wealth-next-owner-note]")
    } : {};

    const wealthPreviewNodes = wealthPreviewSection ? {
        rentStart: wealthPreviewSection.querySelector("[data-preview-rent-start]"),
        ownerStart: wealthPreviewSection.querySelector("[data-preview-owner-start]"),
        diff2021: wealthPreviewSection.querySelector("[data-preview-diff-2021]"),
        diff2026: wealthPreviewSection.querySelector("[data-preview-diff-2026]")
    } : {};

    const wealthCurrencyFormatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
    });

    const wealthCurrencyFormatterPrecise = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const wealthState = {
        hoveredMonth: RENT_VS_BUY_CONFIG.comparisonMonths
    };

    function clampValue(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function formatCurrency(value, withCents = false) {
        return (withCents ? wealthCurrencyFormatterPrecise : wealthCurrencyFormatter).format(value);
    }

    function formatPercent(value) {
        return `${(value * 100).toFixed(2)}%`;
    }

    function formatRatePercent(value) {
        return `${(value * 100).toFixed(3).replace(/\.?0+$/, "")}%`;
    }

    function formatSignedCurrency(value, withCents = false, suffix = "") {
        const sign = value > 0 ? "+" : value < 0 ? "-" : "";
        return `${sign}${formatCurrency(Math.abs(value), withCents)}${suffix}`;
    }

    function getPMIRate(ltvPercent) {
        if (ltvPercent <= 80) return 0;
        if (ltvPercent > 95) return (0.65 / 100) / 12;
        if (ltvPercent > 90) return (0.50 / 100) / 12;
        if (ltvPercent > 85) return (0.35 / 100) / 12;
        return (0.20 / 100) / 12;
    }

    function formatAxisCurrency(value) {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`;
        }

        if (value >= 1000) {
            return `$${Math.round(value / 1000)}k`;
        }

        return `$${Math.round(value)}`;
    }

    function calculateMonthlyPayment(principal, annualRate, totalMonths) {
        if (annualRate <= 0) {
            return principal / totalMonths;
        }

        const monthlyRate = annualRate / 12;
        const factor = Math.pow(1 + monthlyRate, totalMonths);
        return principal * ((monthlyRate * factor) / (factor - 1));
    }

    function buildAmortizationSeries(principal, annualRate, totalMonths, monthsToTrack) {
        const monthlyPayment = calculateMonthlyPayment(principal, annualRate, totalMonths);
        const monthlyRate = annualRate / 12;
        let remainingBalance = principal;
        let cumulativePrincipal = 0;
        let cumulativeInterest = 0;
        const series = [{ month: 0, principal: 0, interest: 0, payment: 0, balance: principal }];

        for (let month = 1; month <= monthsToTrack; month += 1) {
            const interestPaid = annualRate > 0 ? remainingBalance * monthlyRate : 0;
            const principalPaid = Math.min(monthlyPayment - interestPaid, remainingBalance);

            remainingBalance = Math.max(0, remainingBalance - principalPaid);
            cumulativePrincipal += principalPaid;
            cumulativeInterest += interestPaid;

            series.push({
                month,
                principal: cumulativePrincipal,
                interest: cumulativeInterest,
                payment: cumulativePrincipal + cumulativeInterest,
                balance: remainingBalance
            });
        }

        return {
            monthlyPayment,
            series
        };
    }

    function buildLinearSeries(totalValue, months) {
        return Array.from({ length: months + 1 }, (_, month) => ({
            month,
            value: totalValue * (month / months)
        }));
    }

    function buildEscalatingCumulativeSeries(baseMonthly, annualGrowthRate, months) {
        let cumulative = 0;
        const series = [{ month: 0, value: 0, monthly: 0 }];

        for (let month = 1; month <= months; month += 1) {
            const yearIndex = Math.floor((month - 1) / 12);
            const monthlyValue = baseMonthly * Math.pow(1 + annualGrowthRate, yearIndex);
            cumulative += monthlyValue;
            series.push({
                month,
                value: cumulative,
                monthly: monthlyValue
            });
        }

        return series;
    }

    function buildInvestedSavingsSeries(monthlyContributions, annualReturnRate) {
        const monthlyReturnRate = Math.pow(1 + annualReturnRate, 1 / 12) - 1;
        let cumulative = 0;
        const series = [{ month: 0, value: 0, contribution: 0 }];

        for (let month = 1; month < monthlyContributions.length; month += 1) {
            cumulative = (cumulative * (1 + monthlyReturnRate)) + monthlyContributions[month];
            series.push({
                month,
                value: cumulative,
                contribution: monthlyContributions[month]
            });
        }

        return {
            monthlyReturnRate,
            series
        };
    }

    function getNiceChartMax(values) {
        const rawMax = Math.max(...values, 1);
        const magnitude = 10 ** Math.floor(Math.log10(rawMax));
        const scaled = rawMax / magnitude;

        if (scaled <= 2) {
            return 2 * magnitude;
        }

        if (scaled <= 5) {
            return 5 * magnitude;
        }

        return 10 * magnitude;
    }

    function buildWealthBreakdownRow(item, maxValue) {
        const width = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

        return [
            '<div class="wealth-breakdown-row">',
            '  <div class="wealth-breakdown-top">',
            `    <span class="wealth-breakdown-label">${item.label}</span>`,
            `    <strong class="wealth-breakdown-value">${item.displayValue || formatCurrency(item.value, item.withCents)}</strong>`,
            "  </div>",
            '  <div class="wealth-breakdown-track">',
            `    <span class="wealth-breakdown-fill ${item.fillClass}" style="width:${width.toFixed(2)}%"></span>`,
            "  </div>",
            item.note ? `  <div class="wealth-breakdown-note">${item.note}</div>` : "",
            "</div>"
        ].join("");
    }

    function applySignedRowStyle(rowNode, valueNode, value) {
        if (!rowNode || !valueNode) {
            return;
        }

        rowNode.classList.remove("wealth-stat-row-positive", "wealth-stat-row-negative");
        valueNode.classList.remove("wealth-value-positive", "wealth-value-negative");

        if (value > 0) {
            rowNode.classList.add("wealth-stat-row-positive");
            valueNode.classList.add("wealth-value-positive");
        } else if (value < 0) {
            rowNode.classList.add("wealth-stat-row-negative");
            valueNode.classList.add("wealth-value-negative");
        }
    }

    function formatPaymentPerspective(value) {
        if (value > 0) {
            return `Saved ${formatCurrency(value, true)}/mo`;
        }

        if (value < 0) {
            return `Spent ${formatCurrency(Math.abs(value), true)}/mo more`;
        }

        return "About even";
    }

    function formatTotalPerspective(value) {
        if (value > 0) {
            return `Spent ${formatCurrency(value)} less`;
        }

        if (value < 0) {
            return `Spent ${formatCurrency(Math.abs(value))} more`;
        }

        return "About even";
    }

    function formatWealthPerspective(value) {
        if (value > 0) {
            return `Built ${formatCurrency(value)} more`;
        }

        if (value < 0) {
            return `Built ${formatCurrency(Math.abs(value))} less`;
        }

        return "About even";
    }

    function formatNetPerspective(value) {
        if (value > 0) {
            return `Finished ${formatCurrency(value)} ahead`;
        }

        if (value < 0) {
            return `Finished ${formatCurrency(Math.abs(value))} behind`;
        }

        return "Finished even";
    }

    function formatPreviewStartingEdge(value) {
        if (value > 0) {
            return `Renter started about ${formatCurrency(value, true)}/mo lower`;
        }

        if (value < 0) {
            return `Buyer started about ${formatCurrency(Math.abs(value), true)}/mo lower`;
        }

        return "They started about even";
    }

    function formatPreviewYearFiveEdge(value) {
        if (value < 0) {
            return `Buyer was ahead about ${formatCurrency(Math.abs(value), true)}/mo`;
        }

        if (value > 0) {
            return `Renter stayed about ${formatCurrency(value, true)}/mo lower`;
        }

        return "They were about even by year 5";
    }

    function syncWealthComparisonLayout() {
        if (!wealthSection) {
            return;
        }

        const comparisonGrid = wealthSection.querySelector(".wealth-comparison-grid");

        if (!comparisonGrid) {
            return;
        }

        const comparisonCards = Array.from(comparisonGrid.querySelectorAll(".wealth-card"));

        if (!comparisonCards.length) {
            return;
        }

        const comparisonHeadings = comparisonCards
            .map((card) => card.querySelector("h3"))
            .filter(Boolean);
        const comparisonRows = comparisonCards.map((card) =>
            Array.from(card.querySelectorAll(".wealth-stat-stack > .wealth-stat-row"))
        );

        comparisonHeadings.forEach((heading) => {
            heading.style.minHeight = "";
        });

        comparisonRows.flat().forEach((row) => {
            row.style.minHeight = "";
        });

        if (window.innerWidth <= 980) {
            return;
        }

        const maxHeadingHeight = Math.max(...comparisonHeadings.map((heading) => heading.offsetHeight), 0);
        comparisonHeadings.forEach((heading) => {
            heading.style.minHeight = `${maxHeadingHeight}px`;
        });

        const maxRowCount = Math.max(...comparisonRows.map((rows) => rows.length), 0);

        for (let rowIndex = 0; rowIndex < maxRowCount; rowIndex += 1) {
            const matchingRows = comparisonRows
                .map((rows) => rows[rowIndex])
                .filter(Boolean);

            const maxRowHeight = Math.max(...matchingRows.map((row) => row.offsetHeight), 0);

            matchingRows.forEach((row) => {
                row.style.minHeight = `${maxRowHeight}px`;
            });
        }
    }

    function syncWealthMoveLayout() {
        if (!wealthSection) {
            return;
        }

        const moveGrid = wealthSection.querySelector(".wealth-move-grid");

        if (!moveGrid) {
            return;
        }

        const moveCards = Array.from(moveGrid.querySelectorAll(".wealth-move-card"));

        if (!moveCards.length) {
            return;
        }

        const moveHeadings = moveCards
            .map((card) => card.querySelector("h4"))
            .filter(Boolean);
        const moveNotes = moveCards
            .map((card) => card.querySelector("[data-wealth-next-buyer-note], [data-wealth-next-owner-note]"))
            .filter(Boolean);
        const moveRows = moveCards.map((card) =>
            Array.from(card.querySelectorAll(".wealth-move-stats > .wealth-stat-row"))
        );

        moveHeadings.forEach((heading) => {
            heading.style.minHeight = "";
        });

        moveNotes.forEach((note) => {
            note.style.minHeight = "";
        });

        moveRows.flat().forEach((row) => {
            row.style.minHeight = "";
        });

        if (window.innerWidth <= 980) {
            return;
        }

        const maxHeadingHeight = Math.max(...moveHeadings.map((heading) => heading.offsetHeight), 0);
        moveHeadings.forEach((heading) => {
            heading.style.minHeight = `${maxHeadingHeight}px`;
        });

        const maxRowCount = Math.max(...moveRows.map((rows) => rows.length), 0);

        for (let rowIndex = 0; rowIndex < maxRowCount; rowIndex += 1) {
            const matchingRows = moveRows
                .map((rows) => rows[rowIndex])
                .filter(Boolean);

            const maxRowHeight = Math.max(...matchingRows.map((row) => row.offsetHeight), 0);

            matchingRows.forEach((row) => {
                row.style.minHeight = `${maxRowHeight}px`;
            });
        }

        const maxNoteHeight = Math.max(...moveNotes.map((note) => note.offsetHeight), 0);
        moveNotes.forEach((note) => {
            note.style.minHeight = `${maxNoteHeight}px`;
        });
    }

    const rawAmortization = buildAmortizationSeries(
        RENT_VS_BUY_CONFIG.home.loanAmount,
        RENT_VS_BUY_CONFIG.home.mortgageRate2021,
        RENT_VS_BUY_CONFIG.home.loanTermMonths,
        RENT_VS_BUY_CONFIG.comparisonMonths
    );

    const rawPrincipalAtSixty = rawAmortization.series[rawAmortization.series.length - 1].principal || 1;
    const rawInterestAtSixty = rawAmortization.series[rawAmortization.series.length - 1].interest || 1;
    const principalScale = RENT_VS_BUY_CONFIG.home.principalPaidDownFiveYears / rawPrincipalAtSixty;
    const interestScale = RENT_VS_BUY_CONFIG.home.interestPaidFiveYears / rawInterestAtSixty;

    const homeownerSeries = rawAmortization.series.map((point) => ({
        month: point.month,
        principal: point.principal * principalScale,
        interest: point.interest * interestScale,
        payment: (point.principal * principalScale) + (point.interest * interestScale)
    }));

    const appreciationSeries = buildLinearSeries(
        RENT_VS_BUY_CONFIG.home.appreciationFiveYears,
        RENT_VS_BUY_CONFIG.comparisonMonths
    );

    const homeownerLtvPercent = (RENT_VS_BUY_CONFIG.home.loanAmount / RENT_VS_BUY_CONFIG.home.value2021) * 100;
    const homeownerMonthlyTaxes = (RENT_VS_BUY_CONFIG.home.value2021 * RENT_VS_BUY_CONFIG.home.propertyTaxRateAnnual) / 12;
    const homeownerMonthlyInsurance = (RENT_VS_BUY_CONFIG.home.value2021 * RENT_VS_BUY_CONFIG.home.homeownersInsuranceRateAnnual) / 12;
    const homeownerPmiMonthlyRate = getPMIRate(homeownerLtvPercent);
    const homeownerMonthlyPmi = RENT_VS_BUY_CONFIG.home.loanAmount * homeownerPmiMonthlyRate;
    const homeownerMonthlyCarryCosts = homeownerMonthlyTaxes + homeownerMonthlyInsurance + homeownerMonthlyPmi;
    const homeownerTaxesSeries = buildEscalatingCumulativeSeries(
        homeownerMonthlyTaxes,
        RENT_VS_BUY_CONFIG.home.propertyTaxGrowthRateAnnual,
        RENT_VS_BUY_CONFIG.comparisonMonths
    );
    const homeownerInsuranceSeries = buildEscalatingCumulativeSeries(
        homeownerMonthlyInsurance,
        RENT_VS_BUY_CONFIG.home.homeownersInsuranceGrowthRateAnnual,
        RENT_VS_BUY_CONFIG.comparisonMonths
    );
    const homeownerPmiSeries = buildEscalatingCumulativeSeries(
        homeownerMonthlyPmi,
        0,
        RENT_VS_BUY_CONFIG.comparisonMonths
    );
    const rentPaidSeries = buildEscalatingCumulativeSeries(
        RENT_VS_BUY_CONFIG.rent.monthly2021,
        RENT_VS_BUY_CONFIG.rent.annualGrowthRate,
        RENT_VS_BUY_CONFIG.comparisonMonths
    );
    const rentFiveYearModeledTotal = rentPaidSeries[rentPaidSeries.length - 1].value;
    const renterEndingMonthlyHousingCost = rentPaidSeries[rentPaidSeries.length - 1].monthly;
    const homeownerFiveYearTaxes = homeownerTaxesSeries[homeownerTaxesSeries.length - 1].value;
    const homeownerFiveYearInsurance = homeownerInsuranceSeries[homeownerInsuranceSeries.length - 1].value;
    const homeownerFiveYearPmi = homeownerPmiSeries[homeownerPmiSeries.length - 1].value;
    const homeownerTotalHousingPaidFiveYears = RENT_VS_BUY_CONFIG.home.principalInterestPaidFiveYears + homeownerFiveYearTaxes + homeownerFiveYearInsurance + homeownerFiveYearPmi;
    const homeownerNetAfterHousingPaid = RENT_VS_BUY_CONFIG.home.totalWealthGainedFiveYears - homeownerTotalHousingPaidFiveYears;
    const homeownerEndingMonthlyTaxes = homeownerTaxesSeries[homeownerTaxesSeries.length - 1].monthly;
    const homeownerEndingMonthlyInsurance = homeownerInsuranceSeries[homeownerInsuranceSeries.length - 1].monthly;
    const homeownerEndingMonthlyCarryCosts = homeownerEndingMonthlyTaxes + homeownerEndingMonthlyInsurance + homeownerMonthlyPmi;
    const homeownerEndingMonthlyHousingCost = RENT_VS_BUY_CONFIG.home.monthlyPrincipalInterest + homeownerEndingMonthlyCarryCosts;
    const homeownerCarryIncrease = homeownerEndingMonthlyCarryCosts - homeownerMonthlyCarryCosts;
    const homeownerPaidSeries = homeownerSeries.map((point, index) => ({
        month: point.month,
        value: point.payment + homeownerTaxesSeries[index].value + homeownerInsuranceSeries[index].value + homeownerPmiSeries[index].value
    }));
    const homeownerMonthlyHousingSeries = homeownerTaxesSeries.map((point, index) => ({
        month: point.month,
        monthly: index === 0 ? 0 : RENT_VS_BUY_CONFIG.home.monthlyPrincipalInterest + homeownerTaxesSeries[index].monthly + homeownerInsuranceSeries[index].monthly + homeownerPmiSeries[index].monthly
    }));
    const homeownerBalanceSeries = homeownerSeries.map((point) => ({
        month: point.month,
        value: Math.max(0, RENT_VS_BUY_CONFIG.home.loanAmount - point.principal)
    }));
    const purchasePriceSeries = Array.from({ length: RENT_VS_BUY_CONFIG.comparisonMonths + 1 }, (_, month) => ({
        month,
        value: RENT_VS_BUY_CONFIG.home.value2021
    }));
    const estimatedValueSeries = appreciationSeries.map((point) => ({
        month: point.month,
        value: RENT_VS_BUY_CONFIG.home.value2021 + point.value
    }));
    const renterSavingsContributionSeries = rentPaidSeries.map((point, index) => {
        if (index === 0) {
            return 0;
        }

        return Math.max(homeownerMonthlyHousingSeries[index].monthly - point.monthly, 0);
    });
    const renterInvestmentSeries = buildInvestedSavingsSeries(
        renterSavingsContributionSeries,
        RENT_VS_BUY_CONFIG.rent.stockMarketAnnualReturn
    );
    const homeownerStartingMonthlyHousingCost = RENT_VS_BUY_CONFIG.home.monthlyPrincipalInterest + homeownerMonthlyCarryCosts;
    const paymentDifference2021 = homeownerStartingMonthlyHousingCost - RENT_VS_BUY_CONFIG.rent.monthly2021;
    const paymentDifference2026 = homeownerEndingMonthlyHousingCost - renterEndingMonthlyHousingCost;
    const totalPaidDifference = homeownerTotalHousingPaidFiveYears - rentFiveYearModeledTotal;
    const renterWealthBuiltFiveYears = renterInvestmentSeries.series[renterInvestmentSeries.series.length - 1].value;
    const nextPurchaseBuyerShortfall = Math.min(
        0,
        RENT_VS_BUY_CONFIG.nextPurchase.buyerToday.riHousingAssistance - RENT_VS_BUY_CONFIG.nextPurchase.buyerToday.cashToClose
    );
    const nextPurchaseBuyerOutOfPocket = Math.max(
        0,
        RENT_VS_BUY_CONFIG.nextPurchase.buyerToday.cashToClose - RENT_VS_BUY_CONFIG.nextPurchase.buyerToday.riHousingAssistance
    );
    const nextPurchaseOwnerLeftAfterClose = RENT_VS_BUY_CONFIG.nextPurchase.ownerToday.saleProceedsAvailable - RENT_VS_BUY_CONFIG.nextPurchase.ownerToday.cashToClose;
    const nextPurchaseMonthlyGap = RENT_VS_BUY_CONFIG.nextPurchase.buyerToday.monthlyMortgage - RENT_VS_BUY_CONFIG.nextPurchase.ownerToday.monthlyMortgage;
    const nextPurchaseBuyerVsPriorGap = RENT_VS_BUY_CONFIG.nextPurchase.buyerToday.monthlyMortgage - renterEndingMonthlyHousingCost;
    const nextPurchaseOwnerVsPriorGap = RENT_VS_BUY_CONFIG.nextPurchase.ownerToday.monthlyMortgage - homeownerEndingMonthlyHousingCost;

    function renderWealthPreview() {
        if (!wealthPreviewSection) {
            return;
        }

        if (wealthPreviewNodes.rentStart) {
            wealthPreviewNodes.rentStart.textContent = `${formatCurrency(RENT_VS_BUY_CONFIG.rent.monthly2021, true)}/mo`;
        }

        if (wealthPreviewNodes.ownerStart) {
            wealthPreviewNodes.ownerStart.textContent = `${formatCurrency(homeownerStartingMonthlyHousingCost, true)}/mo`;
        }

        if (wealthPreviewNodes.diff2021) {
            wealthPreviewNodes.diff2021.textContent = formatPreviewStartingEdge(paymentDifference2021);
        }

        if (wealthPreviewNodes.diff2026) {
            wealthPreviewNodes.diff2026.textContent = formatPreviewYearFiveEdge(paymentDifference2026);
        }
    }

    function renderWealthChart(seriesCollection) {
        if (!wealthChartNode) {
            return;
        }

        const chartWidth = 760;
        const chartHeight = 320;
        const padding = { top: 14, right: 14, bottom: 34, left: 60 };
        const innerWidth = chartWidth - padding.left - padding.right;
        const innerHeight = chartHeight - padding.top - padding.bottom;
        const months = RENT_VS_BUY_CONFIG.comparisonMonths;
        const chartMax = getNiceChartMax(seriesCollection.flatMap((series) => series.values));
        const currentMonth = clampValue(wealthState.hoveredMonth, 0, months);

        const xScale = (month) => padding.left + ((month / months) * innerWidth);
        const yScale = (value) => padding.top + innerHeight - ((value / chartMax) * innerHeight);
        const buildPath = (values) => values.map((value, month) => `${month === 0 ? "M" : "L"} ${xScale(month).toFixed(2)} ${yScale(value).toFixed(2)}`).join(" ");

        const yTicks = 4;
        const yTickValues = Array.from({ length: yTicks + 1 }, (_, index) => chartMax * (index / yTicks));
        const xTickValues = [0, 12, 24, 36, 48, 60];

        const gridMarkup = yTickValues.map((value) => {
            const y = yScale(value);

            return [
                `<line class="wealth-chart-grid-line" x1="${padding.left}" y1="${y}" x2="${chartWidth - padding.right}" y2="${y}"></line>`,
                `<text class="wealth-chart-axis-label" x="${padding.left - 10}" y="${y + 4}" text-anchor="end">${formatAxisCurrency(value)}</text>`
            ].join("");
        }).join("");

        const xAxisMarkup = xTickValues.map((month) => {
            const x = xScale(month);
            const label = month === 0 ? "Start" : `${month} mo`;

            return `<text class="wealth-chart-tick-label" x="${x}" y="${chartHeight - 12}" text-anchor="middle">${label}</text>`;
        }).join("");

        const currentPoints = seriesCollection.map((series) => {
            const currentValue = series.values[currentMonth];

            return {
                series,
                value: currentValue,
                x: xScale(currentMonth),
                y: yScale(currentValue),
                label: formatCurrency(currentValue)
            };
        });

        const pointMarkup = currentPoints.map((point) =>
            `<circle class="wealth-chart-focus-point" cx="${point.x}" cy="${point.y}" r="6" fill="${point.series.pointColor}"></circle>`
        ).join("");

        const labelDirection = currentMonth >= (months * 0.72) ? "left" : "right";
        const minLabelGap = 30;
        const labelHeight = 24;
        const minLabelY = padding.top + 14;
        const maxLabelY = padding.top + innerHeight - 14;
        const positionedPoints = currentPoints
            .slice()
            .sort((a, b) => a.y - b.y)
            .map((point) => ({ ...point }));

        let previousLabelY = minLabelY - minLabelGap;
        positionedPoints.forEach((point) => {
            point.labelY = Math.max(point.y, previousLabelY + minLabelGap, minLabelY);
            previousLabelY = point.labelY;
        });

        if (positionedPoints.length) {
            const overflow = positionedPoints[positionedPoints.length - 1].labelY - maxLabelY;

            if (overflow > 0) {
                positionedPoints.forEach((point) => {
                    point.labelY -= overflow;
                });
            }
        }

        const pointPositionMap = new Map(positionedPoints.map((point) => [point.series, point]));
        const focusLabelMarkup = seriesCollection.map((series) => {
            const point = pointPositionMap.get(series);
            const textWidth = Math.max(58, point.label.length * 7.2);
            const boxWidth = textWidth + 18;
            const rectXBase = labelDirection === "right" ? point.x + 14 : point.x - 14 - boxWidth;
            const rectX = clampValue(rectXBase, padding.left + 4, chartWidth - padding.right - boxWidth - 4);
            const rectY = point.labelY - (labelHeight / 2);
            const connectorX = labelDirection === "right" ? rectX : rectX + boxWidth;
            const textAnchor = labelDirection === "right" ? "start" : "end";
            const textX = labelDirection === "right" ? rectX + 9 : rectX + boxWidth - 9;

            return [
                '<g class="wealth-chart-focus-label" aria-hidden="true">',
                `  <line class="wealth-chart-focus-connector" x1="${point.x}" y1="${point.y}" x2="${connectorX}" y2="${point.labelY}" stroke="${series.pointColor}"></line>`,
                `  <rect class="wealth-chart-focus-label-bg" x="${rectX}" y="${rectY}" width="${boxWidth}" height="${labelHeight}" rx="12" ry="12" stroke="${series.pointColor}"></rect>`,
                `  <text class="wealth-chart-focus-label-text" x="${textX}" y="${point.labelY + 0.5}" text-anchor="${textAnchor}" fill="${series.pointColor}">${point.label}</text>`,
                "</g>"
            ].join("");
        }).join("");

        const lineMarkup = seriesCollection.map((series) =>
            `<path class="wealth-chart-line ${series.lineClass}" d="${buildPath(series.values)}"></path>`
        ).join("");

        const guideX = xScale(currentMonth);

        wealthChartNode.innerHTML = [
            `<rect x="0" y="0" width="${chartWidth}" height="${chartHeight}" fill="transparent"></rect>`,
            gridMarkup,
            `<line class="wealth-chart-axis-line" x1="${padding.left}" y1="${padding.top + innerHeight}" x2="${chartWidth - padding.right}" y2="${padding.top + innerHeight}"></line>`,
            `<line class="wealth-chart-guide" x1="${guideX}" y1="${padding.top}" x2="${guideX}" y2="${padding.top + innerHeight}"></line>`,
            lineMarkup,
            focusLabelMarkup,
            pointMarkup,
            xAxisMarkup
        ].join("");

        if (wealthChartReadout) {
            const readoutLines = seriesCollection.map((series) => `${series.readoutLabel}: ${formatCurrency(series.values[currentMonth])}`);

            wealthChartReadout.innerHTML = [
                `<strong>Month ${currentMonth} of ${months}</strong>`,
                `<span>${readoutLines.join("<br>")}</span>`
            ].join("");
        }
    }

    function renderWealthSection() {
        const renterNetAfterHousingPaid = renterWealthBuiltFiveYears - rentFiveYearModeledTotal;
        const renterPerspectivePayment2021 = paymentDifference2021;
        const renterPerspectivePayment2026 = paymentDifference2026;
        const renterPerspectiveTotal = totalPaidDifference;
        const renterPerspectiveWealth = renterWealthBuiltFiveYears - RENT_VS_BUY_CONFIG.home.totalWealthGainedFiveYears;
        const renterPerspectiveNet = renterNetAfterHousingPaid - homeownerNetAfterHousingPaid;

        if (wealthValueNodes.rent2021) {
            wealthValueNodes.rent2021.textContent = `${formatCurrency(RENT_VS_BUY_CONFIG.rent.monthly2021)}/mo`;
        }

        if (wealthValueNodes.rentCurrent) {
            wealthValueNodes.rentCurrent.textContent = `${formatCurrency(RENT_VS_BUY_CONFIG.rent.monthlyCurrent)}/mo`;
        }

        if (wealthValueNodes.home2021) {
            wealthValueNodes.home2021.textContent = formatCurrency(RENT_VS_BUY_CONFIG.home.value2021);
        }

        if (wealthValueNodes.homeCurrent) {
            wealthValueNodes.homeCurrent.textContent = formatCurrency(RENT_VS_BUY_CONFIG.home.valueCurrent);
        }

        if (wealthValueNodes.rate2021) {
            wealthValueNodes.rate2021.textContent = formatRatePercent(RENT_VS_BUY_CONFIG.home.mortgageRate2021);
        }

        if (wealthValueNodes.rateCurrent) {
            wealthValueNodes.rateCurrent.textContent = formatPercent(RENT_VS_BUY_CONFIG.home.mortgageRateCurrent);
        }

        if (wealthValueNodes.taxRate) {
            wealthValueNodes.taxRate.textContent = formatPercent(RENT_VS_BUY_CONFIG.home.propertyTaxRateAnnual);
        }

        if (wealthValueNodes.taxGrowth) {
            wealthValueNodes.taxGrowth.textContent = formatPercent(RENT_VS_BUY_CONFIG.home.propertyTaxGrowthRateAnnual);
        }

        if (wealthValueNodes.insuranceRate) {
            wealthValueNodes.insuranceRate.textContent = formatPercent(RENT_VS_BUY_CONFIG.home.homeownersInsuranceRateAnnual);
        }

        if (wealthValueNodes.insuranceGrowth) {
            wealthValueNodes.insuranceGrowth.textContent = formatPercent(RENT_VS_BUY_CONFIG.home.homeownersInsuranceGrowthRateAnnual);
        }

        if (wealthValueNodes.pmiRate) {
            wealthValueNodes.pmiRate.textContent = formatPercent(homeownerPmiMonthlyRate * 12);
        }

        if (wealthValueNodes.rentGrowth) {
            wealthValueNodes.rentGrowth.textContent = formatPercent(RENT_VS_BUY_CONFIG.rent.annualGrowthRate);
        }

        if (wealthValueNodes.stockReturn) {
            wealthValueNodes.stockReturn.textContent = formatPercent(RENT_VS_BUY_CONFIG.rent.stockMarketAnnualReturn);
        }

        if (wealthValueNodes.rentTotal) {
            wealthValueNodes.rentTotal.textContent = formatCurrency(rentFiveYearModeledTotal);
        }

        if (wealthValueNodes.rentMonthlyStart) {
            wealthValueNodes.rentMonthlyStart.textContent = formatCurrency(RENT_VS_BUY_CONFIG.rent.monthly2021, true);
        }

        if (wealthValueNodes.rentMonthlyEnd) {
            wealthValueNodes.rentMonthlyEnd.textContent = formatCurrency(renterEndingMonthlyHousingCost, true);
        }

        if (wealthValueNodes.rentMidpoint) {
            wealthValueNodes.rentMidpoint.textContent = formatCurrency(RENT_VS_BUY_CONFIG.rent.fiveYearBaseTotal);
        }

        if (wealthValueNodes.renterWealth) {
            wealthValueNodes.renterWealth.textContent = formatCurrency(renterWealthBuiltFiveYears);
        }

        if (wealthValueNodes.renterNet) {
            wealthValueNodes.renterNet.textContent = formatCurrency(renterNetAfterHousingPaid);
        }

        applySignedRowStyle(wealthValueNodes.renterNetRow, wealthValueNodes.renterNet, renterNetAfterHousingPaid);

        if (wealthValueNodes.renterNote) {
            const savingsWindowMonths = renterSavingsContributionSeries.filter((value) => value > 0).length;
            wealthValueNodes.renterNote.textContent = `In this example, average rent rose from about ${formatCurrency(RENT_VS_BUY_CONFIG.rent.monthly2021, true)}/mo to about ${formatCurrency(renterEndingMonthlyHousingCost, true)}/mo over five years. Since rent only sat meaningfully below the buyer's payment for about ${savingsWindowMonths} months, the renter wealth line stays fairly modest even with a ${formatPercent(RENT_VS_BUY_CONFIG.rent.stockMarketAnnualReturn)} annual stock-market assumption.`;
        }

        if (wealthValueNodes.diff2021) {
            wealthValueNodes.diff2021.textContent = formatPaymentPerspective(renterPerspectivePayment2021);
        }

        applySignedRowStyle(wealthValueNodes.diff2021Row, wealthValueNodes.diff2021, renterPerspectivePayment2021);

        if (wealthValueNodes.diff2026) {
            wealthValueNodes.diff2026.textContent = formatPaymentPerspective(renterPerspectivePayment2026);
        }

        applySignedRowStyle(wealthValueNodes.diff2026Row, wealthValueNodes.diff2026, renterPerspectivePayment2026);

        if (wealthValueNodes.diffTotal) {
            wealthValueNodes.diffTotal.textContent = formatTotalPerspective(renterPerspectiveTotal);
        }

        applySignedRowStyle(wealthValueNodes.diffTotalRow, wealthValueNodes.diffTotal, renterPerspectiveTotal);

        if (wealthValueNodes.diffWealth) {
            wealthValueNodes.diffWealth.textContent = formatWealthPerspective(renterPerspectiveWealth);
        }

        applySignedRowStyle(wealthValueNodes.diffWealthRow, wealthValueNodes.diffWealth, renterPerspectiveWealth);

        if (wealthValueNodes.diffNet) {
            wealthValueNodes.diffNet.textContent = formatNetPerspective(renterPerspectiveNet);
        }

        applySignedRowStyle(wealthValueNodes.diffNetRow, wealthValueNodes.diffNet, renterPerspectiveNet);

        if (wealthValueNodes.ownerMonthly) {
            wealthValueNodes.ownerMonthly.textContent = formatCurrency(RENT_VS_BUY_CONFIG.home.monthlyPrincipalInterest, true);
        }

        if (wealthValueNodes.ownerMonthlyTotal) {
            wealthValueNodes.ownerMonthlyTotal.textContent = formatCurrency(RENT_VS_BUY_CONFIG.home.monthlyPrincipalInterest + homeownerMonthlyCarryCosts, true);
        }

        if (wealthValueNodes.ownerCarry) {
            wealthValueNodes.ownerCarry.textContent = formatCurrency(homeownerMonthlyCarryCosts, true);
        }

        if (wealthValueNodes.ownerCarryEnd) {
            wealthValueNodes.ownerCarryEnd.textContent = formatCurrency(homeownerEndingMonthlyCarryCosts, true);
        }

        if (wealthValueNodes.ownerMonthlyEnd) {
            wealthValueNodes.ownerMonthlyEnd.textContent = formatCurrency(homeownerEndingMonthlyHousingCost, true);
        }

        if (wealthValueNodes.ownerCarryNote) {
            wealthValueNodes.ownerCarryNote.textContent = `In this example, taxes, insurance, and PMI rose from about ${formatCurrency(homeownerMonthlyCarryCosts, true)}/mo to about ${formatCurrency(homeownerEndingMonthlyCarryCosts, true)}/mo by year 5, but principal paydown and appreciation may still have built about ${formatCurrency(RENT_VS_BUY_CONFIG.home.totalWealthGainedFiveYears)} in wealth along the way.`;
        }

        if (wealthValueNodes.ownerPaid) {
            wealthValueNodes.ownerPaid.textContent = formatCurrency(homeownerTotalHousingPaidFiveYears);
        }

        if (wealthValueNodes.ownerPrincipal) {
            wealthValueNodes.ownerPrincipal.textContent = formatCurrency(RENT_VS_BUY_CONFIG.home.principalPaidDownFiveYears);
        }

        if (wealthValueNodes.ownerAppreciation) {
            wealthValueNodes.ownerAppreciation.textContent = formatCurrency(RENT_VS_BUY_CONFIG.home.appreciationFiveYears);
        }

        if (wealthValueNodes.ownerWealth) {
            wealthValueNodes.ownerWealth.textContent = formatCurrency(RENT_VS_BUY_CONFIG.home.totalWealthGainedFiveYears);
        }

        applySignedRowStyle(wealthValueNodes.ownerWealthRow, wealthValueNodes.ownerWealth, RENT_VS_BUY_CONFIG.home.totalWealthGainedFiveYears);

        if (wealthValueNodes.ownerNet) {
            wealthValueNodes.ownerNet.textContent = formatCurrency(homeownerNetAfterHousingPaid);
        }

        if (wealthValueNodes.nextBuyerMonthly) {
            wealthValueNodes.nextBuyerMonthly.textContent = `${formatCurrency(RENT_VS_BUY_CONFIG.nextPurchase.buyerToday.monthlyMortgage)}/mo`;
        }

        if (wealthValueNodes.nextBuyerCompare) {
            wealthValueNodes.nextBuyerCompare.textContent = `${formatCurrency(Math.abs(nextPurchaseMonthlyGap), true)}/mo more`;
        }

        applySignedRowStyle(
            wealthValueNodes.nextBuyerCompareRow,
            wealthValueNodes.nextBuyerCompare,
            -Math.abs(nextPurchaseMonthlyGap)
        );

        if (wealthValueNodes.nextBuyerPrior) {
            wealthValueNodes.nextBuyerPrior.textContent = `${formatCurrency(nextPurchaseBuyerVsPriorGap, true)}/mo more`;
        }

        applySignedRowStyle(
            wealthValueNodes.nextBuyerPriorRow,
            wealthValueNodes.nextBuyerPrior,
            -Math.abs(nextPurchaseBuyerVsPriorGap)
        );

        if (wealthValueNodes.nextBuyerDown) {
            wealthValueNodes.nextBuyerDown.textContent = formatCurrency(RENT_VS_BUY_CONFIG.nextPurchase.buyerToday.downPayment);
        }

        if (wealthValueNodes.nextBuyerClosing) {
            wealthValueNodes.nextBuyerClosing.textContent = formatCurrency(RENT_VS_BUY_CONFIG.nextPurchase.buyerToday.closingCosts);
        }

        if (wealthValueNodes.nextBuyerClose) {
            wealthValueNodes.nextBuyerClose.textContent = formatCurrency(RENT_VS_BUY_CONFIG.nextPurchase.buyerToday.cashToClose);
        }

        if (wealthValueNodes.nextBuyerGap) {
            wealthValueNodes.nextBuyerGap.textContent = formatSignedCurrency(nextPurchaseBuyerShortfall);
        }

        applySignedRowStyle(
            wealthValueNodes.nextBuyerGapRow,
            wealthValueNodes.nextBuyerGap,
            nextPurchaseBuyerShortfall
        );

        if (wealthValueNodes.nextBuyerNote) {
            wealthValueNodes.nextBuyerNote.textContent = `With ${formatCurrency(RENT_VS_BUY_CONFIG.nextPurchase.buyerToday.riHousingAssistance)} in Rhode Island Housing help, this FHA buyer would still need about ${formatCurrency(nextPurchaseBuyerOutOfPocket)} out of pocket to close on a roughly $475K home.`;
        }

        if (wealthValueNodes.nextOwnerMonthly) {
            wealthValueNodes.nextOwnerMonthly.textContent = `${formatCurrency(RENT_VS_BUY_CONFIG.nextPurchase.ownerToday.monthlyMortgage)}/mo`;
        }

        if (wealthValueNodes.nextOwnerCompare) {
            wealthValueNodes.nextOwnerCompare.textContent = `${formatCurrency(Math.abs(nextPurchaseMonthlyGap), true)}/mo less`;
        }

        applySignedRowStyle(
            wealthValueNodes.nextOwnerCompareRow,
            wealthValueNodes.nextOwnerCompare,
            Math.abs(nextPurchaseMonthlyGap)
        );

        if (wealthValueNodes.nextOwnerPrior) {
            wealthValueNodes.nextOwnerPrior.textContent = `${formatCurrency(nextPurchaseOwnerVsPriorGap, true)}/mo more`;
        }

        applySignedRowStyle(
            wealthValueNodes.nextOwnerPriorRow,
            wealthValueNodes.nextOwnerPrior,
            -Math.abs(nextPurchaseOwnerVsPriorGap)
        );

        if (wealthValueNodes.nextOwnerDown) {
            wealthValueNodes.nextOwnerDown.textContent = formatCurrency(RENT_VS_BUY_CONFIG.nextPurchase.ownerToday.downPayment);
        }

        if (wealthValueNodes.nextOwnerClosing) {
            wealthValueNodes.nextOwnerClosing.textContent = formatCurrency(RENT_VS_BUY_CONFIG.nextPurchase.ownerToday.closingCosts);
        }

        if (wealthValueNodes.nextOwnerClose) {
            wealthValueNodes.nextOwnerClose.textContent = formatCurrency(RENT_VS_BUY_CONFIG.nextPurchase.ownerToday.cashToClose);
        }

        if (wealthValueNodes.nextOwnerLeft) {
            wealthValueNodes.nextOwnerLeft.textContent = formatSignedCurrency(nextPurchaseOwnerLeftAfterClose, true);
        }

        applySignedRowStyle(wealthValueNodes.nextOwnerLeftRow, wealthValueNodes.nextOwnerLeft, nextPurchaseOwnerLeftAfterClose);

        if (wealthValueNodes.nextOwnerNote) {
            wealthValueNodes.nextOwnerNote.textContent = `Using a ${formatCurrency(RENT_VS_BUY_CONFIG.nextPurchase.ownerToday.downPayment)} down payment and an estimated ${formatCurrency(RENT_VS_BUY_CONFIG.nextPurchase.ownerToday.pointsCost)} point-buydown cost to move the rate from 6.36% to 5.5% (modeled as about 1 point per 0.25% of rate reduction), this buyer may still have about ${formatCurrency(nextPurchaseOwnerLeftAfterClose, true)} left after closing instead of needing to bring new cash from scratch.`;
        }

        if (wealthRenterBreakdown) {
            const renterItems = [
                {
                    label: "Estimated rent payments over 5 years with 4% annual increases",
                    value: rentFiveYearModeledTotal,
                    fillClass: "wealth-breakdown-fill-rent"
                },
                {
                    label: "If rent stayed flat at the 2021 level",
                    value: RENT_VS_BUY_CONFIG.rent.fiveYearBaseTotal,
                    fillClass: "wealth-breakdown-fill-rent",
                    note: "This is a context number, not added to the base chart line."
                }
            ];

            const renterMax = Math.max(...renterItems.map((item) => item.value), 1);
            wealthRenterBreakdown.innerHTML = renterItems
                .map((item) => buildWealthBreakdownRow(item, renterMax))
                .join("");
        }

        if (wealthOwnerBreakdown) {
            const homeownerItems = [
                {
                    label: "Interest paid over 5 years",
                    value: RENT_VS_BUY_CONFIG.home.interestPaidFiveYears,
                    fillClass: "wealth-breakdown-fill-interest",
                    note: "This is the financing cost portion of the homeowner's principal-and-interest payment."
                },
                {
                    label: "Estimated RI property taxes paid over 5 years",
                    value: homeownerFiveYearTaxes,
                    fillClass: "wealth-breakdown-fill-taxes",
                    note: `Modeled using a ${formatPercent(RENT_VS_BUY_CONFIG.home.propertyTaxRateAnnual)} annual tax assumption on the 2021 home value.`
                },
                {
                    label: "Estimated homeowners insurance paid over 5 years",
                    value: homeownerFiveYearInsurance,
                    fillClass: "wealth-breakdown-fill-insurance",
                    note: `Modeled using a ${formatPercent(RENT_VS_BUY_CONFIG.home.homeownersInsuranceRateAnnual)} annual homeowners insurance assumption.`
                },
                {
                    label: "Estimated PMI paid over 5 years",
                    value: homeownerFiveYearPmi,
                    fillClass: "wealth-breakdown-fill-pmi",
                    note: `Modeled using the site's standard PMI logic at ${formatPercent(homeownerPmiMonthlyRate * 12)} for a ${homeownerLtvPercent.toFixed(1)}% loan-to-value example.`
                },
                {
                    label: "Estimated total mortgage payments over 5 years",
                    value: homeownerTotalHousingPaidFiveYears,
                    fillClass: "wealth-breakdown-fill-owner-total",
                    note: "This combines principal and interest, RI property taxes growing 3% annually, homeowners insurance growing 5% annually, and flat PMI over the 60-month example."
                },
                {
                    label: "Escrow-style monthly increase by year 5",
                    value: homeownerCarryIncrease,
                    displayValue: `${formatCurrency(homeownerMonthlyCarryCosts, true)}/mo to ${formatCurrency(homeownerEndingMonthlyCarryCosts, true)}/mo`,
                    fillClass: "wealth-breakdown-fill-owner-total",
                    note: "This shows how the monthly taxes, insurance, and PMI portion drifted upward over the five-year example."
                },
                {
                    label: "Net after mortgage payments",
                    value: homeownerNetAfterHousingPaid,
                    fillClass: "wealth-breakdown-fill-owner-net",
                    note: "This is estimated wealth gained minus the all-in housing dollars paid over the same 60-month period. It is not take-home cash and does not include selling costs."
                },
                {
                    label: "Principal paid down over 5 years",
                    value: RENT_VS_BUY_CONFIG.home.principalPaidDownFiveYears,
                    fillClass: "wealth-breakdown-fill-principal",
                    note: "This is money that reduced the loan balance and became equity."
                },
                {
                    label: "Estimated appreciation gained",
                    value: RENT_VS_BUY_CONFIG.home.appreciationFiveYears,
                    fillClass: "wealth-breakdown-fill-appreciation",
                    note: "Historical / estimated appreciation in this example. It is not guaranteed."
                }
            ];

            const homeownerMax = Math.max(...homeownerItems.map((item) => item.value), 1);
            wealthOwnerBreakdown.innerHTML = homeownerItems
                .map((item) => buildWealthBreakdownRow(item, homeownerMax))
                .join("");
        }

        const chartSeries = [
            {
                values: purchasePriceSeries.map((point) => point.value),
                lineClass: "wealth-chart-line-purchase",
                pointColor: "#111111",
                readoutLabel: "Original purchase price"
            },
            {
                values: estimatedValueSeries.map((point) => point.value),
                lineClass: "wealth-chart-line-value",
                pointColor: "#ce011f",
                readoutLabel: "Estimated value"
            },
            {
                values: homeownerBalanceSeries.map((point) => point.value),
                lineClass: "wealth-chart-line-balance",
                pointColor: "#1d4ed8",
                readoutLabel: "Mortgage balance"
            }
        ];

        renderWealthChart(chartSeries);
        syncWealthComparisonLayout();
        syncWealthMoveLayout();
    }

    if (wealthChartNode) {
        const updateHoveredMonthFromEvent = (event) => {
            const svgRect = wealthChartNode.getBoundingClientRect();
            const point = event.touches && event.touches[0] ? event.touches[0] : event;
            const relativeX = clampValue(point.clientX - svgRect.left, 0, svgRect.width);
            const month = Math.round((relativeX / svgRect.width) * RENT_VS_BUY_CONFIG.comparisonMonths);

            wealthState.hoveredMonth = clampValue(month, 0, RENT_VS_BUY_CONFIG.comparisonMonths);
            renderWealthSection();
        };

        wealthChartNode.addEventListener("pointermove", updateHoveredMonthFromEvent);
        wealthChartNode.addEventListener("pointerleave", () => {
            wealthState.hoveredMonth = RENT_VS_BUY_CONFIG.comparisonMonths;
            renderWealthSection();
        });
        wealthChartNode.addEventListener("touchmove", updateHoveredMonthFromEvent, { passive: true });
        wealthChartNode.addEventListener("touchend", () => {
            wealthState.hoveredMonth = RENT_VS_BUY_CONFIG.comparisonMonths;
            renderWealthSection();
        });
    }

    window.addEventListener("resize", () => {
        syncWealthComparisonLayout();
        syncWealthMoveLayout();
    });

    renderWealthPreview();

    if (wealthSection) {
        renderWealthSection();
    }
}
