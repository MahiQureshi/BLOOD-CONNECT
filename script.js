/* =========================================================
   BLOOD CONNECT — MAIN JAVASCRIPT
   Premium Interactive Healthcare Platform
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initAuth();
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
   GLOBAL STATE
   ========================================================= */

const state = {
    currentUser: JSON.parse(localStorage.getItem("bloodConnectUser")) || null,
    currentPage: "home",
    selectedCamp: null,
    selectedSearchType: "blood",
    registrations: JSON.parse(localStorage.getItem("bloodConnectRegistrations")) || [],
    emergencyRequests: JSON.parse(localStorage.getItem("bloodConnectEmergency")) || [],
    language: localStorage.getItem("bloodConnectLanguage") || "English"
};

/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
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

    if (state.currentUser) {
        localStorage.setItem(
            "bloodConnectUser",
            JSON.stringify(state.currentUser)
        );
    }
}

function generateID(prefix = "BC") {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${random}`;
}

function showToast(message, type = "success") {
    let container = $(".toast-container");

    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let icon = "fa-circle-check";

    if (type === "error") icon = "fa-circle-exclamation";
    if (type === "warning") icon = "fa-triangle-exclamation";
    if (type === "info") icon = "fa-circle-info";

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
        <button class="toast-close">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("show");
    }, 10);

    toast.querySelector(".toast-close").addEventListener("click", () => {
        removeToast(toast);
    });

    setTimeout(() => {
        removeToast(toast);
    }, 4500);
}

function removeToast(toast) {
    toast.classList.remove("show");

    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 300);
}

function closeModal() {
    const modal = $(".modal");

    if (modal) {
        modal.classList.remove("active");
        document.body.classList.remove("modal-open");
    }
}

function openModal(title, content, footer = "") {
    const modal = $(".modal");

    if (!modal) return;

    const titleElement = modal.querySelector(".modal-title");
    const bodyElement = modal.querySelector(".modal-body");
    const footerElement = modal.querySelector(".modal-footer");

    if (titleElement) titleElement.textContent = title;
    if (bodyElement) bodyElement.innerHTML = content;
    if (footerElement) footerElement.innerHTML = footer;

    modal.classList.add("active");
    document.body.classList.add("modal-open");
}

/* =========================================================
   AUTHENTICATION
   ========================================================= */

function initAuth() {

    const loginTab = $(".auth-tab[data-auth='login']");
    const signupTab = $(".auth-tab[data-auth='signup']");

    const loginForm = $("#loginForm");
    const signupForm = $("#signupForm");

    if (loginTab && signupTab) {

        loginTab.addEventListener("click", () => {
            switchAuth("login");
        });

        signupTab.addEventListener("click", () => {
            switchAuth("signup");
        });
    }

    function switchAuth(type) {

        $$(".auth-tab").forEach(tab => {
            tab.classList.remove("active");
        });

        const selectedTab = $(`.auth-tab[data-auth='${type}']`);

        if (selectedTab) {
            selectedTab.classList.add("active");
        }

        if (loginForm) {
            loginForm.classList.toggle("hidden", type !== "login");
        }

        if (signupForm) {
            signupForm.classList.toggle("hidden", type !== "signup");
        }
    }

    if (loginForm) {

        loginForm.addEventListener("submit", event => {

            event.preventDefault();

            const email = loginForm.querySelector(
                "input[type='email']"
            )?.value.trim();

            const password = loginForm.querySelector(
                "input[type='password']"
            )?.value;

            if (!email || !password) {
                showToast(
                    "Please enter your email and password.",
                    "error"
                );
                return;
            }

            const users =
                JSON.parse(localStorage.getItem("bloodConnectUsers")) || [];

            const user = users.find(
                item =>
                    item.email.toLowerCase() === email.toLowerCase() &&
                    item.password === password
            );

            if (!user) {
                showToast(
                    "Account not found or password is incorrect.",
                    "error"
                );
                return;
            }

            state.currentUser = user;
            saveData();

            showToast("Welcome back to Blood Connect!");

            setTimeout(() => {
                enterApplication();
            }, 500);
        });
    }

    if (signupForm) {

        signupForm.addEventListener("submit", event => {

            event.preventDefault();

            const name =
                signupForm.querySelector(
                    "input[name='name'], #signupName"
                )?.value.trim();

            const email =
                signupForm.querySelector(
                    "input[type='email']"
                )?.value.trim();

            const password =
                signupForm.querySelector(
                    "input[type='password']"
                )?.value;

            const role =
                signupForm.querySelector(
                    "input[name='role']:checked"
                )?.value || "donor";

            if (!name || !email || !password) {
                showToast(
                    "Please complete all required fields.",
                    "error"
                );
                return;
            }

            if (password.length < 6) {
                showToast(
                    "Password must contain at least 6 characters.",
                    "warning"
                );
                return;
            }

            const users =
                JSON.parse(localStorage.getItem("bloodConnectUsers")) || [];

            if (
                users.some(
                    user =>
                        user.email.toLowerCase() === email.toLowerCase()
                )
            ) {
                showToast(
                    "An account with this email already exists.",
                    "error"
                );
                return;
            }

            const user = {
                id: generateID("USER"),
                name,
                email,
                password,
                role,
                createdAt: new Date().toISOString()
            };

            users.push(user);

            localStorage.setItem(
                "bloodConnectUsers",
                JSON.stringify(users)
            );

            state.currentUser = user;
            saveData();

            showToast(
                "Account created successfully!"
            );

            setTimeout(() => {
                enterApplication();
            }, 500);
        });
    }

    // Role cards
    $$(".role-card").forEach(card => {

        card.addEventListener("click", () => {

            $$(".role-card").forEach(item => {
                item.classList.remove("selected");
            });

            card.classList.add("selected");

            const radio = card.querySelector("input[type='radio']");

            if (radio) {
                radio.checked = true;
            }
        });
    });
}

function enterApplication() {

    const authScreen = $(".auth-screen");
    const mainApp = $(".main-app");

    if (authScreen) {
        authScreen.classList.add("hidden");
    }

    if (mainApp) {
        mainApp.classList.remove("hidden");
    }

    updateUserUI();
    showPage("home");
}

function logout() {

    state.currentUser = null;

    localStorage.removeItem("bloodConnectUser");

    const mainApp = $(".main-app");
    const authScreen = $(".auth-screen");

    if (mainApp) {
        mainApp.classList.add("hidden");
    }

    if (authScreen) {
        authScreen.classList.remove("hidden");
    }

    showToast("You have been logged out.", "info");
}

function updateUserUI() {

    if (!state.currentUser) return;

    const nameElements = $$(".user-name");

    nameElements.forEach(element => {
        element.textContent = state.currentUser.name;
    });

    const profileName = $(".profile-name");

    if (profileName) {
        profileName.textContent = state.currentUser.name;
    }

    const profileRole = $(".profile-role");

    if (profileRole) {
        profileRole.textContent =
            state.currentUser.role === "recipient"
                ? "Recipient"
                : "Donor";
    }

    const initials =
        state.currentUser.name
            .split(" ")
            .map(word => word[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();

    $$(".user-avatar").forEach(element => {
        element.textContent = initials;
    });
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function initNavigation() {

    $$(".nav-link").forEach(link => {

        link.addEventListener("click", event => {

            event.preventDefault();

            const page =
                link.dataset.page ||
                link.getAttribute("href")?.replace("#", "");

            if (page) {
                showPage(page);
            }
        });
    });

    $$(".page-link").forEach(link => {

        link.addEventListener("click", event => {

            event.preventDefault();

            const page = link.dataset.page;

            if (page) {
                showPage(page);
            }
        });
    });

    $$("[data-page]").forEach(element => {

        if (
            element.classList.contains("nav-link") ||
            element.classList.contains("page-link")
        ) {
            return;
        }

        element.addEventListener("click", () => {

            const page = element.dataset.page;

            if (page) {
                showPage(page);
            }
        });
    });

    const logoutButton = $("#logoutBtn");

    if (logoutButton) {
        logoutButton.addEventListener("click", logout);
    }
}

function showPage(pageName) {

    const pages = $$(".page");

    if (!pages.length) return;

    pages.forEach(page => {
        page.classList.remove("active");
    });

    const target = $(`#${pageName}`);

    if (target) {
        target.classList.add("active");
        state.currentPage = pageName;
    }

    $$(".nav-link").forEach(link => {

        link.classList.remove("active");

        if (link.dataset.page === pageName) {
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

    if (pageName === "camps") {
        refreshCampRegistrations();
    }

    if (pageName === "emergency") {
        updateEmergencyHistory();
    }
}

/* =========================================================
   TABS
   ========================================================= */

function initTabs() {

    // Generic tabs
    $$(".camp-tab").forEach(tab => {

        tab.addEventListener("click", () => {

            $$(".camp-tab").forEach(item => {
                item.classList.remove("active");
            });

            tab.classList.add("active");

            const target = tab.dataset.tab;

            $$(".camp-panel").forEach(panel => {
                panel.classList.remove("active");
            });

            const panel = $(`#${target}`);

            if (panel) {
                panel.classList.add("active");
            }
        });
    });

    // Search tabs
    $$(".search-tab").forEach(tab => {

        tab.addEventListener("click", () => {

            $$(".search-tab").forEach(item => {
                item.classList.remove("active");
            });

            tab.classList.add("active");

            const target = tab.dataset.search;

            $$(".search-panel").forEach(panel => {
                panel.classList.remove("active");
            });

            const panel = $(`#${target}`);

            if (panel) {
                panel.classList.add("active");
            }

            state.selectedSearchType =
                target === "hlaSearch"
                    ? "hla"
                    : "blood";
        });
    });
}

/* =========================================================
   SMART SEARCH
   ========================================================= */

function initSearch() {

    const bloodSearchForm = $("#bloodSearchForm");

    if (bloodSearchForm) {

        bloodSearchForm.addEventListener("submit", event => {

            event.preventDefault();

            const bloodGroup =
                bloodSearchForm.querySelector(
                    "[name='bloodGroup']"
                )?.value;

            const location =
                bloodSearchForm.querySelector(
                    "[name='location']"
                )?.value.trim();

            const service =
                bloodSearchForm.querySelector(
                    "[name='service']"
                )?.value || "All";

            if (!bloodGroup) {

                showToast(
                    "Please select a blood group.",
                    "error"
                );

                return;
            }

            performBloodSearch(
                bloodGroup,
                location,
                service
            );
        });
    }

    const hlaSearchForm = $("#hlaSearchForm");

    if (hlaSearchForm) {

        hlaSearchForm.addEventListener("submit", event => {

            event.preventDefault();

            const hlaType =
                hlaSearchForm.querySelector(
                    "[name='hlaType'], #hlaType"
                )?.value.trim();

            const location =
                hlaSearchForm.querySelector(
                    "[name='location']"
                )?.value.trim();

            if (!hlaType) {

                showToast(
                    "Please enter an HLA type.",
                    "error"
                );

                return;
            }

            performHLASearch(
                hlaType,
                location
            );
        });
    }
}

function performBloodSearch(
    bloodGroup,
    location,
    service
) {

    const resultsContainer =
        $(".blood-search-results") ||
        $("#bloodSearchResults") ||
        $(".results-list");

    if (!resultsContainer) return;

    const sampleResults = [
        {
            name: "Aarav Medical Donor",
            type: "Donor",
            group: bloodGroup,
            location: location || "Nearby",
            distance: "1.8 km",
            status: "Available"
        },
        {
            name: "City Blood Centre",
            type: "Blood Bank",
            group: bloodGroup,
            location: location || "Nearby",
            distance: "3.2 km",
            status: "Available"
        },
        {
            name: "LifeCare Hospital",
            type: "Hospital",
            group: bloodGroup,
            location: location || "Nearby",
            distance: "4.7 km",
            status: "Available"
        }
    ];

    resultsContainer.innerHTML = sampleResults.map(result => `
        <div class="result-card">

            <div class="result-icon">
                <i class="fa-solid ${
                    result.type === "Donor"
                        ? "fa-user"
                        : result.type === "Blood Bank"
                            ? "fa-building"
                            : "fa-hospital"
                }"></i>
            </div>

            <div class="result-info">

                <h3>${result.name}</h3>

                <div class="result-meta">
                    <span>
                        <i class="fa-solid fa-droplet"></i>
                        ${result.group}
                    </span>

                    <span>
                        <i class="fa-solid fa-location-dot"></i>
                        ${result.location}
                    </span>

                    <span>
                        <i class="fa-solid fa-route"></i>
                        ${result.distance}
                    </span>
                </div>

            </div>

            <div class="result-side">

                <span class="status-badge status-success">
                    ${result.status}
                </span>

                <button
                    class="btn btn-primary btn-small"
                    onclick="contactResult('${result.name}')"
                >
                    Connect
                </button>

            </div>

        </div>
    `).join("");

    showToast(
        `${sampleResults.length} potential matches found.`
    );
}

function performHLASearch(
    hlaType,
    location
) {

    const resultsContainer =
        $(".hla-search-results") ||
        $("#hlaSearchResults") ||
        $(".results-list");

    if (!resultsContainer) return;

    const results = [
        {
            name: "HLA Compatible Donor A",
            match: "98%",
            location: location || "Nearby",
            type: "Potential Match"
        },
        {
            name: "HLA Compatible Donor B",
            match: "94%",
            location: location || "Nearby",
            type: "High Compatibility"
        },
        {
            name: "Regional HLA Registry",
            match: "91%",
            location: location || "Nearby",
            type: "Registry Match"
        }
    ];

    resultsContainer.innerHTML = results.map(result => `
        <div class="result-card hla-result">

            <div class="result-icon hla-icon">
                <i class="fa-solid fa-dna"></i>
            </div>

            <div class="result-info">

                <h3>${result.name}</h3>

                <div class="result-meta">
                    <span>
                        <i class="fa-solid fa-dna"></i>
                        HLA: ${hlaType}
                    </span>

                    <span>
                        <i class="fa-solid fa-location-dot"></i>
                        ${result.location}
                    </span>
                </div>

            </div>

            <div class="result-side">

                <strong class="match-score">
                    ${result.match}
                </strong>

                <button
                    class="btn btn-primary btn-small"
                    onclick="contactResult('${result.name}')"
                >
                    Connect
                </button>

            </div>

        </div>
    `).join("");

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

            <h3>${name}</h3>

            <p>
                Your connection request can be initiated
                through Blood Connect.
            </p>

            <div class="modal-info-box">
                <i class="fa-solid fa-shield-heart"></i>
                <span>
                    Personal contact information remains protected
                    until a connection is accepted.
                </span>
            </div>

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
   CAMPS
   ========================================================= */

function registerCamp(campName) {

    state.selectedCamp = campName;

    openRegistrationModal(campName);
}

function openRegistrationModal(campName) {

    const today = new Date().toISOString().split("T")[0];

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
                    <p>Complete your registration below.</p>
                </div>
            </div>

            <div class="form-row">

                <div class="form-group">
                    <label>Full Name *</label>
                    <input
                        type="text"
                        name="fullName"
                        required
                        placeholder="Enter your full name"
                    >
                </div>

                <div class="form-group">
                    <label>Age *</label>
                    <input
                        type="number"
                        name="age"
                        min="18"
                        max="70"
                        required
                        placeholder="Age"
                    >
                </div>

            </div>

            <div class="form-row">

                <div class="form-group">
                    <label>Gender *</label>

                    <select name="gender" required>
                        <option value="">Select</option>
                        <option>Female</option>
                        <option>Male</option>
                        <option>Other</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Blood Group *</label>

                    <select name="bloodGroup" required>
                        <option value="">Select</option>
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
                    <label>Phone Number *</label>

                    <input
                        type="tel"
                        name="phone"
                        required
                        pattern="[0-9]{10}"
                        placeholder="10-digit mobile number"
                    >
                </div>

                <div class="form-group">
                    <label>Email *</label>

                    <input
                        type="email"
                        name="email"
                        required
                        placeholder="your@email.com"
                    >
                </div>

            </div>

            <div class="form-group">
                <label>Address / Location *</label>

                <textarea
                    name="address"
                    required
                    rows="2"
                    placeholder="Enter your current location"
                ></textarea>
            </div>

            <div class="form-row">

                <div class="form-group">
                    <label>Preferred Date *</label>

                    <input
                        type="date"
                        name="preferredDate"
                        min="${today}"
                        required
                    >
                </div>

                <div class="form-group">
                    <label>Preferred Time *</label>

                    <select name="preferredTime" required>
                        <option value="">Select time</option>
                        <option>09:00 AM</option>
                        <option>10:00 AM</option>
                        <option>11:00 AM</option>
                        <option>12:00 PM</option>
                        <option>02:00 PM</option>
                        <option>03:00 PM</option>
                        <option>04:00 PM</option>
                    </select>
                </div>

            </div>

            <div class="form-group">

                <label>
                    Have you donated blood before?
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
                <label>Last Donation Date</label>

                <input
                    type="date"
                    name="lastDonation"
                >
            </div>

            <div class="form-group">
                <label>Emergency Contact</label>

                <input
                    type="tel"
                    name="emergencyContact"
                    pattern="[0-9]{10}"
                    placeholder="Emergency contact number"
                >
            </div>

            <div class="form-group">
                <label>HLA Information (Optional)</label>

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
                    I confirm that the information provided is accurate
                    and I agree to participate in this blood donation camp.
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

    const form = $("#campRegistrationForm");

    if (form) {

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                submitCampRegistration(
                    form,
                    campName
                );
            }
        );
    }
}

function submitCampRegistration(form, campName) {

    const formData = new FormData(form);

    const registration = {
        id: generateID("REG"),
        campName,
        fullName: formData.get("fullName"),
        age: formData.get("age"),
        gender: formData.get("gender"),
        bloodGroup: formData.get("bloodGroup"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        address: formData.get("address"),
        preferredDate: formData.get("preferredDate"),
        preferredTime: formData.get("preferredTime"),
        previousDonation: formData.get("previousDonation"),
        lastDonation: formData.get("lastDonation"),
        emergencyContact: formData.get("emergencyContact"),
        hla: formData.get("hla"),
        registeredAt: new Date().toISOString(),
        status: "Confirmed"
    };

    state.registrations.push(registration);

    saveData();

    showRegistrationSuccess(registration);
}

function showRegistrationSuccess(registration) {

    openModal(
        "Registration Successful",
        `
        <div class="success-modal">

            <div class="success-animation">
                <i class="fa-solid fa-check"></i>
            </div>

            <h2>You're Registered!</h2>

            <p>
                Your participation has been successfully confirmed.
            </p>

            <div class="registration-summary">

                <div>
                    <span>Registration ID</span>
                    <strong>${registration.id}</strong>
                </div>

                <div>
                    <span>Camp</span>
                    <strong>${registration.campName}</strong>
                </div>

                <div>
                    <span>Participant</span>
                    <strong>${registration.fullName}</strong>
                </div>

                <div>
                    <span>Blood Group</span>
                    <strong>${registration.bloodGroup}</strong>
                </div>

                <div>
                    <span>Date</span>
                    <strong>${registration.preferredDate}</strong>
                </div>

                <div>
                    <span>Time</span>
                    <strong>${registration.preferredTime}</strong>
                </div>

            </div>

            <div class="modal-info-box">
                <i class="fa-solid fa-shield-heart"></i>
                <span>
                    Keep your registration ID for future reference.
                </span>
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

    updateDashboard();

    showToast(
        `Registration confirmed: ${registration.id}`
    );
}

function refreshCampRegistrations() {

    $$(".camp-card").forEach(card => {

        const title =
            card.querySelector("h3")?.textContent.trim();

        if (!title) return;

        const registrations =
            state.registrations.filter(
                registration =>
                    registration.campName === title
            );

        const button =
            card.querySelector(".register-camp-btn");

        if (
            button &&
            registrations.length > 0
        ) {
            button.innerHTML =
                `<i class="fa-solid fa-check"></i> Registered`;
            button.classList.add("registered");
        }
    });
}

/* =========================================================
   EMERGENCY SYSTEM
   ========================================================= */

function initEmergency() {

    const emergencyForm = $("#emergencyForm");

    if (!emergencyForm) return;

    const hlaToggle =
        emergencyForm.querySelector(
            "#hlaToggle, [name='hlaEnabled']"
        );

    const hlaFields =
        emergencyForm.querySelector(
            ".hla-fields"
        );

    if (hlaToggle && hlaFields) {

        hlaToggle.addEventListener("change", () => {

            hlaFields.classList.toggle(
                "hidden",
                !hlaToggle.checked
            );
        });
    }

    emergencyForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            submitEmergencyRequest(
                emergencyForm
            );
        }
    );
}

function submitEmergencyRequest(form) {

    const formData = new FormData(form);

    const bloodGroup =
        formData.get("bloodGroup");

    const patientName =
        formData.get("patientName") ||
        formData.get("name");

    const age =
        formData.get("age");

    const contact =
        formData.get("contact") ||
        formData.get("phone");

    const hospital =
        formData.get("hospitalName");

    if (
        !bloodGroup ||
        !patientName ||
        !age ||
        !contact ||
        !hospital
    ) {

        showToast(
            "Please complete all required emergency details.",
            "error"
        );

        return;
    }

    const request = {
        id: generateID("EMG"),
        patientName,
        age,
        bloodGroup,
        units: formData.get("units") || "1",
        contact,
        hospital,
        location:
            formData.get("hospitalLocation") ||
            formData.get("location") ||
            "",
        hla:
            formData.get("hla") ||
            "",
        urgency:
            formData.get("urgency") ||
            "Urgent",
        notes:
            formData.get("notes") ||
            "",
        createdAt: new Date().toISOString(),
        status: "Searching"
    };

    state.emergencyRequests.push(request);

    saveData();

    showEmergencySuccess(request);

    form.reset();

    const hlaFields =
        form.querySelector(".hla-fields");

    if (hlaFields) {
        hlaFields.classList.add("hidden");
    }
}

function showEmergencySuccess(request) {

    openModal(
        "Emergency Request Activated",
        `
        <div class="emergency-success">

            <div class="emergency-pulse">
                <i class="fa-solid fa-heart-pulse"></i>
            </div>

            <h2>Help Is Being Searched</h2>

            <p>
                Blood Connect has created your emergency request
                and started matching nearby resources.
            </p>

            <div class="emergency-id">
                <span>Request ID</span>
                <strong>${request.id}</strong>
            </div>

            <div class="emergency-details">

                <div>
                    <span>Patient</span>
                    <strong>${request.patientName}</strong>
                </div>

                <div>
                    <span>Blood Group</span>
                    <strong>${request.bloodGroup}</strong>
                </div>

                <div>
                    <span>Units</span>
                    <strong>${request.units}</strong>
                </div>

                <div>
                    <span>Hospital</span>
                    <strong>${request.hospital}</strong>
                </div>

            </div>

            <div class="emergency-status">
                <span class="status-dot"></span>
                Searching for compatible resources
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
            class="btn btn-danger"
            onclick="trackEmergency('${request.id}')"
        >
            Track Request
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
                <span>Request ID</span>
                <strong>${request.id}</strong>
            </div>

            <div class="tracking-timeline">

                <div class="timeline-item completed">
                    <span class="timeline-dot"></span>

                    <div>
                        <strong>Request Created</strong>
                        <small>Completed</small>
                    </div>
                </div>

                <div class="timeline-item active">
                    <span class="timeline-dot"></span>

                    <div>
                        <strong>Searching Nearby Matches</strong>
                        <small>In progress</small>
                    </div>
                </div>

                <div class="timeline-item">
                    <span class="timeline-dot"></span>

                    <div>
                        <strong>Compatible Donor / Bank Found</strong>
                        <small>Waiting</small>
                    </div>
                </div>

                <div class="timeline-item">
                    <span class="timeline-dot"></span>

                    <div>
                        <strong>Connection Confirmed</strong>
                        <small>Waiting</small>
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

    if (!state.emergencyRequests.length) {

        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-heart-pulse"></i>
                <h3>No emergency requests</h3>
                <p>Your emergency requests will appear here.</p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        state.emergencyRequests
            .slice()
            .reverse()
            .map(request => `
                <div class="result-card emergency-result">

                    <div class="result-icon emergency-icon">
                        <i class="fa-solid fa-heart-pulse"></i>
                    </div>

                    <div class="result-info">

                        <h3>${request.patientName}</h3>

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
                                <i class="fa-solid fa-hashtag"></i>
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
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    const registrations =
        state.registrations.length;

    const emergencyRequests =
        state.emergencyRequests.length;

    const registrationCount =
        $(".registration-count");

    const emergencyCount =
        $(".emergency-count");

    if (registrationCount) {
        registrationCount.textContent =
            registrations;
    }

    if (emergencyCount) {
        emergencyCount.textContent =
            emergencyRequests;
    }

    const totalActivity =
        $(".activity-count");

    if (totalActivity) {
        totalActivity.textContent =
            registrations + emergencyRequests;
    }

    renderRecentActivity();
}

function renderRecentActivity() {

    const container =
        $(".recent-activity") ||
        $("#recentActivity");

    if (!container) return;

    const activities = [
        ...state.registrations.map(item => ({
            type: "registration",
            title: `Registered for ${item.campName}`,
            date: item.registeredAt,
            icon: "fa-calendar-check"
        })),

        ...state.emergencyRequests.map(item => ({
            type: "emergency",
            title: `Emergency request ${item.id}`,
            date: item.createdAt,
            icon: "fa-heart-pulse"
        }))
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
                <h3>No activity yet</h3>
                <p>
                    Your Blood Connect activity will appear here.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        activities
            .map(activity => `
                <div class="activity-item">

                    <div class="activity-icon">
                        <i class="fa-solid ${activity.icon}"></i>
                    </div>

                    <div class="activity-content">
                        <strong>${activity.title}</strong>
                        <span>
                            ${formatDate(activity.date)}
                        </span>
                    </div>

                </div>
            `)
            .join("");
}

function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
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

            <h2>${bankName}</h2>

            <p>
                Verified Blood Connect partner resource.
            </p>

            <div class="bank-detail-grid">

                <div>
                    <span>Location</span>
                    <strong>${location}</strong>
                </div>

                <div>
                    <span>Status</span>
                    <strong class="available-text">
                        Available
                    </strong>
                </div>

                <div>
                    <span>Service</span>
                    <strong>24 × 7 Support</strong>
                </div>

                <div>
                    <span>Matching</span>
                    <strong>Blood + HLA</strong>
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
        `${bankName} selected. Complete the request form.`
    );
}

/* =========================================================
   GENERAL FORMS
   ========================================================= */

function initForms() {

    // Prevent empty demo buttons/forms from silently doing nothing
    $$("form").forEach(form => {

        if (
            form.id === "loginForm" ||
            form.id === "signupForm" ||
            form.id === "bloodSearchForm" ||
            form.id === "hlaSearchForm" ||
            form.id === "emergencyForm"
        ) {
            return;
        }

        form.addEventListener("submit", event => {

            event.preventDefault();

            showToast(
                "Your information has been saved successfully."
            );
        });
    });

    // Button loading animation
    $$(".btn").forEach(button => {

        button.addEventListener("click", () => {

            if (
                button.type === "submit" ||
                button.dataset.loading === "true"
            ) {
                return;
            }

            button.classList.add("button-clicked");

            setTimeout(() => {
                button.classList.remove("button-clicked");
            }, 250);
        });
    });
}

/* =========================================================
   LANGUAGE
   ========================================================= */

function initLanguage() {

    const languageSelect =
        $(".language-select") ||
        $("#languageSelect");

    if (!languageSelect) return;

    languageSelect.value = state.language;

    languageSelect.addEventListener(
        "change",
        event => {

            state.language =
                event.target.value;

            localStorage.setItem(
                "bloodConnectLanguage",
                state.language
            );

            changeLanguage(
                state.language
            );
        }
    );
}

function changeLanguage(language) {

    if (language === "English") {
        showToast("Language changed to English.");
        return;
    }

    if (language === "Hindi") {
        showToast("भाषा हिंदी में बदल दी गई है।");
        return;
    }

    if (language === "Marathi") {
        showToast("भाषा मराठीमध्ये बदलली आहे.");
        return;
    }

    if (language === "Urdu") {
        showToast("زبان اردو میں تبدیل کر دی گئی ہے۔");
        return;
    }

    showToast(
        `Language changed to ${language}.`
    );
}

/* =========================================================
   MODAL
   ========================================================= */

function initModal() {

    const modal = $(".modal");

    if (!modal) return;

    const closeButton =
        modal.querySelector(".close-modal");

    if (closeButton) {
        closeButton.addEventListener(
            "click",
            closeModal
        );
    }

    modal.addEventListener("click", event => {

        if (
            event.target.classList.contains(
                "modal-overlay"
            )
        ) {
            closeModal();
        }
    });

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                closeModal();
            }
        }
    );
}

/* =========================================================
   UI MICRO INTERACTIONS
   ========================================================= */

function initUI() {

    // Profile dropdown
    const profileButton =
        $(".profile-menu");

    const profileDropdown =
        $(".profile-dropdown");

    if (
        profileButton &&
        profileDropdown
    ) {

        profileButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                profileDropdown.classList.toggle(
                    "active"
                );
            }
        );

        document.addEventListener(
            "click",
            () => {
                profileDropdown.classList.remove(
                    "active"
                );
            }
        );
    }

    // Scroll reveal
    const revealElements =
        $$(".feature-card, .step-card, .bank-card, .journey-card, .stat-card");

    if ("IntersectionObserver" in window) {

        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (entry.isIntersecting) {

                            entry.target.classList.add(
                                "visible"
                            );

                            observer.unobserve(
                                entry.target
                            );
                        }
                    });

                },
                {
                    threshold: 0.12
                }
            );

        revealElements.forEach(element => {
            observer.observe(element);
        });
    }

    // Input focus effects
    $$("input, select, textarea").forEach(input => {

        input.addEventListener(
            "focus",
            () => {
                input.parentElement?.classList.add(
                    "input-focused"
                );
            }
        );

        input.addEventListener(
            "blur",
            () => {
                input.parentElement?.classList.remove(
                    "input-focused"
                );
            }
        );
    });
}

/* =========================================================
   STORED DATA
   ========================================================= */

function loadStoredData() {

    if (state.currentUser) {

        const authScreen = $(".auth-screen");
        const mainApp = $(".main-app");

        if (authScreen) {
            authScreen.classList.add("hidden");
        }

        if (mainApp) {
            mainApp.classList.remove("hidden");
        }

        updateUserUI();
        updateDashboard();
    }
}

/* =========================================================
   BLOOD GROUP QUICK ACTIONS
   ========================================================= */

$$(".blood-group-option").forEach(option => {

    option.addEventListener("click", () => {

        $$(".blood-group-option").forEach(item => {
            item.classList.remove("selected");
        });

        option.classList.add("selected");

        const bloodGroup =
            option.dataset.group;

        const select =
            document.querySelector(
                "[name='bloodGroup']"
            );

        if (select && bloodGroup) {
            select.value = bloodGroup;
        }
    });
});

/* =========================================================
   EMERGENCY QUICK ACTION
   ========================================================= */

$$("[data-emergency]").forEach(button => {

    button.addEventListener("click", () => {

        showPage("emergency");

        const bloodGroup =
            button.dataset.emergency;

        const select =
            document.querySelector(
                "#emergencyForm [name='bloodGroup']"
            );

        if (select && bloodGroup) {
            select.value = bloodGroup;
        }
    });
});

/* =========================================================
   CAMP REGISTRATION GLOBAL ACCESS
   ========================================================= */

window.registerCamp = registerCamp;
window.openRegistrationModal = openRegistrationModal;
window.closeModal = closeModal;
window.showPage = showPage;
window.logout = logout;
window.trackEmergency = trackEmergency;
window.contactResult = contactResult;
window.sendConnectionRequest = sendConnectionRequest;
window.openBloodBank = openBloodBank;
window.requestFromBank = requestFromBank;
window.changeLanguage = changeLanguage;

/* =========================================================
   DEMO DATA / CAMP BUTTON SUPPORT
   ========================================================= */

document.addEventListener("click", event => {

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
        registerCamp(campName);
    }
});

/* =========================================================
   KEYBOARD ACCESSIBILITY
   ========================================================= */

document.addEventListener("keydown", event => {

    if (event.key === "Enter") {

        const focused =
            document.activeElement;

        if (
            focused &&
            focused.classList.contains(
                "role-card"
            )
        ) {
            focused.click();
        }
    }
});

/* =========================================================
   CONSOLE BRANDING
   ========================================================= */

console.log(
    "%cBlood Connect",
    "font-size: 24px; font-weight: 800;"
);

console.log(
    "%cSmart Blood • HLA • Emergency • Camps",
    "font-size: 13px;"
);
