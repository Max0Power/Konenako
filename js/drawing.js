/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 15.09.2020
 * Kanvasille piirtamisen funktiot
 */
 
"use strict";


/**
 * Piirtaa matriksin sisallon dokumentissa olevaan "Drawing" kanvakseen
 */
function drawPixelArray(matrix) {
	var canvas = document.getElementById("Drawing");
	
	canvas.width = matrix.length;
	canvas.height = matrix[0].length;
	
	var ctx = canvas.getContext("2d");
	
	var imgData = ctx.createImageData(matrix.length, matrix[0].length);
	var data = imgData.data;
	
	for (var x = 0; x < matrix.length; x++) {
		for (var y = 0; y < matrix[0].length; y++) {
			var pixelIndex = y * (matrix.length * 4) + (x * 4);
			data[pixelIndex] = matrix[x][y];
			data[pixelIndex + 1] = matrix[x][y];
			data[pixelIndex + 2] = matrix[x][y];
		    data[pixelIndex + 3] = 255;
		}
	}
	
	ctx.putImageData(imgData, 0, 0);
}


/**
 * Piirtaa borderin annetun alueen ymparilla
 */
function drawArea(topLeft, bottomRight, color) {
	var canvas = document.getElementById("Drawing");
	var ctx = canvas.getContext("2d");
	ctx.strokeStyle = color;
	ctx.lineWidth = 1;
	ctx.strokeRect(topLeft[0] - 1, topLeft[1] - 1,
	Math.abs(bottomRight[0] - topLeft[0]) + 3, Math.abs(bottomRight[1] - topLeft[1]) + 3);
	
}



/**
 * Piirtofunktio, jota voi tarvittaessa kayttaa nopeaan testaukseen
 */
function testingDrawPixelArray(parent_div, matrix) {
	var canvas = document.createElement("CANVAS");
	parent_div.appendChild(canvas);
	
	canvas.width = matrix.length;
	canvas.height = matrix[0].length;
	
	var ctx = canvas.getContext("2d");
	
	var imgData = ctx.createImageData(matrix.length, matrix[0].length);
	var data = imgData.data;
	
	for (var x = 0; x < matrix.length; x++) {
		for (var y = 0; y < matrix[0].length; y++) {
			var pixelIndex = y * (matrix.length * 4) + (x * 4);
			data[pixelIndex] = matrix[x][y];
			data[pixelIndex + 1] = matrix[x][y];
			data[pixelIndex + 2] = matrix[x][y];
		    data[pixelIndex + 3] = 255;
		}
	}
	parent_div.appendChild(document.createElement("br"));
	
	ctx.putImageData(imgData, 0, 0);
}