import { connectElements, createElement, initCanvas, connectDirect, setPosition, getPosition } from "./canvas.js";

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

export const createNode = (tree, firstname, lastname, birth, death, id=null) => {
    const element = createElement(tree.canvas);

    const node = {
        "firstname": firstname,
        "lastname": lastname,
        "birth": birth ? new Date(birth) : null,
        "death": death ? new Date(death) : null,
        "id": id ? id : nodeId++,
        "element": element
    }

    callbacks.createElement(element, node);

    tree.nodes.push(node);
    return node;
}

export const addRelationship = (tree, node1Id, node2Id, start, end, type, id=null) => {
    const node1 = getNodeById(tree, node1Id);
    const node2 = getNodeById(tree, node2Id);

    const element = connectElements(tree.canvas, node1.element, node2.element);
    

    const relationship = {
        "nodes": [node1Id, node2Id],
        "start": start ? new Date(start) : null,
        "end": end ? new Date(end) : null,
        "type": type,
        "id": id ? id :relationshipId++,
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
    const levels = {}
    let node = tree.nodes[0];
    let nodeLevel = 0;

    rt(tree, node, nodeLevel, levels);

    const levelToNode = {};

    let extrema = [0,0];
    let maxNodes = 0;
    
    for (const [nodeId, level] of Object.entries(levels)) {
        if(!levelToNode[level]) {
            levelToNode[level] = [];
        }

        if(level < extrema[0]) {
            extrema[0] = level;
        }
        if(level > extrema[1]) {
            extrema[1] = level;
        }

        levelToNode[level].push(getNodeById(tree, parseInt(nodeId)));
        if(levelToNode[level].length > maxNodes) {
            maxNodes = levelToNode[level].length;
        }
    }

    const ySteps = Math.abs(extrema[0]) + Math.abs(extrema[1]) + 1;
    const xSteps = maxNodes;

    let x = 0;
    let y = levelToNode[0][0].element.offsetHeight * 2;;

    Object.keys(levelToNode).sort(function(a, b) {
        return parseInt(b) - parseInt(a);
      }).forEach((i) => {
        x = levelToNode[0][0].element.offsetWidth * 2;
        for (const node of levelToNode[i]) {
            setPosition(node.element, [x,y]);
            x += node.element.offsetWidth + 100;
        }
        y += levelToNode[0][0].element.offsetHeight + 50;
    });


    return levelToNode;
}

const rt = (tree, node, nodeLevel, levels) => {
    const addAllInRelationships = (node) => {
        getRelationshipsWithNodeId(tree, node.id).forEach(element => {
            let otherNode = element.nodes.filter(v => v !== node.id)[0];
            if(levels[otherNode]) {
                console.log(otherNode, levels[otherNode], nodeLevel);
            }
            levels[otherNode] = nodeLevel;

            addAllParents(getNodeById(tree, otherNode));

            element.children.forEach(child => {
                if(levels[child] !== undefined) {
                    return;
                }
                levels[child] = nodeLevel-1;
                rt(tree, getNodeById(tree, child), nodeLevel-1, levels);
            });
        });
    }

    const addAllParents = (node) => {
        getRelationshipsWithNodeIdAsChild(tree, node.id).forEach(element => {
            element.nodes.forEach(parent => {
                if(levels[parent]) {
                    console.log(parent, levels[parent], nodeLevel+1);
                }

                levels[parent] = nodeLevel+1;
                if(levels[parent] !== undefined) {
                    return;
                }
                rt(tree, getNodeById(tree, parent), nodeLevel+1, levels);
            });
        });
    }

    if(levels[node.id]) {
        console.log(node.id, levels[node.id], nodeLevel);
    }
    addAllInRelationships(node);
    addAllParents(node);
}

export const getRelationshipById = (tree, id) => {
    return (tree.relationships.filter((v) => v.id === id) || [undefined])[0];
}

export const getRelationshipsWithNodeId = (tree, id) => {
    return (tree.relationships.filter((v) => v.nodes.includes(id)) || []);
}

export const getRelationshipsWithNodeIdAsChild = (tree, id) => {
    return (tree.relationships.filter((v) => v.children.includes(id)) || []);
}


export const getNodeById = (tree, id) => {
    return (tree.nodes.filter((v) => v.id === id) || [undefined])[0];
}

const getExtramaNodes = (tree) => {
    const extrema = {
        "min": null,
        "max": null
    };
    
    tree.nodes.forEach(node => {
        if(node.birth && (extrema.min === null || node.birth < extrema.min.birth)) {
            extrema.min = node;
        }

        if(extrema.max === null || !node.death || node.death > extrema.max.death) {
            extrema.max = node;
        }
    });

    return extrema;
}

export const getExtramas = (tree) => {
    const extrema = getExtramaNodes(tree);

    return {
        "min": extrema.min.birth,
        "max": extrema.max.death || new Date() 
    };
}

export const onlyShowNodes = (tree, currentYear) => {
    reset(tree);
    const relationships = tree.relationships.filter(relationship => !(relationship.start.getFullYear() <= currentYear && relationship.end.getFullYear() >= currentYear));
    const nodes = tree.nodes.filter(node => !(node.birth.getFullYear() <= currentYear && (!node.death || node.death.getFullYear() >= currentYear)));

    nodes.forEach(node => {
        node.element.classList.add("hidden");
    });

    relationships.forEach(relationship => {
        relationship.element.classList.add("hidden");
    });
}

export const reset = (tree) => {
    tree.nodes.forEach(node => {
        node.element.classList.remove("hidden");
    });

    tree.relationships.forEach(relationship => {
        relationship.element.classList.remove("hidden");
    });
}

export const exportTree = (tree) => {
    const exportedTree = {
        "nodes": [],
        "relationships": []
    }

    tree.nodes.forEach(node => {
        exportedTree.nodes.push({
            "firstname": node.firstname,
            "lastname": node.lastname,
            "birth": node.birth,
            "death": node.death,
            "id": node.id,
            "element": getPosition(node.element)
        })
    });

    tree.relationships.forEach(relationship => {
        exportedTree.relationships.push({
            "nodes": relationship.nodes,
            "start": relationship.start,
            "end": relationship.end,
            "type": relationship.type,
            "id": relationship.id,
            "children": relationship.children,
            "element": getPosition(relationship.element)
        });
    });

    return exportedTree;
}

export const importTree = (exportedTree, tree) => {
    exportedTree.nodes.forEach(node => {
        const element = createNode(tree, node.firstname, node.lastname, node.birth, node.death, node.id);
        setPosition(element.element, node.element);
    });

    exportedTree.relationships.forEach(r => {
        const element = addRelationship(tree, r.nodes[0], r.nodes[1], r.start, r.end, r.type, r.id);
        setPosition(element.element, r.element);

        r.children.forEach(child => {
            addChildren(tree, r.id, child);
        });
    });
}