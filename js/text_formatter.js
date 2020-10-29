/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 03.09.2020
 * @version 29.10.2020, Error correction merged
 */

"use strict";

/**
 * Ottaa parametrina tunnistetut merkit ja suorittaa rivityksen, valityksen seka tulostuksen
 */
function formatText(characters) {
	
	// teksti rivitetaan jarjestamalla kirjaimet:
	characters = characters.sort(compare);
	
	// rivitys ja rivien korkeuksien laskeminen:
	var lines = [];
	var lineHeights = [];
	if(characters.length > 0) {
		lines.push([characters[0]]);
		lineHeights.push([characters[0].bounds.topLeft[1], characters[0].bounds.bottomRight[1]]);
		
	}
	for(var i = 1; i < characters.length; i++) {
		var prev = characters[i-1];
		var cur = characters[i];
		if (prev.bounds.bottomRight[1] < cur.bounds.topLeft[1]) {
			lines.push([cur]);
			lineHeights.push([cur.bounds.topLeft[1], cur.bounds.bottomRight[1]]);
	    }
		else {
			lines[lines.length - 1].push(cur);
			if(cur.bounds.topLeft[1] < lineHeights[lineHeights.length - 1][0]) lineHeights[lineHeights.length - 1][0] = cur.bounds.topLeft[1];
			if(cur.bounds.bottomRight[1] > lineHeights[lineHeights.length - 1][1]) lineHeights[lineHeights.length - 1][1] = cur.bounds.bottomRight[1];
		}
	}
    
    // Tekstin tulostaminen:
    var empty_space_ratio = document.getElementById("EmptySpaceRatio").value;
    let default_text = convertLinesToString(lines, empty_space_ratio);
    
    function convertLinesToString(lines, empty_space_ratio) {
	var txt = "";
	for (var i = 0; i < lines.length; i++) {
	    var space_width = ((lineHeights[i][1] - lineHeights[i][0]) + 1) * empty_space_ratio;
	    for (var j = 0; j < lines[i].length; j++) {
		if (j - 1 >= 0) {
		    var gap = (lines[i][j].bounds.topLeft[0] - lines[i][j-1].bounds.bottomRight[0]) + 1;
		    if(gap > space_width) txt += " ";
		}
		txt += lines[i][j].value;
	    }
	    
	    if (i + 1 < lines.length) txt += "\n";
	}
	return txt;
    }

    // Rivien piirtäminen:
    drawLines(lines);

    function drawLines(lines) {
	const linecolor = "#0000FF"; // blue
	for (var i = 0; i < lines.length; i++) {
	    let topleft = [lines[i][0].bounds.topLeft[0], lineHeights[i][0]];
	    let bottomright = [lines[i][lines[i].length - 1].bounds.bottomRight[0], lineHeights[i][1]];
	    drawArea(topleft, bottomright, linecolor);
	}
    }

    // Virheenkorjaus suuret/pienet kirjaimet:
    lines.forEach(line => {
	// listataan arviot rivin fonttikoosta
	let fontsize_array = initFontSize(line);

	//let most_popular_font = mostPopularFont(line);

	// alkuarvausten keskihajonta
	let fontsize_diff = sd(fontsize_array);

	// arvaa rivin kirjainten fonttikoon
	let fontsize_quess = quessFontSize(fontsize_array);

	line.forEach(c => {
	    // kirjaimen todellinen korkeus
	    let charheight = c.bounds.pixelHeight();

	    let charbest = 0; // probability
	    for(let i = 0; i < GLOBAALI.getCharacterCount(); i++) {
		// should be same as the lineratio
		let charratio = GLOBAALI.fontratio[i];
		// should be same as the lineheight
		let fontsize = fontSize(charheight, charratio);

		// should be as close zero as possible
		let diff = Math.abs(fontsize_quess - fontsize);
		// fontsize was different from the quessed size
		if (diff <= fontsize_diff) {
		    var percent = GLOBAALI.compare(i, c.bounds.pixels);
		    if (percent > charbest) {
			charbest = percent;
			c.confidence = percent;
			c.comparedataindex = i;
			c.value = GLOBAALI.getCharacter(i);
		    }
		}
	    }
	});
    });

    // Teksti jossa suurten ja pienten kirjainten virheet korjattu
    let correct_text = convertLinesToString(lines, empty_space_ratio);

    // Yhdistetään alkuperäinen ja virheenkorjaus tekstit
    let result_text = "";
    for (var i = 0; i < default_text.length; i++) {
	const default_char = default_text.charAt(i);
	const correct_char = correct_text.charAt(i);
	// tarkistetaan löysikö virheenkorjaus saman kirjaimen
	if (default_char.toLowerCase() === correct_char.toLowerCase()) {
	    // virheenkorjaus valitaan jos samat kirjaimet
	    // virheenkorjaus tunnistaa oikean fonttikoon
	    result_text += correct_char;
	} else {
	    // fonttikokoa ei voida verrata kun eri kirjaimet
	    // muuten tunnistetaan tod.näk. väärä kirjain
	    result_text += default_char;
	}
    }

    // Tekstintunnistus valmis:
    document.getElementById("TextOutput").value = result_text;
    updateProgressBar(100, SECONDS);
	
	/**
	 * teksti rivitetaan jarjestamalla kirjaimet Y:n ja X:n perusteella
	 */
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
}


/**
 * tekee arviot fonttikoosta
 */
function initFontSize(line) {
    // fonttikoon arviot laitetaan listaan
    let fontsize_array = [];

    // arvioi jokaisen kirjaimen fonttikokoa
    line.forEach(c => {
	let charheight = c.bounds.pixelHeight();
	// rivinkorkeus arvioi fonttikokoa

	// should be same as the lineratio
	let charratio = GLOBAALI.fontratio[c.comparedataindex];

	// should be same as the lineheight
	let fontsize = fontSize(charheight, charratio);

	// fonttikoon arvio listaan
	fontsize_array.push(fontsize);
    });

    // arviot kirjainten fonttikoosta
    return fontsize_array;
}


/**
 * Arvaa fonttikoon =)
 */
function quessFontSize(fontsize_array) {
    // alkuarvaus fonttikoolle käytännössä sama kuin keskiarvo
    let fontsize_quess = leastSquaresConstant(fontsize_array);
    let previous_quess = -1; // eri kuin fontsize_quess!

    while (previous_quess !== fontsize_quess) {
	// jatketaan kunnes fonttikoko vakiintuu

	previous_quess = fontsize_quess;
	fontsize_array = filterArray(fontsize_array, fontsize_quess);
	fontsize_quess = leastSquaresConstant(fontsize_array);
    }

    return fontsize_quess;
}


/**
 * Rivin eniten esiintyvaa fontti tunnistuksen perusteella (ei kayteta talle hetkella --> ei parantanut tunnistusta)
 */
function mostPopularFont(line) {
    var allfonts = [];
    
    var fonts = [];
    line.forEach(c => {
	if (fonts[c.font] === undefined) {
	    fonts[c.font] = 0;
	    allfonts.push(c.font)
	} else {
	    fonts[c.font] += 1;
	}
    });

    var lkm = 0;
    var most_popular = "";
    allfonts.forEach(f => {
	if (fonts[f] > lkm) {
	    lkm = fonts[f];
	    most_popular = f;
	}
    });

    return most_popular;
}
