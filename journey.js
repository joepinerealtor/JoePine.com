const journeyData = {
    buyer: {
        eyebrow: "Buyer Process",
        title: "From pre-approved to keys in hand.",
        intro: "Start with the money conversation, move through the contract milestones, and head into closing with a lot more confidence.",
        modeLabel: "Buyer Process",
        primaryCta: {
            label: "Open Buyer Resources",
            href: "./buyers.html#buyer-payment",
        },
        secondaryCta: {
            label: "View Buyer Lenders",
            href: "./buyers.html#buyer-lenders",
        },
        stages: [
            {
                slug: "pre-approved",
                label: "Pre-Approved",
                image: "./images/journey/buyer/01-pre-approved.png",
                summary: "You are officially pre-approved, which means we can stop guessing and start shopping with confidence.",
                what: "We dial in your towns, your real payment comfort zone, your move timeline, and the must-haves that matter most so I can set up searches that actually fit.",
                why: "Two homes at the same price can carry very different monthly payments once taxes and insurance enter the chat, so comfort matters more than sticker price.",
                note: "Never be afraid to send a house to your lender and ask what the monthly payment would actually look like.",
                checklist: [
                    "Pick your top towns and any areas you want to avoid.",
                    "Decide your comfortable monthly payment range.",
                    "Send over must-haves, deal-breakers, and ideal move timeline.",
                ],
            },
            {
                slug: "offer-accepted",
                label: "Offer Accepted",
                image: "./images/journey/buyer/02-offer-accepted.png",
                summary: "Your offer was accepted, and now the deal gets real fast. This stage is all about staying on schedule and protecting the contract.",
                what: "We handle the deposit, line up inspections inside the contract timeline, and start moving from home-shopping mode into contract-to-close mode.",
                why: "Without the deposit and a fast inspection plan, the deal is basically just paper. Quick action here keeps momentum and protects your position.",
                note: "Exciting? Absolutely. Relaxed? Not really. This is where good calendar management wins.",
                checklist: [
                    "Get the deposit where it needs to go as soon as possible.",
                    "Decide which inspections you want to schedule.",
                    "Stay extra responsive while we lock in dates and deadlines.",
                ],
            },
            {
                slug: "inspections",
                label: "Inspections",
                image: "./images/journey/buyer/03-inspections.png",
                summary: "You made it through inspections, which is a major hurdle and one of the biggest points where deals can wobble.",
                what: "Your lender keeps underwriting moving, the appraisal gets ordered if it is not already in motion, and we work through any remaining conditions so nothing sneaks up on us later.",
                why: "Getting past inspections is a strong sign the deal is holding together and we are still moving in the right direction toward closing.",
                note: "Huge step forward. Now we keep the paperwork moving and start packing a little at a time.",
                checklist: [
                    "Respond quickly to any lender or processor document requests.",
                    "Expect the appraisal fee and keep that step moving.",
                    "Start packing the easy non-essentials now, not later.",
                ],
            },
            {
                slug: "appraisal",
                label: "Appraisal",
                image: "./images/journey/buyer/04-appraisal.png",
                summary: "The appraisal is the lender's independent value check on the home, and it helps confirm the property supports the price and loan amount.",
                what: "Your lender orders a licensed third-party appraiser to review the home, compare it to recent sales, and give the bank an opinion of value. Buyers usually pay for this up front, and you typically do not need to attend.",
                why: "The lender needs to know the home is worth what you agreed to pay before they fund the loan. If the value supports the price, great. If it comes in low, we may need to renegotiate, challenge the value, or adjust the financing strategy.",
                note: "This is not about whether the home is pretty. It is about whether the value makes sense to the bank.",
                checklist: [
                    "Watch for the lender to collect the appraisal fee and officially place the order.",
                    "Stay responsive if the lender or loan team asks for anything while we wait.",
                    "Do not panic if the report takes a little time. Joe will stay on top of the timeline.",
                ],
            },
            {
                slug: "mortgage-commitment",
                label: "Mortgage Commitment",
                image: "./images/journey/buyer/05-mortgage-commitment.png",
                summary: "Mortgage commitment is the lender's big yes, with just a short final checklist left before clear to close.",
                what: "We work through any last lender conditions, keep the file stable, and wait for the final clear-to-close approval to come through.",
                why: "This is the home-stretch milestone. At this point, closing stops feeling hypothetical and starts feeling scheduled.",
                note: "Big win. Now is not the time to poke the loan with new credit cards, furniture shopping, or mystery deposits.",
                checklist: [
                    "Do not open new credit or make major purchases.",
                    "Keep your documents and funds easy to access.",
                    "Stay responsive until the final clear to close comes in.",
                ],
            },
            {
                slug: "clear-to-close",
                label: "Clear To Close",
                image: "./images/journey/buyer/06-clear-to-close.png",
                summary: "Clear to close means underwriting is done, the lender is ready, and we are officially in the closing countdown.",
                what: "We confirm the final walkthrough, the closing time and location, the exact money due, and the last attorney or title details before signing day.",
                why: "There are no more big lender question marks here. Now it is about final coordination and making sure a tiny detail does not create last-minute stress.",
                note: "You are in the final stretch now. It is getting real in the best way.",
                checklist: [
                    "Confirm closing time, location, and exact amount due.",
                    "Prepare certified funds or confirm wiring instructions carefully.",
                    "Get your ID ready and decide where you will store your closing docs.",
                ],
            },
            {
                slug: "closing-day",
                label: "Closing Day",
                image: "./images/journey/buyer/07-closing-day.png",
                summary: "Signing day turns into key day, and then the deed records and it is officially yours.",
                what: "You complete the final walkthrough, sign the documents, funds move, recording happens, and the keys officially hit your hand.",
                why: "This is the moment all the showings, deadlines, underwriting, and signatures finally turn into home.",
                note: "Welcome home. You earned this.",
                checklist: [
                    "Use the walkthrough to check condition, systems, repairs, and included items.",
                    "Bring your valid photo ID and have funds handled exactly as instructed.",
                    "After closing, save your documents, change the locks, and celebrate a little.",
                ],
            },
        ],
    },
    seller: {
        eyebrow: "Seller Process",
        title: "From signed paperwork to SOLD.",
        intro: "Start with the listing strategy, move through market activity and contract checkpoints, and finish the handoff without feeling blindsided.",
        modeLabel: "Seller Process",
        primaryCta: {
            label: "Open Seller Resources",
            href: "./sellers.html#seller-proceeds",
        },
        secondaryCta: {
            label: "See Seller Process Hub",
            href: "./sellers.html#seller-process",
        },
        stages: [
            {
                slug: "listing-agreement-signed",
                label: "Listing Agreement Signed",
                image: "./images/journey/seller/01-listing-agreement-signed.png",
                summary: "Paperwork is signed, and now the prep work starts so your launch looks sharp, smooth, and intentional.",
                what: "I get the listing details, marketing pieces, photos, and showing strategy lined up so your home hits the market strong on MLS and everywhere buyers are searching.",
                why: "A clean launch creates better first impressions, more buyer interest, and fewer avoidable hiccups once you are live.",
                note: "This is where prep turns into positioning.",
                checklist: [
                    "Get photos and listing prep on the calendar.",
                    "Decide what showing schedule feels realistic for your life.",
                    "Start a simple show-ready routine like the laundry basket method.",
                ],
            },
            {
                slug: "listing-is-live",
                label: "Listing Is Live",
                image: "./images/journey/seller/02-listing-is-live.png",
                summary: "Your home is officially live in MLS, and now buyers, agents, saves, and showing requests start rolling in.",
                what: "Your listing starts populating across Zillow, Realtor.com, Homes.com, and more while I coordinate showings, communication, and feedback.",
                why: "The first few days tell us a lot. Presentation, availability, and buyer response matter most right now.",
                note: "We are officially in the fun part now.",
                checklist: [
                    "Keep the home bright, clean, and easy to preview.",
                    "Keep a few empty laundry baskets handy for quick resets.",
                    "Tell Joe about any showing windows or restrictions that matter.",
                ],
            },
            {
                slug: "offers-in-hand",
                label: "Offers In Hand",
                image: "./images/journey/seller/03-offers-in-hand.png",
                summary: "Offers mean leverage. Now we compare the full picture instead of just chasing the loudest number.",
                what: "We review price, financing, deposit, contingencies, timelines, and lender strength so you can choose the offer with the best chance to actually close.",
                why: "The highest offer is not always the strongest offer. Terms and execution matter too.",
                note: "Not every 'best' offer is best on paper alone.",
                checklist: [
                    "Review price and terms together, not just the top number.",
                    "Consider highest and best if multiple solid offers show up.",
                    "Let Joe verify lenders before choosing a winner.",
                ],
            },
            {
                slug: "under-contract",
                label: "Under Contract",
                image: "./images/journey/seller/04-under-contract.png",
                summary: "You picked the right offer, paperwork is signed, and now we move into inspections, attorney coordination, and timeline management.",
                what: "The buyer schedules inspections, I coordinate access, and we keep the contract calendar moving so the deal stays clean and organized.",
                why: "This is where steady communication and early context about the home can make negotiations much easier.",
                note: "Accepted offer is great. Keeping it together is the real job now.",
                checklist: [
                    "Send over a few inspection availability windows.",
                    "Tell Joe about any known quirks or issues in the home now.",
                    "Choose your real estate attorney if you have not already.",
                ],
            },
            {
                slug: "inspections",
                label: "Inspections",
                image: "./images/journey/seller/05-inspections.png",
                summary: "The buyer got through inspections and is moving forward, so the next major checkpoint is the appraisal.",
                what: "I coordinate the appraiser, make sure access is smooth, and help present the home and its upgrades in the best light for the bank's review.",
                why: "This is the lender's value check, and a smooth appraisal keeps the deal moving toward the finish line.",
                note: "No need to overthink it. Think showing-ready, not perfection.",
                checklist: [
                    "Tidy up and make sure all rooms and major systems are easy to access.",
                    "Point out any upgrades or improvements Joe should highlight.",
                    "Start packing non-essentials so closing week feels easier.",
                ],
            },
            {
                slug: "appraisal",
                label: "Appraisal",
                image: "./images/journey/seller/06-appraisal.png",
                summary: "The appraisal is the buyer's lender's professional value check to make sure the home supports the agreed purchase price.",
                what: "The appraiser visits the property, reviews condition, features, upgrades, and comparable sales, then sends a value report back to the buyer's lender. Joe coordinates access and helps make sure the appraiser has the right context on the home.",
                why: "The bank will not lend based on the contract price alone. They need support for the value. If the appraisal supports the number, we keep moving. If it comes in short, it can create a renegotiation conversation that we need to navigate carefully.",
                note: "Think showing-ready, not perfect. This is a value check for the bank, not another open house.",
                checklist: [
                    "Keep the home reasonably tidy and make sure the appraiser can access all rooms and major systems.",
                    "Send Joe any major upgrades or improvements you want highlighted.",
                    "Expect the visit to be fairly quick. Joe will handle coordination and keep you posted on the next step.",
                ],
            },
            {
                slug: "mortgage-commitment",
                label: "Mortgage Commitment",
                image: "./images/journey/seller/07-mortgage-commitment.png",
                summary: "The buyer's mortgage commitment is in, which is a big green light that the deal is tracking the way we want.",
                what: "Now we wait for clear to close, line up your closing time with the attorney, and start wrapping the last operational details.",
                why: "At this point, most of the major risk has settled down and the final stretch becomes about coordination.",
                note: "Home-stretch energy. Time to get the little things handled before they become annoying.",
                checklist: [
                    "Watch for your final closing disclosure or settlement statement.",
                    "Start transferring or cancelling utilities and updating your address.",
                    "Check banks and subscriptions so nothing keeps going to the old place.",
                ],
            },
            {
                slug: "clear-to-close",
                label: "Clear To Close",
                image: "./images/journey/seller/08-clear-to-close.png",
                summary: "We are clear to close, which means the lender is done and we are basically working through the final handoff checklist.",
                what: "We finalize attorney timing, prep keys and access items, and make sure the home is ready for the new owners and a clean closing-day handoff.",
                why: "The financing question is over. Now it is all about finishing strong and making closing day easy.",
                note: "Finish line in sight. Let's keep it clean, organized, and drama-free.",
                checklist: [
                    "Leave manuals, tips, or a welcome note if you want to.",
                    "Disconnect smart devices from your personal accounts.",
                    "Gather keys, openers, alarm info, and any access instructions.",
                ],
            },
            {
                slug: "sold",
                label: "SOLD!",
                image: "./images/journey/seller/09-sold.png",
                summary: "Your home is sold, funds are released, and the whole plan officially made it across the finish line.",
                what: "The deed records, proceeds are released, and any last utility, mail, or service loose ends get tied up after the handoff.",
                why: "This is the moment all the prep, showings, negotiations, and paperwork finally pay off.",
                note: "Enjoy the moment. You earned it.",
                checklist: [
                    "Make sure all keys, openers, and access items were handed off cleanly.",
                    "Confirm utilities, forwarding address, and service transfers are handled.",
                    "Keep your final settlement statement handy and call Joe if you need anything after closing.",
                ],
            },
        ],
    },
};

