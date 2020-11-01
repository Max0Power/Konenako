"use strict";

/**	
 * @example
 *   scaleToNext16x16(0,0,16) === [0,0]
 *   scaleToNext16x16(0,1,16) === [0,16]
 *   scaleToNext16x16(1,0,16) === [16,0]
 *   scaleToNext16x16(1,1,16) === [16,16]
 */	
function scaleToNext16x16(width, height, size) {
    width += width % 16 > 0 ? size - (width % size) : 0;
    height += height % 16 > 0 ? size - (height % size) : 0;
    return [width, height];
}

/**
 * @example
 *   magnitude(0,0) === 0
 *   magnitude(0,255) === 255
 *   magnitude(255,0) === 255
 *   magnitude(255,255) === 360.6245
 *   magnitude(0,-255) === 255
 *   magnitude(-255,0) === 255
 *   magnitude(-255,255) === 360.6245
 *   magnitude(-255,-255) === 360.6245
 *   magnitude(255,-255) === 360.6245
 */
function magnitude(gradientX, gradientY) {
    return Math.sqrt(Math.pow(gradientX,2) + Math.pow(gradientY,2));	
}

/**
 * @example
 *   orientation(0,0) === 0
 *   orientation(0,255) === 90
 *   orientation(255,0) === 0
 *   orientation(255,255) === 45
 *   orientation(0,-255) === -90
 *   orientation(-255,0) === 180
 *   orientation(-255,255) === 135
 *   orientation(-255,-255) === -135
 *   orientation(255,-255) === -45
 */
function orientation(gradientX, gradientY) {
    return parseInt(Math.atan2(gradientY, gradientX) * (180 / Math.PI), 10);
}

/**
 * @example
 *   orientation0x180(0,0) === 0
 *   orientation0x180(0,255) === 90
 *   orientation0x180(255,0) === 0
 *   orientation0x180(255,255) === 45
 *   orientation0x180(0,-255) === 90
 *   orientation0x180(-255,0) === 180
 *   orientation0x180(-255,255) === 135
 *   orientation0x180(-255,-255) === 45
 *   orientation0x180(255,-255) === 135
 */
function orientation0x180(gradientX, gradientY) {
    let angle = orientation(gradientX, gradientY);
    return angle < 0 ? angle + 180 : angle;
}

/**
 * @example
 *   locateHistogram(9,20,0) === [0,1]
 *   locateHistogram(9,20,45) === [2,3]
 *   locateHistogram(9,20,90) === [4,5]
 *   locateHistogram(9,20,135) === [6,7]
 *   locateHistogram(9,20,180) === [8,0]
 */
function locateHistogram(size, step, angle) {
    let h_prev = parseInt(angle / step, 10);
    if (h_prev === size) h_prev = size - 1; // poikkeus
    
    let h_next = (h_prev + 1) % size;
    return [h_prev, h_next];
}

/**
 * @example
 *   insertHistogram(9,20,0,0) === [0,0]
 *   insertHistogram(9,20,0,255) === [255,0]
 *   insertHistogram(9,20,45,255) === [191.125,63.75]
 *   insertHistogram(9,20,90,255) === [127.5,127.5]
 *   insertHistogram(9,20,135,255) === [63.75,191.125]
 *   insertHistogram(9,20,180,255) === [0,255]
 *  
 */
function insertHistogram(size, step, angle, amount) {
    let [h_prev, h_next] = locateHistogram(size, step, angle);
    
    let add_prev = ( (h_next * step - angle) / step) * amount;
    if (h_next < h_prev) {
	add_prev = ( (h_next * step - (angle - 180)) / step) * amount;
    }
    let add_next = ( (angle - (h_prev * step)) / step) * amount;
    return [add_prev, add_next];
}

/**
 * @example
 *   normalizeHistogram([0,0,0]) === [0,0,0]
 *   normalizeHistogram([1,0,0]) === [1,0,0]
 *   normalizeHistogram([1,1,0]) === [0.7071,0.7071,0]
 *   normalizeHistogram([1,2,3]) === [0.2673,0.5345,0.8018]
 */
function normalizeHistogram(histogram) {
    let k = Math.sqrt(histogram.reduce(
	(acc,cur) => acc + Math.pow(cur, 2)
    ));
    if (k > 0) return histogram.map(
	val => val / k // divide by zero
    );
    return histogram;
}

/**
 * @example
 *   normalizeHistogram([0,0,0,0],255) === [0,0,0,0]
 *   normalizeHistogram([0,1,2,3],255) === [0,85,170,255]
 *   normalizeHistogram([255,255],255) === [255,255]
 */
