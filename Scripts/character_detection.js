/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 03.09.2020
 */

"use strict";

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

		matrix[x][y] = Math.floor((r+b+g)/3.0);
	    }
	}
	
	return matrix;
    }
    
    return matrix;
}

function findCharactersRecursive(t, reach) {
    const width = t.length;
    const height = t[0].length;

    var characters = new Array();

    // taulukko kertoo onko indeksissä käyty aiemmin
    var ones = luoMatriisi(width,height,true); // kaavat.js
    for (var i = 0; i < width; i++) {
	for (var j = 0; j < height; j++) {
	    if (tarkista(t,ones,i,j)) {
		// selvitetään interpoloitavat sijainnit
		var empty = annaTyhjat(t,ones,i,j,reach);
		characters.push(new Character(...empty));
	    }
	}
    }

    return characters;
}

function tarkista(t,ones,i,j) {
    if (i < 0 || j < 0) {
	return false;
    }
    if (i >= t.length || j >= t[i].length) {
	return false;
    }
    if (t[i][j] > 0) {
	return false;
    }

    return ones[i][j];
}

function annaTyhjat(t,ones,is,js,reach) {
    var empty = [[is,js]]; // found empty value
    ones[is][js] = false; // mark as visited

    var minX = Number.MAX_SAFE_INTEGER;
    var minY = Number.MAX_SAFE_INTEGER;
    
    var maxX = Number.MIN_SAFE_INTEGER;
    var maxY = Number.MIN_SAFE_INTEGER;

    while (empty.length > 0) {
	var [i,j] = empty.shift();

	// add to queue if not visited
	for (var x = -reach; x <= reach; x++) {
	    for (var y = -reach; y <= reach; y++) {
		var [a,b] = [i+x,j+y];
		if (tarkista(t,ones,a,b)) {
		    empty.push([a,b]); // found empty value
		    ones[a][b] = false; // mark as visited
		}
	    }
	}

	minX = i < minX ? i : minX;
	minY = j < minY ? j : minY;
	
	maxX = i > maxX ? i : maxX;
	maxY = j > maxY ? j : maxY;
    }

    // piirtää oikein kun kääntää y-arvot
    return [[minX,minY],[maxX,maxY]];
}

/**
 * Etsii Pikselitaulukosta kaikki merkit, muodostaa merkki -oliot taulukkoon ja palauttaa sen.
 @param {Int[][]} bw_m - Mustavalko kuvan matriisi
 @return {Character[]} - Palauttaa kaikki loydetyt Character -oliot taulukossa
 */
function findCharacters(bw_m, look_out_distance) {
	
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
	
	// alustetaan characters -taulukko, johon etitaan mustien pikseleiden ryhmat Character -olioina
	var characters = new Array();
	
	// Kaydaan lapi kuva ja etsitaan mustien pikseleiden ryhmat:
	for (var x = 0; x < bw_m.length; x++) {
		for (var y = 0; y < bw_m[0].length; y++) {
			
			// Jos pikseli on jo prosessoitu --> jatketaan seuraavaan pikseliin:
			if (processed[x][y] === 1) continue;
			
			// merkataan pikseli kasitellyksi:
			processed[x][y] = 1;
			
			// Jos pikseli on musta --> lahdetaan etsiman aluetta:
			if (bw_m[x][y] === 0) {
				
				// muodustavaa aluetta merkaavat parametrit:
				var area_top_left = [x, y];
				var area_bottom_right = [x,y];
				
				// Alustetaan open_set taulukko, jonka avulla kaydaan alueen pikselit lapi:
				var open_set = [[x,y]];
				
				// suoritetaan looppia niin kauan, etta open setissa ei ole alkioita_
				while(open_set.length > 0) {					
					
					// Lisataan open settiin naapurit, jotka ovat mustia ja joita ei olla kasitelty:
					for (var i = 0; i < neighbour_pointers.length; i++) {
						var n_x = open_set[0][0] + neighbour_pointers[i][0];
						var n_y = open_set[0][1] + neighbour_pointers[i][1];
						
						// Jos laskettu naapurin sijainti on matriisin ulkopuolella --> jatketaan seuraavaan naapuriin:
						if (n_x < 0 || n_x >= bw_m.length || n_y < 0 || n_y >= bw_m[0].length) continue;
						
						// Jos naapurin pikseli on musta ja sita ei ole viela prosessoitu --> prosessoidaan ja lisataan se open_set listaan
						if (bw_m[n_x][n_y] === 0 && processed[n_x][n_y] === 0) {
							// muodostuvan alueen laskenta:
							if (n_x < area_top_left[0]) area_top_left[0] = n_x;
							if (n_x > area_bottom_right[0]) area_bottom_right[0] = n_x;
							if (n_y < area_top_left[1]) area_top_left[1] = n_y;
							if (n_y > area_bottom_right[1]) area_bottom_right[1] = n_y;
							// open_set listaan lisays ja merkataan kasitellyksi:
							open_set[open_set.length] = [n_x, n_y];
							processed[n_x][n_y] = 1;
						}
					}
					
					// Poistetaan jokaisella while silmukan kierroksella open_setin ensimmainen alkio, jota kaytetaan naapureiden sijainnin laskentaan:
					open_set.splice(0,1);
				}
				
				
				characters[characters.length] = new Character(area_top_left, area_bottom_right);						
			}
		}
	}
	
	return characters;
	
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
