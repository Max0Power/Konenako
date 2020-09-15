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
			var pixelIndex = y * (img.naturalWidth * 4) + (x * 4);
			tmpArray[y] = (imgData[pixelIndex] + imgData[pixelIndex+1] + imgData[pixelIndex+2]) / 3.0;
		}
		matrix[x] = tmpArray;
	}

	// Palautetaan lopuksi kuvasta saatu numerotaulukko:
	return matrix;
}

/**
 * Muuntaa grayscale-kuvan mustavalko-kuvaksi. Matala kynnys tekee
 * mustan taustan. Korkea kynnys tekee valkoisen taustan.
 * 
 * param matrix {number[][]} grayscale-matriisi
 * param treshold {number} kynnysarvo [0-255]
 * return {number[][]} mustavalko-matriisi
 */
function convertGrayscaleToBlackAndWhite(matrix, threshold) {
    if (threshold < 128) {
	return matrix.map(row => row.map(col => {
	    return col < threshold ? 255 : 0;
	}));
    }

    return matrix.map(row => row.map(col => {
	return col < threshold ? 0 : 255;
    }));
}

/**
 * Iterative Selection Thresholding Method
 * 
 * param matrix {number[][]} grayscale-matriisi
 * return {number} mustavalko-kuvan kynnysarvo
 */
function iterativeSelectionThreshold(matrix) {
    matrix = matrix.map(row => row.map(Math.floor));

    const margin = 1;
    var treshold = getMatrixAverage(matrix); // kaavat.js

    while (true) {
	var background = []; var foreground = [];
	matrix.forEach(row => row.forEach(val => {
	    if (val <= treshold) background.push(val);
	    if (val > treshold) foreground.push(val);
	}));

	var average_bg = average(background); // kaavat.js
	var average_fg = average(foreground); // kaavat.js
	var new_treshold = average([average_bg,average_fg]); // kaavat.js
	var difference = Math.abs(new_treshold - treshold);

	if (difference <= margin) break;
	treshold = Math.floor(new_treshold);
    }

    return treshold;
}

/**
 * Muodostaa grayscale-matriisin arvoista histogrammin
 * 
 * param matrix {number[][]} matriisi
 * return {number[]} histogrammi
 */
function makeHistogram(matrix) {
    var histogram = new Array(256).fill(0);
    matrix.forEach(row => row.forEach(col => {
	histogram[Math.floor(col)] += 1;
    }));
    return histogram;
}

/**
 * ei käytössä
 */
function histogramThreshold(histogram, total) {
    var sum = 0;
    for (var i = 0; i < histogram.length; i++) {
	sum += histogram[i];
	if (sum >= total / 2) {
	    return i;
	}
    }

    // virheelliset parametrit
    return histogram.length - 1;
}

/**
 * Balanced Histogram Thresholding Method (BHT)
 * 
 * param matrix {number[][]} grayscale-matriisi
 * return {number} mustavalko-kuvan kynnysarvo
 */
function balancedHistogramThreshold(matrix) {
    matrix = matrix.map(row => row.map(Math.floor));
    
    var histogram = makeHistogram(matrix);

    var left = 0;
    var right = histogram.length - 1;
    var threshold = Math.floor(average([left,right])); // kaavat.js

    // threshold is included only to left weight
    var left_weight = weight(left, threshold);
    var right_weight = weight(threshold + 1, right);

    function weight(left, right) {
	var arr = range(right - left + 1, left); // kaavat.js
	return sum(arr.map(key => histogram[key])); // kaavat.js
    }

    while (left < right) {
	if (right_weight > left_weight) {
	    // right side is heavier
	    right_weight -= histogram[right];
	    right -= 1;
	} else {
	    // left side is heavier
	    left_weight -= histogram[left];
	    left += 1;
	}

	var new_threshold = Math.round(average([left,right])); // kaavat.js
	
	if (new_threshold < threshold) {
	    // threshold was included to left weight
	    left_weight -= histogram[threshold];
	    right_weight += histogram[threshold];
	} else if (new_threshold > threshold) {
	    // threshold was already in left weight
	    left_weight += histogram[new_threshold];
	    right_weight -= histogram[new_threshold];
	}

	threshold = new_threshold;
    }

    return threshold;
}

/**
 * Otsu's Thresholding Method
 * 
 * param matrix {number[][]} grayscale-matriisi
 * return {number} mustavalko-kuvan kynnysarvo
 */
function otsuThreshold(matrix) {
    var histogram = makeHistogram(matrix);
    var keymap = range(256, 0); // kaavat.js

    let total = sum(histogram); // kaavat.js
    let sumA = keymap.reduce((a,b) => a + keymap[b] * histogram[b], 0);

    let sumB = 0;
    let weight_bg = 0;
    let weight_fg = 0;

    let maximum = 0;
    let threshold = 0;

    for (var i = 0; i < histogram.length; i++) {
	weight_bg += histogram[i]; // weight background
	if (weight_bg === 0) continue;

	weight_fg = total - weight_bg; // weight foreground
	if (weight_fg === 0) break;

	sumB += i * histogram[i];

	let mean_bg = sumB / weight_bg; // mean background
	let mean_fg = (sumA - sumB) / weight_fg; // mean foreground

	// calculate between class variance
	let variance = weight_bg * weight_fg * Math.pow(mean_bg - mean_fg, 2);

	// check if new maximum variance found
	if (variance > maximum) {
	    maximum = variance;
	    threshold = i;
	}
    }

    return threshold;
}
