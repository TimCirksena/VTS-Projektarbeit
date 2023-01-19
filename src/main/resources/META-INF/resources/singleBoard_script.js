// noinspection BadExpressionStatementJS

let dragged;
var id = 2;

console.log("funzt")

function dragzone() {
    /* events fired on the draggable target */
    const sources = document.querySelectorAll(".draggable");
    sources.forEach(source => {
        source.addEventListener("drag", (event) => {
            console.log("dragging");
        });
        source.addEventListener("dragstart", (event) => {
            // store a ref. on the dragged elem
            dragged = event.target;
            // make it half transparent
            event.target.classList.add("dragging");
        });
        source.addEventListener("dragend", (event) => {
            // reset the transparency
            event.target.classList.remove("dragging");
        });
    })
    /* events fired on the drop targets */
    //const target = document.getElementById("droptarget");
    const listTargets = document.querySelectorAll(".dropzone");
    listTargets.forEach(target => {
        target.addEventListener("dragover", (event) => {
            // prevent default to allow drop
            event.preventDefault();
        }, false);
        target.addEventListener("dragenter", (event) => {
            // highlight potential drop target when the draggable element enters it
            if (event.target.classList.contains("dropzone")) {
                event.target.classList.add("dragover");
            }
        });
        target.addEventListener("dragleave", (event) => {
            // reset background of potential drop target when the draggable element leaves it
            if (event.target.classList.contains("dropzone")) {
                event.target.classList.remove("dragover");
            }
        });
        target.addEventListener("drop", (event) => {
            // prevent default action (open as link for some elements)
            event.preventDefault();
            // move dragged element to the selected drop target
            if (event.target.classList.contains("dropzone")) {
                event.target.classList.remove("dragover");
                event.target.appendChild(dragged);
            }
        });
    })
}

//New List-Item
document.getElementById("add-button").addEventListener("click", createKanbanDummy);

function createKanbanListElement(titel, listeId) {
    // Create new dropzone element
    var newListKanbanDiv = document.createElement("div");
    newListKanbanDiv.classList.add("dropzone");
    newListKanbanDiv.setAttribute("id", "color-picker" + id);
    id++;

    // Create card link
    var cardLink2 = document.createElement("a");
    cardLink2.classList.add("card-link");
    cardLink2.href = "#";
    cardLink2.innerHTML = "ListeID" + listeId;
    newListKanbanDiv.appendChild(cardLink2);

    // Create new h2 element for the title
    var newTitle = document.createElement("h2");
    newTitle.classList.add("list-title");
    newTitle.innerHTML = titel;

    // Create new label for color picker
    var colorPickerLabel = document.createElement("label");
    colorPickerLabel.setAttribute("for", "color-picker");
    colorPickerLabel.innerHTML = "Background color: ";

    // Create new color picker input
    var colorPickerInput = document.createElement("input");
    colorPickerInput.setAttribute("type", "color");
    colorPickerInput.setAttribute("id", "color-picker");
    colorPickerInput.setAttribute("name", "color-picker");
    colorPickerInput.setAttribute("style", "width: 30px; height: 15px;");
    colorPickerInput.addEventListener("change", function () {
        var parent = this.parentElement.parentElement;
        parent.style.backgroundColor = this.value;
    });

    // Append elements to new dropzone element
    newListKanbanDiv.appendChild(newTitle);
    newListKanbanDiv.appendChild(colorPickerLabel);
    colorPickerLabel.appendChild(colorPickerInput);


    // Append new dropzone element to boardKanban div
    document.getElementById("boardKanban").appendChild(newListKanbanDiv);
    dragzone();

    return newListKanbanDiv;
}

function createCard(title) {
    // Create card element
    var card = document.createElement("div");
    card.setAttribute("draggable", "true");
    card.classList.add("card", "draggable");
    card.innerHTML = title;
    return card;
}

function createKanbanDummy() {
    // Create new dropzone element
    var newDropzone = document.createElement("div");
    newDropzone.classList.add("dropzone");
    newDropzone.setAttribute("id", "color-picker" + id);
    id++;

    // Create new h2 element for the title
    var newTitle = document.createElement("h2");
    newTitle.classList.add("list-title");
    newTitle.innerHTML = "New List Title";

    // Create new label for color picker
    var colorPickerLabel = document.createElement("label");
    colorPickerLabel.setAttribute("for", "color-picker");
    colorPickerLabel.innerHTML = "Background color: ";

    // Create new color picker input
    var colorPickerInput = document.createElement("input");
    colorPickerInput.setAttribute("type", "color");
    colorPickerInput.setAttribute("id", "color-picker");
    colorPickerInput.setAttribute("name", "color-picker");
    colorPickerInput.setAttribute("style", "width: 30px; height: 15px;");
    colorPickerInput.addEventListener("change", function () {
        var parent = this.parentElement.parentElement;
        parent.style.backgroundColor = this.value;
    });

    // Append elements to new dropzone element
    newDropzone.appendChild(newTitle);
    newDropzone.appendChild(colorPickerLabel);
    colorPickerLabel.appendChild(colorPickerInput);

    // Append new dropzone element to boardKanban div
    document.getElementById("boardKanban").appendChild(newDropzone);
    dragzone();

}
