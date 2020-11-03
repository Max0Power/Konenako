/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 03.09.2020
 * @version 29.10.2020, Error correction merged
 */

"use strict";

// CHARACTER_COMPARISON_DATA on Globaali ComparisonData -olio, joka pitaa sisallaan ohjelman kayttaman vasteen.
// CHARACTER_COMPARISON_DATA asetetaan kayttoon makeCharacterComparisonData() funktiolla.
var CHARACTER_COMPARISON_DATA = null;
// SPECIAL_CHARACTERS: pitaa sisallaan merkit, jotka vaativat tavallista korkeaman todennakoisyyden, jotta ne hyvaksytaan tunnistetuksi.
const SPECIAL_CHARACTERS = ['.', ','];
// Seuraavat muuttuja merkkaavat vahimmaista vaadittua yhtalaisyytta vasteeseen nahden, jotta merkki voidaan hyvaksya tunnistetuksi.
const MIN_BASIC_CHARACTER_SIMILARITY_REQUIRED = 0.6;
const MIN_SPECIAL_CHACACTER_SIMILARITY_REQUIRED = 0.8;


/**
 * Alustaa globaalin CHARACTER_COMPARISON_DATA ComparisonData -olion.
 * Pitaa sisallaan vasteen, jota kaytetaan merkkien tunnistuksessa.
 * Kutsutaan heti sivun latautuessa ensimmaista kertaa
 */
function makeCharacterComparisonData() {
	
    var characters = ['A','B','C','D','E','F','G',
			  'H','I','J','K','L','M','N',
			  'O','P','Q','R','S','T','U',
			  'V','W','X','Y','Z',
			  'a','b','c','d','e','f','g',
			  'h','i','j','k','l','m','n',
			  'o','p','q','r','s','t','u',
			  'v','w','x','y','z',
			  '0','1','2','3','4','5','6','7','8','9',
			  '.',',','-', '+', '/', '\\', '!'];

    var fonts = ["Arial",
			  "Times New Roman",
			  "Helvetica",
			  "Verdana",
			  "Courier New"];
    
    var comparisonDataObj = new ComparisonData();

	for (var i = 0; i < fonts.length; i++) {
		comparisonDataObj.addCharacterDataSet(characters, 256, fonts[i]);
	}
    
    return comparisonDataObj;
}


/**
 * Tekee tunnistuksen loydetyille alueille mustavalkokuvasta
 * Jatkaa suorituksen jalkeen character_group_detection.js skriptiin, jossa etsitaan yhteen kuuluvat merkkijonot
 * @param {Int[][]} bw_m - Mustavalko kuvan matriisi
 * @param {Area[]} areas - taulukko Area -olioita, jotka loydettiin detectAreas -funktiolla (area_detection.js)
 */
function detectCharacters(bw_m, areas) {
    var area_count_at_start = areas.length;
    
	// Taulukko, johon kerataan tunnistetut merkit:
	var characters = [];
	
	if (CHARACTER_COMPARISON_DATA === null) formatText(characters);
	
	// Asetetaan intervalli, joka kasittelee loydetyt alueet ja tekee tunnistuksen:
    clearInterval(INTERVAL);
 	INTERVAL = setInterval(process, 10);
	
	/**
	 * Prosessi "INTERVALpi", joka tekee jokaiselle loydetylle alueelle tunnistuksen, joka maarittelee loytyiko merkki
	 */
	function process() {
	    
		const MAX_AREA_PROCESS_COUNT = 10;
		var areas_processed_count = 0;
		const detected_character_draw_color = "#00FF00"; // green
	    
		while (areas_processed_count < MAX_AREA_PROCESS_COUNT && areas.length > 0) {
			// Lasketaan todennakoisyydet suhteessa vastedatan merkkeihin:
			var probablity_array = [];
			if (CHARACTER_COMPARISON_DATA !== null) {
				for (var i = 0; i < CHARACTER_COMPARISON_DATA.getCharacterCount(); i++) {
					var probablity = CHARACTER_COMPARISON_DATA.compare(i, areas[0].pixels);
					probablity_array.push(probablity);
				}
			}
			
			// Etsitaan paras laskettu todennakoisyys, joka on korkeampi kuin asetetut raja-arvot:
			var best_probablity_index = -1;
			var best_probablity = -1;
			for (var i = 0; i < probablity_array.length; i++) {
				if(probablity_array[i] > best_probablity) {
					// asetetaan similarity_required sen mukaan onko kyseessa perusmerkki vai erikoismerkki
					var similarity_required = MIN_BASIC_CHARACTER_SIMILARITY_REQUIRED;
					for (var j = 0; j < SPECIAL_CHARACTERS.length; j++) {
						if (CHARACTER_COMPARISON_DATA.getCharacter(i) === SPECIAL_CHARACTERS[j]) {
							similarity_required = MIN_SPECIAL_CHACACTER_SIMILARITY_REQUIRED;
							break;
						}
					}
					// Jos merkille saatu todennakoisyys on korkeampi kuin maaritetty raja-arvo --> asetetaan se todennakoisimmaksi merkiksi
					if (probablity_array[i] >= similarity_required) {
						best_probablity_index = i;
						best_probablity = probablity_array[i];						
					}
				}
			}
		    
			// Jos todennakoinen merkki loytyi vasteesta, joka ylitti asetetun raja-arvon:
		    if (best_probablity_index >= 0) {
				// lisataan tunnistettu merkki characters taulukkoon:
				var c = CHARACTER_COMPARISON_DATA.getCharacter(best_probablity_index); // merkin symboli
				var f = CHARACTER_COMPARISON_DATA.getFont(best_probablity_index); // merkin kayttama fontti
			    characters.push(new Character(c, f, areas[0])); // lisataan merkki characters taulukkoon
				// piirretaan kattama alue vihreksi (merkki tunnistettu):
			    drawArea(areas[0].topLeft, areas[0].bottomRight, detected_character_draw_color);
				// asettaa viela viimeisimmaksi lisatylle Character -oliolle mika oli todennakoisyys seka indeksi vasteessa:
			    characters[characters.length-1].confidence = best_probablity;
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
