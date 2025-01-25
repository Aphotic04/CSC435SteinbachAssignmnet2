//Calls function to ensure the base reference ID stored is healthy
checkBaseId();

//Resets the Id of the task clicked
var clickedTaskId = "-1";

//Vars for DOM Elements for more streamlined code
var formSection = document.getElementById('form');
var form = document.getElementById('editForm');
var formId = document.getElementById('numId');
var formTitle = document.getElementById('txtTitle');
var formDescription = document.getElementById('txaDescription');
var formTracking = document.getElementById('txtTracking');

var formConfirm = document.getElementById('btnConfirm');
var formCancel = document.getElementById('btnCancel');

var pendingLow = document.getElementById('pendingLow');
var pendingMid = document.getElementById('pendingMid');
var pendingHigh = document.getElementById('pendingHigh');
var inProgressLow = document.getElementById('inProgressLow');
var inProgressMid = document.getElementById('inProgressMid');
var inProgressHigh = document.getElementById('inProgressHigh');
var finishedLow = document.getElementById('finishedLow');
var finishedMid = document.getElementById('finishedMid');
var finishedHigh = document.getElementById('finishedHigh');

//Task class
class Task {
    constructor(title, description, priority, tracking, assignNewId, id) {
        //Ensures an ID increment and copy from local storage only when assignNewId is true
        if (assignNewId) {
            this.id = parseInt(localStorage.getItem('taskId') || "0");
            localStorage.setItem('taskId', this.id + 1);
        }
        else {
            this.id = id;
        }
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.tracking = tracking;
    }

    //Setters and getters
    setTitle(title) {
        this.title = title;
    }
    
    getTitle() {
        return this.title;
    }

    setDescription(description) {
        this.description = description;
    }

    getDescription() {
        return this.description;
    }

    setPriority(priority) {
        this.priority = priority;
    }

    getPriority() {
        return this.priority;
    }

    setId(id) {
        this.id = id;
    }

    getId() {
        return this.id;
    }

    setTracking(tracking) {
        this.tracking = tracking;
    }

    getTracking() {
        return this.tracking;
    }
}

/**
 * Takes Object storing Task objects from local storage and turns it parses it into workable task object.
 * @returns {Object} - Storing Task objects with their ID's as keys.
 * @throws {Error} - Caught error if the tasks don't load from local storage.
 */
function loadTasks() {
    try {
        //Takes and parses Object storing task data
        const savedTasks = JSON.parse(localStorage.getItem('taskArray')) || {};
        const tasks = {};

        for (const id in savedTasks) {
            //Creates an actual Task object out of Object with task data
            const taskData = savedTasks[id];
            const restoredTask = new Task(taskData.title, taskData.description, taskData.priority, taskData.tracking, false, taskData.id);
            
            //Restore the original ID
            restoredTask.id = taskData.id; 
            tasks[id] = restoredTask;

            //Add Task
            addTask(restoredTask); 
        }

        return tasks;
    } catch (error) {
        console.error("Error loading tasks:", error);
        return {};
    }
}


var taskArray = loadTasks();

/**
 * Validates the base Task ID to increment from to ensure it is a number.
 */
function checkBaseId() {
    if(isNaN(localStorage.getItem('taskId'))) {
        localStorage.removeItem('taskId');
        localStorage.setItem('taskId', 0);
    }
}

/**
 * Takes a Task and creates an element for it, and appends that element to its respective area.
 * @param {Task} newTask - The Task to add to the display.
 */
