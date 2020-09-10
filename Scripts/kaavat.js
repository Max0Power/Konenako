/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 09.09.2020
 */

"use strict"

/**
 * @example
 *   range(0,1) === []
 *   range(1,1) === [1]
 *   range(1,0) === [0]
 *   range(2,0) === [0,1]
 */
function range(size, start) {
    return [...new Array(size).keys()].map(i => start + i);
}

/**
 * @example
 *   average([0,1]) === 0.5
 *   average([1,1]) === 1
 *   average([1,0]) === 0.5
 *   average([2,0]) === 1
 */
function average(array) {
    return sum(array) / array.length;
}

function getMatrixAverage(matrix) {
    var average = 0;
    var count = 0;
    for (var x = 0; x < matrix.length; x++) {
	for (var y = 0; y < matrix[x].length; y++) {
	    average += matrix[x][y];
	    count += 1;
	}
    }
    return average / count;
}

/**
 * @example
 *   sum([0,1]) === 1
 *   sum([1,1]) === 2
 *   sum([1,0]) === 1
 *   sum([2,0]) === 2
 */
function sum(array) {
    return array.reduce((a,b) => a + b, 0);
}

/*
 * @example
 *   min([0,1]) === 0
 *   min([1,1]) === 1
 *   min([1,0]) === 0
 *   min([2,0]) === 0
 */
function min(array) {
    return Math.min(...array);
}

/**
 * @example
 *   max([0,1]) === 1
 *   max([1,1]) === 1
 *   max([1,0]) === 1
 *   max([2,0]) === 2
 */
function max(array) {
    return Math.max(...array);
}

/**
 * Palauttaa parametrien mukaisen matriisin
 * @param rivit       rivien lkm
 * @param sarakkeet   sarakkeiden lkm
 * @param oletus      oletusarvo
 * @return            täytetty matriisi
 * @example
 *   luoMatriisi(0,0,0) === []
 *   luoMatriisi(2,0,0) === [[],[]]
 *   luoMatriisi(0,2,0) === []
 *   luoMatriisi(2,2,0) === [[0,0],[0,0]]
 *   luoMatriisi(2,2,2) === [[2,2],[2,2]]
 */
function luoMatriisi(rivit,sarakkeet,oletus) {
    /*
    // virhe: sarakkeilla sama viite
    var t = new Array(rivit).fill(new Array(sarakkeet));
    return t.map(x => x.fill(oletus));
    */
    
    var t = [];
    for (var i = 0; i < rivit; i++) {
	t[i] = [];
	for (var j = 0; j < sarakkeet; j++) {
	    t[i][j] = oletus;
	}
    }
    return t;
}

function scaleMatrix(matrix, width, height) {
    var xs = matrix.length;
    var ys = matrix[0].length;

    var scaleX = width / xs;
    var scaleY = height / ys;

    var mat = luoMatriisi(width, height, 0);

    for (var x = 0; x < matrix.length; x++) {
	var prevX = Math.round(scaleX*x);
	var diffX = Math.round(scaleX*(x+1)) - prevX;
	for (var y = 0; y < matrix[x].length; y++) {
	    var prevY = Math.round(scaleY*y);
	    var diffY = Math.round(scaleY*(y+1) - prevY);

	    var pixel = matrix[x][y];
	    for (var xx = 0; xx < diffX; xx++) {
		for (var yy = 0; yy < diffY; yy++) {
		    mat[prevX + xx][prevY + yy] = pixel;
		}
	    }
	}
    }

    // TODO: skaalaus alaspäin
    // TODO: kokeile piirtää suuremmalle kanvakselle

    return mat;
}
