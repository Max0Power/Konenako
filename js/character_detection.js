/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 03.09.2020
 */

"use strict";

/**
 * Huom! Pienellä fontilla kirjaimen rajoissa virhettä
 * Huom! Sopiva fonttikoko "256px Arial"
 */
function makeCharacter(text, font) {
    var canvas = document.createElement("CANVAS");
    var context = canvas.getContext("2d");

    // measure width and height
    setContext(context, font);

    function setContext(context, font) {
	// canvas context settings
	context.font = font;
	context.fillStyle = "black";
	context.textBaseline = "top";
    }

    // measure text width and height based on context
    let metrics = context.measureText(text);
    let actualLeft = metrics.actualBoundingBoxLeft;
    let actualRight = metrics.actualBoundingBoxRight;
    let actualTop = metrics.actualBoundingBoxAscent;
    let actualBottom = metrics.actualBoundingBoxDescent;

    // setting width or height resets canvas context
    context.canvas.width = actualLeft + actualRight;
    context.canvas.height = actualTop + actualBottom;

    // canvas context was reset
    setContext(context, font);

    // fit to canvas starting from topleft corner
    context.fillText(text, actualLeft, actualTop);

    var matrix = makeCanvasMatrix(context);
    
    function makeCanvasMatrix(context) {
	var width = context.canvas.width;
	var height = context.canvas.height;
	
	var imgd = context.getImageData(0, 0, width, height);
	var data = new Uint32Array(imgd.data.buffer);
	
	var matrix = new Array(width);
	for (var x = 0; x < width; x++) {
	    matrix[x] = new Array(height);
	    for (var y = 0; y < height; y++) {
		var pixel = data[(y*width)+x];

		var r = (0xff000000 & pixel) >>> 24;
		var b = (0x00ff0000 & pixel) >>> 16;
		var g = (0x0000ff00 & pixel) >>> 8;

		matrix[x][y] = Math.round((r+b+g)/3.0);
	    }
	}
	
	return matrix;
    }
    
    return matrix;
}


/**
 * Tekee tunnistuksen loydetyille alueille mustavalkokuvasta
 * Jatkaa suorituksen jalkeen character_group_detection.js skriptiin, jossa etsitaan yhteen kuuluvat merkkijonot
 * @param {Int[][]} bw_m - Mustavalko kuvan matriisi
 * @param {Area[]} areas - taulukko Area -olioita, jotka loydettiin detectAreas -funktiolla (area_detection.js)
 */
function detectCharacters(bw_m, areas) {
	console.log("Detect Characters started: TODO");
	var characters = [];
	
	
	var loop = setInterval(process, 10);
	
	function process() {
		
		clearInterval(loop);
	}
	
	detectCharacterGroups(characters)
}


/**
 * Merkki -olio, sisaltaa yksittaisen merkin kattavan alueen PixelArraysta
 */
class Character {
	
	/**
	 * Muodostaja Merkki -oliolle
	 * @param {[x, y]} topLeft - Taulukko osoittamaan alueen vasen ylanurkka
	 * @param {[x, y]} bottomRight - Taulukko osoittamaan alueen oikea alanurkka
	 */
	constructor(topLeft, bottomRight) {
		this.topLeft = topLeft;
		this.bottomRight = bottomRight;
		this.val = "";
	}
	
	determineValue(bw_m) {
		
		
	}
}
