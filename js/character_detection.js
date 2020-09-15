/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 03.09.2020
 */

"use strict";

/**
 * Vertaa alueen ja kirjaimen osuvuutta
 * 
 * param matrix {number[][]} koko kuvan matriisi
 * param area {Area} verrattavan kirjaimen rajat
 * param sample {number[][]} verrattava kirjain
 * return {number} alueen ja kirjaimen vastaavuus
 */
function compareCharacter(matrix, areaObj, sample) {
    const width = areaObj.pixelWidth();
    const height = areaObj.pixelHeight();
    
    var sad = 0; // sum of absolute differences
    const sadMax = width*height*255;

    var xs = 0; var ys = 0;
    
    for (var x = areaObj.topLeft[0]; x <= areaObj.bottomRight[0]; x++) {
	for (var y = areaObj.topLeft[1]; y <= areaObj.bottomRight[1]; y++) {
	    sad += Math.abs(matrix[x][y] - sample[xs][ys]);
	    ys++;
	}
	xs++;
    }

    return 1 - (sad/sadMax); // relative to maximum sad
}

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
	
	console.log("Detect Characters started: IN DEVELOPMENT");
	
	// Taulukko, johon kerataan tunnistetut merkit:
	var characters = [];
	
	// Luodaan intervalli, joka kasittelee loydetyt alueet ja tekee tunnistuksen:
	var loop = setInterval(process, 10);
	
	// Luodaan vaste data:
	var comparison_characters = [];
	var comparison_data = [];
	for (var ascii_index = 33; ascii_index < 127; ascii_index++) {
			comparison_characters.push(String.fromCharCode(ascii_index));
			comparison_data.push(makeCharacter(comparison_characters[comparison_characters.length - 1], "256px Arial"));		
	}
	
	
	/**
	 * Prosessi "looppi", joka tekee jokaiselle loydetylle alueelle tunnistuksen, joka maarittelee loytyiko merkki
	 */
	function process() {
		
		const MAX_AREA_PROCESS_COUNT = 10;
		var areas_processed_count = 0;
		
		while (areas_processed_count < MAX_AREA_PROCESS_COUNT && areas.length > 0) {
			
			// Lasketaan todennakoisyydet suhteessa vastedatan merkkeihin:
			var probablity_array = [];
			for (var i = 0; i < comparison_data.length; i++) {
				var probablity = 0;
				
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
			if (probablity_array[best_probablity_index] > 0.5) {
				characters.push(new Character(comparison_characters[best_probablity_index], areas[0]));
			}
			
			// Poistetaan kasitelty Area -olio areas taulukosta:
			areas.splice(0, 1);
			
			areas_processed_count++;
		}	
		// Kaikki alueet kasitelty: jatketaan suoritusta detectCharacterGroups funktioon (character_group_detection.js)
		if (areas.length < 1) {
			clearInterval(loop);
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
