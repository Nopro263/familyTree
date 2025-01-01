import { moveAllElements, scale } from "./canvas.js";
import { deserialize, serialize } from "./data.js";
import { createTree, createNode, addChildren, addRelationship, callbacks, getNodeById, reorderTree, getExtramas, onlyShowNodes, exportTree, importTree } from "./tree.js";

let connectNodes = [];

const SENSITIVITY = 40;

const onInputUpdate = () => {
    const element = document.querySelector(".custom-slider > input");
    const p = (element.value - element.min) / (element.max - element.min);

    const e = document.querySelector(".custom-slider > .hover");
    e.style.setProperty("--l", `${(window.innerWidth - 4 - 15 - 40) * p}px`)
    e.querySelector("p").innerText = element.value;

    onlyShowNodes(tree, parseInt(element.value));
}

document.querySelector(".custom-slider > input").addEventListener("input", onInputUpdate);

document.querySelector(".arrow").addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("open");
});

document.querySelector(".hoverelements > *:nth-child(1)").addEventListener("click", () => {
    document.body.classList.add("line_connect");
    connectNodes = [];
});

document.querySelector(".hoverelements > *:nth-child(2)").addEventListener("click", () => {
    const node = createNode(tree, "John", "Doe", "1.1.1990", undefined);
    startEdit(node);
    node.element.classList.add("active");
    document.querySelector(".sidebar").classList.add("open");
});

window.addEventListener("wheel", (ev) => {
    if(ev.ctrlKey) {
        ev.preventDefault();
        if(ev.deltaY < 0) {
            scale(tree.canvas, 1.05);
        } else if(ev.deltaY > 0) {
            scale(tree.canvas, 0.95);
        }
    } else if(ev.altKey || ev.shiftKey) {
        ev.preventDefault();
        if(ev.deltaY < 0) {
            moveAllElements(tree.canvas, [SENSITIVITY, 0]);
        } else if(ev.deltaY > 0) {
            moveAllElements(tree.canvas, [-SENSITIVITY, 0]);
        }
    } else {
        ev.preventDefault();
        if(ev.deltaY < 0) {
            moveAllElements(tree.canvas, [0, SENSITIVITY]);
        } else if(ev.deltaY > 0) {
            moveAllElements(tree.canvas, [0, -SENSITIVITY]);
        }
    }
}, { passive: false })

const addNode = (node) => {
    connectNodes.push(node);
    document.querySelectorAll(".active").forEach((v) => {
        v.classList.remove("active");
    });
    node.element.classList.add("active");

    if(connectNodes.length == 2) {
        if(connectNodes[0].children === undefined && connectNodes[1].children === undefined) { // two nodes
            const relationship = addRelationship(tree, connectNodes[0].id, connectNodes[1].id, undefined, undefined, "+");

            startRelationshipEdit(relationship);
            relationship.element.classList.add("active");
            document.querySelector(".sidebar").classList.add("open");
        } else if(connectNodes.filter(v => v.children === undefined)) { // one node and on relationship
            const connNode = connectNodes.filter(v => v.children === undefined)[0];
            const connRelationship = connectNodes.filter(v => v.children !== undefined)[0];

            addChildren(tree, connRelationship.id, connNode.id);
        }
        connectNodes = [];
        document.body.classList.remove("line_connect");
    }
}

callbacks.createElement = (element, node) => {
    element.innerHTML = `<h1>${node.firstname} ${node.lastname}</h1><p>${node.birth ? node.birth.toLocaleDateString() : "?"} - ${node.death ? node.death.toLocaleDateString() : "now"}</p>`;
    const l = () => {
        if(document.body.classList.contains("line_connect")) {
            addNode(node);
        } else {
            startEdit(node);
            element.classList.add("active");
            document.querySelector(".sidebar").classList.add("open");
        }
    };
    element.addEventListener("click", l);
    node.listener = l;

    try {
        const slider = document.querySelector(".custom-slider > input");
        const extremas = getExtramas(tree);
        slider.min = extremas.min.getFullYear();
        slider.max = new Date().getFullYear();

        onInputUpdate();
    } catch {

    }
}

callbacks.createRelationship = (element, relationship) => {
    element.innerHTML = relationship.type;

    element.addEventListener("click", () => {
        if(document.body.classList.contains("line_connect")) {
            addNode(relationship);
        } else {
            startRelationshipEdit(relationship);
            element.classList.add("active");
            document.querySelector(".sidebar").classList.add("open");
        }
    });
}

