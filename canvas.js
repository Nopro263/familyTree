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
}

export const initCanvas = (canvas) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    //svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", window.innerWidth);
    svg.setAttribute("height", window.innerHeight);
    svg.setAttribute("viewBox", "0 0 " + window.innerWidth + " " + window.innerHeight);
    
    console.log(svg)

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

    return element;
}


export const connectElements = (canvas, element1, element2) => {
    const svg = canvas.querySelector("svg");

    // variable for the namespace 
    const svgns = "http://www.w3.org/2000/svg";

    // make a simple rectangle
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

        element.style.left = `${(getVal(element1.style.left) + element1.offsetWidth / 2 + getVal(element2.style.left) + element2.offsetWidth / 2 ) / 2 - element.offsetWidth}px`;
        element.style.top = `${(getVal(element1.style.top) + element1.offsetHeight / 2 + getVal(element2.style.top) + element2.offsetHeight / 2 ) / 2 - element.offsetHeight}px`;

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

    line1.setAttribute("stroke", "#5cceee");
    line2.setAttribute("stroke", "#5cceee");

    

    svg.appendChild(line1);
    svg.appendChild(line2);

    return element;
}