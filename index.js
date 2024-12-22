import { createTree, createNode, addChildren, addRelationship } from "./tree.js";

const tree = createTree(".mainCanvas");

console.log(createNode(tree, "Noah"));
console.log(createNode(tree, "Emily"));

console.log(addRelationship(tree, 0,1));

/*const a = createElement(canvas);
a.innerHTML = "A";
const b = createElement(canvas);
b.innerHTML = "B";

const line_ab = connectElements(canvas, a,b);
line_ab.innerHTML = "⚭";*/