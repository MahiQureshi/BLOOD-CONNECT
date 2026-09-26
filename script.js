/* =========================================================
   BLOOD CONNECT
   NO LOGIN / NO SIGN-IN VERSION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initTabs();
    initSearch();
    initEmergency();
    initForms();
    initLanguage();
    initModal();
    initUI();
    loadStoredData();
});

/* =========================================================
   STATE
   ========================================================= */

const state = {
    currentPage: "home",
    selectedCamp: null,
    selectedSearchType: "blood",

    registrations:
        JSON.parse(
            localStorage.getItem("bloodConnectRegistrations")
        ) || [],

    emergencyRequests:
        JSON.parse(
            localStorage.getItem("bloodConnectEmergency")
        ) || [],

    language:
        localStorage.getItem("bloodConnectLanguage")
        || "English"
};

/* =========================================================
   HELPERS
   ========================================================= */

function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}

function generateID(prefix) {
    return `${prefix}-${Math.floor(
        100000 + Math.random() * 900000
    )}`;
}

function saveData() {

    localStorage.setItem(
        "bloodConnectRegistrations",
        JSON.stringify(state.registrations)
    );

    localStorage.setItem(
        "bloodConnectEmergency",
        JSON.stringify(state.emergencyRequests)
    );

    localStorage.setItem(
        "bloodConnectLanguage",
        state.language
    );
}

/* =========================================================
   TOAST
   ========================================================= */

function showToast(message, type = "success") {

    let container = $(".toast-container");

    if (!container) {

        container = document.createElement("div");

        container.className =
            "toast-container";

        document.body.appendChild(container);
    }

    const toast =
        document.createElement("div");

    toast.className =
        `toast toast-${type}`;

    let icon = "fa-circle-check";

    if (type === "error")
        icon = "fa-circle-exclamation";

    if (type === "warning")
        icon = "fa-triangle-exclamation";

    if (type === "info")
        icon = "fa-circle-info";

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>

        <span>${message}</span>

        <button class="toast-close">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    toast.querySelector(
        ".toast-close"
    ).addEventListener(
        "click",
        () => removeToast(toast)
    );

    setTimeout(() => {
        removeToast(toast);
    }, 4500);
}

function removeToast(toast) {

    toast.classList.remove("show");

    setTimeout(() => {
        toast.remove();
    }, 300);
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function initNavigation() {

    $$(".nav-link").forEach(link => {

        link.addEventListener(
            "click",
            event => {

                event.preventDefault();

                const page =
                    link.dataset.page ||
                    link
                        .getAttribute("href")
                        ?.replace("#", "");

                if (page) {
                    showPage(page);
                }
            }
        );
    });

    $$(".page-link").forEach(link => {

        link.addEventListener(
            "click",
            event => {

                event.preventDefault();

                if (link.dataset.page) {
                    showPage(
                        link.dataset.page
                    );
                }
            }
        );
    });

    $$("[data-page]").forEach(element => {

        if (
            element.classList.contains(
                "nav-link"
            ) ||
            element.classList.contains(
                "page-link"
            )
        ) {
            return;
        }

        element.addEventListener(
            "click",
            () => {

                showPage(
                    element.dataset.page
                );
            }
        );
    });
}

function showPage(pageName) {

    $$(".page").forEach(page => {
        page.classList.remove("active");
    });

    const target =
        document.getElementById(pageName);

    if (target) {

        target.classList.add("active");

        state.currentPage =
            pageName;
    }

    $$(".nav-link").forEach(link => {

        link.classList.remove("active");

        if (
            link.dataset.page ===
            pageName
        ) {
            link.classList.add("active");
        }
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (pageName === "dashboard") {
        updateDashboard();
    }

    if (pageName === "emergency") {
        updateEmergencyHistory();
    }

    if (pageName === "camps") {
        refreshCampRegistrations();
    }
}

/* =========================================================
   TABS
   ========================================================= */

function initTabs() {

    $$(".camp-tab").forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                $$(".camp-tab")
                    .forEach(item =>
                        item.classList.remove(
                            "active"
                        )
                    );

                tab.classList.add("active");

                const target =
                    document.getElementById(
                        tab.dataset.tab
                    );

                $$(".camp-panel")
                    .forEach(panel =>
                        panel.classList.remove(
                            "active"
                        )
                    );

                if (target) {
                    target.classList.add(
                        "active"
                    );
                }
            }
        );
    });

    $$(".search-tab").forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                $$(".search-tab")
                    .forEach(item =>
                        item.classList.remove(
                            "active"
                        )
                    );

                tab.classList.add("active");

                $$(".search-panel")
                    .forEach(panel =>
                        panel.classList.remove(
                            "active"
                        )
                    );

                const target =
                    document.getElementById(
                        tab.dataset.search
                    );

                if (target) {
                    target.classList.add(
                        "active"
                    );
                }

                state.selectedSearchType =
                    tab.dataset.search ===
                    "hlaSearch"
                        ? "hla"
                        : "blood";
            }
        );
    });
}

