const API_BASE = "http://localhost/SoloProject/backend/api.php";

/* Button handling */
const addBtn = document.getElementById("addBtn");
addBtn.addEventListener("click", () => {
    document.getElementById("modalOverlay").style.display = "flex";
});

/* Data */
let assignments = [];
let editId = null;
let isInitialLoad = true; // Flag to check if it's the initial page load

const tableBody = document.getElementById("assignments");

/* INITIAL LOAD */
document.addEventListener("DOMContentLoaded", loadAssignments);

async function loadAssignments() {
    try {
        const res = await fetch(API_BASE);
        assignments = await res.json();
        renderTable();
        
        // Auto-fill with test data only on initial page load if empty
        if (isInitialLoad && assignments.length === 0) {
            fillTestData();
        }
        isInitialLoad = false;
    } catch (err) {
        console.error("Failed to load assignments", err);
    }
}

/* Form handling */
const form = document.getElementById("assignmentForm");
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const payload = {
        course: document.getElementById("course").value,
        name: document.getElementById("assignmentName").value,
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
        } else {
            // UPDATE
            await fetch(`${API_BASE}/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            editId = null;
        }

        await loadAssignments();
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
            const assignment = assignments.find(x => x.id == id);

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
            if (confirm("Delete this assignment?")){
                try {
                    await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
                    await loadAssignments();
                } catch (err) {
                    console.error("Delete failed", err);
                }
            }           
        });
    });
}

/* Statistics */
const viewToggle = document.getElementById("viewToggle");
viewToggle.addEventListener("change", () => {
    const statsDiv = document.getElementById("statistics");
    const tableDiv = document.getElementById("assignmentsTable");
    
    if (viewToggle.checked) {
        tableDiv.style.display = "none";
        statsDiv.style.display = "block";
        renderStatistics();
    } else {
        statsDiv.style.display = "none";
        tableDiv.style.display = "table";
    }
});

function renderStatistics() {
    document.getElementById("totalAssignments").textContent =
        `Total Assignments: ${assignments.length}`;

    document.getElementById("completedAssignments").textContent =
        `Completed Assignments: ${assignments.filter(a => a.status === "Completed").length}`;

    document.getElementById("inProgressAssignments").textContent =
        `In Progress Assignments: ${assignments.filter(a => a.status === "In Progress").length}`;

    document.getElementById("notStartedAssignments").textContent =
        `Not Started Assignments: ${assignments.filter(a => a.status === "Not Started").length}`;
}
