/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 09.09.2020
 */

"use strict";

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

/**
 * @example
 *   averageMatrix([[0,0],[0,0]]) === 0
 *   averageMatrix([[2,2],[2,2]]) === 2
 *   averageMatrix([[1,1],[2,2]]) === 1.5
 */
function averageMatrix(matrix) {
    var average = 0; var count = 0;
    matrix.forEach(row => row.forEach(col => {
	average += col;
	count += 1;
    }));
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
 *   makeMatrix(0,0,0) === []
 *   makeMatrix(2,0,0) === [[],[]]
 *   makeMatrix(0,2,0) === []
 *   makeMatrix(2,2,0) === [[0,0],[0,0]]
 *   makeMatrix(2,2,2) === [[2,2],[2,2]]
 */
function makeMatrix(rows,cols,value) {
    var matrix = new Array(rows);
    for (var x = 0; x < rows; x++) {
	matrix[x] = new Array(cols);
	for (var y = 0; y < cols; y++) {
	    matrix[x][y] = value;
	}
    }
    return matrix;
}

/**
 * Skaalaa matriisin leveyden ja korkeuden mukaan
 * 
 * param matrix {number[][]} skaalattava matriisi
 * param width {number} skaalatun matriisin leveys
 * param height {number} skaalatun matriisin korkeus
 * return {number[][]} skaalattu matriisi
 */
function scaleMatrix(matrix, width, height) {
    var scaleX = matrix.length/width;
    var scaleY = matrix[0].length/height;
    
    var scaleM = new Array(width);
    for (var x = 0; x < width; x++) {
	var xs = parseInt(scaleX*x, 10);
	scaleM[x] = new Array(height);
	for (var y = 0; y < height; y++) {
	    var ys = parseInt(scaleY*y, 10);
	    scaleM[x][y] = matrix[xs][ys];
	}
    }
    return scaleM;
}
