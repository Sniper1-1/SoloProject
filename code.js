const API_BASE = "./backend/api.php";


/* Paging */
let currentPage = 1;
let pageSize = parseInt(getCookie("pageSize")) || 10;
document.getElementById("entriesPerPage").value = pageSize;
let totalRecords = 0;
document.getElementById("entriesPerPage").addEventListener("change", (e) => {
    pageSize = parseInt(e.target.value);
    setCookie("pageSize", pageSize, 30);
    loadAssignments(1);
});


/* Button handling */
const addBtn = document.getElementById("addBtn");
addBtn.addEventListener("click", () => {
    //clear the popup for entering an entry so that it doesn't open with last values
    form.reset();
    editId = null;

    document.getElementById("modalOverlay").style.display = "flex";
});

/* Data */
let assignments = [];
let editId = null;

const tableBody = document.getElementById("assignments");

/* INITIAL LOAD */
document.addEventListener("DOMContentLoaded", () => loadAssignments(currentPage));

async function loadAssignments(page = 1) {
    try {
        const res = await fetch(
            `${API_BASE}?page=${page}&limit=${pageSize}&search=${encodeURIComponent(searchTerm)}&sort=${sortField}&direction=${sortDirection}`
        );

        const result = await res.json();

        assignments = result.data;
        totalRecords = result.total;
        currentPage = result.page;

        renderTable();
        renderPagingControls();
        updateSortIndicators();

    } catch (err) {
        console.error("Failed to load assignments", err);
    }
}

/* Form handling */
const form = document.getElementById("assignmentForm");
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const payload = {
        course: document.getElementById("course").value.trim(),
        name: document.getElementById("assignmentName").value.trim(),
        dueDate: document.getElementById("dueDate").value,
        status: document.getElementById("status").value,
        imageUrl: document.getElementById("imageUrl").value.trim()
    };


    try {
        if (editId === null) {
            // CREATE
            await fetch(API_BASE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const newTotal = totalRecords + 1;
            const lastPage = Math.ceil(newTotal / pageSize);
            await loadAssignments(lastPage);

        } else {
            // UPDATE
            await fetch(`${API_BASE}/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            editId = null;
            await loadAssignments(currentPage);
        }
        modalOverlay.style.display = "none";

    } catch (err) {
        console.error("Save failed", err);
    }
});

/* Modal close */
const modalOverlay = document.getElementById("modalOverlay");
modalOverlay.addEventListener("click", e => {
    if (e.target === modalOverlay) {
        modalOverlay.style.display = "none";
        editId = null;
    }
});

/* Render table */
function renderTable() {
    tableBody.innerHTML = "";

    assignments.forEach(assignment => {
        const row = document.createElement("tr");
        // dueDate is blank if not provided
        row.innerHTML = `
            <td>${assignment.id}</td>
            <td>${assignment.course}</td>
            <td>${assignment.name}</td>
            <td>${assignment.dueDate || ""}</td>
            <td>${assignment.status}</td>
            
            <td>
            <img 
                src="${assignment.imageUrl || 'images/placeholder.png'}"
                alt="Assignment Image"
                class="thumb"
                onerror="this.src='images/placeholder.png';"
                >
            </td>

            <td>
                <button class="updateBtn" data-id="${assignment.id}">Edit</button>
                <button class="deleteBtn" data-id="${assignment.id}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    attachButtonHandlers();
}

/* Edit/Delete buttons */
function attachButtonHandlers() {
    // Edit button handlers
    document.querySelectorAll(".updateBtn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const assignment = assignments.find(a => a.id == id);

            course.value = assignment.course;
            assignmentName.value = assignment.name;
            dueDate.value = assignment.dueDate;
            document.getElementById("status").value = assignment.status; // < uses getElementById instead of status.value because status is a deprecated reserved word. Wasn't breaking, but wasn't exactly working.
            imageUrl.value = assignment.imageUrl || "";

            editId = id;
            modalOverlay.style.display = "flex";
        });
    });

    // Delete button handlers
    document.querySelectorAll(".deleteBtn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            if (confirm("Delete this assignment?")) {
                try {
                    await fetch(`${API_BASE}/${id}`, { method: "DELETE" });

                    // If page becomes empty, move back one page
                    if (assignments.length === 1 && currentPage > 1) {
                        currentPage--;
                    }

                    await loadAssignments(currentPage);
                } catch (err) {
                    console.error("Delete failed", err);
                }
            }
        });
    });
}

