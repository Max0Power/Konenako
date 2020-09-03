/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 03.09.2020
 */

"use strict";


/**
 * Etsii Pikselitaulukosta kaikki merkit, muodostaa merkki -oliot taulukkoon ja palauttaa sen.
 @param {Pixel[][]} pixelArray - Kaksiulotteinen taulukko, joka sisaltaa kuvan datan pikseleina
 @return {Character[]} - Palauttaa kaikki loydetyt Character -oliot taulukossa
 */
function findCharacters(pixelArray) {
	
	var characters = new Array();
	
	// TODO merkkien etsinta:
	for (var x = 0; x < pixelArray.length; x++) {
		for (var y = 0; y < pixelArray[0].length; y++) {
			// 1. loytaa alueen --> luo Character olion
			// 2. Tekee tunnistuksen Character oliolla
			// 3. Jos merkki loytyi --> lisaa olion characters taulukkoon
		}
	}
	
	return characters;
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
	
	determineValue(pixelArray) {
		
		
	}
	
}