import { createTree, createNode, addChildren, addRelationship, callbacks, reorderElements, getNodeById } from "./tree.js";

callbacks.createElement = (element, node) => {
    element.innerHTML = `<h1>${node.firstname} ${node.lastname}</h1><p>${node.birth || "?"} - ${node.death || "now"}</p>`;
}

callbacks.createRelationship = (element, relationship) => {
    element.innerHTML = relationship.type;
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

/*reorderElements(tree, [
    0,3,2,1
]);*/

/*const a = createElement(canvas);
a.innerHTML = "A";
const b = createElement(canvas);
b.innerHTML = "B";

const line_ab = connectElements(canvas, a,b);
line_ab.innerHTML = "⚭";*/