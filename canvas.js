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
    const upperLeftElement = getVal(element1.style.left) < getVal(element2.style.left) ? element1 : element2;
    const lowerRightElement = getVal(element1.style.left) >= getVal(element2.style.left) ? element1 : element2;

    console.log(upperLeftElement, lowerRightElement);

    const _dx = getVal(lowerRightElement.style.left) - getVal(upperLeftElement.style.left) - upperLeftElement.offsetWidth;
    const _dy = getVal(lowerRightElement.style.top) - getVal(upperLeftElement.style.top) - upperLeftElement.offsetHeight;

    const dx = Math.abs(_dx);
    const dy = Math.abs(_dy);
    const flipx = _dx != dx;
    const flipy = _dy != dy;

    const element = document.createElement("div");
    element.classList.add("line");

    element.style.width = `${dx}px`;
    element.style.height = `${dy}px`;
    element.style.left = `${getVal(upperLeftElement.style.left) + upperLeftElement.offsetWidth}px`;
    element.style.top = `${getVal(upperLeftElement.style.top) + upperLeftElement.offsetHeight}px`;

    element.style.transform = `scale(${flipx ? -1 : 1}, ${flipy ? -1 : 1}) translate(${flipx ? dx : 0}px, ${flipy ? dy : 0}px)`;

    canvas.appendChild(element);
}