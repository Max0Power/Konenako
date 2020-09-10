/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 03.09.2020
 */

"use strict";


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