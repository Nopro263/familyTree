import { callbacks } from "./data.js";
import { getNodeByHTMLId, getRelationshipByHTMLId } from "./tree.js";

let lastId = 0;

const dragData = {};

const getVal = (style) => {
    return parseInt(style.substring(0, style.length - 2)) || 0;
}

const setNewAbsolutePosition = (element, oldPos, newPos) => {
    const dx = newPos.clientX - oldPos.clientX;
    const dy = newPos.clientY - oldPos.clientY;

    element.style.left = `${ getVal(element.style.left) + dx }px`;
    element.style.top = `${ getVal(element.style.top) + dy }px`;

    if(element.classList.contains("element")) {
        callbacks.onMoveNode(getNodeByHTMLId(element.id), [newPos.clientX, newPos.clientY]);
    } else {
        callbacks.onMoveRelationship(getRelationshipByHTMLId(element.id), [newPos.clientX, newPos.clientY]);
    }
}

export const initCanvas = (canvas) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    //svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", window.innerWidth);
    svg.setAttribute("height", window.innerHeight  - document.querySelector("header").offsetHeight);
    svg.setAttribute("viewBox", "0 0 " + window.innerWidth + " " + (window.innerHeight  - document.querySelector("header").offsetHeight));

    addEventListener("resize", (event) => {
        svg.setAttribute("width", window.innerWidth);
        svg.setAttribute("height", window.innerHeight - document.querySelector("header").offsetHeight);
        svg.setAttribute("viewBox", "0 0 " + window.innerWidth + " " + (window.innerHeight - document.querySelector("header").offsetHeight));
    });

    

    canvas.appendChild(svg);

    canvas.addEventListener("dragover", (ev) => {
        ev.preventDefault(); // allow dropping
    });

    canvas.addEventListener("drop", (ev) => {
        ev.preventDefault();

        let _id = ev.dataTransfer.getData("text");
        const element = document.getElementById(_id);
        const data = dragData[_id];

        element.classList.remove("dragging");

        setNewAbsolutePosition(element, data, ev);
    });
}

export const createElement = (canvas) => {
    const element = document.createElement("div");

    element.id = `ELEMENT_${lastId++}`
    element.draggable = true;
    element.classList.add("element");

    canvas.appendChild(element);

    element.addEventListener("dragstart" , (ev) => {
        ev.dataTransfer.setData("text", ev.target.id);
        ev.target.classList.add("dragging");

        dragData[ev.target.id] = {
            "clientX": ev.clientX,
            "clientY": ev.clientY,
        }
    });

    element.addEventListener("dragend" , (ev) => {
        ev.target.classList.remove("dragging");
    });

    element.style.left = `${ window.innerWidth / 2 }px`;
    element.style.top = `${ window.innerHeight / 2 }px`;

    return element;
}


export const connectElements = (canvas, element1, element2) => {
    const svg = canvas.querySelector("svg");

    const svgns = "http://www.w3.org/2000/svg";

    let line1 = document.createElementNS(svgns, "line");
    let line2 = document.createElementNS(svgns, "line");



    const element = document.createElement("div");

    element.id = `LINE_${element1.id}_${element2.id}`
    element.draggable = true;
    element.classList.add("line");

    element.addEventListener("dragstart" , (ev) => {
        ev.dataTransfer.setData("text", ev.target.id);
        ev.target.classList.add("dragging");

        dragData[ev.target.id] = {
            "clientX": ev.clientX,
            "clientY": ev.clientY,
        }
    });

    element.addEventListener("dragend" , (ev) => {
        ev.target.classList.remove("dragging");
    });

    canvas.appendChild(element);



    const updatePos = () => {

        element.style.left = `${(getVal(element1.style.left) + element1.offsetWidth / 2 + getVal(element2.style.left) + element2.offsetWidth / 2 ) / 2 - element.offsetWidth / 2}px`;
        element.style.top = `${(getVal(element1.style.top) + element1.offsetHeight / 2 + getVal(element2.style.top) + element2.offsetHeight / 2 ) / 2 - element.offsetHeight / 2}px`;

        element.dispatchEvent(new DragEvent("dragend"));
        
        updateOtherPos();
    }

    const updateOtherPos = () => {
        line1.setAttribute("x1", getVal(element1.style.left) + element1.offsetWidth / 2);
        line1.setAttribute("y1", getVal(element1.style.top) + element1.offsetHeight / 2);
        line1.setAttribute("x2", getVal(element.style.left) + element.offsetWidth / 2);
        line1.setAttribute("y2", getVal(element.style.top) + element.offsetHeight / 2);

        line2.setAttribute("x1", getVal(element.style.left) + element.offsetWidth / 2);
        line2.setAttribute("y1", getVal(element.style.top) + element.offsetHeight / 2);
        line2.setAttribute("x2", getVal(element2.style.left) + element2.offsetWidth / 2);
        line2.setAttribute("y2", getVal(element2.style.top) + element2.offsetHeight / 2);
    }
    
    updatePos();

    element1.addEventListener("dragend", updatePos);
    element2.addEventListener("dragend", updatePos);
    element.addEventListener("dragend", updateOtherPos);

    if(!element.lines) {
        element.lines = [];
    }

    element.lines.push({line1, line2, updatePos, element1, element2});

    line1.setAttribute("stroke", "#5cceee");
    line2.setAttribute("stroke", "#5cceee");

    

    svg.appendChild(line1);
    svg.appendChild(line2);

    return element;
}

