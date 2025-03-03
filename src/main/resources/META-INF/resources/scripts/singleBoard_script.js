let dragged;
var modalElement = document.getElementById("modalElement");
var close_modal_element = document.getElementsByClassName("close-modal-element")[0];

// Back button Link auf den Current Host stellen
document.getElementById("backButton").href = location.protocol + '//' + location.host + "/kanban";

modalAddListe();
close_modal_element.onclick = function () {
    modalElement.style.display = "none";
}
var create_element_form = document.getElementById("modal-element-form");

/** Erstellt eine neue Liste*/
document.getElementById("add-button").addEventListener("click", function (event) {
    event.preventDefault(); // um zu verhindern das Submittet wird

    var inputField = document.getElementById("input-field");
    var listKanbanTitel = inputField.value;
    var obj = new Object();
    var currentUrl = window.location.href;
    var boardId = currentUrl.substring(currentUrl.lastIndexOf('/') + 1);

    obj.boardId = boardId;
    obj.titel = listKanbanTitel;
    obj.color = "#8080c0";

    var jsonString = JSON.stringify(obj);
    console.log(jsonString);
    var request = new Request("http://"+ location.host +"/kanban/board/PostForList", {
        method: "POST",
        body: jsonString,
        headers: {"Content-Type": "application/json"}
    });
    // mit fetch zu quarkus markus senden
    fetch(request)
        .then(function (response) {
            // popups erstellen, die dem user feedback geben
            if (response.ok) {
                console.log("Liste erstellt!");
            } else {
                alert("Fehler bei erstellen der Liste" + response.status);
            }
        })
        .catch(function (error) {
            alert("Fehler bei erstellen der Liste: " + error);
        });
    modal.style.display = "none";
});

function changeElementPos(listeId, elementId) {
    var obj = new Object();
    obj.listeId = listeId;
    obj.elementId = elementId;

    fetch("/kanban/board/changePos", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(obj)
    }).then(function (response) {
        // popups erstellen, die dem user feedback geben
        if (response.ok) {
            console.log("SUCCESSFUL PATCH!!!" + listeId);
        } else {
            alert("Fehler bei erstellen des Elements " + response.status);
        }
    })
        .catch(function (error) {
            alert("Fehler bei erstellen des Elements: " + error);
        });
}

var socket = new WebSocket("ws://"+ location.host +"/kanban/board");
socket.onmessage = function (event) {
    var message = JSON.parse(event.data);
    console.log(message);
    var currentUrl = window.location.href;
    var boardId = currentUrl.substring(currentUrl.lastIndexOf('/') + 1);
    //console.log(parseInt(boardId));
    //console.log(message.boardId);
    if (message.type === "liste_kanban_created" && message.boardId === parseInt(boardId)) {

        createKanbanList(message.titel, message.listeId, message.color);
    }
    if (message.type === "liste_kanban_deleted") {
        document.getElementById("outerListe" + message.listeId).remove();
    }
    if (message.type === "element_added") {
        addElementToKanbanList(message.listeId, message.elementId, message.titel);
    }
    if (message.type === "element_edit") {
        elementEditFromWebsockt(message);
    }
    if (message.type === "element_kanban_deleted") {
        document.getElementById("element" + message.elementId).remove();
    }
    if (message.type === "element_moved") {
        document.getElementById("liste" + message.listeId).appendChild(document.getElementById("element" + message.elementId));
        //document.getElementById("element"+message.elementId).remove();
    }
    if (message.type === "color_changed") {
        document.getElementById("liste"+message.listeId).style.backgroundColor = message.color;
        document.getElementById("liste"+message.listeId).parentElement.style.backgroundColor = message.color;
    }
};

/** Erstellt ein neues Element in der Parent Liste */
function createNewElement(listeId, titleInput, erstellerInput, descriptionInput) {
    var obj = new Object();
    obj.listeId = listeId;
    obj.titel = titleInput;
    obj.ersteller = erstellerInput;
    obj.beschreibung = descriptionInput;

    console.log("post obj:");
    console.log(obj);

    fetch("/kanban/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(obj)
    }).then(function (response) {
        // popups erstellen, die dem user feedback geben
        if (response.ok) {
            console.log("Element erstellt!");
        } else {
            alert("Fehler bei erstellen des Elements " + response.status);
        }
    })
        .catch(function (error) {
            alert("Fehler bei erstellen des Elements: " + error);
        });
}

