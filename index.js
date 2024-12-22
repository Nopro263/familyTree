import { connectElements, createElement, initCanvas } from "./canvas.js";

const canvas = document.querySelector(".mainCanvas");

initCanvas(canvas);

const a = createElement(canvas);
a.innerHTML = "A";
const b = createElement(canvas);
b.innerHTML = "B";

const line_ab = connectElements(canvas, a,b);
line_ab.innerHTML = "⚭";