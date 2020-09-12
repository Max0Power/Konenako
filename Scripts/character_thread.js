/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 09.09.2020
 */

"use strict";

importScripts('kaavat.js');

/**
 * @example
 *   var worker = new Worker('Scripts/worker.js');
 *   worker.postMessage([matrix,reach]);
 */
onmessage = function(event) {
    const args = event.data;
    const sqrs = findSquares(...args);

    postMessage(sqrs);
    close();
}

function findSquares(matrix, reach) {
    const width = matrix.length;
    const height = matrix[0].length;
    const total = width*height;

    reach = Math.abs(Math.round(reach)); // negative values
    reach = reach === 0 ? 1 : reach; // reach can't be zero

    var characters = new Array();

    // taulukko kertoo onko indeksissä käyty aiemmin
    var ones = makeMatrix(width,height,true); // kaavat.js

    for (var i = 0; i < width; i++) {
	for (var j = 0; j < height; j++) {
	    if (tarkista(matrix,ones,i,j)) {
		// selvitetään interpoloitavat sijainnit
		var empty = annaTyhjat(matrix,ones,i,j,reach);
		characters.push(empty);
	    }
	}
    }

    return characters;
}

function annaTyhjat(matrix,ones,is,js,reach) {
    var empty = [[is,js]]; // found empty value
    ones[is][js] = false; // mark as visited 

    var minX = Number.MAX_SAFE_INTEGER;
    var minY = Number.MAX_SAFE_INTEGER;

    var maxX = Number.MIN_SAFE_INTEGER;
    var maxY = Number.MIN_SAFE_INTEGER;
    
    while (empty.length > 0) {
	var [i,j] = empty.shift();

	minX = i < minX ? i : minX;
	minY = j < minY ? j : minY;
	
	maxX = i > maxX ? i : maxX;
	maxY = j > maxY ? j : maxY;

	// add to queue if not visited
	for (var x = -reach; x <= reach; x++) {
	    for (var y = -reach; y <= reach; y++) {
		var [a,b] = [i+x,j+y];
		if (tarkista(matrix,ones,a,b)) {
		    empty.push([a,b]); // found empty value
		    ones[a][b] = false; // mark as visited
		}
	    }
	}
    }

    return [[minX,minY],[maxX,maxY]];
}

function tarkista(matrix,ones,i,j) {
    if (i < 0 || j < 0) {
	return false;
    }
    if (i >= matrix.length || j >= matrix[i].length) {
	return false;
    }
    if (matrix[i][j] > 0) {
	return false;
    }

    return ones[i][j];
}
