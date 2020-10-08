/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 15.09.2020
 * Kanvasille piirtamisen funktiot
 */
 
"use strict";

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


function drawArea(topLeft, bottomRight, color) {
	var canvas = document.getElementById("Drawing");
	var ctx = canvas.getContext("2d");
	ctx.strokeStyle = color;
	ctx.lineWidth = 1;
	ctx.strokeRect(topLeft[0] - 1, topLeft[1] - 1,
	Math.abs(bottomRight[0] - topLeft[0]) + 3, Math.abs(bottomRight[1] - topLeft[1]) + 3);
	
}


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

function drawHOG(histograms36x1) {
	var canvas = document.createElement("CANVAS");
	document.body.appendChild(canvas);
	
	var width =(histograms36x1.length + 1) * 16;
	var height = (histograms36x1[0].length + 1) * 16;
	
	canvas.width = width;
	canvas.height = height;
	
	var ctx = canvas.getContext("2d");
	
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, width, height);
	
	var line_start_points = [
	[0, 7],
	[0, 4],
	[0, 1],
	[3, 0],
	[6, 0],
	[9, 0],
	[12, 0],
	[15, 1],
	[15, 4],
	];
	
	var line_end_points = [
	[15, 7],
	[15, 11],
	[15, 14],
	[12, 15],
	[9, 15],
	[6, 15],
	[3, 15],
	[0, 14],
	[0, 11],
	];
	
	for (var x = 0; x < histograms36x1.length; x++) {
		for (var y = 0; y < histograms36x1[0].length; y++) {
			
			for (var angle_index  = 0; angle_index < 9; angle_index++) {
				
				var col = parseInt((
					parseInt(histograms36x1[x][y][angle_index], 10) + 
					parseInt(histograms36x1[x][y][9 + angle_index], 10) + 
					parseInt(histograms36x1[x][y][18 + angle_index], 10) + 
					parseInt(histograms36x1[x][y][27 + angle_index], 10)
					), 10);
				if (col > 255) col = 255;
				if (col < 0) col = 0;
				
				var l_start_x = x * 16 + line_start_points[angle_index][0];
				var l_start_y = y * 16 + line_start_points[angle_index][1];
				var l_end_x = x * 16 + line_end_points[angle_index][0];
				var l_end_y = y * 16 + line_end_points[angle_index][1];

				
				ctx.strokeStyle = "rgb(" + col + "," + col + "," + col + ")";
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(l_start_x, l_start_y);
				ctx.lineTo(l_end_x, l_end_y);
				ctx.stroke();

			}
		}
	}
	
	console.log(histograms36x1);
	
}


function histograms36x1ToImagePixels(histograms36x1) {
	var width =(histograms36x1.length + 1) * 16;
	var height = (histograms36x1[0].length + 1) * 16;
	
	var m = new Array(width);
	for (var x = 0; x < width; x++) {
		m[x] = new Array(height);
		for (var y = 0; y < height; y++) {
			m[x][y] = 0;
		}
	}
	
	for (var x = 0; x < histograms36x1.length; x++) {
		for (var y = 0; y < histograms36x1[0].length; y++) {
			
		}
	}	
}