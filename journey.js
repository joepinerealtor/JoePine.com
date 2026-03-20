const journeyData = {
    buyer: {
        eyebrow: "Buyer Process",
        title: "From the moving itch to keys in hand.",
        intro: "Start with the \"should we actually do this?\" conversation, connect with a lender, shape the search, and move through the contract milestones with a lot more confidence.",
        modeLabel: "Buyer Process",
        stages: [
            {
                slug: "moving-bug",
                label: "Feeling The Moving Itch?",
                navLabel: "Moving Itch",
                image: "./images/journey/buyer/01-pre-approved.png",
                summary: "This is the stage where a house catches your eye online, the idea of moving will not leave you alone, and you want to see if a move is actually feasible.",
                what: "We start with the real conversation: why you want to move, what kind of change you are hoping for, whether the timing makes sense, and whether it is worth turning that late-night house-scroll into an actual plan.",
                why: "Before you go deep on showings or floor plans, it helps to figure out if this is just a passing itch or the start of a move that actually makes sense for your life.",
                note: "Most moves start this way. One house online, one late-night thought, and suddenly you are mentally rearranging furniture.",
                action: {
                    label: "Try Monthly Payment Calculator",
                    target: "buyer-payment",
                    href: "/buyers/#buyer-payment",
                },
                checklist: [
                    "Think about why you want to move and what you hope the next home will solve.",
                    "Talk through timeline, budget comfort, and whether the move feels realistic right now.",
                    "Start a simple list of what is pushing you to move and what you want the next home to give you.",
                ],
            },
            {
                slug: "connect-with-a-lender",
                label: "Connect With A Lender",
                navLabel: "Lender",
                image: "./images/journey/buyer/01-pre-approved.png",
                summary: "Before we tour seriously, we get your financing lined up so your budget is based on real numbers instead of guesses.",
                what: "You connect with a lender, review your income, debts, down payment, and monthly comfort zone, and get the preapproval process moving so we know what is actually feasible.",
                why: "This is where the search gets real. It tells us what is possible, what monthly payment feels comfortable, and whether there is anything to clean up before you start falling for a house.",
                note: "The goal is not just to find your max. It is to find the monthly payment that still feels comfortable in real life.",
                actions: [
                    {
                        label: "View Lending Partners",
                        target: "buyer-lenders",
                        href: "/buyers/#buyer-lenders",
                        variant: "primary",
                    },
                    {
                        label: "Try Monthly Payment Calculator",
                        target: "buyer-payment",
                        href: "/buyers/#buyer-payment",
                    },
                ],
                checklist: [
                    "Pick a lender and start the preapproval conversation early.",
                    "Gather pay stubs, bank statements, tax documents, and anything else the lender asks for.",
                    "Use the monthly payment calculator to sanity-check what feels comfortable before you stretch too far.",
                ],
            },
            {
                slug: "pre-approved",
                label: "Pre-Approved",
                image: "./images/journey/buyer/01-pre-approved.png",
                summary: "Now you have a preapproval in hand, which means we can stop guessing and start shopping with more confidence and credibility.",
                what: "Your lender has reviewed the big pieces of your financial picture and given you a price range, which means sellers will take your offer a lot more seriously when the right house shows up.",
                why: "Preapproval turns the search from casual browsing into a real move plan. It keeps you focused on homes that fit both the approval and your actual comfort zone.",
                note: "Just because you are approved for it does not mean you have to love the payment. Comfort still matters.",
                action: {
                    label: "Try Monthly Payment Calculator",
                    target: "buyer-payment",
                    href: "/buyers/#buyer-payment",
                },
                checklist: [
                    "Keep your preapproval letter handy so it is ready when we need it.",
                    "Let Joe know if the lender gave you any conditions or timing details that matter.",
                    "Check in with your lender again if a specific home catches your eye and you want to know the likely monthly payment.",
                ],
            },
            {
                slug: "start-your-search",
                label: "Start Your Search",
                navLabel: "Search",
                image: "./images/journey/buyer/02-offer-accepted.png",
                summary: "This is where we sort through what you need, what you want, and what you know is not going to work so your search fits real life instead of just looking good online.",
                what: "We talk through location, style, floor count, bedroom and bathroom needs, commute, yard, parking, and the difference between what would be nice and what actually matters for the way you live.",
                why: "Clear criteria helps us avoid wasting time on homes that look great online but do not actually solve the reason you want to move.",
                note: "Every buyer has needs, wants, and deal-breakers. Knowing the difference makes the search faster and less chaotic.",
                action: {
                    label: "Try Monthly Payment Calculator",
                    target: "buyer-payment",
                    href: "/buyers/#buyer-payment",
                },
                checklist: [
                    "Separate your must-haves from your nice-to-haves.",
                    "Call out your deal-breakers early so we do not waste time touring the wrong homes.",
                    "Get honest about location, layout, commute, and how much compromise you are actually willing to make.",
                    "Use the monthly payment calculator to better understand how much home fits a monthly payment that feels comfortable based on your loan type and down payment, even if you are getting down payment assistance from Rhode Island or Massachusetts programs.",
                ],
            },
            {
                slug: "submitting-offers",
                label: "Submitting Offers",
                navLabel: "Offers",
                image: "./images/journey/buyer/02-offer-accepted.png",
                summary: "Once the right home shows up, we build a serious offer around price, terms, and how competitive the situation looks.",
                what: "We review comparable sales, talk through contingencies, deposits, timelines, and lender strength, then decide how aggressive or protective the offer should be based on the house and the competition around it. This is also the right time to review inspectors and closing attorneys so you are not scrambling to line people up once the offer is accepted.",
                why: "A strong offer is not just about the top number. Terms, speed, and presentation matter too, especially when multiple buyers are interested in the same home. Once you are under contract, the inspection window usually starts right away, so having your professionals in mind early makes the next step a lot smoother.",
                note: "This is where strategy matters more than adrenaline. The more prepared you are before the offer is accepted, the calmer the first contract deadlines feel.",
                actions: [
                    {
                        label: "Review Inspectors",
                        target: "buyer-inspectors",
                        href: "/buyers/#buyer-inspectors",
                        variant: "primary",
                    },
                    {
                        label: "Review Closing Attorneys",
                        target: "buyer-attorneys",
                        href: "/buyers/#buyer-attorneys",
                    },
                ],
                checklist: [
                    "Be ready to review comps and decide what the home is worth to you.",
                    "Have your preapproval and any proof of funds ready to go with the offer.",
                    "Review inspectors and closing attorneys now so you can loop the right people in quickly once the offer is accepted.",
                    "Plan on the inspection window usually being the first 10 days after acceptance, excluding weekends and federal holidays, so speed matters.",
                    "Know where you are flexible and where you want to hold your line on terms.",
                ],
            },
            {
                slug: "under-contract",
                label: "Under Contract",
                image: "./images/journey/buyer/02-offer-accepted.png",
                summary: "Your offer was accepted, and now the deal gets real fast. This stage is all about staying on schedule and protecting the contract.",
                what: "We handle the deposit, line up inspections inside the contract timeline, and start moving from home-shopping mode into contract-to-close mode.",
                why: "Without the deposit and a fast inspection plan, the deal is basically just paper. Quick action here keeps momentum and protects your position. We usually have about 10 days to perform inspections, so moving early gives you time to review the report, decide whether any follow-up inspections make sense, and move forward with more confidence.",
                note: "Exciting? Absolutely. Relaxed? Not really. This is where good calendar management wins.",
                actions: [
                    {
                        label: "View Inspectors",
                        target: "buyer-inspectors",
                        href: "/buyers/#buyer-inspectors",
                        variant: "primary",
                    },
                    {
                        label: "View Closing Attorneys",
                        target: "buyer-attorneys",
                        href: "/buyers/#buyer-attorneys",
                    },
                ],
                checklist: [
                    "Get the deposit where it needs to go as soon as possible.",
                    "Schedule your inspection as soon as possible so you have enough time to review the report and line up any follow-up inspections if needed.",
                    "Choose your closing attorney if you have not already.",
                    "Stay extra responsive while we lock in dates and deadlines.",
                ],
            },
            {
                slug: "inspections",
                label: "Inspections",
                image: "./images/journey/buyer/03-inspections.png",
                summary: "This is where the home gets inspected and you figure out whether you are moving forward cleanly or negotiating repairs, credits, or a change in strategy.",
                what: "You choose the inspections you want, attend if you can, review the findings, and decide whether to ask for repairs, a credit, or just keep the deal moving.",
                why: "Inspections are one of the biggest checkpoints in a purchase. They help you understand the home better and make sure you are comfortable with what you are buying.",
                note: "Not every inspection item is a deal-breaker. The goal is to understand what matters, what is normal, and what changes the risk for you.",
                checklist: [
                    "Decide which inspections you want to book and get them scheduled quickly inside the contract window.",
                    "Plan to attend if you can so you can hear the inspector's big-picture take in real time.",
                    "Review the report with perspective and decide what is worth addressing versus what is normal home ownership.",
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
                navLabel: "Mortgage Approval",
                image: "./images/journey/buyer/05-mortgage-commitment.png",
                summary: "Mortgage commitment is the lender's big yes, with just a short final checklist left before clear to close.",
                what: "We work through any last lender conditions, keep the file stable, and wait for the final clear-to-close approval to come through.",
                why: "This is the home-stretch milestone. At this point, closing stops feeling hypothetical and starts feeling scheduled.",
                note: "Big win. Now is not the time to poke the loan with new credit cards, furniture shopping, or mystery deposits.",
                checklist: [
                    "Do not open new credit or make major purchases.",
                    "Keep your documents and funds easy to access.",
                    "Once you receive mortgage commitment, schedule movers and utility transfers if you are planning to move on closing day.",
                    "Use the closing date in your contract as the working date for utility transfers so the home is on, accessible, and ready for a proper final walkthrough on closing day.",
                    "Stay responsive until the final clear to close comes in.",
                ],
            },
            {
                slug: "clear-to-close",
                label: "Clear To Close",
                image: "./images/journey/buyer/06-clear-to-close.png",
                summary: "Clear to close means underwriting is done, the lender is ready, and we are officially in the closing countdown.",
                what: "We confirm the closing time and location, the exact money due, and the last attorney or title details before signing day.",
                why: "There are no more big lender question marks here. Now it is about final coordination and making sure a tiny detail does not create last-minute stress.",
                note: "You are in the final stretch now. It is getting real in the best way.",
                checklist: [
                    "Confirm closing time, location, and exact amount due.",
                    "Prepare certified funds or confirm wiring instructions carefully.",
                    "Get your ID ready and decide where you will store your closing docs.",
                ],
            },
            {
                slug: "final-walkthrough",
                label: "Final Walkthrough",
                navLabel: "Walkthrough",
                image: "./images/journey/buyer/07-closing-day.png",
                summary: "Right before closing, you get one last look at the home to make sure it is in the condition you expected and everything that was supposed to stay is still there.",
                what: "This is your last chance to confirm the home looks the way it should, negotiated repairs are done if any were agreed to, and included items like appliances or fixtures are still in place before you sign.",
                why: "A clean walkthrough helps closing day stay calm. If something is off, we want to catch it before signatures and money start moving.",
                note: "This is not another inspection. It is a final condition check before closing.",
                checklist: [
                    "Check the condition of the home, major systems, and any negotiated repair items.",
                    "Make sure anything that was supposed to stay with the home is still there.",
                    "Tell Joe right away if something looks different from what the contract says or what you expected.",
                ],
            },
            {
                slug: "closing-day",
                label: "Closing Day",
                image: "./images/journey/buyer/07-closing-day.png",
                summary: "This is signing day. Documents get signed, funds move, and the deal is officially crossing the finish line.",
                what: "You head to the closing table, sign the final documents, confirm funds have been handled the right way, and wait for the recording process to finish so ownership can officially transfer.",
                why: "This is the moment all the showings, deadlines, underwriting, and signatures finally turn into an actual closing.",
                note: "Welcome home. You earned this.",
                checklist: [
                    "Bring your valid photo ID and have funds handled exactly as instructed.",
                    "Bring any final attorney or lender items you were told to have with you.",
                    "Keep your phone handy in case the attorney, lender, or Joe needs a quick answer while funds or recording are wrapping up.",
                ],
            },
            {
                slug: "closed",
                label: "Closed",
                navLabel: "Closed",
                image: "./images/journey/buyer/07-closing-day.png",
                summary: "The deed records, the transaction is closed, and the home is officially yours.",
                what: "Once recording is complete, keys get released if they have not already, you save your documents, and the move shifts from transaction mode into actually settling into the home.",
                why: "This is the moment the process is no longer pending or scheduled. It is done.",
                note: "Take a breath, save the paperwork, and enjoy the win.",
                checklist: [
                    "Save your closing documents somewhere easy to find later.",
                    "Change the locks, update your address, and start transferring the services you need.",
                    "Celebrate a little. Buying a home is a big deal.",
                ],
            },
        ],
    },
    seller: {
        eyebrow: "Seller Process",
        title: "From pricing conversation to SOLD.",
        intro: "Start with the home-value conversation, move through launch prep and contract milestones, and finish the handoff without feeling blindsided.",
        modeLabel: "Seller Process",
        stages: [
            {
                slug: "whats-your-home-worth",
                label: "What's Your Home Worth?",
                navLabel: "Home Value",
                image: "./images/journey/seller/01-listing-agreement-signed.png",
                summary: "This is where we figure out what your home is likely worth in the current market and what similar homes are actually selling for.",
                what: "I come out, evaluate the home, prepare a comparative market analysis, and talk through condition, updates, repairs, timing, and how all of that affects price and strategy.",
                why: "Before we talk marketing or launch, we need a realistic value range and a clear plan for what needs attention, what does not, and how that impacts what buyers are likely to pay.",
                note: "Value is not just about square footage. Condition, updates, competition, and buyer perception all matter.",
                checklist: [
                    "Walk through the home and point out upgrades, repairs, and anything you are unsure about.",
                    "Review comparable sales, active competition, and likely value range together.",
                    "Decide which repairs are worth making and which ones are better priced into the strategy.",
                ],
            },
            {
                slug: "listing-agreement-signed",
                label: "Listing Agreement Signed",
                navLabel: "Listing Signed",
                image: "./images/journey/seller/02-listing-is-live.png",
                summary: "Paperwork is signed, and now we can officially move into launch prep with a clear plan.",
                what: "We lock in the list price, finalize the listing details, confirm the showing approach, and get everything organized so the launch feels intentional instead of rushed.",
                why: "This is the point where strategy turns into action. Once the agreement is signed, we can start building the full listing presentation around the plan we chose.",
                note: "This is the handoff from planning into execution.",
                checklist: [
                    "Confirm list price, timeline, and launch goals.",
                    "Decide what showing schedule feels realistic for your life.",
                    "Gather any property details, updates, or documents buyers should know about.",
                ],
            },
            {
                slug: "listing-photos-and-marketing-prep",
                label: "Listing Photos + Marketing Prep",
                navLabel: "Photos + Prep",
                image: "./images/journey/seller/03-offers-in-hand.png",
                summary: "Now we get the home visually ready so it launches with the strongest possible first impression.",
                what: "We line up listing photos, video, drone, 3D tours, floor plans, and the final prep work that helps the home look sharp online and in person. This is also where we declutter and depersonalize so buyers can picture themselves in the space more easily.",
                why: "The launch only happens once. Strong visuals and clean prep help buyers stop, understand the home faster, and book showings with more confidence. It can feel a little strange to take some of the 'you' out of your home, but that usually helps it appeal to a broader pool of buyers.",
                note: "This is where marketing quality starts to matter in a very visible way.",
                checklist: [
                    "Get the home photo-ready and remove anything distracting or overly personal.",
                    "Take down most family photos and highly personal items so buyers focus on the home and imagine themselves living there.",
                    "Finish the small touch-ups or repairs we decided were worth doing.",
                    "Have the home clean, bright, and ready for photos, video, and marketing capture.",
                ],
            },
            {
                slug: "listing-is-live",
                label: "Listing Is Live",
                image: "./images/journey/seller/04-under-contract.png",
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
                navLabel: "Offers",
                image: "./images/journey/seller/05-inspections.png",
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
                image: "./images/journey/seller/06-appraisal.png",
                summary: "You picked the right offer, paperwork is signed, and now we move into inspections, attorney coordination, and timeline management.",
                what: "The buyer schedules inspections, I coordinate access, and we keep the contract calendar moving so the deal stays clean and organized.",
                why: "This is where steady communication and early context about the home can make negotiations much easier.",
                note: "Accepted offer is great. Keeping it together is the real job now.",
                action: {
                    label: "View Closing Attorneys",
                    target: "seller-attorneys",
                    href: "/sellers/#seller-attorneys",
                },
                checklist: [
                    "Send over a few inspection availability windows.",
                    "Tell Joe about any known quirks or issues in the home now.",
                    "Choose your real estate attorney if you have not already.",
                    "Your real estate attorney is typically paid at closing, so this cost is usually rolled into your closing costs and shown on the settlement statement rather than paid upfront as a retainer.",
                ],
            },
            {
                slug: "inspections",
                label: "Inspections",
                image: "./images/journey/seller/07-mortgage-commitment.png",
                summary: "This is where the buyer brings in their inspector and we find out whether the deal stays smooth or turns into a repair or credit conversation.",
                what: "The buyer schedules inspections, I coordinate access, and once the reports come back we sort through any repair requests, credits, or negotiations that need to be worked through.",
                why: "This is one of the biggest checkpoints in the deal. Clear expectations and steady communication here help keep good buyers moving forward instead of letting the deal wobble.",
                note: "Not every inspection item is a crisis. The goal is to sort out what really matters and keep perspective.",
                checklist: [
                    "Make the home accessible for the inspector, including attic, basement, electrical panel, and major systems.",
                    "Tell Joe about any known quirks, repairs, or recent improvements before the report comes back.",
                    "Be ready for the possibility of a repair request, a credit request, or a simple move-forward decision.",
                    "Start packing non-essentials so closing week feels easier.",
                ],
            },
            {
                slug: "appraisal",
                label: "Appraisal",
                image: "./images/journey/seller/08-clear-to-close.png",
                summary: "Once inspections are behind us, the next major checkpoint is the appraisal to make sure the home supports the agreed purchase price.",
                what: "The appraiser visits the property, reviews condition, features, upgrades, and comparable sales, then sends a value report back to the buyer's lender. Joe coordinates access and helps make sure the appraiser has the right context on the home.",
                why: "The bank will not lend based on the contract price alone. They need support for the value. If the appraisal supports the number, we keep moving. If it comes in short, it can create a renegotiation conversation that we need to navigate carefully.",
                note: "Think showing-ready, not perfect. This is a value check for the bank, not another open house.",
                checklist: [
                    "Keep the home reasonably tidy and make sure the appraiser can access all rooms and major systems.",
                    "Send Joe any major upgrades or improvements you want highlighted.",
                    "Start scheduling movers, storage, and your moving plan around the closing date agreed to in the contract so you are not scrambling at the last minute.",
                    "Expect the visit to be fairly quick. Joe will handle coordination and keep you posted on the next step.",
                ],
            },
            {
                slug: "mortgage-commitment",
                label: "Mortgage Commitment",
                navLabel: "Mortgage Approval",
                image: "./images/journey/seller/09-sold.png",
                summary: "Once the appraisal is behind us, mortgage commitment is usually the next major milestone if the deal is staying on track.",
                what: "The buyer's lender finishes up the loan file and issues the mortgage commitment, which is the big sign that financing is lining up the way we want before clear to close.",
                why: "This is one of the last major checkpoints before clear to close. At this point, most of the bigger risk has settled down and the final stretch becomes much more about coordination.",
                note: "Home-stretch energy. Time to get the little things handled before they become annoying.",
                checklist: [
                    "Watch for your draft settlement statement or seller proceeds figures from the attorney.",
                    "Start transferring or cancelling utilities and updating your address.",
                    "Check banks and subscriptions so nothing keeps going to the old place.",
                ],
            },
            {
                slug: "clear-to-close",
                label: "Clear To Close",
                image: "./images/journey/seller/09-sold.png",
                summary: "We are clear to close, which means the financing side is done and closing day is mostly about final coordination.",
                what: "We lock in the signing time, confirm attorney details, finish your moving plan, and make sure the home is ready for the final walk through and closing-day handoff.",
                why: "The big financing questions are over. Now it is about timing, logistics, and making sure nothing small creates stress right before closing.",
                note: "Finish line in sight. Let's keep it clean, organized, and drama-free.",
                checklist: [
                    "Confirm closing time, attorney details, and where you need to be.",
                    "Finish packing and make sure the home will be emptied or left as agreed in the contract.",
                    "Gather keys, openers, alarm info, and anything that stays with the home in one easy-to-hand-off place.",
                ],
            },
            {
                slug: "final-walk-through",
                label: "Final Walkthrough",
                navLabel: "Walkthrough",
                image: "./images/journey/seller/09-sold.png",
                summary: "Right before closing, the buyer usually does one last walk through to make sure the home is in the condition the contract calls for.",
                what: "This is the last confirmation that agreed repairs are done if any were negotiated, the home is in the expected condition, and anything that was supposed to stay with the home is still there.",
                why: "A clean final walk through helps closing day stay calm. If the home looks the way it is supposed to look, everyone can move into signing without last-minute friction.",
                note: "Think clean handoff, not perfection. We just want the home ready for the next owner the way the deal expects.",
                checklist: [
                    "Make sure the home is emptied as agreed unless something is supposed to stay.",
                    "Double-check that any negotiated repairs or credits were handled the way the contract says.",
                    "Leave keys, openers, alarm information, and anything else the buyer is supposed to receive at closing.",
                    "Leave a note for the new owners if you want to, especially if you are leaving behind smart-home tech or coded systems like thermostats, cameras, security systems, or garage doors.",
                    "Set out manuals, passwords, app details, and simple instructions for anything the next owner may need to reconnect, reset, or reprogram on day one.",
                    "Some sellers also like to leave a short neighborhood note with the kind of local details a buyer would never get from the listing, like who to know nearby, where packages usually land, or that an older neighbor may appreciate a check-in during bad winter storms.",
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

const trackerStorageKeys = {
    mode: "joeJourneyMode",
    buyerStage: "joeJourneyBuyerStage",
    sellerStage: "joeJourneySellerStage",
};

const isEmbeddedTracker = new URLSearchParams(window.location.search).has("embed");

const trackerElements = {
    eyebrow: document.querySelector("[data-tracker-eyebrow]"),
    title: document.querySelector("[data-tracker-title]"),
    intro: document.querySelector("[data-tracker-intro]"),
    progressTitle: document.querySelector("[data-tracker-progress-title]"),
    progressCopy: document.querySelector("[data-tracker-progress-copy]"),
    progressFill: document.querySelector("[data-progress-fill]"),
    rail: document.querySelector(".tracker-rail"),
    stageList: document.querySelector("[data-stage-list]"),
    copyCard: document.querySelector("[data-tracker-copy-card]"),
    stageStep: document.querySelector("[data-stage-step]"),
    stageMode: document.querySelector("[data-stage-mode]"),
    stageTitle: document.querySelector("[data-stage-title]"),
    stageSummary: document.querySelector("[data-stage-summary]"),
    stageWhat: document.querySelector("[data-stage-what]"),
    stageWhy: document.querySelector("[data-stage-why]"),
    stageChecklist: document.querySelector("[data-stage-checklist]"),
    stageNote: document.querySelector("[data-stage-note]"),
    stageActionRow: document.querySelector("[data-stage-action-row]"),
    prevButton: document.querySelector("[data-prev-stage]"),
    nextButton: document.querySelector("[data-next-stage]"),
    modeTabs: Array.from(document.querySelectorAll("[data-mode-tab]")),
};

function getJourneyConfig() {
    return journeyData[trackerState.mode];
}

function readStoredTrackerValue(key) {
    try {
        return window.localStorage.getItem(key);
    } catch (error) {
        return null;
    }
}

function writeStoredTrackerValue(key, value) {
    try {
        window.localStorage.setItem(key, String(value));
    } catch (error) {
        // Ignore storage issues and keep the tracker usable.
    }
}

function getStageStorageKey(mode) {
    return mode === "seller" ? trackerStorageKeys.sellerStage : trackerStorageKeys.buyerStage;
}

function getSavedStageIndex(mode) {
    const config = journeyData[mode];
    if (!config) {
        return 0;
    }

    const rawValue = readStoredTrackerValue(getStageStorageKey(mode));
    const parsedValue = Number.parseInt(rawValue || "", 10);

    if (Number.isNaN(parsedValue)) {
        return 0;
    }

    return Math.max(0, Math.min(parsedValue, config.stages.length - 1));
}

function persistTrackerState() {
    writeStoredTrackerValue(trackerStorageKeys.mode, trackerState.mode);
    writeStoredTrackerValue(getStageStorageKey(trackerState.mode), trackerState.stageIndex);
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
        const buttonLabel = stage.navLabel || stage.label;
        const stepNumber = String(index + 1).padStart(2, "0");
        const button = document.createElement("button");
        button.type = "button";
        button.className = "tracker-stage-button";
        button.setAttribute("role", "tab");
        button.setAttribute("aria-selected", String(index === trackerState.stageIndex));
        button.setAttribute("aria-label", stage.label);
        button.dataset.index = String(index);

        if (index < trackerState.stageIndex) {
            button.classList.add("is-complete");
        }

        if (index === trackerState.stageIndex) {
            button.classList.add("is-active");
        }

        button.innerHTML = `
            <span class="tracker-stage-marker">${stepNumber}</span>
            <span class="tracker-stage-copy">
                <span class="tracker-stage-name">${buttonLabel}</span>
                <span class="tracker-stage-index">${index === trackerState.stageIndex ? "Current step" : `Step ${index + 1}`}</span>
            </span>
        `;

        button.addEventListener("click", () => {
            trackerState.stageIndex = index;
            renderTracker();
        });

        trackerElements.stageList.appendChild(button);
    });
}

function handleStageAction(action) {
    if (!action) {
        return;
    }

    if (isEmbeddedTracker && action.target) {
        window.parent.postMessage({
            type: "joe-open-resource",
            target: action.target,
        }, "*");
        return;
    }

    if (action.href) {
        window.location.href = action.href;
        return;
    }
}

function getStageActions(stage) {
    if (Array.isArray(stage.actions) && stage.actions.length) {
        return stage.actions;
    }

    if (stage.action) {
        return [stage.action];
    }

    return [];
}

function renderStageActions(stage) {
    if (!trackerElements.stageActionRow) {
        return;
    }

    const actions = getStageActions(stage);
    trackerElements.stageActionRow.innerHTML = "";

    if (!actions.length) {
        trackerElements.stageActionRow.hidden = true;
        return;
    }

    actions.forEach((action) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "journey-button tracker-stage-action-button";
        button.textContent = action.label;
        button.addEventListener("click", () => {
            handleStageAction(action);
        });
        trackerElements.stageActionRow.appendChild(button);
    });

    trackerElements.stageActionRow.hidden = false;
}

function syncTrackerWorkspaceHeights() {
    if (!trackerElements.rail || !trackerElements.copyCard) {
        return;
    }

    const isDesktop = window.matchMedia("(min-width: 981px)").matches;

    if (!isDesktop) {
        trackerElements.rail.style.maxHeight = "";
        return;
    }

    const cardHeight = Math.max(
        trackerElements.copyCard.getBoundingClientRect().height,
        trackerElements.copyCard.offsetHeight,
        trackerElements.copyCard.clientHeight,
        trackerElements.copyCard.scrollHeight,
    );

    if (cardHeight > 120) {
        trackerElements.rail.style.maxHeight = `${Math.ceil(cardHeight)}px`;
        return;
    }

    trackerElements.rail.style.maxHeight = "";
}

function getTrackerProgressInstruction() {
    const isDesktop = window.matchMedia("(min-width: 981px)").matches;
    return isDesktop ? "Use the left rail to move at your own pace." : "Swipe the steps above to move at your own pace.";
}

function refreshTrackerResponsiveCopy() {
    const stage = getJourneyConfig().stages[trackerState.stageIndex];
    if (trackerElements.progressCopy && stage) {
        trackerElements.progressCopy.textContent = `You are in ${stage.label}. ${getTrackerProgressInstruction()}`;
    }
}

function renderTracker() {
    const config = getJourneyConfig();
    const stage = config.stages[trackerState.stageIndex];
    const stageCount = config.stages.length;
    const progressPercent = stageCount > 1
        ? ((trackerState.stageIndex + 1) / stageCount) * 100
        : 100;

    trackerElements.modeTabs.forEach((tab) => {
        const isActive = tab.dataset.modeTab === trackerState.mode;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
    });

    trackerElements.eyebrow.textContent = config.eyebrow;
    trackerElements.title.textContent = config.title;
    trackerElements.intro.textContent = config.intro;
    trackerElements.progressTitle.textContent = `Step ${trackerState.stageIndex + 1} of ${stageCount}`;
    trackerElements.progressCopy.textContent = `You are in ${stage.label}. ${getTrackerProgressInstruction()}`;

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
    renderStageActions(stage);

    trackerElements.prevButton.disabled = trackerState.stageIndex === 0;
    trackerElements.nextButton.disabled = trackerState.stageIndex === stageCount - 1;
    if (trackerElements.progressFill) {
        trackerElements.progressFill.style.width = `${progressPercent}%`;
    }

    renderStageButtons();

    if (trackerElements.copyCard) {
        trackerElements.copyCard.scrollTop = 0;
    }

    requestAnimationFrame(syncTrackerWorkspaceHeights);

    const activeButton = trackerElements.stageList.querySelector(".tracker-stage-button.is-active");
    if (activeButton) {
        activeButton.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }

    setHash(trackerState.mode);
    persistTrackerState();
}

function setMode(mode) {
    if (!journeyData[mode]) {
        return;
    }

    trackerState.mode = mode;
    trackerState.stageIndex = getSavedStageIndex(mode);
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
    const storedMode = readStoredTrackerValue(trackerStorageKeys.mode);
    const initialMode = requestedMode || (storedMode === "buyer" || storedMode === "seller" ? storedMode : trackerState.mode);

    trackerState.mode = initialMode;
    trackerState.stageIndex = getSavedStageIndex(initialMode);

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
window.addEventListener("resize", () => {
    syncTrackerWorkspaceHeights();
    refreshTrackerResponsiveCopy();
});
window.addEventListener("load", syncTrackerWorkspaceHeights);

initializeTrackerFromHash();
