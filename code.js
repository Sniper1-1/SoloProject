/*Button handling*/
const addBtn = document.getElementById("addBtn");
const updateBtn = document.getElementById("updateBtn");
const deleteBtn = document.getElementById("deleteBtn");

addBtn.addEventListener("click", function() {
    // Code to add a new assignment
    console.log("Add button clicked");
    form.style.display = "block";
});

updateBtn.addEventListener("click", function() {
    // Code to update an existing assignment
    console.log("Update button clicked");
});
deleteBtn.addEventListener("click", function() {
    // Code to delete an assignment
    console.log("Delete button clicked");
});

/*Data handling*/
let assignments = [];
let nextId=0;
const tableBody = document.getElementById("assignments");


function addAssignment(newAssignment) {
    assignments.push(newAssignment);
    tableBody.innerHTML = ""; // clear table so that rows are not duplicated on subsequent adds

    assignments.forEach(assignment => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${assignment.id}</td>
            <td>${assignment.course}</td>
            <td>${assignment.name}</td>
            <td>${assignment.dueDate}</td>
            <td>${assignment.status}</td>
        `;

        tableBody.appendChild(row);
    });

    console.log("Assignment added:", newAssignment);
}

const form = document.getElementById("assignmentForm");
form.addEventListener("submit", function(event) {
    event.preventDefault();
    const course = document.getElementById("course").value;
    const assignmentName = document.getElementById("assignmentName").value;
    const dueDate = document.getElementById("dueDate").value;
    const status = document.getElementById("status").value;

    const newAssignment = {
        id: nextId++,
        course: course,
        name: assignmentName,
        dueDate: dueDate,
        status: status
    };
    addAssignment(newAssignment);

    form.reset();
    form.style.display = "none";
});