/** Löscht eine bestehende Liste per Websocket */
function deleteListe(listeId, boardId) {

    var obj = new Object();
    obj.listeId = listeId;
    obj.boardId = boardId;
    var jsonString = JSON.stringify(obj);

    var request = new Request("http://"+ location.host +"/kanban/board/listeDelete", {
        method: "DELETE",
        body: jsonString,
        headers: {"Content-Type": "application/json"}
    });
    // mit fetch zu quarkus markus senden
    fetch(request)
        .then(function (response) {
            // popups erstellen, die dem user feedback geben
            if (response.ok) {
                console.log("Die Liste wurde deleted")

            } else {
                alert("Fehler beim löschen der Liste " + response.status);
            }
        })
        .catch(function (error) {
            alert("Fehler beim löschen der Liste: " + error);
        });
}

/** Löscht ein bestehendes Element per Websocket */
function deleteElement(elementId) {

    var obj = new Object();
    obj.elementId = elementId;

    var jsonString = JSON.stringify(obj);

    var request = new Request("http://"+ location.host +"/kanban/create/delete", {
        method: "DELETE",
        body: jsonString,
        headers: {"Content-Type": "application/json"}
    });
    // mit fetch zu quarkus markus senden
    fetch(request)
        .then(function (response) {
            // popups erstellen, die dem user feedback geben
            if (response.ok) {
                console.log("Die Element wurde deleted")

            } else {
                alert("Fehler beim löschen des Elements " + response.status);
            }
        })
        .catch(function (error) {
            alert("Fehler beim löschen des Elements: " + error);
        });
}

/** Websocket: Methode die zur aktualisierung für die Websockets dient*/
function elementEditFromWebsockt(message) {

    var element = document.getElementById('element' + message.elementId);
    let childP = element.querySelector("p");
    childP.textContent = message.titel;
}

