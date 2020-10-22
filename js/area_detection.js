/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 15.09.20207
 * Vastaa mustien pikseleiden muodostamien alueitten loytamisesta mustavalkokuvasta.
 * Jatkaa suorituksen jalkeen character_detection.js --> skriptiin, jossa tehdaan merkkien tunnistus loydetyilla alueilla.
 */
 
"use strict";


/**
 * Etsii Pikselitaulukosta kaikki mustien pikselien alueet, muodostaa Area -oliot taulukkoon --> sen jalkeen jatketaan character_detection.js:aan.
 @param {Int[][]} bw_m - Mustavalko kuvan matriisi
 @return {Area[]} - Palauttaa kaikki loydetyt pikseli alueet kuvasta
 */
function detectAreas(bw_m, look_out_x, look_out_y) {
		
	// Piirto --> piirretaan mustavalko kuva:
	drawPixelArray(bw_m);
	
	// Aputaulukko helpottamaan naapureiden x ja y koordinaattien laskentaa:
	var neighbour_pointers = generateNeighbourPointers(look_out_x, look_out_y);
	
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
	
	var areas = [];

        clearInterval(INTERVAL);
	INTERVAL = setInterval(process, 20);
	
	
	/*
	 * Prosessi "INTERVAL", joka suorittaa mahdollisten kirjainten etsimisen kuvasta.
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
				
				// Jos open_set on tyhjentynyt --> alue on loytynyt ja luodaan Area -olio + piirretaan kanvasille loytynyt alue
				if (open_set.length <= 0) {
					// Jos area on hyvaksyttavan kokoinen: lisataan se area taulukkoon
					/*if ( (area_bottom_right[0] - area_top_left[0]) + 1 >= 5 || (area_bottom_right[1] - area_top_left[1]) + 1 >= 5) {
						areas.push(new Area(area_top_left, area_bottom_right, getPixelsFromArea(bw_m, area_top_left, area_bottom_right)));
						drawArea(area_top_left, area_bottom_right, "#FF0000");
					}*/
					areas.push(new Area(area_top_left, area_bottom_right, getPixelsFromArea(bw_m, area_top_left, area_bottom_right)));
					drawArea(area_top_left, area_bottom_right, "#FF0000");
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
		
		// Koko kuva on kasitelty: Jatketaan detectCharacters funktioon (character_detection.js)
		if (processed_count >= processed.length * processed[0].length && open_set.length < 1) {
			clearInterval(INTERVAL);
			console.log("Areas detected: " + areas.length);
			detectCharacters(bw_m, areas);
		}
	}
	
	
	function generateNeighbourPointers(x_reach, y_reach) {
		if (x_reach < 1) x_reach = 1;
		if (y_reach < 1) y_reach = 1;
		
		var pointers = [];
		
		for (var x = -x_reach; x <= x_reach; x++) {
			for(var y = -y_reach; y <= y_reach; y++) {
				if (x == 0 && y == 0) continue;
				
				pointers.push([x,y]);
			}
		}
		
		return pointers;
	}

	
	function getPixelsFromArea(m, area_top_left, area_bottom_right) {
		
		var width = Math.abs(area_bottom_right[0] - area_top_left[0] + 1);
		var height = Math.abs(area_bottom_right[1] - area_top_left[1] + 1);
		
		var pixels = new Array(width);
		
		var p_x = 0;
		var p_y = 0;
		for (var x = area_top_left[0]; x <= area_bottom_right[0]; x++) {
			pixels[p_x] =  new Array(height);
			for (var y = area_top_left[1]; y <= area_bottom_right[1]; y++) {
				pixels[p_x][p_y] = m[x][y];
				p_y++;
			}
			p_y = 0;
			p_x++;
		}
		
		return pixels;
	}
}


/**
 * Luokka alueelle, joka pitaa sisallaan loydetyn mustien pikselien alueen
 */
class Area {
	
	
	/**
	 * Area -olion muodostaja
	 * @param {Int[x, y]} topLeft - alueen vasemman ylanurkan x ja y koordinaatti
	 * @param {Int[x, y]} bottomRight - alueen oikean alanurkan x ja y koordinaatti
	 */
	constructor(topLeft, bottomRight, pixels) {
		this.topLeft = topLeft;
		this.bottomRight = bottomRight;
		this.pixels = pixels;
	}
	
	
	/*
	 * Palauttaa alueen leveyden
	 * @return {Int} - Palauttaa alueen leveyden
	 */
	pixelWidth() {
		return Math.abs(this.bottomRight[0] - this.topLeft[0] + 1);
	}
	
	
	/*
	 * Palauttaa alueen korkeuden
	 * @return {Int} - Palauttaa alueen korkeuden
	 */
	pixelHeight() {
		return Math.abs(this.bottomRight[1] - this.topLeft[1] + 1);
	}
}