/* =========================================================
   CAMP REGISTRATION
   ========================================================= */

function registerCamp(campName) {

    state.selectedCamp =
        campName;

    openRegistrationModal(
        campName
    );
}

function openRegistrationModal(
    campName
) {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    openModal(
        "Camp Registration",

        `
        <form id="campRegistrationForm">

            <div class="registration-header">

                <div class="registration-icon">
                    <i class="fa-solid fa-calendar-check"></i>
                </div>

                <div>
                    <h3>${campName}</h3>

                    <p>
                        Complete your registration.
                    </p>
                </div>

            </div>

            <div class="form-row">

                <div class="form-group">

                    <label>
                        Full Name *
                    </label>

                    <input
                        type="text"
                        name="fullName"
                        placeholder="Enter your full name"
                        required
                    >

                </div>

                <div class="form-group">

                    <label>
                        Age *
                    </label>

                    <input
                        type="number"
                        name="age"
                        min="18"
                        max="70"
                        required
                    >

                </div>

            </div>

            <div class="form-row">

                <div class="form-group">

                    <label>
                        Gender *
                    </label>

                    <select
                        name="gender"
                        required
                    >

                        <option value="">
                            Select
                        </option>

                        <option>
                            Female
                        </option>

                        <option>
                            Male
                        </option>

                        <option>
                            Other
                        </option>

                    </select>

                </div>

                <div class="form-group">

                    <label>
                        Blood Group *
                    </label>

                    <select
                        name="bloodGroup"
                        required
                    >

                        <option value="">
                            Select
                        </option>

                        <option>A+</option>
                        <option>A-</option>
                        <option>B+</option>
                        <option>B-</option>
                        <option>AB+</option>
                        <option>AB-</option>
                        <option>O+</option>
                        <option>O-</option>

                    </select>

                </div>

            </div>

            <div class="form-row">

                <div class="form-group">

                    <label>
                        Phone Number *
                    </label>

                    <input
                        type="tel"
                        name="phone"
                        pattern="[0-9]{10}"
                        placeholder="10-digit number"
                        required
                    >

                </div>

                <div class="form-group">

                    <label>
                        Email *
                    </label>

                    <input
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        required
                    >

                </div>

            </div>

            <div class="form-group">

                <label>
                    Address / Location *
                </label>

                <textarea
                    name="address"
                    rows="2"
                    required
                ></textarea>

            </div>

            <div class="form-row">

                <div class="form-group">

                    <label>
                        Preferred Date *
                    </label>

                    <input
                        type="date"
                        name="preferredDate"
                        min="${today}"
                        required
                    >

                </div>

                <div class="form-group">

                    <label>
                        Preferred Time *
                    </label>

                    <select
                        name="preferredTime"
                        required
                    >

                        <option value="">
                            Select
                        </option>

                        <option>
                            09:00 AM
                        </option>

                        <option>
                            10:00 AM
                        </option>

                        <option>
                            11:00 AM
                        </option>

                        <option>
                            12:00 PM
                        </option>

                        <option>
                            02:00 PM
                        </option>

                        <option>
                            03:00 PM
                        </option>

                        <option>
                            04:00 PM
                        </option>

                    </select>

                </div>

            </div>

            <div class="form-group">

                <label>
                    Previous Blood Donation
                </label>

                <div class="inline-options">

                    <label>
                        <input
                            type="radio"
                            name="previousDonation"
                            value="Yes"
                        >
                        Yes
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="previousDonation"
                            value="No"
                            checked
                        >
                        No
                    </label>

                </div>

            </div>

            <div class="form-group">

                <label>
                    Last Donation Date
                </label>

                <input
                    type="date"
                    name="lastDonation"
                >

            </div>

            <div class="form-group">

                <label>
                    Emergency Contact
                </label>

                <input
                    type="tel"
                    name="emergencyContact"
                    pattern="[0-9]{10}"
                >

            </div>

            <div class="form-group">

                <label>
                    HLA Information
                    <span>(Optional)</span>
                </label>

                <input
                    type="text"
                    name="hla"
                    placeholder="Example: HLA-A*02:01"
                >

            </div>

            <label class="consent-check">

                <input
                    type="checkbox"
                    name="consent"
                    required
                >

                <span>
                    I confirm that the information
                    provided is accurate.
                </span>

            </label>

            <button
                type="submit"
                class="btn btn-primary btn-full"
            >

                <i class="fa-solid fa-check"></i>

                Confirm Registration

            </button>

        </form>
        `
    );

    const form =
        $("#campRegistrationForm");

    if (form) {

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const data =
                    new FormData(form);

                const registration = {

                    id:
                        generateID("REG"),

                    campName,

                    fullName:
                        data.get("fullName"),

                    age:
                        data.get("age"),

                    gender:
                        data.get("gender"),

                    bloodGroup:
                        data.get("bloodGroup"),

                    phone:
                        data.get("phone"),

                    email:
                        data.get("email"),

                    address:
                        data.get("address"),

                    preferredDate:
                        data.get(
                            "preferredDate"
                        ),

                    preferredTime:
                        data.get(
                            "preferredTime"
                        ),

                    previousDonation:
                        data.get(
                            "previousDonation"
                        ),

                    lastDonation:
                        data.get(
                            "lastDonation"
                        ),

                    emergencyContact:
                        data.get(
                            "emergencyContact"
                        ),

                    hla:
                        data.get("hla"),

                    registeredAt:
                        new Date()
                            .toISOString(),

                    status:
                        "Confirmed"
                };

                state.registrations.push(
                    registration
                );

                saveData();

                showRegistrationSuccess(
                    registration
                );
            }
        );
    }
}