const trackerState = {
    mode: "buyer",
    stageIndex: 0,
};

const trackerElements = {
    eyebrow: document.querySelector("[data-tracker-eyebrow]"),
    title: document.querySelector("[data-tracker-title]"),
    intro: document.querySelector("[data-tracker-intro]"),
    stageList: document.querySelector("[data-stage-list]"),
    progressFill: document.querySelector("[data-progress-fill]"),
    stageStep: document.querySelector("[data-stage-step]"),
    stageMode: document.querySelector("[data-stage-mode]"),
    stageTitle: document.querySelector("[data-stage-title]"),
    stageSummary: document.querySelector("[data-stage-summary]"),
    stageWhat: document.querySelector("[data-stage-what]"),
    stageWhy: document.querySelector("[data-stage-why]"),
    stageChecklist: document.querySelector("[data-stage-checklist]"),
    stageNote: document.querySelector("[data-stage-note]"),
    primaryCta: document.querySelector("[data-primary-cta]"),
    secondaryCta: document.querySelector("[data-secondary-cta]"),
    prevButton: document.querySelector("[data-prev-stage]"),
    nextButton: document.querySelector("[data-next-stage]"),
    modeTabs: Array.from(document.querySelectorAll("[data-mode-tab]")),
};

function getJourneyConfig() {
    return journeyData[trackerState.mode];
}

