/**
 * @author Jussi Parviainen ja Harri Linna
 * @created 13.10 02.09.2020
 */
 
"use strict";

const MAX_EPS_TO_RATIO = 0.2;


/**
 * Luokka vastedatalle, jonne syotetaan merkkien vertailussa vasteena kaytettavat merkit.
 * Luokka sisaltaa metodin merkkien vertailuun
 */
class ComparisonData {
	
	/**
	 * CompparisonData -olion muodostaja
	 */
	constructor() {
		this.comparison_data = [];
		this.comparison_characters = [];
		this.comparison_fonts = [];
		this.fontratio = [];
	    this.spaceratio = [];
	    this.areaFiltering = Number.MAX_SAFE_INTEGER;
	    //this.comparison_hog =[];
 	}
	
	
	/**
	 * Lisaa merkiston (taulukkossa olevat merkit) vertailussa kaytettavaan datasettiin
	 */
	addCharacterDataSet(data, size, font) {
		for (var i = 0; i < data.length; i++) {
		    this.addCharacter(data[i], size, font);
		    //let index = this.comparison_data.length-1;
		    //this.comparison_hog.push(hog(this.comparison_data[index]));
		}

	    // välilyönnin leveys tietyllä fontilla
	    //const latestchar = this.comparison_characters[this.comparison_characters-1];
	    //const spacewidth = this.setEmptySpaceRatio(latestchar, size, font);
	    //this.spaceratio[font] = spacewidth;
	}
	
	
	/**
	 * Lisaa yksittaisen merkin vertailussa kaytettavaan datasettiin
	 */
	addCharacter(c, size, font) {
		// create a canvas for sample character
		const canvas = document.createElement("CANVAS");
		const ctx = canvas.getContext("2d");

		// measure width and height
		setContext(ctx, size, font);

		// measure c width and height based on ctx
		const metrics = ctx.measureText(c);
		const actualLeft = metrics.actualBoundingBoxLeft;
		const actualRight = metrics.actualBoundingBoxRight;
		const actualTop = metrics.actualBoundingBoxAscent;
		const actualBottom = metrics.actualBoundingBoxDescent;

		// setting width or height resets canvas ctx
		canvas.width = actualLeft + actualRight;
		canvas.height = actualTop + actualBottom;
		
		// default white background
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// canvas ctx was reset
		setContext(ctx, size, font);

		// fit to canvas starting from topleft corner
		ctx.fillText(c, actualLeft, actualTop);

		// Lisataan data olioon
		this.comparison_characters.push(c);
		this.comparison_fonts.push(font);
		this.comparison_data.push(makeCanvasMatrix(ctx));

		const index = this.comparison_data.length-1;
		const height = this.comparison_data[index][0].length;
		const ratio = fontRatio(height, size);
		this.fontratio.push(ratio); 
		
		function setContext(ctx, size, font) {
			// canvas ctx settings
			ctx.font = `${size}px ${font}`;
			ctx.fillStyle = "black";
			ctx.textBaseline = "top";
		}
		
		function makeCanvasMatrix(ctx) {
			// shortened names for width and height
			const width = ctx.canvas.width;
			const height = ctx.canvas.height;

			// convert canvas image data into unsigned 32-bit array
			const imgd = ctx.getImageData(0, 0, width, height);
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
	}
	
	
	/**
	 * Etsii loytyyko parametrina annettu merkki olion vastedatasta ja tekee vertailun sen loytyessa
	 */
	compareToCharacter(c, m_to_compare_with) {
		for (var i = 0; i < this.comparison_characters.length; i++) {
			if (this.comparison_characters[i] === c) {
				return this.compare(i, m_to_compare_with);
			}
		}
		return 0;
	}
	
	
    /**
     * Tekee vertailun indeksissa olevaan merkkiin nahden
     */
    compare(index, m_to_compare_with) {
	// Taulukon indeksin oikeellisuustarkistus
	assert(index >= 0 && index < this.comparison_data.length);
	
	var m_width = m_to_compare_with.length
	var m_height = m_to_compare_with[0].length
	var m_ratio = m_width / m_height;
	
	var sample_width = this.comparison_data[index].length;
	var sample_height = this.comparison_data[index][0].length;
	var sample_ratio = sample_width / sample_height;
		    
	// Alueen ja vastedata mittasuhteet eivät täsmää    
	if (Math.abs(m_ratio - sample_ratio) > MAX_EPS_TO_RATIO) return 0;

	// Alue pienempää kuin pienimmän fonttikoon pienin kirjain
	if (m_width * m_height < GLOBAALI.getAreaFiltering()) return 0;
	
	//if (m_to_compare_with.length < document.getElementById("AreaFiltteringX").value ||
	//    m_to_compare_with[0].length < document.getElementById("AreaFiltteringY").value) return 0;
	
	//..... .... lopulta skaalataan samaan kokoon
	var sample_scaled = scaleMatrix(this.comparison_data[index], m_width, m_height); // kaavat.js

	// Suoritetaan pikselitason vertailu lopuksi
	return sad(m_to_compare_with, sample_scaled);
    }
	
	
	/**
	 * Palauttaa indeksissa olevan merkin
	 */
	getCharacter(index) {
		if (index < 0 || index > this.comparison_characters.length - 1) return "INDEX WAS INVALID";
		
		return this.comparison_characters[index];
	}
	
	
	/**
	 * Palauttaa indeksissa olevan fontin
	 */
	getFont(index) {
		if (index < 0 || index > this.comparison_characters.length - 1) return "INDEX WAS INVALID";
		
		return this.comparison_fonts[index];
	}
	
	
	/**
	 * Palauttaa vasteessa olevan merkkien maaran
	 */
	getCharacterCount() {
		return this.comparison_characters.length;
	}


    /**
     * Ei käytössä!
     * 
     * Palauttaa fontin välilyönnin leveyden suhteessa fonttikokoon
     * @param sample merkki josta välilyönnin leveys lasketaan
     * @param size
     * @param font
     * @return {double} välilyönnin leveyden suhde rivin korkeuteen
     */
    /*
    setEmptySpaceRatio(sample, size, font) {
	// create a canvas for sample character
	const canvas = document.createElement("CANVAS");
	const ctx = canvas.getContext("2d");

	// measure width and height
	setContext(ctx, size, font);

	// measure c width and height based on ctx
	let metrics = ctx.measureText(`${sample} ${sample}`);
	let actualLeft = metrics.actualBoundingBoxLeft;
	let actualRight = metrics.actualBoundingBoxRight;

	// setting width or height resets canvas ctx
	const with_space = actualLeft + actualRight;

	metrics = ctx.measureText(`${sample}${sample}`);
	actualLeft = metrics.actualBoundingBoxLeft;
	actualRight = metrics.actualBoundingBoxRight;

	// setting width or height resets canvas ctx
	const without_space = actualLeft + actualRight;
	
	function setContext(ctx, size, font) {
	    // canvas ctx settings
	    ctx.font = `${size}px ${font}`;
	    ctx.fillStyle = "black";
	    ctx.textBaseline = "top";
	}

	return Math.abs(with_space - without_space) / size;
    }
    */

    /**
     * Ei käytössä!
     */
    /*
    getEmptySpaceRatio(lineheight) {
	let unique = removeDuplicates(this.comparison_fonts);
	
	unique = unique.map(font => {
	    return lineheight * this.spaceratio[font];
	});

	//let mean = quessFontSize(unique);
	let mean = average(unique);
	let deviation = sd(unique);
	
	return {
	    mean: mean,
	    deviation: deviation
	};
    }
    */
    
    /**
     * Perustuu siihen että x_px <= y_px, kun x <= y, jolloin
     * pienimmän fonttikoon pienin kirjain on suurin alaraja.
     * Niinpä ei tarvitse optimoida yhtään mitään!
     * 
     * @param fontsize {number} pienin sallittu fonttikoko
     */
    setAreaFiltering(fontsize) {
	const canvas = document.createElement("CANVAS");
	const ctx = canvas.getContext("2d");
	
	let fonts = removeDuplicates(this.comparison_fonts);
	let chars = removeDuplicates(this.comparison_characters);

	this.areaFiltering = Number.MAX_SAFE_INTEGER;

	// vastedata täytyy ensin alustaa!
	assert(fonts.length > 0 && chars.length > 0);
	
	fonts.forEach(font => {
	    setContext(ctx, fontsize, font);
	    chars.forEach(character => {
		let metrics = ctx.measureText(character);
		let actualWidth = Math.ceil(metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight);
		let actualHeight = Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
		let actualSize = Math.ceil(actualWidth * actualHeight);

		if (actualSize < this.areaFiltering) {
		    this.areaFiltering = actualSize;
		}
	    });
	});

	function setContext(ctx, size, font) {
	    ctx.font = `${size}px ${font}`;
	    ctx.fillStyle = "black";
	    ctx.textBaseline = "top";
	}
    }

    getAreaFiltering() {
	return this.areaFiltering;
    }
}