const startEdit = (node) => {
    document.querySelectorAll(".active").forEach((v) => {
        v.classList.remove("active");
    });

    const sidebar = document.querySelector(".sidebar .content");
    sidebar.innerHTML = `<h1>${node.firstname} ${node.lastname}</h1>
    <p>${node.birth ? node.birth.toLocaleDateString() : "?"} - ${node.death ? node.death.toLocaleDateString() : "now"}</p>
    <div class="seperator"></div>
    <div class="row"><label for="firstname">first name</label><input id="firstname" type="text" value="${node.firstname}"/></div>
    <div class="row"><label for="lastname">last name</label><input id="lastname" type="text" value="${node.lastname}"/></div>
    <div class="row"><label for="birth">born</label><input id="birth" type="date" value="${node.birth ? node.birth.toLocaleDateString('en-CA') : "?"}"/></div>
    <div class="row"><label for="death">died</label><input type="checkbox" id="hasDied" ${node.death ? "checked" : ""}/><input id="death" type="date" value="${node.death ? node.death.toLocaleDateString('en-CA') : "now"}" ${node.death ? "" : "disabled"}/></div>
    <button class="end" id="save">save</button>`;

    sidebar.querySelector("#hasDied").addEventListener("change", (ev) => {
        sidebar.querySelector("#death").disabled = !ev.target.checked;
    });

    sidebar.querySelector("#save").addEventListener("click", (ev) => {
        node.firstname = sidebar.querySelector("#firstname").value;
        node.lastname = sidebar.querySelector("#lastname").value;
        node.birth = new Date(sidebar.querySelector("#birth").value);
        node.death = sidebar.querySelector("#hasDied").checked ? new Date(sidebar.querySelector("#death").value) : null;

        node.element.removeEventListener("click", node.l || null);

        callbacks.createElement(node.element, node);
        startEdit(node);
        node.element.classList.add("active");
    });
}

const startRelationshipEdit = (node) => {
    document.querySelectorAll(".active").forEach((v) => {
        v.classList.remove("active");
    });

    const sidebar = document.querySelector(".sidebar .content");
    sidebar.innerHTML = `<h1>${getNodeById(tree, node.nodes[0]).firstname} ${node.type} ${getNodeById(tree, node.nodes[1]).firstname}</h1>
    <p>${node.start ? node.start.toLocaleDateString() : "?"} - ${node.end ? node.end.toLocaleDateString() : "now"}</p>
    <div class="seperator"></div>
    <div class="row"><label for="start">start</label><input id="start" type="date" value="${node.start ? node.start.toLocaleDateString('en-CA') : "?"}"/></div>
    <div class="row"><label for="end">end</label><input id="end" type="date" value="${node.end ? node.end.toLocaleDateString('en-CA') : "?"}"/></div>
    <div class="row"><label for="type">type</label><select id="type"><option value="⚭" ${node.type === "⚭" ? 'selected="selected"' : ""}>Married</option><option value="+" ${node.type === "+" ? 'selected="selected"' : ""}>Not Married</option></select></div>
    <button class="end" id="save">save</button>`;

    sidebar.querySelector("#save").addEventListener("click", (ev) => {
        node.start = new Date(sidebar.querySelector("#start").value);
        node.end = new Date(sidebar.querySelector("#end").value);
        node.type = sidebar.querySelector("#type").value;

        node.element.removeEventListener("click", node.l || null);

        callbacks.createRelationship(node.element, node);

        startRelationshipEdit(node);
        node.element.classList.add("active");
    });
}

const tree = createTree(".mainCanvas");

const main = ()=> {
    console.log(createNode(tree, "Jim", "Doe", "1.1.1990", undefined));
    console.log(createNode(tree, "Jill", "Doe", "1.1.1992", "1.1.2020"));

    console.log(createNode(tree, "Tim", "Doe", "1.1.2015", undefined));

    console.log(addRelationship(tree, 0,1, "1.1.2012", "1.1.2020", "⚭"));


    addChildren(tree, 0, 2);

    console.log(reorderTree(tree));
}

const imported = (data) => {
    importTree(data, tree);
}

document.querySelector(".export").addEventListener("click", () => {
    console.log(serialize(exportTree(tree)));
})

const url = new URL(window.location);
if(url.searchParams.get("data")) {
    imported(deserialize(url.searchParams.get("data")));
} else {
    main();
}