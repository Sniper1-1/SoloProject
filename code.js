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
        status: document.getElementById("status").value
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
            <td>${assignment.status}</td>
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
            status.value = assignment.status;

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
    if (!pagingDiv) return;

    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

    // the pagging controls
    pagingDiv.innerHTML = `
        <button ${currentPage === 1 ? "disabled" : ""} id="firstPage" aria-label="First page">
            &lt;&lt;
        </button>
        <button ${currentPage === 1 ? "disabled" : ""} id="prevPage" aria-label="Previous page">
            &lt;
        </button>
        
        <label style="margin: 0 8px;">
            Page
            <input
                type="number"
                id="pageInput"
                min="1"
                max="${totalPages}"
                value="${currentPage}"
                style="width: 30px; text-align: center;"
            >
            of ${totalPages}
        </label>

        <button ${currentPage === totalPages ? "disabled" : ""} id="nextPage" aria-label="Next page">
            &gt;
        </button>
        <button ${currentPage === totalPages ? "disabled" : ""} id="lastPage" aria-label="Last page">
            &gt;&gt;
        </button>
    `;


    document.getElementById("firstPage")?.addEventListener("click", () => {
        loadAssignments(1);
    });
    document.getElementById("prevPage")?.addEventListener("click", () => {
        loadAssignments(currentPage - 1);
    });

    document.getElementById("nextPage")?.addEventListener("click", () => {
        loadAssignments(currentPage + 1);
    });
    document.getElementById("lastPage")?.addEventListener("click", () => {
        const lastPage = Math.ceil(totalRecords / pageSize);
        loadAssignments(lastPage);
    });

    const pageInput = document.getElementById("pageInput");

    // enter a page number handler
    pageInput.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            let page = parseInt(pageInput.value, 10);

            if (isNaN(page)) return;

            page = Math.max(1, Math.min(page, totalPages));
            loadAssignments(page);
        }
    });

    // click outside page number input handler
    pageInput.addEventListener("blur", () => {
        let page = parseInt(pageInput.value, 10);

        if (isNaN(page)) {
            pageInput.value = currentPage;
            return;
        }

        page = Math.max(1, Math.min(page, totalPages));
        loadAssignments(page);
    });

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
        statsDiv.style.display = "block";
        pageHeader.textContent = "Assignment Statistics";
        renderStatistics();
    } else {
        statsDiv.style.display = "none";
        addBtn.style.display = "inline-block";
        pagingDiv.style.display = "block";
        tableDiv.style.display = "table";
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