export const connectDirect = (canvas, element1, element2) => {
    const svg = canvas.querySelector("svg");

    const svgns = "http://www.w3.org/2000/svg";

    let line = document.createElementNS(svgns, "line");

    if(!element1.dlines) {
        element1.dlines = [];
    }
    if(!element2.dlines) {
        element2.dlines = [];
    }

    const updatePos = () => {
        line.setAttribute("x1", getVal(element1.style.left) + element1.offsetWidth / 2);
        line.setAttribute("y1", getVal(element1.style.top) + element1.offsetHeight / 2);
        line.setAttribute("x2", getVal(element2.style.left) + element2.offsetWidth / 2);
        line.setAttribute("y2", getVal(element2.style.top) + element2.offsetHeight / 2);
    }

    updatePos();

    element1.addEventListener("dragend", updatePos);
    element2.addEventListener("dragend", updatePos);

    element1.dlines.push({line, updatePos, "element": element2});
    element2.dlines.push({line, updatePos, "element": element1});

    line.setAttribute("stroke", "#5cceee");

    svg.appendChild(line);
}

export const setPosition = (element, position) => {

    element.style.left = `${position[0]}px`;
    element.style.top = `${position[1]}px`;

    element.dispatchEvent(new DragEvent("dragend"));
}

export const getPosition = (element) => {
    return [getVal(element.style.left), getVal(element.style.top)]
}

export const scale = (canvas, delta) => {
    const scale = parseFloat(canvas.style.getPropertyValue("scale") == "" ? "1" : canvas.style.getPropertyValue("scale")) + (delta >= 1 ? 0.1 : -0.1);
    for(let index = 0; index < canvas.children.length; index++) {
        const element = canvas.children[index];

        if(!element.classList.contains("element")) {
            continue;
        }

        const position = getPosition(element);
        setPosition(element, [position[0] * delta , position[1] * delta]);
    }

    canvas.style.setProperty("scale", scale);
}

export const moveAllElements = (canvas, delta) => {
    for(let index = 0; index < canvas.children.length; index++) {
        const element = canvas.children[index];

        if(!element.classList.contains("element")) {
            continue;
        }

        const position = getPosition(element);
        setPosition(element, [position[0] + delta[0] , position[1] + delta[1]]);
    }
}

export const removeElement = (canvas, element) => {
    if(element.dlines) {
        element.dlines.forEach(line => {
            canvas.querySelector("svg").removeChild(line.line);
            line.element.removeEventListener("dragend", line.updatePos);
        });
    }

    if(element.lines) {
        element.lines.forEach(line => {
            canvas.querySelector("svg").removeChild(line.line1);
            canvas.querySelector("svg").removeChild(line.line2);

            line.element1.removeEventListener("dragend", line.updatePos);
            line.element2.removeEventListener("dragend", line.updatePos);
        })
    }

    element.parentElement.removeChild(element);
}