function addTask(newTask) {
    //Cretes and sets up new Task DOM element
    let newTaskElement = document.createElement("div");
    newTaskElement.id = newTask.getId();
    newTaskElement.classList.add("task");
    newTaskElement.innerText = newTask.getTitle();

    //Adds appropriate event listeners to the element
    newTaskElement.addEventListener("dblclick", () => displayEdit(newTask));
    newTaskElement.addEventListener("click", () => clickTask(newTaskElement, newTask));

    //Decides where the element will be placed based on priority and tracking
    let target;
    switch (newTask.getPriority()) {
        case 'mid' : {
            newTaskElement.style.backgroundColor = "lightyellow";
            switch(newTask.getTracking()) {
                case "inProgress" : target = inProgressMid;
                break;

                case "finished" : target = finishedMid;
                break;

                default : target = pendingMid;
            }
        };
        break;
        case 'high' : {
            newTaskElement.style.backgroundColor = "lightpink";
            switch(newTask.getTracking()) {
                case "inProgress" : target = inProgressHigh;
                break;

                case "finished" : target = finishedHigh;
                break;

                default : target = pendingHigh;
            }
        };
        break;
        default : {
            newTaskElement.style.backgroundColor = "lightgreen";
            switch(newTask.getTracking()) {
                case "inProgress" : target = inProgressLow;
                break;

                case "finished" : target = finishedLow;
                break;

                default : target = pendingLow;
            }
        };
        break;
    }

    //Appends based on above choice
    target.appendChild(newTaskElement);
}

/**
 * Removes the task that is clicked.
 */
function removeTask() {
    //If there is a selected element, remove the Task from the array and the DOM
    if (clickedTaskId != "-1") {
        delete taskArray[clickedTaskId];
        saveArray();
        document.getElementById(clickedTaskId).remove(); 
        clickedTaskId = "-1";
    }
    else {
        console.log("No Task Selected to Remove");
    }
}

/**
 * Displays the form for editing a Task.
 * @param {Task} task - The Task to base the input values on.
 */
function displayEdit(task) {
    //Displays form and ensures the values are based on the values of the Task passed through parameter
    document.getElementById('form').style.visibility = "visible";
    formId.value = task.getId();
    formTitle.value = task.getTitle();
    formDescription.value = task.getDescription();
    formTracking.value = task.getTracking();
    switch (task.getPriority()) {
        case 'mid' : document.getElementById("midPriority").checked = true;
        break;
        case 'high' : document.getElementById("highPriority").checked = true;
        break;
        default : document.getElementById("lowPriority").checked = true;
        break;
    }
    
}

/**
 * Edits the editing Task to the values entered in inputs.
 */
function editTask() {
    //Creates new Task and sets values based on input values
    let task = new Task(" ", " ", " ", 'pending', false, 0);
    task.setTitle(formTitle.value);
    task.setDescription(formDescription.value);
    task.setPriority(document.querySelector('input[name="optPriority"]:checked').value);
    task.setId(formId.value);
    task.setTracking(formTracking.value);

    //Re-render the updated task
    const taskElement = document.getElementById(task.getId());
    //Remove old element
    if (taskElement) taskElement.remove(); 
    //Re-add updated element
    addTask(task); 

    //Replace previous task in array
    taskArray[task.getId()] = task;

    //Save array
    saveArray();
}

/**
 * Saves all Tasks to local storage.
 */
function saveArray() {
    console.log("Saving taskArray to localStorage:", taskArray);
    localStorage.setItem("taskArray", JSON.stringify(taskArray));
}

/**
 * Handles the CSS and setting the clickedTaskId for a Task that is clicked.
 * @param {Element} taskElement - The Task element clicked.
 * @param {Task} task - The Task of the Task element clicked.
 */
function clickTask(taskElement, task) {
    //If there was a previously clicked task, change background color back to original
    if (clickedTaskId != "-1") {
        let prevClickTask = Object.assign(new Task("New Task"," ","low", "pending" ,false, 0), taskArray[clickedTaskId]);
        let prevClickTaskEl = document.getElementById(clickedTaskId);
        switch (prevClickTask.getPriority()) {
            case "mid" : prevClickTaskEl.style.backgroundColor = "lightyellow";
            break;
            case "high" : prevClickTaskEl.style.backgroundColor = "lightpink";
            break;
            default : prevClickTaskEl.style.backgroundColor = "lightgreen";
            break;
        }
    }
    //Otherwise, set clicked task to darker color 
    switch (task.getPriority()) {
        case "mid" : taskElement.style.backgroundColor = "rgb(255, 255, 81)";
        break;
        case "high" : taskElement.style.backgroundColor = "rgb(255, 97, 97)";
        break;
        default : taskElement.style.backgroundColor = "rgb(59, 177, 59)";
        break;
    }
    //Set ID of currently clicked task
    clickedTaskId = taskElement.id;
}

