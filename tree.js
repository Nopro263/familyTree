import { connectElements, createElement, initCanvas, connectDirect } from "./canvas.js";

let nodeId = 0;
let relationshipId = 0;

export const createTree = (selector) => {
    const canvas = document.querySelector(selector);

    initCanvas(canvas);

    return {
        "nodes": [],
        "relationships": [],
        "canvas": canvas
    }
}

export const createNode = (tree, name) => {
    const element = createElement(tree.canvas);

    element.innerHTML = name;

    const node = {
        "name": name,
        "id": nodeId++,
        "element": element
    }

    tree.nodes.push(node);
    return node;
}

export const addRelationship = (tree, node1Id, node2Id) => {
    const node1 = _getNode(tree, node1Id);
    const node2 = _getNode(tree, node2Id);

    const element = connectElements(tree.canvas, node1.element, node2.element);
    element.innerHTML = "+";

    const relationship = {
        "nodes": [node1Id, node2Id],
        "id": relationshipId++,
        "children": [],
        "element": element
    }

    tree.relationships.push(relationship);
    return relationship;
}

export const addChildren = (tree, relationshipId, nodeId) => {
    const relationship = _getRelationship(tree, relationshipId);
    relationship.children.push(nodeId);

    connectDirect(tree.canvas, relationship.element, _getNode(tree, nodeId).element);
}

const _getRelationship = (tree, id) => {
    return tree.relationships.filter((v) => v.id === id)[0];
}

const _getNode = (tree, id) => {
    return tree.nodes.filter((v) => v.id === id)[0];
}