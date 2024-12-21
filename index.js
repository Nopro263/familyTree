import { createElement, initCanvas } from "./canvas.js";

const canvas = document.querySelector(".mainCanvas");

initCanvas(canvas);

createElement(canvas).innerHTML = "A";
createElement(canvas).innerHTML = "B";