/**
 * Moves the currently clicked Task over to the In Progress tracking section.
 */
function startTask() {
    //Makes new Task with tracking value at inProgress, otherwise copies other values
    let oldTask = taskArray[clickedTaskId];
    let task = new Task(" ", " ", " ", 'inProgress', false, 0);
    task.setTitle(oldTask.title);
    task.setDescription(oldTask.description);
    task.setPriority(oldTask.priority);
    task.setId(oldTask.id);

    //Re-render the updated task
    const taskElement = document.getElementById(task.getId());
    //Remove old element
    if (taskElement) taskElement.remove(); 
    //Re-add updated element
    addTask(task); 

    //Replace previous task in array
    taskArray[task.getId()] = task;

    //Save array
    saveArray();
}

/**
 * Moves the currently clicked Task over to the Finished tracking section.
 */
function finishTask() {
    //Makes new Task with tracking value at finished, otherwise copies other values
    let oldTask = taskArray[clickedTaskId];
    let task = new Task(" ", " ", " ", 'finished', false, 0);
    task.setTitle(oldTask.title);
    task.setDescription(oldTask.description);
    task.setPriority(oldTask.priority);
    task.setId(oldTask.id);

    //Re-render the updated task
    const taskElement = document.getElementById(task.getId());
    //Remove old element
    if (taskElement) taskElement.remove();
    //Re-add updated element
    addTask(task);

    //Replace previous task in array
    taskArray[task.getId()] = task;

    //Save array
    saveArray();
}

/**
 * Moves the currently clicked Task over to the Pending tracking section.
 */
function revertTask() {
    //Makes new Task with tracking value at pending, otherwise copies other values
    let oldTask = taskArray[clickedTaskId];
    let task = new Task(" ", " ", " ", 'pending', false, 0);
    task.setTitle(oldTask.title);
    task.setDescription(oldTask.description);
    task.setPriority(oldTask.priority);
    task.setId(oldTask.id);

    //Re-render the updated task
    const taskElement = document.getElementById(task.getId());
    //Remove old element
    if (taskElement) taskElement.remove(); 
    //Re-add updated element
    addTask(task);

    //Replace previous task in array
    taskArray[task.getId()] = task;

    //Save array
    saveArray();
}

//Event listener for pressing 'Add', which adds a new blank task
document.getElementById('btnAdd').addEventListener("click", (event) => {
    const newTask = new Task("New Task"," ","low", "pending" ,true, 0);
    taskArray[newTask.getId()] = newTask;
    saveArray();
    addTask(newTask);
});

//Event listener for clicking 'Remove' which calls the removeTask function
document.getElementById('btnRemove').addEventListener("click", removeTask);

//Event listener for clicking 'Start Task' which calls the startTask function
document.getElementById('btnStart').addEventListener('click', startTask);

//Event listener for clicking 'Finish' which calls the finishTask function
document.getElementById('btnFinish').addEventListener('click', finishTask);

//Event listener for clicking 'Revert' which calls the revertTask function
document.getElementById('btnRevert').addEventListener('click', revertTask);



//Event listener for clicking the 'Confirm' or 'Cancel' buttons on the edit form
form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (event.submitter.value == 'confirm') {
        editTask();
        formSection.style.visibility = "hidden";
    }
    else {
        formSection.style.visibility = "hidden";
    }
    console.log('You pressed', event.submitter.value);
});
window.addEventListener("onunload", saveArray());