function showRegistrationSuccess(
    registration
) {

    openModal(
        "Registration Successful",

        `
        <div class="success-modal">

            <div class="success-animation">
                <i class="fa-solid fa-check"></i>
            </div>

            <h2>
                You're Registered!
            </h2>

            <p>
                Your camp registration
                has been confirmed.
            </p>

            <div class="registration-summary">

                <div>
                    <span>
                        Registration ID
                    </span>

                    <strong>
                        ${registration.id}
                    </strong>
                </div>

                <div>
                    <span>Camp</span>

                    <strong>
                        ${registration.campName}
                    </strong>
                </div>

                <div>
                    <span>Participant</span>

                    <strong>
                        ${registration.fullName}
                    </strong>
                </div>

                <div>
                    <span>Blood Group</span>

                    <strong>
                        ${registration.bloodGroup}
                    </strong>
                </div>

                <div>
                    <span>Date</span>

                    <strong>
                        ${registration.preferredDate}
                    </strong>
                </div>

                <div>
                    <span>Time</span>

                    <strong>
                        ${registration.preferredTime}
                    </strong>
                </div>

            </div>

        </div>
        `,

        `
        <button
            class="btn btn-primary"
            onclick="closeModal()"
        >
            Done
        </button>
        `
    );

    showToast(
        `Registration confirmed: ${registration.id}`
    );

    updateDashboard();
}

function refreshCampRegistrations() {

    $$(".camp-card").forEach(card => {

        const title =
            card.querySelector("h3")
                ?.textContent
                .trim();

        if (!title) return;

        const registered =
            state.registrations.some(
                item =>
                    item.campName === title
            );

        const button =
            card.querySelector(
                ".register-camp-btn"
            );

        if (
            registered &&
            button
        ) {

            button.innerHTML = `
                <i class="fa-solid fa-check"></i>
                Registered
            `;

            button.classList.add(
                "registered"
            );
        }
    });
}

