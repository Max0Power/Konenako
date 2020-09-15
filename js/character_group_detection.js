/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 03.09.2020
 */

"use strict";


/**
 * Kay lapi loydetyt character -oliot taulukosta ja muodostaa ryhmat.
 * Jatkaa suorituksen jalkeen tulostukseen, jossa tulostetaan tunnistetut merkit.
 * @param {Character[]} characters - Taulukko Character -olioita
 */
function detectCharacterGroups(characters) {
	console.log("Detect Character Groups Started: TODO");
}


/**
 * CharacterGroup -olion muodostaja, joka sisaltaa yksittaiseen merkkijonoon kuuluvat Character -oliot.
 */
class CharacterGroup {
	
	/**
	 * CharacterGroup -olion muodostaja, joka sisaltaa taulukossa ryhmaan kuuluvat Character -oliot
	 * @param {Character[]} characters - ryhmaan kuuluvat Character -oliot taulukossa.
	 */
	constructor(characters) {
		this.characters = characters;
		this.linebreak = false
	}
	
	setLineBreak() {
		this.linebrake = true
	}
	
	toString() {
		var txt = "";
		for (var i = 0; i < this.characters.length; i++) {
			txt = txt + this.characters[i].val;
		}
		return txt;
	}
}