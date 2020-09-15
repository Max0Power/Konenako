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
 * Etsii Pikselitaulukosta kaikki merkit, muodostaa merkki -oliot taulukkoon ja palauttaa sen.
 @param {Int[][]} bw_m - Mustavalko kuvan matriisi
 @return {Character[]} - Palauttaa kaikki loydetyt Character -oliot taulukossa
 */
function findCharacters(bw_m, look_out_distance) {
	
	// Piirto:
	drawPixelArray(bw_m);
	
	// Aputaulukko helpottamaan naapureiden x ja y koordinaattien laskentaa:
	var neighbour_pointers = generateNeighbourPointers(look_out_distance);
	
	// processed matriisi merkkaa tietoa onko pikseli kasitelty vai ei:
	var processed = new Array(bw_m.length);
	for (var x = 0; x < bw_m.length; x++) {
		var tmp = new Array(bw_m[0].length);
		for (var y = 0; y < bw_m[0].length; y++) {
			tmp[y] = 0;
		}
		processed[x] = tmp;
	}
	var processed_count = 0;
	
	var open_set = [];
	var i_x = 0;
	var i_y = 0;
	
	var area_top_left;
	var area_bottom_right;
	
	var characters = [];
	
	var loop = setInterval(process, 10);
	
	/*
	 * Prosessi "looppi", joka suorittaa mahdollisten kirjainten etsimisen kuvasta.
	 * Suoritetaan intervallina, koska operaatio on suhteellisen raskas ja selain voi kaatua esimerkiksi liian isosta kuvasta.
	 */
	function process() {
		// Muuttuja, jotka rajoittavat silmukoiden suorittamista:
		const MAX_PROCESSED_COUNT = 100000; // <-- Luku, joka maaraa maksimin kuinka monta pikselia voidaan prosessoida yhden intervallin kierroksen aikana
		var processed_counter = 0; // <-- merkkaa kuinka monta on kasitelty yhden intervallin kierroksen aikana
		
		// Jatketaan silmukkaa niin kauan, etta maksimi maara pikseleita on prosessoitu tai koko kuva on prosessoitu:
		while(processed_counter < MAX_PROCESSED_COUNT && processed_count < processed.length * processed[0].length) {
			
			// Jos open_set taulukossa on alkioita --> kasitellaan jokaisen alkion naapurit ja maaritellaan pikseleiden kattamaa aluetta:
			while(open_set.length > 0 && processed_counter < MAX_PROCESSED_COUNT) {
				for (var i = 0; i < neighbour_pointers.length; i++) {
					var n_x = open_set[0][0] + neighbour_pointers[i][0];
					var n_y = open_set[0][1] + neighbour_pointers[i][1];
						
					// Jos laskettu naapurin sijainti on matriisin ulkopuolella --> jatketaan seuraavaan naapuriin:
					if (n_x < 0 || n_x >= bw_m.length || n_y < 0 || n_y >= bw_m[0].length) continue;
					
					// jos naapuria ei ole prosessoitu:
					if (processed[n_x][n_y] === 0) {
						// merkataan prosessoiduksi ja kasvatetaan tarpeellisia muuttujia
						processed[n_x][n_y] = 1;
						processed_count++;
						processed_counter++;
						// Jos pikseli on musta --> lasketaan muodostuvaa aluetta ja lisataan se open_set taulukkoon:
						if (bw_m[n_x][n_y] === 0) {
							// muodostuvan alueen laskenta:
							if (n_x < area_top_left[0]) area_top_left[0] = n_x;
							if (n_x > area_bottom_right[0]) area_bottom_right[0] = n_x;
							if (n_y < area_top_left[1]) area_top_left[1] = n_y;
							if (n_y > area_bottom_right[1]) area_bottom_right[1] = n_y;
							// open_set listaan lisays:
							open_set.push([n_x, n_y]);
						}
					}
				}
					
				// Poistetaan jokaisella while silmukan kierroksella open_setin ensimmainen alkio, jota kaytetaan naapureiden sijainnin laskentaan:
				open_set.splice(0,1);
				
				// Jos open_set on tyhjentynyt --> alue on loytynyt ja luodaan Character -olio + piirretaan kanvasille loytynyt alue
				if (open_set.length <= 0) {
					characters.push(new Character(area_top_left, area_bottom_right));
					drawArea(area_top_left, area_bottom_right);
				}
			}
			// Jos open setissa ei ole pikseleita --> etsitaan seuraava musta pikseli
			if (open_set.length < 1) {
				for (var x = i_x; x < bw_m.length; x++) {
					i_x = x;
					for (var y = i_y; y < bw_m[0].length; y++) {
						i_y = y;
						// Jos ei ole prosessoitu --> prosessoidaan
						if (processed[x][y] === 0) {
							processed[x][y] = 1;
							processed_count++;
							processed_counter++;
							// jos musta --> lisataan open_set taulukkoon
							if (bw_m[x][y] === 0) {
								open_set.push([i_x, i_y]);
								area_top_left = [i_x, i_y];
								area_bottom_right = [i_x, i_y];
								
								break;
							}
						}
					}
					if (open_set.length > 0) break;
					i_y = 0;
				}
			}
		}
		
		// Koko kuva on kasitelty: TODO --> Jatka tanne ohjelman etenemista:
		if (processed_count >= processed.length * processed[0].length && open_set.length < 1) {
			console.log(processed_count + "/" + processed.length * processed[0].length);
			clearInterval(loop);
		}
	}
	
	
	/**
	 * Apufunktio naapureiden osoittimien generointiin annetulla etaisyydella
	 */
	function generateNeighbourPointers(look_out_distance) {
		if (look_out_distance < 1) look_out_distance = 1;
		
		// Taulukko, johon generoidaan naapureiden osoittimet:
 		var pointers = [];
		
		for (var reach = 1; reach <= look_out_distance; reach++) {
			// alustetaan x ja y = vasen ylakulma
			var x = -reach;
			var y = reach;
			
			// vasen yla --> oikea yla
			while(x <  reach) {
				pointers[pointers.length] = [x, y];
				x++;
			}
			// oikea yla --> oikea ala
			while(y > -reach) {
				pointers[pointers.length] = [x, y];
				y--;
			}
			// oikea ala --> vasen ala
			while (x > -reach) {
				pointers[pointers.length] = [x, y];
				x--;
			}
			// vasen ala --> vasen yla
			while(y < reach) {
				pointers[pointers.length] = [x, y];
				y++;
			}
		}
		
		return pointers;
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
	constructor(topLeft, bottomRight) {
		this.topLeft = topLeft;
		this.bottomRight = bottomRight;
		this.val = "";
	}
	
	determineValue(bw_m) {
		
		
	}
	
	pixelWidth() {
		return Math.abs(this.bottomRight[0] - this.topLeft[0]);
	}
	
	
	pixelHeight() {
		return Math.abs(this.bottomRight[1] - this.topLeft[1]);
	}
	
}
