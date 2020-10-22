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
}
