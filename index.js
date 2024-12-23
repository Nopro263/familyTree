import { createTree, createNode, addChildren, addRelationship, callbacks, getNodeById, reorderTree } from "./tree.js";

document.querySelector(".arrow").addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("open");
});

callbacks.createElement = (element, node) => {
    element.innerHTML = `<h1>${node.firstname} ${node.lastname}</h1><p>${node.birth ? node.birth.toLocaleDateString() : "?"} - ${node.death ? node.death.toLocaleDateString() : "now"}</p>`;
    const l = () => {
        startEdit(node);
        element.classList.add("active");
        document.querySelector(".sidebar").classList.add("open");
    };
    element.addEventListener("click", l);
    node.listener = l;
}

callbacks.createRelationship = (element, relationship) => {
    element.innerHTML = relationship.type;

    element.addEventListener("click", () => {
        startRelationshipEdit(relationship);
        element.classList.add("active");
        document.querySelector(".sidebar").classList.add("open");
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
    });
}

const tree = createTree(".mainCanvas");

console.log(createNode(tree, "Papa", "Mustermann", "1.1.1990", undefined));
console.log(createNode(tree, "Mama", "Mustermann", "1.1.1992", "1.1.2020"));

console.log(createNode(tree, "Papa2", "Mustermann", "1.1.1990", undefined));
console.log(createNode(tree, "Mama2", "Mustermann", "1.1.1992", "1.1.2020"));
console.log(createNode(tree, "Papa3", "Mustermann", "1.1.1990", undefined));
console.log(createNode(tree, "Mama3", "Mustermann", "1.1.1992", "1.1.2020"));
console.log(createNode(tree, "Papa4", "Mustermann", "1.1.1990", undefined));
console.log(createNode(tree, "Mama4", "Mustermann", "1.1.1992", "1.1.2020"));

console.log(createNode(tree, "Sohn", "Mustermann", "1.1.2015", undefined));

console.log(addRelationship(tree, 0,1, "1.1.2012", "1.1.2020", "⚭"));

console.log(addRelationship(tree, 2,3, "1.1.2012", "1.1.2020", "⚭"));
console.log(addRelationship(tree, 4,5, "1.1.2012", "1.1.2020", "⚭"));
console.log(addRelationship(tree, 6,7, "1.1.2012", "1.1.2020", "⚭"));

addChildren(tree, 0, 8);
addChildren(tree, 0, 7);
addChildren(tree, 1, 1);

console.log(reorderTree(tree));

/*reorderElements(tree, [
    0,3,2,1
]);*/

/*const a = createElement(canvas);
a.innerHTML = "A";
const b = createElement(canvas);
b.innerHTML = "B";

const line_ab = connectElements(canvas, a,b);
line_ab.innerHTML = "⚭";*/