function setHash(mode) {
    const nextHash = `#${mode}`;
    if (window.location.hash !== nextHash) {
        history.replaceState(null, "", nextHash);
    }
}

function renderStageButtons() {
    const config = getJourneyConfig();

    trackerElements.stageList.innerHTML = "";

    config.stages.forEach((stage, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "tracker-stage-button";
        button.setAttribute("role", "tab");
        button.setAttribute("aria-selected", String(index === trackerState.stageIndex));
        button.dataset.index = String(index);

        if (index < trackerState.stageIndex) {
            button.classList.add("is-complete");
        }

        if (index === trackerState.stageIndex) {
            button.classList.add("is-active");
        }

        button.innerHTML = `
            <span class="tracker-stage-name">${stage.label}</span>
            <span class="tracker-stage-index">Step ${index + 1}</span>
        `;

        button.addEventListener("click", () => {
            trackerState.stageIndex = index;
            renderTracker();
        });

        trackerElements.stageList.appendChild(button);
    });
}

function renderTracker() {
    const config = getJourneyConfig();
    const stage = config.stages[trackerState.stageIndex];
    const stageCount = config.stages.length;
    const progressPercent = stageCount > 1
        ? (trackerState.stageIndex / (stageCount - 1)) * 100
        : 100;

    trackerElements.modeTabs.forEach((tab) => {
        const isActive = tab.dataset.modeTab === trackerState.mode;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
    });

    trackerElements.eyebrow.textContent = config.eyebrow;
    trackerElements.title.textContent = config.title;
    trackerElements.intro.textContent = config.intro;

    trackerElements.stageStep.textContent = `Step ${trackerState.stageIndex + 1} of ${stageCount}`;
    trackerElements.stageMode.textContent = config.modeLabel;
    trackerElements.stageTitle.textContent = stage.label;
    trackerElements.stageSummary.textContent = stage.summary;
    trackerElements.stageWhat.textContent = stage.what;
    trackerElements.stageWhy.textContent = stage.why;
    trackerElements.stageChecklist.innerHTML = stage.checklist
        .map((item) => `<li>${item}</li>`)
        .join("");
    trackerElements.stageNote.textContent = stage.note;

    trackerElements.primaryCta.textContent = config.primaryCta.label;
    trackerElements.primaryCta.href = config.primaryCta.href;
    trackerElements.secondaryCta.textContent = config.secondaryCta.label;
    trackerElements.secondaryCta.href = config.secondaryCta.href;

    trackerElements.prevButton.disabled = trackerState.stageIndex === 0;
    trackerElements.nextButton.disabled = trackerState.stageIndex === stageCount - 1;
    trackerElements.progressFill.style.width = `${progressPercent}%`;

    renderStageButtons();

    const activeButton = trackerElements.stageList.querySelector(".tracker-stage-button.is-active");
    if (activeButton) {
        activeButton.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }

    setHash(trackerState.mode);
}

