/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 03.09.2020
 * @version 29.10.2020, Error correction merged
 */

"use strict";

const MIN_CONFIDENCE = 0.6;

function makeComparisonData() {
    var basic_data_set = ['A','B','C','D','E','F','G',
			  'H','I','J','K','L','M','N',
			  'O','P','Q','R','S','T','U',
			  'V','W','X','Y','Z',
			  'a','b','c','d','e','f','g',
			  'h','i','j','k','l','m','n',
			  'o','p','q','r','s','t','u',
			  'v','w','x','y','z',
			  '0','1','2','3','4','5','6','7','8','9',
			  '-', '+', '/', '\\', '!'];

    var basic_font_set = ["Arial",
			  "Times New Roman",
			  "Helvetica",
			  "Verdana",
			  "Courier New"];
    
    var basic_comparison_data = new ComparisonData();

    basic_font_set.forEach(font => {
	basic_comparison_data.addCharacterDataSet(basic_data_set, 256, font);
    });

    basic_comparison_data.setAreaFiltering(8);
    
    return basic_comparison_data;
}

/**
 * Tekee tunnistuksen loydetyille alueille mustavalkokuvasta
 * Jatkaa suorituksen jalkeen character_group_detection.js skriptiin, jossa etsitaan yhteen kuuluvat merkkijonot
 * @param {Int[][]} bw_m - Mustavalko kuvan matriisi
 * @param {Area[]} areas - taulukko Area -olioita, jotka loydettiin detectAreas -funktiolla (area_detection.js)
 */
function detectCharacters(bw_m, areas) {
    var area_count_at_start = areas.length;
    var basic_comparison_data = GLOBAALI;
    
	// Taulukko, johon kerataan tunnistetut merkit:
	var characters = [];
	
	// Asetetaan intervalli, joka kasittelee loydetyt alueet ja tekee tunnistuksen:
    clearInterval(INTERVAL);
 	INTERVAL = setInterval(process, 10);
	
	/**
	 * Prosessi "INTERVALpi", joka tekee jokaiselle loydetylle alueelle tunnistuksen, joka maarittelee loytyiko merkki
	 */
	function process() {
	    
		const MAX_AREA_PROCESS_COUNT = 10;
		var areas_processed_count = 0;
		const charcolor = "#00FF00"; // green
	    
		while (areas_processed_count < MAX_AREA_PROCESS_COUNT && areas.length > 0) {
			// Lasketaan todennakoisyydet suhteessa vastedatan merkkeihin:
			var probablity_array = [];
			for (var i = 0; i < basic_comparison_data.getCharacterCount(); i++) {
				var probablity = basic_comparison_data.compare(i, areas[0].pixels);
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
		    if (probablity_array[best_probablity_index] > MIN_CONFIDENCE) {
			var c = basic_comparison_data.getCharacter(best_probablity_index);
			var f = GLOBAALI.getFont(best_probablity_index);
			    characters.push(new Character(c, f, areas[0]));
			    drawArea(areas[0].topLeft, areas[0].bottomRight, charcolor);
			    characters[characters.length-1].confidence = probablity_array[best_probablity_index];
			    characters[characters.length-1].comparedataindex = best_probablity_index;
			}
			
			// Poistetaan kasitelty Area -olio areas taulukosta:
			areas.splice(0, 1);
			
			areas_processed_count++;
		}

	    var progress = Math.round(45 + (1.0 - (areas.length / area_count_at_start))*45);
	    updateProgressBar(progress, SECONDS);
	    
		// Kaikki alueet kasitelty: jatketaan suoritusta detectCharacterGroups funktioon (character_group_detection.js)
		if (areas.length < 1) {
			clearInterval(INTERVAL);
			formatText(characters);
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
    constructor(value, font, bounds) {
		this.value = value;
		this.bounds = bounds;
		this.confidence = 0;
	    this.comparedataindex = undefined;
	    this.font = font;
	}
}