/** Websocket: Methode die zur aktualisierung für die Websockets dient*/
function createKanbanList(titel, listeId, colorFromDB) {
    var outerDiv = document.createElement("div");
    outerDiv.classList.add("listContainerDiv");
    outerDiv.id = "outerListe" + listeId;
    var newListKanbanDiv = document.createElement("div");
    newListKanbanDiv.classList.add("dropzone");
    newListKanbanDiv.setAttribute("id", "color-picker" + listeId);
    newListKanbanDiv.id = "liste" + listeId;

    // Titel element ersteleln
    var newTitle = document.createElement("h2");
    newTitle.classList.add("list-title");
    newTitle.classList.add("title");
    newTitle.innerHTML = titel;

    // label für colorpicker erstellen
    var colorPickerLabel = document.createElement("label");
    colorPickerLabel.setAttribute("for", "color-picker");
    colorPickerLabel.innerHTML = "Background color: ";

    // Delete button erstellen
    var deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-kanban");
    deleteButton.id = "deleteListe" + listeId;
    deleteButton.addEventListener("click", function (e) {
        var currentUrl = window.location.href;
        var boardId = currentUrl.substring(currentUrl.lastIndexOf('/') + 1);
        deleteListe(listeId, boardId);
    });
    outerDiv.appendChild(deleteButton);

    // Input für color picker erstellen
    var colorPickerInput = document.createElement("input");
    colorPickerInput.setAttribute("type", "color");
    colorPickerInput.setAttribute("id", "color-picker" + listeId);
    colorPickerInput.setAttribute("name", "color-picker");
    colorPickerInput.setAttribute("style", "width: 30px; height: 15px;");
    colorPickerInput.addEventListener("change", function () {
        var color = this.value;
        setColor(listeId, color);
    });

    var addElementButton = document.createElement("button");
    addElementButton.innerHTML = "+ Element hinzufügen";
    addElementButton.classList.add("add-element-button");
    //damit wir schneller an die Id im modal kommen
    addElementButton.id = listeId;
    addElementButton.addEventListener("click", function (event) {
        openAddElementModal(listeId);

        //Warum hier zweimal?
        //openAddElementModal(listeId);
    })

    var eButtonDiv = document.createElement("div");
    eButtonDiv.classList.add("element-button-div")
    eButtonDiv.appendChild(addElementButton);

    //alle elemente an div anhängen

    outerDiv.appendChild(newTitle);
    //newListKanbanDiv.appendChild(eButtonDiv);
    outerDiv.appendChild(colorPickerLabel);
    colorPickerLabel.appendChild(colorPickerInput);
    outerDiv.appendChild(newListKanbanDiv);
    outerDiv.appendChild(eButtonDiv);

    outerDiv.style.backgroundColor = colorFromDB;
    newListKanbanDiv.style.backgroundColor = colorFromDB;

    // neue Liste an Dokument anhängen
    document.getElementById("boardKanban").appendChild(outerDiv);

    newListKanbanDiv.addEventListener("dragover", (event) => {

        event.preventDefault();
    }, false);
    newListKanbanDiv.addEventListener("dragenter", (event) => {
        // wenn man mit einem Element über eine Liste draggt, dann wird es transparenter
        if (event.target.classList.contains("dropzone")) {
            event.target.classList.add("dragover");
        }
    });
    newListKanbanDiv.addEventListener("dragleave", (event) => {
        // transparenz aufheben
        if (event.target.classList.contains("dropzone")) {
            event.target.classList.remove("dragover");
        }
    });
    newListKanbanDiv.addEventListener("drop", (event) => {
        // um ungewollte effekte zu verhindern
        event.preventDefault();
        // in der webseite die position des Elements verändern und eine Request an den Server schicken
        // damit es auch dor geändert wird
        if (event.target.classList.contains("dropzone")) {
            event.target.classList.remove("dragover");
            event.target.appendChild(dragged);
            let elementId = event.dataTransfer.getData("text/plain");
            console.log("elementId im listener von dropzone:" + elementId);
            //Schreibt in der Datenbank die Pos um
            console.log("SAAAAAAAAAAAAAAAAAAAAAAAAAG " + elementId);
            changeElementPos(listeId, elementId);
        }
    });
    return newListKanbanDiv;
}
/** Ändert die Farbe einer Liste per Websocket */
function setColor(listeId, color){

    var obj = new Object();
    obj.listeId = listeId;
    obj.color = color;

    fetch("/kanban/board/setColor", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(obj)
    }).then(function (response) {
        // popups erstellen, die dem user feedback geben
        if (response.ok) {
            console.log("FARBE WURDE GELAUNCHT");
        } else {
            alert("Fehler beim ändern der Farbe" + response.status);
        }
    })
        .catch(function (error) {
            alert("Fehler beim ändern der Farbe: " + error);
        });
}
/** Websocket: Methode die zur aktualisierung für die Websockets dient*/
function addElementToKanbanList(listeId, elementId, titel) {
    var parentDiv = document.getElementById("liste" + listeId);
    // Create new card element
    var newCard = document.createElement("div");
    newCard.setAttribute("draggable", "true");
    newCard.classList.add("element", "draggable");
    newCard.setAttribute("id", "element" + elementId);
    newCard.addEventListener("drag", (event) => {
        console.log("dragging");
    });

    var deleteElementButton = document.createElement("button");
    deleteElementButton.classList.add("delete-element-button");
    deleteElementButton.id = "deleteElement" + elementId;
    deleteElementButton.addEventListener("click", function (e) {
        deleteElement(elementId);
    });


    newCard.addEventListener("dragstart", (event) => {
        dragged = event.target;

        event.dataTransfer.setData('text/plain', elementId);
        //transparenz hinzufügen
        event.target.classList.add("dragging");
    });
    newCard.addEventListener("dragend", (event) => {
        //transparenz entfernen
        event.target.classList.remove("dragging");
    });

    var newCardTitle = document.createElement("p");
    newCardTitle.classList.add("element-title");
    newCardTitle.innerHTML = titel;

    //
    var editLinkIcon = document.createElement("div");
    editLinkIcon.classList.add("element-edit-icon");
    editLinkIcon.setAttribute("id", "edit" + elementId);
    editLinkIcon.addEventListener("click", function () {
        openEditElementModal(elementId);
    })

    newCard.appendChild(deleteElementButton);
    newCard.appendChild(newCardTitle);
    newCard.appendChild(editLinkIcon);

    parentDiv.appendChild(newCard);
}