function setMode(mode) {
    if (!journeyData[mode]) {
        return;
    }

    trackerState.mode = mode;
    trackerState.stageIndex = 0;
    renderTracker();
}

function getRequestedMode() {
    const params = new URLSearchParams(window.location.search);
    const queryValue = (params.get("mode") || params.get("embed") || "").toLowerCase();

    if (queryValue.includes("seller")) {
        return "seller";
    }

    if (queryValue.includes("buyer")) {
        return "buyer";
    }

    const hashMode = window.location.hash.replace("#", "").toLowerCase();
    if (hashMode === "buyer" || hashMode === "seller") {
        return hashMode;
    }

    return null;
}

function initializeTrackerFromHash() {
    const requestedMode = getRequestedMode();
    if (requestedMode) {
        trackerState.mode = requestedMode;
    }

    renderTracker();
}

trackerElements.modeTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        setMode(tab.dataset.modeTab);
    });
});

trackerElements.prevButton.addEventListener("click", () => {
    trackerState.stageIndex = Math.max(0, trackerState.stageIndex - 1);
    renderTracker();
});

trackerElements.nextButton.addEventListener("click", () => {
    const lastIndex = getJourneyConfig().stages.length - 1;
    trackerState.stageIndex = Math.min(lastIndex, trackerState.stageIndex + 1);
    renderTracker();
});

window.addEventListener("hashchange", initializeTrackerFromHash);

initializeTrackerFromHash();
