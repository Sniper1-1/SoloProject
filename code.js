/*Button handling*/
const addBtn = document.getElementById("addBtn");

addBtn.addEventListener("click", function() {
    // Code to add a new assignment
    console.log("Add button clicked");
    form.style.display = "block";
});

/*Data handling*/
let assignments = [];
let id=0;
let editIndex = null;
const tableBody = document.getElementById("assignments");



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
    form.style.display = "none";
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

function attachButtonHandlers() {
    const editButtons = document.querySelectorAll(".editBtn");
    const deleteButtons = document.querySelectorAll(".deleteBtn");

    editButtons.forEach(button => {
        button.addEventListener("click", function() {
            const id = Number(this.dataset.id);
            const index = assignments.findIndex(a => a.id === id);
            document.getElementById("course").value = assignments[index].course;
            document.getElementById("assignmentName").value = assignments[index].name;
            document.getElementById("dueDate").value = assignments[index].dueDate;
            document.getElementById("status").value = assignments[index].status;
            editIndex = assignments.findIndex(a => a.id === id);
            form.style.display = "block";
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
            }
        });
    });
}