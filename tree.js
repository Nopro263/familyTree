import { connectElements, createElement, initCanvas, connectDirect, setPosition } from "./canvas.js";

let nodeId = 0;
let relationshipId = 0;

export const callbacks = {
    "createElement": (element, node) => {element.innerHTML = node.firstname},
    "createRelationship": (element, relationship) => {element.innerHTML = "+"}
}

export const createTree = (selector) => {
    const canvas = document.querySelector(selector);

    initCanvas(canvas);

    return {
        "nodes": [],
        "relationships": [],
        "canvas": canvas
    }
}

export const createNode = (tree, firstname, lastname, birth, death) => {
    const element = createElement(tree.canvas);

    const node = {
        "firstname": firstname,
        "lastname": lastname,
        "birth": birth,
        "death": death,
        "id": nodeId++,
        "element": element
    }

    callbacks.createElement(element, node);

    tree.nodes.push(node);
    return node;
}

export const addRelationship = (tree, node1Id, node2Id, start, end, type) => {
    const node1 = getNodeById(tree, node1Id);
    const node2 = getNodeById(tree, node2Id);

    const element = connectElements(tree.canvas, node1.element, node2.element);
    

    const relationship = {
        "nodes": [node1Id, node2Id],
        "start": start,
        "end": end,
        "type": type,
        "id": relationshipId++,
        "children": [],
        "element": element
    }

    callbacks.createRelationship(element, relationship);

    tree.relationships.push(relationship);
    return relationship;
}

export const addChildren = (tree, relationshipId, nodeId) => {
    const relationship = getRelationshipById(tree, relationshipId);
    relationship.children.push(nodeId);

    connectDirect(tree.canvas, relationship.element, getNodeById(tree, nodeId).element);
}

export const reorderTree = (tree) => {
    
}

export const reorderElements = (tree, array) => {
    let y = getNodeById(tree, array[0]).element.offsetHeight + 10;
    let x = 0;

    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        const relationships = tree.relationships.filter(v => v.nodes.includes(element));
        const relationship = relationships[0] // only first;

        const otherNode = relationship.nodes.filter(v => v !== element)[0];
        const otherIndex = array.indexOf(otherNode);

        if(index+1 < array.length) {
            if(array[index+1] == otherNode) {
                continue;
            }

            array[otherIndex] = array[index+1];
            array[index+1] = otherNode;
        }

        if(index-1 >= 0) {
            if(array[index-1] == otherNode) {
                continue;
            }

            array[otherIndex] = array[index-1];
            array[index-1] = otherNode;
        }
    }

    array.forEach(element => {
        setPosition(getNodeById(tree, element).element, [x,y]);
        x += getNodeById(tree, element).element.offsetWidth + 10;
    });
}

export const getRelationshipById = (tree, id) => {
    return (tree.relationships.filter((v) => v.id === id) || [undefined])[0];
}

export const getNodeById = (tree, id) => {
    return (tree.nodes.filter((v) => v.id === id) || [undefined])[0];
}