function normalizeHistogram2(numbers, limit) {
    let ratio = Math.max.apply(this, numbers) / limit;
    if (ratio === 0) return numbers; // divide by zero
    return numbers.map(num => Math.round( num / ratio ));
}

function hog(matrix) {
    const [width, height] = [matrix.length, matrix[0].length];
    const [scaled_w, scaled_h] = scaleToNext16x16(width, height, 16);
    
    // skaalaus, jos ei ole jaollinen 16:sta:
    if (width !== scaled_w || height !== scaled_h) {
	// scale matrix up to next 16	
	matrix = scaleMatrix(matrix, scaled_w, scaled_h);
    }
    
    // luodaan gradientiksi:	
    //let [m_magnitude, m_orientation] = makeToGradientObj(matrix);
    // Muunnetaan 9x1 histogrammeiksi (8x8 alue kuvassa):
    //matrix = make9x1Histograms(m_magnitude, m_orientation);
    // Palautetaan lopuksi 36x1 Histogrammit (16x16 alue kuvasta = 2x2 9x1histogrammia)
    //return make36x1Histograms(matrix);
    return make36x1Histograms(make9x1Histograms(...makeToGradientObj(matrix)));

    /**
     * Luo matriisin pohjalta gradientti-objektin, joka koostuu
     * kahdesta matriisista: .magnitude ja .orientation.
     */
    function makeToGradientObj(matrix) {
	const width = matrix.length;
	const height = matrix[0].length;
	
	var matX = makeMatrix(width, height, 0); // erotus horisontaalinen
	var matY = makeMatrix(width, height, 0); // erotus vertikaalinen
	var matM = makeMatrix(width, height, 0); // Magnitude (pituus)
	var matO = makeMatrix(width, height, 0); // Orientation (kulma)

	for (var x = 0; x < width; x++) {
	    for (var y = 0; y < height; y++) {
		if (x-1 >= 0 && x+1 < width) {
		    matX[x][y] = matrix[x+1][y] - matrix[x-1][y];
		}
		if (y-1 >= 0 && y+1 < height) {
		    matY[x][y] = matrix[x][y-1] - matrix[x][y+1];
		}

		matM[x][y] = magnitude(matX[x][y], matY[x][y]);
		matO[x][y] = orientation0x180(matX[x][y], matY[x][y]);
	    }
	}

	return [matM, matO];
    }
    

    /**
     * histogrammit 9x1 sisältää värin muutokset eri suuntiin
     */
    function make9x1Histograms(m_magnitude, m_orientation) {
	const c_size = 8;
	const h_size = 4;
	const h_step = 45;
	
	var width = parseInt(m_magnitude.length / c_size, 10);
	var height = parseInt(m_magnitude[0].length / c_size, 10);

	// Histogram esiintymät: [0, 45, 90, 135]

	var histograms9x1 = new Array(width);
	for (var x = 0; x < width; x++) {
	    histograms9x1[x] = new Array(height);
	    for(var y = 0; y < height; y++) {
		var _histogram = new Array(h_size).fill(0);
		for (var i = 0; i < c_size; i++) {
		    for (var j = 0; j < c_size; j++) {
			var xs = x*c_size+i;
			var ys = y*c_size+j;

			let [h_prev, h_next] = locateHistogram(h_size, h_step, m_orientation[xs][ys]);
			let [add_prev, add_next] = insertHistogram(h_size, h_step, m_orientation[xs][ys], m_magnitude[xs][ys]);
			
			_histogram[h_prev] += add_prev;
			_histogram[h_next] += add_next;
		    }
		}
		histograms9x1[x][y] = _histogram;
	    }
	}
	return histograms9x1;
    }


    /**
     * Sisältää 4x4 palan histogrammeja
     */
    function make36x1Histograms(histograms) {
	const width = histograms.length;
	const height = histograms[0].length;

	var histograms36x1 = new Array(width-1);

	for (var x = 0; x+1 < width; x++) {
	    histograms36x1[x] = new Array(height-1);
	    for (var y = 0; y+1 < height; y++) {
		let histogram36x1 = histograms[x][y]
		    .concat(histograms[x+1][y])
		    .concat(histograms[x][y+1])
		    .concat(histograms[x+1][y+1]);
		histograms36x1[x][y] = normalizeHistogram2(histogram36x1, 255);
	    }
	}

	return histograms36x1;
    }
}