/* Paging controls */
const pagingDiv = document.getElementById("paging");
function renderPagingControls() {
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

    // Update values
    document.getElementById("pageInput").value = currentPage;
    document.getElementById("pageInput").max = totalPages;
    document.getElementById("pageTotal").textContent = `of ${totalPages}`;

    // Enable / disable buttons
    document.getElementById("firstPage").disabled = currentPage === 1;
    document.getElementById("prevPage").disabled = currentPage === 1;
    document.getElementById("nextPage").disabled = currentPage === totalPages;
    document.getElementById("lastPage").disabled = currentPage === totalPages;
}
//paging button handlers
document.getElementById("firstPage").addEventListener("click", () => {
    loadAssignments(1);
});

document.getElementById("prevPage").addEventListener("click", () => {
    loadAssignments(currentPage - 1);
});

document.getElementById("nextPage").addEventListener("click", () => {
    loadAssignments(currentPage + 1);
});

document.getElementById("lastPage").addEventListener("click", () => {
    const lastPage = Math.ceil(totalRecords / pageSize);
    loadAssignments(lastPage);
});

// text box page number input
const pageInput = document.getElementById("pageInput");
//jump to page on enter
pageInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        jumpToPage();
    }
});
//jump to page on deselect text box
pageInput.addEventListener("blur", jumpToPage);

function jumpToPage() {
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    let page = parseInt(pageInput.value, 10);

    if (isNaN(page)) {
        pageInput.value = currentPage;
        return;
    }

    page = Math.max(1, Math.min(page, totalPages));
    loadAssignments(page);
}


/* Statistics */
const viewToggle = document.getElementById("viewToggle");
viewToggle.addEventListener("change", () => {
    const statsDiv = document.getElementById("statistics");
    const tableDiv = document.getElementById("assignmentsTable");
    const controlsDiv = document.querySelector(".controls");


    if (viewToggle.checked) {
        tableDiv.style.display = "none";
        addBtn.style.display = "none";
        pagingDiv.style.display = "none";
        addTestEntriesBtn.style.display = "none";
        purgeBtn.style.display = "none";
        statsDiv.style.display = "block";
        pageHeader.textContent = "Assignment Statistics";
        controlsDiv.style.display = "none";
        renderStatistics();
    } else {
        statsDiv.style.display = "none";
        addBtn.style.display = "inline-block";
        pagingDiv.style.display = "block";
        tableDiv.style.display = "table";
        addTestEntriesBtn.style.display = "inline-block";
        purgeBtn.style.display = "inline-block";
        pageHeader.textContent = "Course Assignments List";
        controlsDiv.style.display = "block";
    }
});


async function renderStatistics() {
    try {
        const res = await fetch(`${API_BASE}?stats=1`);
        const stats = await res.json();

        document.getElementById("totalAssignments").textContent =
            `Total Assignments: ${stats.total}`;

        document.getElementById("completedAssignments").textContent =
            `Completed Assignments: ${stats.completed}`;

        document.getElementById("inProgressAssignments").textContent =
            `In Progress Assignments: ${stats.inProgress}`;

        document.getElementById("notStartedAssignments").textContent =
            `Not Started Assignments: ${stats.notStarted}`;

        document.getElementById("numOfAssignmentsPerPage").textContent =
            `Number of Assignments Per Page: ${pageSize}`;

    } catch (err) {
        console.error("Failed to load statistics", err);
    }
}


// Search functionality
let searchTerm = "";
let sortField = "id";
let sortDirection = "ASC";

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", () => {
    searchTerm = searchInput.value.trim();
    loadAssignments(1); // reset to page 1
});
// Sorting functionality
document.querySelectorAll("th[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
        const field = th.dataset.sort;

        if (sortField === field) {
            sortDirection = sortDirection === "ASC" ? "DESC" : "ASC";
        } else {
            sortField = field;
            sortDirection = "ASC";
        }

        loadAssignments(1);
    });
});
function updateSortIndicators() {
    document.querySelectorAll("th[data-sort]").forEach(th => {
        th.classList.remove("sorted-asc", "sorted-desc");
    });

    const activeTh = document.querySelector(`th[data-sort="${sortField}"]`);
    if (activeTh) {
        activeTh.classList.add(
            sortDirection === "ASC" ? "sorted-asc" : "sorted-desc"
        );
    }
}



// Cookies
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days*864e5).toUTCString();
    document.cookie = name + "=" + value + "; expires=" + expires + "; path=/";
}

function getCookie(name) {
    return document.cookie.split("; ").reduce((r, v) => {
        const parts = v.split("=");
        return parts[0] === name ? parts[1] : r
    }, "");
}
