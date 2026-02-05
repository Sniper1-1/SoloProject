const API_BASE = "http://localhost/SoloProject/backend/api.php";

/* Paging */
let currentPage = 1;
const pageSize = 10;
let totalRecords = 0;

/* Button handling */
const addBtn = document.getElementById("addBtn");
addBtn.addEventListener("click", () => {
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
        const res = await fetch(`${API_BASE}?page=${page}&limit=${pageSize}`);
        const result = await res.json();

        assignments = result.data;
        totalRecords = result.total;
        currentPage = result.page;

        renderTable();
        renderPagingControls();

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
        assignmentStatus: document.getElementById("assignmentStatus").value
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
        //clear and close the popup for entering an entry
        form.reset();
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
        row.innerHTML = `
            <td>${assignment.id}</td>
            <td>${assignment.course}</td>
            <td>${assignment.name}</td>
            <td>${assignment.dueDate}</td>
            <td>${assignment.assignmentStatus}</td>
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
            assignmentStatus.value = assignment.assignmentStatus;

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

    if (viewToggle.checked) {
        tableDiv.style.display = "none";
        addBtn.style.display = "none";
        pagingDiv.style.display = "none";
        addTestEntriesBtn.style.display = "none";
        purgeBtn.style.display = "none";
        statsDiv.style.display = "block";
        pageHeader.textContent = "Assignment Statistics";
        renderStatistics();
    } else {
        statsDiv.style.display = "none";
        addBtn.style.display = "inline-block";
        pagingDiv.style.display = "block";
        tableDiv.style.display = "table";
        addTestEntriesBtn.style.display = "inline-block";
        purgeBtn.style.display = "inline-block";
        pageHeader.textContent = "Course Assignments List";
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

    } catch (err) {
        console.error("Failed to load statistics", err);
    }
}
