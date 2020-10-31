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

/**
 * Creates matrix from the coordinates inside the image.
 * 
 * param matrix {number[][]} matrix from the image
 * param topleft {number[]} area's top left corner
 * param bottomright {number[]} area's bottom right corner
 * return {number[][]} matrix from the area object
 * @example
 *   reduceMatrix([[1,2],[3,4]],[0,0],[1,1]) === [[1,2],[3,4]]
 *   reduceMatrix([[1,2],[3,4]],[0,0],[1,0]) === [[1,3]]
 *   reduceMatrix([[1,2],[3,4]],[0,0],[0,1]) === [[1,2]]
 *   reduceMatrix([[1,2],[3,4]],[1,1],[1,1]) === [[4]]
 */
function reduceMatrix(matrix, topleft, bottomright) {
    var t = [];
    for (var x = topleft[0]; x <= bottomright[0]; x++) {
	t.push([]);
	for (var y = topleft[1]; y <= bottomright[1]; y++) {
	    t[t.length-1].push(matrix[x][y]);
	}
    }
    return t;
}

/**
 * Reduces 2D matrix to 1D array.
 * 
 * param matrix {number[][]} matrix
 * return {number[]} array
 * @example
 *   reduceDimension([[],[]]) === []
 *   reduceDimension([[1,2],[]]) === [1,2]
 *   reduceDimension([[],[3,4]]) === [3,4]
 *   reduceDimension([[1,2],[3,4]]) === [1,2,3,4]
 */
function reduceDimension(matrix) {
    let array = [];
    matrix.forEach(row => {
	row.forEach(col => {
	    array.push(col);
	});
    });
    return array;
}

/**
 * Compares pixel values of two matrices
 * Pearson correlation coefficient (PCC)
 * 
 * param matrix {number[][]} first matrix
 * param sample {number[][]} second matrix
 * return correlation coefficient 0-1
 */
function pcc(matrix, sample) {
    const arrM = reduceDimension(matrix);
    const arrS = reduceDimension(sample);

    const meanM = average(arrM);
    const meanS = average(arrS);

    var pointer = 0;
    var divisorL = 1;
    var divisorR = 1;

    for (var i = 0; i < arrM.length; i++) {
	pointer += (arrM[i]-meanM)*(arrS[i]-meanS);
	divisorL += Math.pow(arrM[i]-meanM,2);
	divisorR += Math.pow(arrS[i]-meanS,2);
    }

    divisorL = Math.sqrt(divisorL);
    divisorR = Math.sqrt(divisorR);

    const r = pointer / (divisorL * divisorR);
    
    return Math.abs(r);
}

/**
 * Sum of Absolute Differences (SAD)
 * Compares pixel values of two matrices
 * 
 * param matrix {number[][]} first matrix
 * param sample {number[][]} second matrix
 * return {number} absolute differences 0-1
 */
function sad(matrix, sample) {
    const arrM = reduceDimension(matrix);
    const arrS = reduceDimension(sample);
    
    // largest possible difference
    const sadMax = arrM.length*255;  
    
    var sad = 0;
    for (var i = 0; i < arrM.length; i++) {
	// sum of absolute differences (SAD)
	sad += Math.abs(arrM[i] - arrS[i]);
    }

    // relative to maximum SAD
    return 1 - (sad/sadMax);
}

/**
 * Ordinary least squares (OLS)
 * Find line from linear function by least squares method.
 * 
 * @param values_x {number[]} input of linear function
 * @param values_y {number[]} output of linear function
 * @return {number[][]} [result_x,result_y] 
 */
function ols(values_x, values_y) {
    if (values_y.length < 2) {
	return values_y;
    }

    var x_sum = 0;
    var y_sum = 0;
    var xy_sum = 0;
    var xx_sum = 0;
    var count = 0;

    var x = 0;
    var y = 0;
    var values_length = values_x.length;

        /*
     * Calculate the sum for each of the parts necessary.
     */
    for (let i = 0; i< values_length; i++) {
	x = values_x[i];
	y = values_y[i];
	x_sum+= x;
	y_sum+= y;
	xx_sum += x*x;
	xy_sum += x*y;
	count++;
    }

        /*
     * Calculate m and b for the line equation:
     * y = x * m + b
     */
    var m = (count*xy_sum - x_sum*y_sum) / (count*xx_sum - x_sum*x_sum);
    var b = (y_sum/count) - (m*x_sum)/count;

        /*
     * We then return the x and y data points according to our fit
     */
    var result_values_x = [];
    var result_values_y = [];

    for (let i = 0; i < values_length; i++) {
	x = values_x[i];
	y = x * m + b;
	result_values_x.push(x);
	result_values_y.push(y);
    }

    return result_values_y;
}

// TODO: siirrä char group detect
function leastSquaresConstant(array) {
    const tmp = range(array.length, 0);
    const result = ols(tmp, array);
    const diff = Math.abs(result[result.length-1] - result[0]);
    return Math.round(result[0] + (diff/2));
}

/**
 * Standard Deviation (SD)
 * 
 * @param array {number[]} array of values
 * @return {number} standard deviation
 */
function sd(array) {
    const mean = average(array);
    const arr = array.map(x => Math.pow(x - mean, 2));
    return Math.sqrt(average(arr));
}

/**
 * @example
 *   fontRatio(70,70) === 1
 *   fontRatio(49,70) === 0.7
 *   fontRatio(7,70) === 0.1
 */
function fontRatio(height, fontsize) {
    // always less than or equal to 1
    return height/fontsize;
}

/**
 * @example
 *   fontSize(70,1) === 70
 *   fontSize(49,0.7) === 70
 *   fontSize(7,0.1) === 70
 */
function fontSize(height, fontratio) {
    // never less than height
    return Math.round(height/fontratio);
}

/**
 * Huom! Ei testattu
 * 
 * @example
 *   fontWidth(36,36,0.5625) === 64
 *   fontWidth(34,36,0.5625) === 60
 */
function fontWidth(width, height, fontratio) {
    const ratio = fontRatio(width,height);
    const fontsize = fontSize(height,fontratio);
    return Math.round(ratio*fontsize);
}

function filterArray(array, threshold) {
    let below_array = [];
    let over_array = [];
    array.forEach(val => {
	if (val <= threshold) {
	    below_array.push(val);
	}
	if (val >= threshold) {
	    over_array.push(val);
	}
    });

    let below_size = below_array.length;
    let over_size = over_array.length;

    if (below_size > 0 || over_size > 0) {
	if (below_size > over_size) {
	    return below_array;
	}
	return over_array;
    }
    return array

    
}

// HUOM! ei käytössä
function assert(cond) {
    const ERROR = "Error occured";
    if (!cond) {
	throw new Error(ERROR);
    }
}


/**
 * Generoi aputaulukon, joka sisaltaa viereisten naapureiden osoittimet annetulla x ja y etaisyydella
 * Kaytetaan: area_detection.js seka pixel_filttering.js
 */
function generateNeighbourPointers(x_reach, y_reach) {
	if (x_reach < 1) x_reach = 1;
	if (y_reach < 1) y_reach = 1;
	
	var pointers = [];
	
	for (var x = -x_reach; x <= x_reach; x++) {
		for(var y = -y_reach; y <= y_reach; y++) {
			if (x == 0 && y == 0) continue;
			
			pointers.push([x,y]);
		}
	}
	
	return pointers;
}

/**
 * @example
 *   removeDuplicates(['a',1,'a',1]) === ['a',1];
 */
function removeDuplicates(array) {
    return array.filter(function (value, index, self) {
	return self.indexOf(value) === index;
    });
}
