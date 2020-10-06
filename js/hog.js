"use strict";

function hogTestaus(matrix) {
	var seppo = normalizeGradients(batch(distances(nearestSixteen(matrix))));
	console.log("Chunkkify: " + seppo.length + ", " + seppo[0].length);
}


function nearestSixteen(matrix) {
    var width = matrix.length;
    var height = matrix[0].length;
    
    width += 16 - width % 16;
    height += 16 - height % 16;
	console.log("Leveys/korkeus skaalattu " + width + ", " + height);

    // scale matrix up to next 16
    matrix = scaleMatrix(matrix, width, height);

    return matrix;
}

function distances(matrix) {
    var matX = makeMatrix(matrix.length, matrix[0].length,0); // erotus horisontaalinen
    var matY = makeMatrix(matrix.length, matrix[0].length,0); // erotus vertikaalinen
    var matM = makeMatrix(matrix.length, matrix[0].length,0); // Magnitude (pituus)
    var matO = makeMatrix(matrix.length, matrix[0].length,0); // Orientation  (kulma)

    for (var x = 0; x < matrix.length; x++) {
		for (var y = 0; y < matrix[0].length; y++) {
			if (x-1 >= 0 && x+1 < matrix.length) {
			matX[x][y] = matrix[x+1][y] - matrix[x-1][y];
			}
			if (y-1 >= 0 && y+1 < matrix[0].length) {
			matY[x][y] = matrix[x][y-1] - matrix[x][y+1];
			}

			matM[x][y] = Math.sqrt(
			Math.pow(matX[x][y],2)+
				Math.pow(matY[x][y],2));
			matO[x][y] = 0;
			if (matX[x][y] != 0) matO[x][y] = Math.atan(matY[x][y]/matX[x][y]);
		}
    }

    return {
		magnitude: matM,
		orientation: matO
	};
}

function batch(gradient) {
    var width = parseInt(gradient.magnitude.length/8, 10);
    var height = parseInt(gradient.magnitude[0].length/8, 10);
	
	// Histogram esiintymat: [0, 20, 40, 60, 80, 100, 120, 140, 160]
	
	var _frame = new Array(width);
    for (var x = 0; x < width; x++) {
		_frame[x] = new Array(height);
		for(var y = 0; y < height; y++) {
			var _histogram = [0, 0, 0, 0, 0, 0, 0, 0, 0];
			for (var i = 0; i < 8; i++) {
				for (var j = 0; j < 8; j++) {
					var xs = x*8+i;
					var ys = y*8+j;
					
					var h_prev = parseInt(gradient.orientation[xs][ys] / 20, 10);
					var h_next = (h_prev + 1) % 9;
					
					_histogram[h_prev] += ( (h_next * 20 - gradient.orientation[xs][ys]) / 20) * gradient.magnitude[xs][ys];
					_histogram[h_next] += ( (gradient.orientation[xs][ys] - (h_prev * 20)) / 20) * gradient.magnitude[xs][ys];
				}
			}
			_frame[x][y] = _histogram;
		}
    }
	
	return _frame;
}

function normalizeGradients(histograms) {
	
	var normalizedGradients = new Array(histograms.length - 1);
	
	for (var x = 0; x + 1 < histograms.length; x++) {
		normalizedGradients[x] = new Array(histograms[0].length - 1);
		for (var y = 0; y + 1 < histograms[0].length; y++) {
			 var jumbo = histograms[x][y].concat(histograms[x+1][y]).concat(histograms[x][y+1]).concat(histograms[x+1][y+1]);
			 var k = 0;
			 for (var z = 0; z < jumbo.length; z++) {
				 k += jumbo[z] * jumbo[z];
			 }
			 
			 k = Math.sqrt(k);
			 
			 if (k  <= 0) break;
			 for (var z = 0; z < jumbo.length; z++) {
				 jumbo[z] /= k;
			 }
			 
			 normalizedGradients[x][y] = jumbo;
		}
	}
	
	return normalizedGradients;
}

function magicFinalTouch(normalizedGradients) {
	for (var x = 0; x < normalizeGradients.length; x++) {
		for (var y = 0; y < normalizeGradients[0].length; y++) {
			
		}
	}
}
