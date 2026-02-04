Folder name: SoloProject <br>
Local URL: http://localhost/SoloProject/
Netlify URL: https://jchookecpsc3750soloproject.netlify.app/

Backend language: PHP <br>
JSON Persistence explanation: Every entry is stored as follows:
```
{
    "course": "course name",
    "name": "assignment name",
    "dueDate": "YYYY-MM-DD",
    "status": "Not Started/In Progress/Completed",
    "id": unique integer identifier
}
```
The Javascript code is invoked via things like buttons, which then calls the PHP backend to interact with the JSON file for creating a new entry, reading entries, updating entries, and deleting entries. Reloading the page will maintain the data in the table as it is stored in the json file on the server in the backend and not the browser. <br>

Credit to w3schools.com and ChatGPT for some help on how to do stuff/formatting and debugging.

