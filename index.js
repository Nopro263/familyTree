import { createTree, createNode, addChildren, addRelationship, callbacks, getNodeById, reorderTree } from "./tree.js";

document.querySelector(".arrow").addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("open");
});

callbacks.createElement = (element, node) => {
    element.innerHTML = `<h1>${node.firstname} ${node.lastname}</h1><p>${node.birth || "?"} - ${node.death || "now"}</p>`;
    element.addEventListener("click", () => {
        startEdit(node);
        element.classList.add("active");
        document.querySelector(".sidebar").classList.add("open");
    });
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
    sidebar.innerHTML = `<h1>${node.firstname} ${node.lastname}</h1><p>${node.birth || "?"} - ${node.death || "now"}</p>`;
}

const startRelationshipEdit = (node) => {
    document.querySelectorAll(".active").forEach((v) => {
        v.classList.remove("active");
    });

    const sidebar = document.querySelector(".sidebar .content");
    sidebar.innerHTML = `<h1>${node.type}</h1><p>${node.start || "?"} - ${node.end || "now"}</p>`;
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