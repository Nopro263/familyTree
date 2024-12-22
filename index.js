import { connectElements, createElement, initCanvas } from "./canvas.js";

const canvas = document.querySelector(".mainCanvas");

initCanvas(canvas);

const a = createElement(canvas);
a.innerHTML = "A";
const b = createElement(canvas);
b.innerHTML = "B";

a.addEventListener("dragend", () => {
    connectElements(canvas, a,b);
})