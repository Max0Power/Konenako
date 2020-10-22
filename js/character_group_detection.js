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


function detectLines(characters) {
	characters = characters.sort(compare);
	
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

    var e = document.getElementById("DetectionMethod");
    var strUser = e.options[e.selectedIndex].text;

    if (strUser === "Custom") {
	lines.forEach(line => {
	    // listataan arviot rivin fonttikoosta
	    let fontsize_array = initFontSize(line);

	    //let most_popular_font = mostPopularFont(line);

	    // alkuarvausten keskihajonta
	    let fontsize_diff = sd(fontsize_array);

	    let fontsize_quess = quessFontSize(fontsize_array);

	    line.forEach(c => {
		let charheight = c.bounds.pixelHeight();

		let charbest = 0; // probability
		for(let i = 0; i < GLOBAALI.getCharacterCount(); i++) {
		    // should be same as the lineratio
		    let charratio = GLOBAALI.fontratio[i];
		    // should be same as the lineheight
		    let fontsize = fontSize(charheight, charratio);

		    // as close as possible to zero
		    let diff = Math.abs(fontsize_quess - fontsize);
		    let cond = fontsize_diff / fontsize_quess;
		    if (cond > 0 && diff <= fontsize_diff) {
			//if (most_popular_font === GLOBAALI.getFont(i)) {
			var percent = GLOBAALI.compare(i, c.bounds.pixels);
			if (percent > charbest) {
			    charbest = percent;
			    c.confidence = percent;
			    c.comparedataindex = i;
			    c.value = GLOBAALI.getCharacter(i);
			}
			//}
		    }
		}
	    });
	});
    }
    
	var empty_space_ratio = document.getElementById("EmptySpaceRatio").value;
	
	var txt = "";
	for(var i = 0; i < lines.length; i++) {
		var space_width = ((lineHeights[i][1] - lineHeights[i][0]) + 1) * empty_space_ratio;
		for(var j = 0; j < lines[i].length; j++) {
			if(j - 1 >= 0) {
				var gap = (lines[i][j].bounds.topLeft[0] - lines[i][j-1].bounds.bottomRight[0]) + 1;
				if(gap > space_width) txt += " ";
			}
			txt += lines[i][j].value;
		}
		
		if(i + 1 < lines.length) txt += "\n";
		
		drawArea([lines[i][0].bounds.topLeft[0], lineHeights[i][0]], [lines[i][lines[i].length - 1].bounds.bottomRight[0], lineHeights[i][1]], "Blue");
	}
	
    document.getElementById("TextOutput").value = txt;
    updateProgressBar(100, SECONDS);
}

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

    console.log(most_popular);
    return most_popular;
}
