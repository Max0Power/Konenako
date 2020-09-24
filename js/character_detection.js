/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 03.09.2020
 */

"use strict";


/**
 * Vertaa alueen ja mallin pikseleiden osuvuutta
 * 
 * param matrix {number[][]} koko kuvan matriisi
 * param areaObj {Area} verrattavan kirjaimen rajat
 * param sample {number[][]} verrattava kirjain
 * return {number} alueen ja kirjaimen vastaavuus
 */
function compareCharacter(matrix, areaObj, sample) {
    // shortened names for width and height
    const width = areaObj.pixelWidth(); // area_detection.js
    const height = areaObj.pixelHeight(); // area_detection.js

	var sample_scaled_width = parseInt(height / sample[0].length * sample.length, 10);
	if (Math.abs(sample_scaled_width - width) > 10) {
		return 0;
	}
	
	// largest possible difference
    const sadMax = width*height*255;
	
    // resize the sample image to the area size
    sample = scaleMatrix(sample, width, height); // kaavat.js

    var xs = 0; var sad = 0;
    for (var x = areaObj.topLeft[0]; x <= areaObj.bottomRight[0]; x++) { // area_detection.js
	var ys = 0;
	for (var y = areaObj.topLeft[1]; y <= areaObj.bottomRight[1]; y++) { // area_detection.js
	    // sum of absolute differences (SAD)
	    sad += Math.abs(matrix[x][y] - sample[xs][ys]);
	    ys++;
	}
	xs++;
    }

    return 1 - (sad/sadMax); // relative to maximum SAD
}

/**
 * Palauttaa matriisin joka vastaa kirjaimen fonttia
 * 
 * Huom! Pienellä fontilla kirjaimen rajoissa virhettä
 * Huom! Esimerkki fontti "256px Arial"
 * 
 * param text {char} kirjain josta tehdään mallikuva
 * param font {string} kirjaimen koko ja fontti
 * return {number[][]} mallikirjaimen matriisi
 */
function makeCharacter(text, size, font) {
    // create a canvas for sample character
    const canvas = document.createElement("CANVAS");
    const context = canvas.getContext("2d");

    // measure width and height
    setContext(context, size, font);

    function setContext(context, size, font) {
	// canvas context settings
	context.font =  `${size}px ${font}`;
	context.fillStyle = "black";
	context.textBaseline = "top";
    }

    // measure text width and height based on context
    const metrics = context.measureText(text);
    const actualLeft = metrics.actualBoundingBoxLeft;
    const actualRight = metrics.actualBoundingBoxRight;
    const actualTop = metrics.actualBoundingBoxAscent;
    const actualBottom = metrics.actualBoundingBoxDescent;

    // setting width or height resets canvas context
    canvas.width = actualLeft + actualRight;
    canvas.height = actualTop + actualBottom;
	
    // default white background
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // canvas context was reset
    setContext(context, size, font);

    // fit to canvas starting from topleft corner
    context.fillText(text, actualLeft, actualTop);

    // convert measured canvas to a matrix 
    var matrix = makeCanvasMatrix(context);
    
    function makeCanvasMatrix(context) {
	// shortened names for width and height
	const width = context.canvas.width;
	const height = context.canvas.height;

	// convert canvas image data into unsigned 32-bit array
	const imgd = context.getImageData(0, 0, width, height);
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
    
    return matrix;
}


/**
 * Tekee tunnistuksen loydetyille alueille mustavalkokuvasta
 * Jatkaa suorituksen jalkeen character_group_detection.js skriptiin, jossa etsitaan yhteen kuuluvat merkkijonot
 * @param {Int[][]} bw_m - Mustavalko kuvan matriisi
 * @param {Area[]} areas - taulukko Area -olioita, jotka loydettiin detectAreas -funktiolla (area_detection.js)
 */
function detectCharacters(bw_m, areas) {
	
	console.log("Detect Characters started: IN DEVELOPMENT");
	
	// Taulukko, johon kerataan tunnistetut merkit:
	var characters = [];
	
	// Asetetaan intervalli, joka kasittelee loydetyt alueet ja tekee tunnistuksen:
	INTERVAL = setInterval(process, 10);
	
	// Luodaan vaste data:
	var comparison_characters = [];
	var comparison_data = [];
	for (var ascii_index = 33; ascii_index < 127; ascii_index++) {
	    var c = String.fromCharCode(ascii_index);
	    comparison_characters.push(c);
	    var compare_m = makeCharacter(c, 64, "Arial");
	    comparison_data.push(compare_m);
	}
	
	
	/**
	 * Prosessi "INTERVALpi", joka tekee jokaiselle loydetylle alueelle tunnistuksen, joka maarittelee loytyiko merkki
	 */
	function process() {
		
		const MAX_AREA_PROCESS_COUNT = 10;
		var areas_processed_count = 0;
		
		while (areas_processed_count < MAX_AREA_PROCESS_COUNT && areas.length > 0) {
			
			// Lasketaan todennakoisyydet suhteessa vastedatan merkkeihin:
			var probablity_array = [];
			for (var i = 0; i < comparison_data.length; i++) {
				var probablity = compareCharacter(bw_m, areas[0], comparison_data[i]);		
				probablity_array.push(probablity);
			}
			
			// Etsitaan paras laskettu todennakoisyys:
			var best_probablity_index = 0;
			for (var i = 1; i < probablity_array.length; i++) {
				if(probablity_array[i] > probablity_array[best_probablity_index]) {
					best_probablity_index = i;
				}
			}
		    
			// Jos paras todennakoisyys on yli maaritellyn raja-arvon --> lisataan Character olio characters taulukkoon
			if (probablity_array[best_probablity_index] > 0.40) {
			    characters.push(new Character(comparison_characters[best_probablity_index], areas[0]));
			    drawArea(areas[0].topLeft, areas[0].bottomRight, "green");
			    console.log(comparison_characters[best_probablity_index]);
			}
			
			// Poistetaan kasitelty Area -olio areas taulukosta:
			areas.splice(0, 1);
			
			areas_processed_count++;
		}	
		// Kaikki alueet kasitelty: jatketaan suoritusta detectCharacterGroups funktioon (character_group_detection.js)
		if (areas.length < 1) {
			clearInterval(INTERVAL);
			console.log("Characters found: " + characters.length);
			detectCharacterGroups(characters)
		}
	}
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
	constructor(value, bounds) {
		this.value = value;
		this.bounds = bounds;
	}
	
	determineValue(bw_m) {
		
		
	}
}
