let lastId = 0;

const dragData = {};

const setNewAbsolutePosition = (element, oldPos, newPos) => {
    const dx = newPos.clientX - oldPos.clientX;
    const dy = newPos.clientY - oldPos.clientY;

    const getVal = (style) => {
        return parseInt(style.substring(0, style.length - 2)) || 0;
    }

    element.style.left = `${ getVal(element.style.left) + dx }px`;
    element.style.top = `${ getVal(element.style.top) + dy }px`;
}

export const initCanvas = (canvas) => {
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

        console.log(ev);
    });

    element.addEventListener("dragend" , (ev) => {
        ev.target.classList.remove("dragging");
    });

    return element;
}