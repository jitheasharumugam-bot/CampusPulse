// ========================================
// CampusPulse - Smart Campus Issue Tracking
// ========================================

// HTML Elements
const issueForm = document.getElementById("issueForm");
const issuesList = document.getElementById("issuesList");

const totalIssues = document.getElementById("totalIssues");
const pendingIssues = document.getElementById("pendingIssues");
const resolvedIssues = document.getElementById("resolvedIssues");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");

// Load saved issues
let issues = [];

try {
    issues = JSON.parse(localStorage.getItem("campusIssues")) || [];
} catch (error) {
    issues = [];
}

// ========================================
// Calculate Priority
// ========================================

function calculatePriority(category, description) {

    const text = description.toLowerCase();

    if (
        text.includes("emergency") ||
        text.includes("danger") ||
        text.includes("fire") ||
        text.includes("electric shock")
    ) {
        return "High";
    }

    if (
        category === "Laboratory" ||
        category === "Classroom" ||
        category === "Wi-Fi / Internet" ||
        category === "Maintenance"
    ) {
        return "Medium";
    }

    return "Low";
}

// ========================================
// Save Issues
// ========================================

function saveIssues() {
    localStorage.setItem("campusIssues", JSON.stringify(issues));
}

// ========================================
// Update Dashboard
// ========================================

function updateDashboard() {

    totalIssues.textContent = issues.length;

    pendingIssues.textContent = issues.filter(
        issue => issue.status === "Pending"
    ).length;

    resolvedIssues.textContent = issues.filter(
        issue => issue.status === "Resolved"
    ).length;
}

// ========================================
// Display Date and Time
// ========================================

function getReportedDate(issue) {

    const timestamp = Number(issue.id);

    let date;

    if (Number.isFinite(timestamp) && timestamp > 0) {
        date = new Date(timestamp);
    } else {
        date = new Date(issue.date);
    }

    if (isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}

// ========================================
// Display Issues
// ========================================

function displayIssues() {

    issuesList.innerHTML = "";

    const searchText = searchInput.value.toLowerCase();

    const selectedStatus = statusFilter.value;
    const selectedPriority = priorityFilter.value;

    const filteredIssues = issues.filter(issue => {

        const matchesSearch =
            (issue.name || "").toLowerCase().includes(searchText) ||
            (issue.category || "").toLowerCase().includes(searchText) ||
            (issue.description || "").toLowerCase().includes(searchText);

        const matchesStatus =
            selectedStatus === "All" ||
            issue.status === selectedStatus;

        const matchesPriority =
            selectedPriority === "All" ||
            issue.priority === selectedPriority;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    // Show message when no issues are available
    if (filteredIssues.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty-message";

        emptyMessage.textContent = issues.length === 0
            ? "No issues reported yet. Submit your first issue!"
            : "No matching issues found.";

        issuesList.appendChild(emptyMessage);

    } else {

        filteredIssues.forEach(issue => {

            // Issue Card
            const issueCard = document.createElement("div");
            issueCard.className = "issue-card";

            // Student Name
            const name = document.createElement("h3");
            name.textContent = issue.name;

            // Issue ID
            const issueId = document.createElement("p");
            issueId.textContent = "Issue ID: CP-" + issue.id;

            // Category
            const category = document.createElement("p");
            category.textContent = "Category: " + issue.category;

            // Description
            const description = document.createElement("p");
            description.textContent = "Description: " + issue.description;

            // Priority Badge
            const priority = document.createElement("p");
            priority.textContent = "Priority: " + issue.priority;

            priority.className =
                "priority-badge priority-" +
                issue.priority.toLowerCase();

            // Status Badge
            const status = document.createElement("p");
            status.textContent = "Status: " + issue.status;

            status.className =
                "status-badge status-" +
                issue.status.toLowerCase();

            // Date and Time
            const date = document.createElement("p");
            date.textContent = "Reported: " + getReportedDate(issue);

            // Add information to card
            issueCard.append(
                name,
                issueId,
                category,
                description,
                priority,
                status,
                date
            );

            // Mark as Resolved
            if (issue.status === "Pending") {

                const statusButton = document.createElement("button");

                statusButton.textContent = "Mark as Resolved";

                statusButton.addEventListener("click", function () {

                    issue.status = "Resolved";

                    saveIssues();
                    displayIssues();

                });

                issueCard.appendChild(statusButton);
            }

            // Delete Issue
            const deleteButton = document.createElement("button");

            deleteButton.textContent = "Delete Issue";
            deleteButton.style.background = "#dc2626";

            deleteButton.addEventListener("click", function () {

                issues = issues.filter(
                    item => item.id !== issue.id
                );

                saveIssues();
                displayIssues();

            });

            issueCard.appendChild(deleteButton);

            // Add card to page
            issuesList.appendChild(issueCard);

        });
    }

    updateDashboard();
}

// ========================================
// Submit New Issue
// ========================================

issueForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const name = document
        .getElementById("studentName")
        .value.trim();

    const category = document
        .getElementById("category")
        .value;

    const description = document
        .getElementById("description")
        .value.trim();

    if (!name || !category || !description) {

        alert("Please complete all fields.");
        return;
    }

    const newIssue = {

        id: Date.now(),

        name: name,

        category: category,

        description: description,

        priority: calculatePriority(category, description),

        status: "Pending",

        date: new Date().toISOString()

    };

    issues.unshift(newIssue);

    saveIssues();

    // Reset filters so the new issue is visible
    searchInput.value = "";
    statusFilter.value = "All";
    priorityFilter.value = "All";

    displayIssues();

    issueForm.reset();

    alert("Your issue has been submitted successfully!");

});

// ========================================
// Search and Filter Events
// ========================================

searchInput.addEventListener("input", displayIssues);

statusFilter.addEventListener("change", displayIssues);

priorityFilter.addEventListener("change", displayIssues);

// ========================================
// Load Issues When Page Opens
// ========================================

displayIssues();