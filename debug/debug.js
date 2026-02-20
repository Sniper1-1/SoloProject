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
async function fillTestData() {
    for (let i = 0; i < numberOfTestEntries; i++) {

        const course = departments[Math.floor(Math.random() * departments.length)] + 
                       " " + numers[Math.floor(Math.random() * numers.length)];

        const name = names[Math.floor(Math.random() * names.length)];

        const dueDate = new Date(
            Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
        ).toISOString().split('T')[0];

        const statusOptions = ["Not Started", "In Progress", "Completed"];
        const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];

        const imageurl = await getRandomImageUrl();

        document.getElementById("course").value = course;
        document.getElementById("assignmentName").value = name;
        document.getElementById("dueDate").value = dueDate;
        document.getElementById("status").value = status;
        document.getElementById("imageUrl").value = imageurl;

        form.dispatchEvent(new Event('submit'));

        await new Promise(resolve => setTimeout(resolve, 200)); // small delay
    }
}


function getRandomImageUrl() {
    //random num between 1 and 2
    const randomNum = Math.floor(Math.random() * 2) + 1;
    if (randomNum === 1) { //get url from get request to https://api.thecatapi.com/v1/images/search
        return fetch("https://api.thecatapi.com/v1/images/search")
            .then(response => response.json())
            .then(data => data[0].url)
            .catch(() => "images/placeholder.png"); // Fallback to placeholder if API call fails
    }
    else{ //get url from get request to https://dog.ceo/api/breeds/image/random
        return fetch("https://dog.ceo/api/breeds/image/random")
            .then(response => response.json())
            .then(data => data.message)
            .catch(() => "images/placeholder.png"); // Fallback to placeholder if API call fails
    }
}