/**	
 * Palauttaa matriisin joka vastaa kirjaimen fonttia	
 * 	
 * Huom! Pienellä fontilla kirjaimen rajoissa virhettä	
 * Huom! Esimerkki fontti "256px Arial"	
 * 	
 * param text {char} kirjain josta tehdään mallikuva	
 * param font {string} kirjaimen koko ja fontti	
 * return {number[][]} mallikirjaimen matriisi	
 */	
function makeCharacter(text, size, font) {	
    // create a canvas for sample character	
    const canvas = document.createElement("CANVAS");	
    const context = canvas.getContext("2d");	

    // measure width and height	
    setContext(context, size, font);	

    function setContext(context, size, font) {	
	// canvas context settings	
	context.font =  `${size}px ${font}`;	
	context.fillStyle = "black";	
	context.textBaseline = "top";	
    }	

    // measure text width and height based on context	
    const metrics = context.measureText(text);	
    const actualLeft = metrics.actualBoundingBoxLeft;	
    const actualRight = metrics.actualBoundingBoxRight;	
    const actualTop = metrics.actualBoundingBoxAscent;	
    const actualBottom = metrics.actualBoundingBoxDescent;	

    // setting width or height resets canvas context	
    canvas.width = actualLeft + actualRight;	
    canvas.height = actualTop + actualBottom;	

    // default white background	
    context.fillStyle = "white";	
    context.fillRect(0, 0, canvas.width, canvas.height);	

    // canvas context was reset	
    setContext(context, size, font);	

    // fit to canvas starting from topleft corner	
    context.fillText(text, actualLeft, actualTop);	

    // convert measured canvas to a matrix 	
    var matrix = makeCanvasMatrix(context);	

    function makeCanvasMatrix(context) {	
	// shortened names for width and height	
	const width = context.canvas.width;	
	const height = context.canvas.height;	

	// convert canvas image data into unsigned 32-bit array	
	const imgd = context.getImageData(0, 0, width, height);	
	const data = new Uint32Array(imgd.data.buffer);	

	var matrix = new Array(width);	
	for (var x = 0; x < width; x++) {	
	    matrix[x] = new Array(height);	
	    for (var y = 0; y < height; y++) {	
		// pixel index in 32-bit array 	
		var pixel = data[(y*width)+x];	

		// red, green and blue (RGB) values	
		var r = (0xff000000 & pixel) >>> 24;	
		var g = (0x00ff0000 & pixel) >>> 16;	
		var b = (0x0000ff00 & pixel) >>> 8;	

		// calculate average between RGB values	
		var mean = Math.round((r+g+b)/3.0);	
		matrix[x][y] = mean < 255 ? 0 : 255;	
	    }	
	}	

	return matrix;	
    }	

    return matrix;	
}	

function drawHOG(histograms36x1) {
    var canvas = document.createElement("CANVAS");
    document.body.appendChild(canvas);

    var width =(histograms36x1.length) * 16;
    var height = (histograms36x1[0].length) * 16;

    canvas.width = width;
    canvas.height = height;

    var ctx = canvas.getContext("2d");

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    var line_start_points = [
	[0, 7],
	[0, 1],
	[6, 0],
	[12, 0]
    ];

    var line_end_points = [
	[15, 7],
	[15, 14],
	[9, 15],
	[3, 15]
    ];

    const h_size = 4;

    for (var x = 0; x < histograms36x1.length; x++) {
	for (var y = 0; y < histograms36x1[0].length; y++) {
	    for (var angle_index  = 0; angle_index < h_size; angle_index++) {

		var col = parseInt((
		    parseInt(histograms36x1[x][y][angle_index], 10) +
			parseInt(histograms36x1[x][y][1*h_size + angle_index], 10) +
			parseInt(histograms36x1[x][y][2*h_size + angle_index], 10) +
			parseInt(histograms36x1[x][y][3*h_size + angle_index], 10)
		), 10);
		if (col > 255) col = 255;
		if (col < 0) col = 0;

		var l_start_x = x * 16 + line_start_points[angle_index][0];
		var l_start_y = y * 16 + line_start_points[angle_index][1];
		var l_end_x = x * 16 + line_end_points[angle_index][0];
		var l_end_y = y * 16 + line_end_points[angle_index][1];

		ctx.strokeStyle = "rgb(" + col + "," + col + "," + col + ")";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(l_start_x, l_start_y);
		ctx.lineTo(l_end_x, l_end_y);
		ctx.stroke();
	    }
	}
    }
}
