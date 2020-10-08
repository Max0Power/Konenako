"use strict";

function hog(matrix) {

	// skaalaus, jos ei ole jaollinen 16:sta:
	if (matrix.length % 16 !== 0 || matrix[0].length % 16 !== 0) {
		matrix = scaleToNext16x16(matrix);
	}
	// luodaan gradientiksi:
	matrix = makeToGradientObj(matrix);
	// Muunnetaan 9x1 histogrammeiksi (8x8 alue kuvassa):
	matrix = make9x1Histograms(matrix);
	// Palautetaan lopuksi 36x1 Histogrammit (16x16 alue kuvasta = 2x2 9x1histogrammia)
	return make36x1Histograms(matrix);
	//return histograms36x1ToOneDimension(matrix);
	//return make36x1Histograms(make9x1Histograms(makeToGradientObj(matrix)));
	
	/**
	 * Skaalaa matriksin dimensiot lahimpaan lukuun, joka on jaollinen 16:sta
	 */
	function scaleToNext16x16(matrix) {
		var width = matrix.length;
		var height = matrix[0].length;
		
		width += 16 - width % 16;
		height += 16 - height % 16;
		console.log("Leveys/korkeus skaalattu " + width + ", " + height);

		// scale matrix up to next 16
		matrix = scaleMatrix(matrix, width, height);

		return matrix;
	}


	/**
	 * Luo matriisin pohjalta gradientti objektin, joka koostuu kahdesta matriisista: .magnitude ja .orientation
	 */
	function makeToGradientObj(matrix) {
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

				matM[x][y] = Math.sqrt(Math.pow(matX[x][y],2) + Math.pow(matY[x][y],2));
				matO[x][y] = parseInt(Math.atan2(matY[x][y], matX[x][y]) * (180 / Math.PI), 10);
				if (matO[x][y] < 0) matO[x][y] += 180;
				console.log(matO[x][y]);
			}
		}

		return {
			magnitude: matM,
			orientation: matO
		};
	}


	/**
	 * histogrammit 9x1 sisaltaa varin muutokset eri suuntiin
	 */
	function make9x1Histograms(gradient) {
		var width = parseInt(gradient.magnitude.length/8, 10);
		var height = parseInt(gradient.magnitude[0].length/8, 10);
		
		// Histogram esiintymat: [0, 20, 40, 60, 80, 100, 120, 140, 160]
		
		var histograms9x1 = new Array(width);
		for (var x = 0; x < width; x++) {
			histograms9x1[x] = new Array(height);
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
				histograms9x1[x][y] = _histogram;
			}
		}
		
		return histograms9x1;
	}


	/**
	 * Sisaltaa 4x4 palan histogrammeja
	 */
	function make36x1Histograms(histograms) {
		
		var histograms36x1 = new Array(histograms.length - 1);
		
		for (var x = 0; x + 1 < histograms.length; x++) {
			histograms36x1[x] = new Array(histograms[0].length - 1);
			for (var y = 0; y + 1 < histograms[0].length; y++) {
				 var jumbo = histograms[x][y].concat(histograms[x+1][y]).concat(histograms[x][y+1]).concat(histograms[x+1][y+1]);
				 var k = 0;
				 for (var z = 0; z < jumbo.length; z++) {
					 k += jumbo[z] * jumbo[z];
				 }
				 
				 k = Math.sqrt(k);
				 
				 if (k > 0) {
					for (var z = 0; z < jumbo.length; z++) {
						  jumbo[z] /= k;
					 }
				 }
				
				 
				 
				 histograms36x1[x][y] = jumbo;
			}
		}
		
		return histograms36x1;
	}


	/**
	 * Laskee keskiarvon kaikkien muodostottejun 36x1 histogrammien kesken... HMMM... taitaapa olla ylimaarainen vaihe ja aikaisemmin tehty histograms36x1
	 * riittaa hogin palautukseksi....
	 * Menee vaarin, jos 16x16 alueen ( = 2x2 histogrammia) keskusta toimii aina gradienttien lahtopisteena
	 */
/*	function histograms36x1ToOneDimension(histograms36x1) {
		var width = (histograms36x1.length + 1) / 2;
		var height = (histograms36x1[0].length + 1) / 2;
		
		var avg = new Array(width);
		for (var x = 0; x < width; x++) {
			avg[x] = new Array(height);
			for (var y = 0; y < height; y++) {
				avg[x][y] = new Array(36);
				for (var z = 0; z < 36; z++) {
					avg[x][y][z] = 0;
				}
			}
		}
		
		var occurance = new Array(width);
		for (var x = 0; x < width; x++) {
			occurance[x] = new Array(height);
			for (var y = 0; y < height; y++) {
				occurance[x][y] = new Array(36);
				for (var z = 0; z < 36; z++) {
					occurance[x][y][z] = 1;
				}
			}
		}
		
		
		for (var x = 0; x < histograms36x1.length; x++) {
			for (var y = 0; y < histograms36x1[0].length; y++) {
				for (var z = 0; z < histograms36x1[x][y].length; z++) {
					var m_x = x * 8 + (z - (parseInt(z/16, 10) * 16));
					var m_y = y * 8 + (parseInt(z / 16, 10));
					
					var chunk_x = parseInt(m_x / 16, 10);
					var chunk_y = parseInt(m_y / 16, 10);
					var chunk_z = (m_y  - (chunk_y * 16)) * 16 + (m_x - (chunk_x * 16));
					
					avg[chunk_x][chunk_y][chunk_z] += histograms36x1[x][y][z];
					occurance[chunk_x][chunk_y][chunk_z] += 1;
				}				
			}
		}
		
		for (var x = 0; x < width; x++) {
			for(var y = 0; y < height; y++) {
				avg[x][y][z] /= occurance[x][y][z];
			}
		}
		return avg;
	}
	*/
}