/* =========================================================
   EMERGENCY
   ========================================================= */

function initEmergency() {

    const form =
        $("#emergencyForm");

    if (!form) return;

    const hlaToggle =
        form.querySelector(
            "#hlaToggle, [name='hlaEnabled']"
        );

    const hlaFields =
        form.querySelector(
            ".hla-fields"
        );

    if (
        hlaToggle &&
        hlaFields
    ) {

        hlaToggle.addEventListener(
            "change",
            () => {

                hlaFields.classList.toggle(
                    "hidden",
                    !hlaToggle.checked
                );
            }
        );
    }

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const data =
                new FormData(form);

            const request = {

                id:
                    generateID("EMG"),

                patientName:
                    data.get("patientName") ||
                    data.get("name"),

                age:
                    data.get("age"),

                bloodGroup:
                    data.get("bloodGroup"),

                units:
                    data.get("units") || "1",

                contact:
                    data.get("contact") ||
                    data.get("phone"),

                hospital:
                    data.get("hospitalName"),

                location:
                    data.get(
                        "hospitalLocation"
                    ) ||
                    data.get("location"),

                hla:
                    data.get("hla"),

                urgency:
                    data.get("urgency") ||
                    "Urgent",

                notes:
                    data.get("notes"),

                createdAt:
                    new Date().toISOString(),

                status:
                    "Searching"
            };

            if (
                !request.patientName ||
                !request.age ||
                !request.bloodGroup ||
                !request.contact ||
                !request.hospital
            ) {

                showToast(
                    "Please complete all required fields.",
                    "error"
                );

                return;
            }

            state.emergencyRequests.push(
                request
            );

            saveData();

            form.reset();

            showEmergencySuccess(
                request
            );
        }
    );
}

function showEmergencySuccess(
    request
) {

    openModal(
        "Emergency Request Activated",

        `
        <div class="emergency-success">

            <div class="emergency-pulse">
                <i class="fa-solid fa-heart-pulse"></i>
            </div>

            <h2>
                Help Is Being Searched
            </h2>

            <p>
                Blood Connect has activated
                your emergency request.
            </p>

            <div class="emergency-id">

                <span>
                    Request ID
                </span>

                <strong>
                    ${request.id}
                </strong>

            </div>

            <div class="emergency-details">

                <div>
                    <span>Patient</span>
                    <strong>
                        ${request.patientName}
                    </strong>
                </div>

                <div>
                    <span>Blood Group</span>
                    <strong>
                        ${request.bloodGroup}
                    </strong>
                </div>

                <div>
                    <span>Units</span>
                    <strong>
                        ${request.units}
                    </strong>
                </div>

                <div>
                    <span>Hospital</span>
                    <strong>
                        ${request.hospital}
                    </strong>
                </div>

            </div>

            <div class="emergency-status">

                <span class="status-dot"></span>

                Searching for compatible
                resources

            </div>

        </div>
        `,

        `
        <button
            class="btn btn-primary"
            onclick="closeModal()"
        >
            Done
        </button>
        `
    );

    showToast(
        `Emergency request ${request.id} activated.`,
        "warning"
    );

    updateDashboard();
}

function trackEmergency(id) {

    const request =
        state.emergencyRequests.find(
            item => item.id === id
        );

    if (!request) return;

    openModal(
        "Emergency Tracking",

        `
        <div class="tracking-modal">

            <div class="tracking-header">

                <span>
                    Request ID
                </span>

                <strong>
                    ${request.id}
                </strong>

            </div>

            <div class="tracking-timeline">

                <div class="timeline-item completed">

                    <span class="timeline-dot"></span>

                    <div>
                        <strong>
                            Request Created
                        </strong>

                        <small>
                            Completed
                        </small>
                    </div>

                </div>

                <div class="timeline-item active">

                    <span class="timeline-dot"></span>

                    <div>
                        <strong>
                            Searching Nearby Matches
                        </strong>

                        <small>
                            In progress
                        </small>
                    </div>

                </div>

                <div class="timeline-item">

                    <span class="timeline-dot"></span>

                    <div>
                        <strong>
                            Compatible Donor Found
                        </strong>

                        <small>
                            Waiting
                        </small>
                    </div>

                </div>

                <div class="timeline-item">

                    <span class="timeline-dot"></span>

                    <div>
                        <strong>
                            Connection Confirmed
                        </strong>

                        <small>
                            Waiting
                        </small>
                    </div>

                </div>

            </div>

        </div>
        `,

        `
        <button
            class="btn btn-primary"
            onclick="closeModal()"
        >
            Done
        </button>
        `
    );
}

