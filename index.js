import { createTree, createNode, addChildren, addRelationship, callbacks } from "./tree.js";

callbacks.createElement = (element, node) => {
    element.innerHTML = `<h1>${node.firstname} ${node.lastname}</h1><p>${node.birth || "?"} - ${node.death || "now"}</p>`;
}

callbacks.createRelationship = (element, relationship) => {
    element.innerHTML = relationship.type;
}

const tree = createTree(".mainCanvas");

console.log(createNode(tree, "Papa", "Mustermann", "1.1.1990", undefined));
console.log(createNode(tree, "Mama", "Mustermann", "1.1.1992", "1.1.2020"));

console.log(createNode(tree, "Sohn", "Mustermann", "1.1.2015", undefined));

console.log(addRelationship(tree, 0,1, "1.1.2012", "1.1.2020", "⚭"));

addChildren(tree, 0, 2);

/*const a = createElement(canvas);
a.innerHTML = "A";
const b = createElement(canvas);
b.innerHTML = "B";

const line_ab = connectElements(canvas, a,b);
line_ab.innerHTML = "⚭";*/