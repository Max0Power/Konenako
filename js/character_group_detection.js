/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 03.09.2020
 */

"use strict";


function compare(first, second) {
    var [fstTLX,fstTLY] = first.bounds.topLeft;
    var [sndTLX,sndTLY] = second.bounds.topLeft;

    var [fstBRX,fstBRY] = first.bounds.bottomRight;
    var [sndBRX,sndBRY] = second.bounds.bottomRight;

    if (fstBRY < sndTLY) return -1;
    if (sndBRY < fstTLY) return 1;
    if (fstTLX < sndTLX) return -1;
    if (sndTLX < fstTLX) return 1;
    
    return 0;
}

/**
 * Kay lapi loydetyt character -oliot taulukosta ja muodostaa ryhmat.
 * Jatkaa suorituksen jalkeen tulostukseen, jossa tulostetaan tunnistetut merkit.
 * @param {Character[]} characters - Taulukko Character -olioita
 */
function detectCharacterGroups(characters) {
    characters = characters.sort(compare);
    
    var groups = [];
    if (characters.length > 0) {
	groups.push(new CharacterGroup());
	groups[groups.length-1].characters.push(characters[0]);
    }
    
    for (var i = 1; i < characters.length; i++) {
	
	var prev = characters[i-1];
	var cur = characters[i];

	if (groups[groups.length-1].characters.length === 0) {
	    groups[groups.length-1].characters.push(cur);
	} else {
	    var left = prev.bounds.bottomRight[0];
	    var right = cur.bounds.topLeft[0];

	    var diff = Math.abs(right - left);
	    var prevwidth = prev.bounds.pixelWidth();
	    var curwidth = cur.bounds.pixelWidth();

	    if (prev.bounds.bottomRight[1] < cur.bounds.topLeft[1]) {
		groups[groups.length-1].linebreak = true;
	    }
	    
	    if (diff < Math.sqrt(prevwidth * curwidth)) {
		groups[groups.length-1].characters.push(cur);
	    } else {
		groups.push(new CharacterGroup());
		groups[groups.length-1].characters.push(cur);
	    }
	}

    }

    var text = "";
    for (var i = 0; i < groups.length; i++) {
	text += groups[i].toString();
	if (groups[i].linebreak) text += "\n";
	else if (i < groups.length-1) text += " ";
    }

    document.getElementById("TextOutput").value = text;
    drawGroups(groups);
}

function drawGroups(groups) {
    groups.forEach(group => {
	var tmp = group.characters;

	var topleft = tmp[0].bounds.topLeft;
	var bottomright = tmp[tmp.length-1].bounds.bottomRight;
	
	drawArea(topleft,bottomright,"blue");
    });
}

/**
 * CharacterGroup -olion muodostaja, joka sisaltaa yksittaiseen merkkijonoon kuuluvat Character -oliot.
 */
class CharacterGroup {
	
	/**
	 * CharacterGroup -olion muodostaja, joka sisaltaa taulukossa ryhmaan kuuluvat Character -oliot
	 * @param {Character[]} characters - ryhmaan kuuluvat Character -oliot taulukossa.
	 */
	constructor() {
		this.characters = [];
	    this.linebreak = false;
	}
	
	toString() {
		var txt = "";
		for (var i = 0; i < this.characters.length; i++) {
			txt = txt + this.characters[i].value;
		}
		return txt;
	}
}
