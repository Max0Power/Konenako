/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 03.09.2020
 */

"use strict";


/**
 * Lukee ladatun kuvan datan grayscale-matriisiksi
 * @param {Image} img - Latautunut Image elementti, josta pikselit luetaan
 * @return {Number[][]} - Palauttaa kaksi ulotteisen numero taulukon,
 * josta saa grayscalen
 */
function readImageToGrayscaleMatrix(img) {
	
	// Luodaan kanvas, johon kuva piirretaan valiaikaisesti:
	var canvas = document.createElement("canvas");

	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;

	// Kuvan piirto kanvakselle:
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0);
	// Otetaan kuvan data, joka on yksiulotteinen taulukko:
	var imgData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight).data;
	// Luodaan palautettava matriisi ja lasketaan siihen kuvan
	// yksittäisen pikselin keksiarvo:
	var matrix = new Array(img.naturalWidth);
	var imgDataPixelIndex = 0;
	for (var x = 0; x < img.naturalWidth; x++) {
		var tmpArray = new Array(img.naturalHeight);
		for (var y = 0; y < img.naturalHeight; y++) {
			tmpArray[y] = (imgData[imgDataPixelIndex] + imgData[imgDataPixelIndex+1] + imgData[imgDataPixelIndex+2]) / 3.0;
		    imgDataPixelIndex += 4;
		}
		matrix[x] = tmpArray;
	}

	// Palautetaan lopuksi kuvasta saatu numerotaulukko:
	return matrix;
}

/**
 * Muuntaa grayscale-kuvan mustavalko-kuvaksi
 * param arr {[[int]]} grayscale-matriisi
 * return {[[int]]} mustavalko-matriisi
 */
function convertGrayscaleToBlackAndWhite(matrix) {
    var treshold = getMatrixAverage(matrix);

    function getMatrixAverage(matrix) {
	/*
	var mat = matrix.slice();
	mat = mat.map(row => getArrayAverage(row));
	return getArrayAverage(mat);
	*/
	
	var average = 0;
	for (var x = 0; x < matrix.length; x++) {
	    for (var y = 0; y < matrix[x].length; y++) {
		average += matrix[x][y]
	    }
	}
	return average / (matrix.length* matrix[0].length);
    }

    /*
    function getArrayAverage(array) {
	var arr = array.slice();
	return arr.reduce((a,b) => a + b, 0) / arr.length;
    }

    while (true) {
	var black = []; var white = [];
	matrix.map(row => row.map(val => {
	    if (val < treshold) black.push(val);
	    if (val >= treshold) white.push(val);
	}));

	var avg_black = getArrayAverage(black);
	var avg_white = getArrayAverage(white);
	var new_treshold = getArrayAverage([avg_black,avg_white]);
	var diff = Math.round(Math.abs(new_treshold - treshold));

	const margin = 128;
	if (diff < margin) break;
	treshold = new_treshold;
    }
    */

    if (treshold < 128) {
	return matrix.map(row => row.map(col => col < treshold ? 255 : 0));
    }

    return matrix.map(row => row.map(col => col < treshold ? 0 : 255));
}