function updateEmergencyHistory() {

    const container =
        $("#emergencyHistory") ||
        $(".emergency-history");

    if (!container) return;

    if (
        state.emergencyRequests.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">

                <i class="fa-solid fa-heart-pulse"></i>

                <h3>
                    No emergency requests
                </h3>

                <p>
                    Your requests will appear here.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML =
        state.emergencyRequests
            .slice()
            .reverse()
            .map(request => `

                <div class="result-card">

                    <div class="result-icon emergency-icon">

                        <i class="fa-solid fa-heart-pulse"></i>

                    </div>

                    <div class="result-info">

                        <h3>
                            ${request.patientName}
                        </h3>

                        <div class="result-meta">

                            <span>
                                <i class="fa-solid fa-droplet"></i>
                                ${request.bloodGroup}
                            </span>

                            <span>
                                <i class="fa-solid fa-hospital"></i>
                                ${request.hospital}
                            </span>

                            <span>
                                ${request.id}
                            </span>

                        </div>

                    </div>

                    <div class="result-side">

                        <span class="status-badge status-warning">
                            ${request.status}
                        </span>

                        <button
                            class="btn btn-primary btn-small"
                            onclick="trackEmergency('${request.id}')"
                        >
                            Track
                        </button>

                    </div>

                </div>

            `)
            .join("");
}

/* =========================================================
   SMART SEARCH
   ========================================================= */

function initSearch() {

    const bloodForm =
        $("#bloodSearchForm");

    if (bloodForm) {

        bloodForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const group =
                    bloodForm.querySelector(
                        "[name='bloodGroup']"
                    )?.value;

                const location =
                    bloodForm.querySelector(
                        "[name='location']"
                    )?.value ||
                    "Nearby";

                if (!group) {

                    showToast(
                        "Please select a blood group.",
                        "error"
                    );

                    return;
                }

                performBloodSearch(
                    group,
                    location
                );
            }
        );
    }

    const hlaForm =
        $("#hlaSearchForm");

    if (hlaForm) {

        hlaForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const hla =
                    hlaForm.querySelector(
                        "[name='hlaType']"
                    )?.value;

                if (!hla) {

                    showToast(
                        "Please enter an HLA type.",
                        "error"
                    );

                    return;
                }

                performHLASearch(
                    hla
                );
            }
        );
    }
}

function performBloodSearch(
    bloodGroup,
    location
) {

    const container =
        $(".blood-search-results") ||
        $("#bloodSearchResults") ||
        $(".results-list");

    if (!container) return;

    const results = [

        {
            name: "Nearby Verified Donor",
            type: "Donor",
            distance: "1.8 km"
        },

        {
            name: "City Blood Centre",
            type: "Blood Bank",
            distance: "3.2 km"
        },

        {
            name: "LifeCare Hospital",
            type: "Hospital",
            distance: "4.7 km"
        }

    ];

    container.innerHTML =
        results.map(result => `

            <div class="result-card">

                <div class="result-icon">

                    <i class="fa-solid
                        ${
                            result.type === "Donor"
                                ? "fa-user"
                                : result.type === "Blood Bank"
                                    ? "fa-building"
                                    : "fa-hospital"
                        }">
                    </i>

                </div>

                <div class="result-info">

                    <h3>
                        ${result.name}
                    </h3>

                    <div class="result-meta">

                        <span>
                            <i class="fa-solid fa-droplet"></i>
                            ${bloodGroup}
                        </span>

                        <span>
                            <i class="fa-solid fa-location-dot"></i>
                            ${location}
                        </span>

                        <span>
                            ${result.distance}
                        </span>

                    </div>

                </div>

                <button
                    class="btn btn-primary btn-small"
                    onclick="contactResult('${result.name}')"
                >
                    Connect
                </button>

            </div>

        `).join("");

    showToast(
        `${results.length} potential matches found.`
    );
}

