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
 *   makeMatrix(0,0,0) === []
 *   makeMatrix(2,0,0) === [[],[]]
 *   makeMatrix(0,2,0) === []
 *   makeMatrix(2,2,0) === [[0,0],[0,0]]
 *   makeMatrix(2,2,2) === [[2,2],[2,2]]
 */
function makeMatrix(rows,cols,value) {
    var t = [];
    for (var i = 0; i < rows; i++) {
	t[i] = [];
	for (var j = 0; j < cols; j++) {
	    t[i][j] = value;
	}
    }
    return t;
}


/**
 * Skaalaa matriisin leveyden ja korkeuden mukaan
 * TODO: kokeile piirtää suoraan kanvakselle
 * 
 * param matrix {number[][]} skaalattava matriisi
 * param width {number} skaalatun matriisin leveys
 * param height {number} skaalatun matriisin korkeus
 * return {number[][]} skaalattu matriisi
 */
function scaleMatrix(matrix, width, height) {
    // scales matrix's width and height
    var scaleX = width / matrix.length;
    var scaleY = height / matrix[0].length;

    // create a new matrix from parameters
    var scaleM = makeMatrix(width, height, 0);

    for (var x = 0; x < matrix.length; x++) {
	
	// distances between transformed widths
	var thisX = Math.round(scaleX*x);
	var nextX = Math.round(scaleX*(x+1));
	
	for (var y = 0; y < matrix[x].length; y++) {
	    
	    // distances between transformed heights
	    var thisY = Math.round(scaleY*y);
	    var nextY = Math.round(scaleY*(y+1));

	    // coordinates between transformed distances
	    var xs = range(Math.abs(thisX-nextX),thisX);
	    var ys = range(Math.abs(thisY-nextY),thisY);
	    
	    xs.forEach(xx => {
		ys.forEach(yy => {
		    // set coordinate values
		    scaleM[xx][yy] = matrix[x][y];
		});
	    });
	}
    }

    return scaleM;
}
