import { createTree, createNode, addChildren, addRelationship } from "./tree.js";

const tree = createTree(".mainCanvas");

console.log(createNode(tree, "Papa"));
console.log(createNode(tree, "Mama"));

console.log(createNode(tree, "Noah"));

console.log(addRelationship(tree, 0,1));

addChildren(tree, 0, 2);

/*const a = createElement(canvas);
a.innerHTML = "A";
const b = createElement(canvas);
b.innerHTML = "B";

const line_ab = connectElements(canvas, a,b);
line_ab.innerHTML = "⚭";*/