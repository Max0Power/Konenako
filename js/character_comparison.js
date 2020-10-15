/**
 * @author Jussi Parviainen ja Harri Linna
 * @created 13.10 02.09.2020
 */
 
"use strict";

const MAX_EPS_TO_RATIO = 0.2;

class ComparisonData {
	
	constructor() {
		this.comparison_data = [];
		this.comparison_characters = [];
		this.comparison_fonts = [];
 	}
	
	addCharacterDataSet(data, size, font) {
		for (var i = 0; i < data.length; i++) {
			this.addCharacter(data[i], size, font);
		}
	}
	
	addCharacter(c, size, font) {
		// create a canvas for sample character
		const canvas = document.createElement("CANVAS");
		const ctx = canvas.getContext("2d");

		// measure width and height
		setContext(ctx, size, font);

		// measure c width and height based on ctx
		const metrics = ctx.measureText(c);
		const actualLeft = metrics.actualBoundingBoxLeft;
		const actualRight = metrics.actualBoundingBoxRight;
		const actualTop = metrics.actualBoundingBoxAscent;
		const actualBottom = metrics.actualBoundingBoxDescent;

		// setting width or height resets canvas ctx
		canvas.width = actualLeft + actualRight;
		canvas.height = actualTop + actualBottom;
		
		// default white background
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// canvas ctx was reset
		setContext(ctx, size, font);

		// fit to canvas starting from topleft corner
		ctx.fillText(c, actualLeft, actualTop);

		// Lisataan data olioon
		this.comparison_characters.push(c);
		this.comparison_fonts.push(font);
		this.comparison_data.push(makeCanvasMatrix(ctx));
		
		
		function setContext(ctx, size, font) {
			// canvas ctx settings
			ctx.font = `${size}px ${font}`;
			ctx.fillStyle = "black";
			ctx.textBaseline = "top";
		}
		
		function makeCanvasMatrix(ctx) {
			// shortened names for width and height
			const width = ctx.canvas.width;
			const height = ctx.canvas.height;

			// convert canvas image data into unsigned 32-bit array
			const imgd = ctx.getImageData(0, 0, width, height);
			const data = new Uint32Array(imgd.data.buffer);
			
			var matrix = new Array(width);
			for (var x = 0; x < width; x++) {
				matrix[x] = new Array(height);
				for (var y = 0; y < height; y++) {
					// pixel index in 32-bit array 
					var pixel = data[(y*width)+x];

					// red, green and blue (RGB) values
					var r = (0xff000000 & pixel) >>> 24;
					var g = (0x00ff0000 & pixel) >>> 16;
					var b = (0x0000ff00 & pixel) >>> 8;

					// calculate average between RGB values
					var mean = Math.round((r+g+b)/3.0);
					matrix[x][y] = mean < 255 ? 0 : 255;
				}
			}	
			return matrix;
		}
	}
	
	compareToCharacter(c, m_to_compare_with) {
		for (var i = 0; i < this.comparison_characters.length; i++) {
			if (this.comparison_characters[i] === c) {
				return this.compare(i, m_to_compare_with);
			}
		}
		return 0;
	}
	
	
	compare(index, m_to_compare_with) {
		if (index < 0 || index > this.comparison_data.length - 1) return 0;
		
		var m_ratio = m_to_compare_with.length / m_to_compare_with[0].length;
		var sample_ratio = this.comparison_data[index].length / this.comparison_data[index][0].length;
		var eps = 0.2;
		if (m_ratio < sample_ratio - MAX_EPS_TO_RATIO || m_ratio > sample_ratio + MAX_EPS_TO_RATIO) return 0;
		if (m_to_compare_with.length < 5 || m_to_compare_with[0].length < 5) return 0;
		
		//..... .... lopulta skaalataan samaan kokoon
		var sample_scaled = scaleMatrix(this.comparison_data[index], m_to_compare_with.length, m_to_compare_with[0].length); // kaavat.js
		
		return sad(m_to_compare_with, sample_scaled);
	}
	
	getCharacter(index) {
		if (index < 0 || index > this.comparison_characters.length - 1) return "INDEX WAS INVALID";
		
		return this.comparison_characters[index];
	}
	
	getFont(index) {
		if (index < 0 || index > this.comparison_characters.length - 1) return "INDEX WAS INVALID";
		
		return this.comparison_fonts[index];
	}
	
	getCharacterCount() {
		return this.comparison_characters.length;
	}
}
