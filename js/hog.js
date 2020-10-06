"use strict";

function nearestSixteen(matrix) {
    var width = matrix.length;
    var height = matrix[0].length;
    
    width += 16 - width % 16;
    height += 16 - height % 16;

    // scale matrix up to next 16
    matrix = scaleMatrix(matrix, width, height);

    return matrix;
}

function distances(matrix) {
    var matX = makeMatrix(matrix.length, matrix[0].length,0);
    var matY = makeMatrix(matrix.length, matrix[0].length,0);
    var matG = makeMatrix(matrix.length, matrix[0].length,0);
    var matA = makeMatrix(matrix.length, matrix[0].length,0);

    for (var x = 0; x < matrix.length; i++) {
	for (var y = 0; y < matrix[0].length; j++) {
	    if (x-1 >= 0 && x+1 < matrix.length) {
		matX[x][y] = matrix[x+1][y] - matrix[x-1][y];
	    }
	    if (y-1 >= 0 && y+1 < matrix[0].length) {
		matY[x][y] = matrix[x][y-1] - matrix[x][y+1];
	    }

	    matG[x][y] = Math.sqrt(
		Math.pow(matX[x][y],2)+
		    Math.pow(matY[x][y],2));
	    matA[x][y] = Math.atan(matY[x][y]/matX[x][y]);
	}
    }

    return TODO;
}

function batch(matrix) {
    var width = matrix.length/8;
    var height = matrix[0].length/8;

    
    
    for (var x = 0; x < width; x++) {
	for(var y = 0; y < height; y++) {
	    
	    for (var i = 0; i < 8; i++) {
		for (var j = 0; j < 8; j++) {

		    var xs = x*8+i;
		    var ys = y*8+j;

		    
		}
	    }
	}
    }
}
