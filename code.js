/*Button handling*/
const addBtn = document.getElementById("addBtn");

addBtn.addEventListener("click", function() {
    // Code to add a new assignment
    console.log("Add button clicked");
    document.getElementById("modalOverlay").style.display = "flex";
});

/*Data handling and initialization*/
let assignments = [];
let id=0;
let editIndex = null;
const tableBody = document.getElementById("assignments");
// Load assignments from localStorage if available
const savedAssignments = localStorage.getItem("assignments");
const savedIdCounter = localStorage.getItem("idCounter");

if (savedAssignments) {
    assignments = JSON.parse(savedAssignments);
}
if (savedIdCounter) {
    id = parseInt(savedIdCounter);
}
renderTable();

/*Form handling*/
const form = document.getElementById("assignmentForm");
form.addEventListener("submit", function(event) {
    event.preventDefault();
    const course = document.getElementById("course").value;
    const assignmentName = document.getElementById("assignmentName").value;
    const dueDate = document.getElementById("dueDate").value;
    const status = document.getElementById("status").value;

    if(editIndex==null){
        const newAssignment = {
        id: id,
        course: course,
        name: assignmentName,
        dueDate: dueDate,
        status: status
        };
        assignments.push(newAssignment);
        id++; // Increment ID for next assignment
        console.log("Added a new assignment: ", newAssignment);
    }
    else{ //editing existing assignment
        const currentId=assignments[editIndex].id;
        assignments[editIndex]={
            id: currentId,
            course: course,
            name: assignmentName,
            dueDate: dueDate,
            status: status
        };
        editIndex=null;
    }

    renderTable();
    form.reset();
    document.getElementById("modalOverlay").style.display = "none";
    saveAssignments();
});

const modalOverlay = document.getElementById("modalOverlay");
modalOverlay.addEventListener("click", e => {
    if (e.target === modalOverlay) {
        modalOverlay.style.display = "none";
    }
});

/*Render table*/
function renderTable() {
    tableBody.innerHTML = ""; // clear table so that rows are not duplicated on subsequent adds

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
/*Attach button handlers for edit and delete buttons*/
function attachButtonHandlers() {
    const updateButtons = document.querySelectorAll(".updateBtn");
    const deleteButtons = document.querySelectorAll(".deleteBtn");

    updateButtons.forEach(button => {
        button.addEventListener("click", function() {
            const id = Number(this.dataset.id);
            const index = assignments.findIndex(a => a.id === id);
            document.getElementById("course").value = assignments[index].course;
            document.getElementById("assignmentName").value = assignments[index].name;
            document.getElementById("dueDate").value = assignments[index].dueDate;
            document.getElementById("status").value = assignments[index].status;
            editIndex = assignments.findIndex(a => a.id === id);
            document.getElementById("modalOverlay").style.display = "flex";
        });
    });
    deleteButtons.forEach(button => {
        button.addEventListener("click", function() {
            const id = Number(this.dataset.id);
            const index = assignments.findIndex(a => a.id === id);
            if(confirm("Are you sure you want to delete this assignment?")) {                
                console.log("Deleted assignment: ", assignments[index]);
                assignments.splice(index, 1);
                renderTable();
                saveAssignments();
            }
        });
    });
}

/*Saving*/
function saveAssignments() {
    localStorage.setItem("assignments", JSON.stringify(assignments));
    localStorage.setItem("idCounter", id);
}

/*Toggle view between assignments and statistics*/
const viewToggle = document.getElementById("viewToggle");
const assignmentsTable = document.getElementById("assignmentsTable");
const statisticsDiv = document.getElementById("statistics");
viewToggle.addEventListener("change", function() {
    if (this.checked) {
        // Show statistics view
        console.log("Switched to statistics view");
        addBtn.style.display = "none";
        assignmentsTable.style.display = "none";
        statisticsDiv.style.display = "block";
        purgeBtn.style.display = "none";
        addTestEntriesBtn.style.display = "none";

        renderStatistics();

    } else {
        // Show assignments view
        console.log("Switched to assignments view");
        addBtn.style.display = "inline-block";
        assignmentsTable.style.display = "table";
        statisticsDiv.style.display = "none";
        purgeBtn.style.display = "inline-block";
        addTestEntriesBtn.style.display = "inline-block";
        
    }
});
function renderStatistics() {
    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter(a => a.status === "Completed").length;
    const inProgressAssignments = assignments.filter(a => a.status === "In Progress").length;
    const notStartedAssignments = assignments.filter(a => a.status === "Not Started").length;
    document.getElementById("totalAssignments").textContent = `Total Assignments: ${totalAssignments}`;
    document.getElementById("completedAssignments").textContent = `Completed Assignments: ${completedAssignments}`;
    document.getElementById("inProgressAssignments").textContent = `In Progress Assignments: ${inProgressAssignments}`;
    document.getElementById("notStartedAssignments").textContent = `Not Started Assignments: ${notStartedAssignments}`;
}