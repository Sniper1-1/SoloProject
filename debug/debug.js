/*Purge local storage and table*/
const purgeBtn = document.getElementById("purgeBtn");
purgeBtn.addEventListener("click", async function() {
    if (confirm("Are you sure you want to purge all saved assignments and reset the saved table? This action cannot be undone.")) {
        // Delete all assignments from the API
        await fetch(API_BASE, { method: "DELETE" });
        // Reload assignments to update the table
        await loadAssignments();
        alert("All saved assignments have been purged.");
    }
});

/*Randomly fill table for testing*/
const departments=["ENGL", "CPSC", "MATH", "HIST", "BIO", "CHEM", "PHYS", "ECON"];
const numers=["1010","1020","1030","2010","2020","2030","3010","3020","3040"];
const names=["Report","Lab","Project","Presentation","Exam studyguide","Homework"];

const numberOfTestEntries = 30;
const addTestEntriesBtn = document.getElementById("addTestEntriesBtn");
addTestEntriesBtn.addEventListener("click", function() {
    if (confirm(`This will add ${numberOfTestEntries} random test entries to the table. Proceed?`)) {
        fillTestData();
    }
});
function fillTestData() {
    for (let i = 0; i < numberOfTestEntries; i++) {
        setTimeout(() => { // Use setTimeout to space out the requests because running it async seemed to cause requests to overlap and error
            const course = departments[Math.floor(Math.random() * departments.length)] + " " + numers[Math.floor(Math.random() * numers.length)];
            const name = names[Math.floor(Math.random() * names.length)];
            const dueDate = new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const statusOptions = ["Not Started", "In Progress", "Completed"];
            const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
            
            document.getElementById("course").value = course;
            document.getElementById("assignmentName").value = name;
            document.getElementById("dueDate").value = dueDate;
            document.getElementById("status").value = status;

            form.dispatchEvent(new Event('submit'));
        }, i * 50); // 50ms interval between requests (i*50 is because without it they all queue and run at 50ms togther)
    }
}