function performHLASearch(
    hla
) {

    const container =
        $(".hla-search-results") ||
        $("#hlaSearchResults") ||
        $(".results-list");

    if (!container) return;

    container.innerHTML = `

        <div class="result-card">

            <div class="result-icon hla-icon">

                <i class="fa-solid fa-dna"></i>

            </div>

            <div class="result-info">

                <h3>
                    High Compatibility Match
                </h3>

                <div class="result-meta">

                    <span>
                        HLA: ${hla}
                    </span>

                    <span>
                        Compatibility: 98%
                    </span>

                </div>

            </div>

            <button
                class="btn btn-primary btn-small"
                onclick="contactResult('HLA Match')"
            >
                Connect
            </button>

        </div>

    `;

    showToast(
        "HLA compatibility search completed."
    );
}

function contactResult(name) {

    openModal(
        "Connect With Match",

        `
        <div class="connection-modal">

            <div class="modal-feature-icon">

                <i class="fa-solid fa-handshake"></i>

            </div>

            <h3>
                ${name}
            </h3>

            <p>
                Send a connection request
                through Blood Connect.
            </p>

        </div>
        `,

        `
        <button
            class="btn btn-secondary"
            onclick="closeModal()"
        >
            Cancel
        </button>

        <button
            class="btn btn-primary"
            onclick="sendConnectionRequest('${name}')"
        >
            Send Request
        </button>
        `
    );
}

function sendConnectionRequest(name) {

    closeModal();

    showToast(
        `Connection request sent to ${name}.`
    );
}

/* =========================================================
   BLOOD BANKS
   ========================================================= */

function openBloodBank(
    bankName,
    location = "Nearby"
) {

    openModal(
        bankName,

        `
        <div class="blood-bank-detail">

            <div class="bank-detail-icon">

                <i class="fa-solid fa-building-columns"></i>

            </div>

            <h2>
                ${bankName}
            </h2>

            <p>
                Verified Blood Connect partner.
            </p>

            <div class="bank-detail-grid">

                <div>
                    <span>Location</span>
                    <strong>
                        ${location}
                    </strong>
                </div>

                <div>
                    <span>Status</span>
                    <strong>
                        Available
                    </strong>
                </div>

                <div>
                    <span>Service</span>
                    <strong>
                        24 × 7
                    </strong>
                </div>

                <div>
                    <span>Matching</span>
                    <strong>
                        Blood + HLA
                    </strong>
                </div>

            </div>

        </div>
        `,

        `
        <button
            class="btn btn-secondary"
            onclick="closeModal()"
        >
            Close
        </button>

        <button
            class="btn btn-primary"
            onclick="requestFromBank('${bankName}')"
        >
            Request Blood
        </button>
        `
    );
}

function requestFromBank(bankName) {

    closeModal();

    showPage("emergency");

    showToast(
        `${bankName} selected. Complete the emergency request.`
    );
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    const registrationCount =
        $(".registration-count");

    const emergencyCount =
        $(".emergency-count");

    const activityCount =
        $(".activity-count");

    if (registrationCount) {

        registrationCount.textContent =
            state.registrations.length;
    }

    if (emergencyCount) {

        emergencyCount.textContent =
            state.emergencyRequests.length;
    }

    if (activityCount) {

        activityCount.textContent =
            state.registrations.length +
            state.emergencyRequests.length;
    }

    renderRecentActivity();
}