/** QUELLE: https://stackoverflow.com/questions/19469881/remove-all-event-listeners-of-specific-type
 *  Modal: Öffnet ein Modal welches dazu dient ein bestehendes Element zu patchen per Websocket*/
function openEditElementModal(elementId) {
    // Modal anzeigen
    modalElement.style.display = "block";

    /** Hier wird <b>GETTET</b>
     *  */
    fetch("/kanban/board/element/" + elementId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => response.json())
        .then(data => {
            console.log(data);
            document.getElementById("title-input").value = data.titel;
            document.getElementById("ersteller-input").value = data.ersteller;
            document.getElementById("description-input").value = data.beschreibung;
        })
        .catch(error => {
            console.log(error)
        });

    //Mehrere Events mit einem Button
    var el = document.getElementById('save-element-button'),
        elClone = el.cloneNode(true);

    el.parentNode.replaceChild(elClone, el);

    /** Hier wird <b>gepatch</b> */
    console.log("Das ist die GET id " + elementId);
    elClone.addEventListener("click", (e) => {
        const titleInput = document.getElementById("title-input");
        const erstellerInput = document.getElementById("ersteller-input");
        const descriptionInput = document.getElementById("description-input");

        e.preventDefault();
        var obj = new Object();
        console.log("Das ist die PATCH id " + elementId);
        obj.elementId = elementId;
        obj.titel = titleInput.value;
        obj.ersteller = erstellerInput.value;
        obj.beschreibung = descriptionInput.value;

        console.log("patch obj:");
        console.log(obj);

        fetch("/kanban/board/", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(obj)
        }).then(function (response) {
            // popups erstellen, die dem user feedback geben
            if (response.ok) {
                console.log("SUCCESSFUL PATCH!!!");
            } else {
                alert("Fehler bei erstellen des Elements " + response.status);
            }
        })
            .catch(function (error) {
                alert("Fehler bei erstellen des Elements: " + error);
            });
            // Wenn der benutzer irgendwo hinklickt wird das modal geschlossen
        window.onclick = function (event) {
            if (event.target == modalElement) {
                modalElement.style.display = "none";
            }
        }
    });
}

/** Modal: Öffnet ein Modal welches dazu dient ein neues Element anzulegen */
function openAddElementModal(listeId) {

    modalElement.style.display = "block";

    fetch("/kanban/board/userName", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => response.json())
        .then(data => {
            console.log(data);

            document.getElementById("ersteller-input").value = data.username;
        })
        .catch(error => {
            console.log(error)
        });

    const titleInput = document.getElementById("title-input");
    const erstellerInput = document.getElementById("ersteller-input");
    const descriptionInput = document.getElementById("description-input");
    const saveButton = document.getElementById("save-element-button");


    var el = document.getElementById('save-element-button'),
        elClone = el.cloneNode(true);

    el.parentNode.replaceChild(elClone, el);

    elClone.addEventListener("click", (e) => {
        e.preventDefault();
        createNewElement(listeId, titleInput.value, erstellerInput.value, descriptionInput.value);
    });

    // Modal schließen wenn ausserhalb des Modals gedrückt wird
    window.onclick = function (event) {
        if (event.target == modalElement) {
            modalElement.style.display = "none";
        }
    }
    document.getElementById("title-input").value = "";
    document.getElementById("description-input").value = "";
}

/** Modal: Poppt auf wenn man den grünen button auf der html drück für adden einer Liste */
function modalAddListe() {
    var modal = document.getElementById("modal");
    console.log(modal);
    var btn = document.getElementById("open-modal-btn");
    console.log(btn);
    var span = document.getElementsByClassName("close-modal")[0];

    btn.onclick = function () {
        modal.style.display = "block";
        //Für den autofocus, damit instant geschrieben werden kann
        document.getElementById("input-field").focus();
    }
    // wenn auf schliessen gedrückt wird, dann modal schliessen
    span.onclick = function () {
        modal.style.display = "none";
    }
    // Modal schließen wenn ausserhalb des Modals gedrückt wird

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}