function renderRecentActivity() {

    const container =
        $(".recent-activity") ||
        $("#recentActivity");

    if (!container) return;

    const activities = [

        ...state.registrations.map(
            item => ({
                title:
                    `Registered for ${item.campName}`,
                date:
                    item.registeredAt,
                icon:
                    "fa-calendar-check"
            })
        ),

        ...state.emergencyRequests.map(
            item => ({
                title:
                    `Emergency request ${item.id}`,
                date:
                    item.createdAt,
                icon:
                    "fa-heart-pulse"
            })
        )

    ]
    .sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    )
    .slice(0, 5);

    if (!activities.length) {

        container.innerHTML = `
            <div class="empty-state">

                <i class="fa-solid fa-chart-line"></i>

                <h3>
                    No activity yet
                </h3>

                <p>
                    Your activity will appear here.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML =
        activities.map(
            activity => `

                <div class="activity-item">

                    <div class="activity-icon">

                        <i class="fa-solid ${activity.icon}"></i>

                    </div>

                    <div class="activity-content">

                        <strong>
                            ${activity.title}
                        </strong>

                        <span>
                            ${formatDate(activity.date)}
                        </span>

                    </div>

                </div>

            `
        ).join("");
}

function formatDate(date) {

    return new Date(date)
        .toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );
}

/* =========================================================
   LANGUAGE
   ========================================================= */

function initLanguage() {

    const select =
        $(".language-select") ||
        $("#languageSelect");

    if (!select) return;

    select.value =
        state.language;

    select.addEventListener(
        "change",
        event => {

            state.language =
                event.target.value;

            saveData();

            showToast(
                `Language changed to ${state.language}.`
            );
        }
    );
}

/* =========================================================
   MODAL
   ========================================================= */

function openModal(
    title,
    content,
    footer = ""
) {

    const modal =
        $(".modal");

    if (!modal) return;

    const titleElement =
        modal.querySelector(
            ".modal-title"
        );

    const body =
        modal.querySelector(
            ".modal-body"
        );

    const footerElement =
        modal.querySelector(
            ".modal-footer"
        );

    if (titleElement)
        titleElement.textContent =
            title;

    if (body)
        body.innerHTML =
            content;

    if (footerElement)
        footerElement.innerHTML =
            footer;

    modal.classList.add(
        "active"
    );

    document.body.classList.add(
        "modal-open"
    );
}

function closeModal() {

    const modal =
        $(".modal");

    if (!modal) return;

    modal.classList.remove(
        "active"
    );

    document.body.classList.remove(
        "modal-open"
    );
}

function initModal() {

    const modal =
        $(".modal");

    if (!modal) return;

    const closeButton =
        modal.querySelector(
            ".close-modal"
        );

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeModal
        );
    }

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target.classList.contains(
                    "modal-overlay"
                )
            ) {
                closeModal();
            }
        }
    );

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {
                closeModal();
            }
        }
    );
}

/* =========================================================
   GENERAL UI
   ========================================================= */

function initForms() {

    $$("form").forEach(form => {

        if (
            form.id ===
                "bloodSearchForm" ||
            form.id ===
                "hlaSearchForm" ||
            form.id ===
                "emergencyForm"
        ) {
            return;
        }

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                showToast(
                    "Information saved successfully."
                );
            }
        );
    });
}

function initUI() {

    $$("input, select, textarea")
        .forEach(input => {

            input.addEventListener(
                "focus",
                () => {
                    input.parentElement
                        ?.classList.add(
                            "input-focused"
                        );
                }
            );

            input.addEventListener(
                "blur",
                () => {
                    input.parentElement
                        ?.classList.remove(
                            "input-focused"
                        );
                }
            );
        });

    // Camp registration buttons
    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".register-camp-btn, [data-register-camp]"
                );

            if (!button) return;

            const campName =
                button.dataset.registerCamp ||
                button.closest(".camp-card")
                    ?.querySelector("h3")
                    ?.textContent
                    ?.trim();

            if (campName) {
                registerCamp(
                    campName
                );
            }
        }
    );
}

/* =========================================================
   LOAD
   ========================================================= */

function loadStoredData() {

    updateDashboard();

    refreshCampRegistrations();

    updateEmergencyHistory();
}

/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.showPage =
    showPage;

window.registerCamp =
    registerCamp;

window.openRegistrationModal =
    openRegistrationModal;

window.closeModal =
    closeModal;

window.trackEmergency =
    trackEmergency;

window.contactResult =
    contactResult;

window.sendConnectionRequest =
    sendConnectionRequest;

window.openBloodBank =
    openBloodBank;

window.requestFromBank =
    requestFromBank;

window.showToast =
    showToast;

console.log(
    "%cBlood Connect",
    "font-size:24px;font-weight:800;"
);

console.log(
    "%cSmart Blood • HLA • Emergency • Camps",
    "font-size:13px;"
);
