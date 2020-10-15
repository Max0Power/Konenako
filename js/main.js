/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 02.09.2020
 * @version 10.10.2020, Tesseract
 */
 
"use strict";

// TODO: luokka Character, kirjoitetaan omaan javascript tiedostoon
// TODO: luokka CharacterGroup, kirjoitetaan omaan javasctript tiedostoon

var INTERVAL;


/**
 * Sivuston valmistuessa asetetaan ohjelman päätoiminnot eli kuvan analysointi
 */
window.onload = function() {
	// Haetaan TextArea, joka toimii OutPuttina:
	var textOutput = document.getElementById("TextOutput");

	analyzeUserInput();
}

function analyzeUserInput() {
	
	clearInterval(INTERVAL);
	
	// Luodaan kuva elementti ja asetetaan sourceksi käyttäjän ohjelmalle syöttämä kuva:
	var img = new Image();
	
		// Haetaan Käyttäjän syöte komponentti:
	var fileInput = document.getElementById("FileInput");
		if (fileInput.files.length > 0) {
		img.src = URL.createObjectURL(fileInput.files[0]);
	}
	else {
		img.src = "images/Example.png";
	}
	// Kun käyttäjän syöttämä kuva on valmis --> luetaan kuvan pikselit ja analysoidaan kuvan sisältö tekstiksi
	img.onload = function(e) {
		
		// grayscale muunnos:
	    var g_m = readImageToGrayscaleMatrix(img);
	    //var g_m = makeCharacter2("i", 64, "Arial");
		
		// mustavalko muunnos:
		var bw_m = grayscaleToBlackAndWhite(g_m, document.getElementById("InvertColors").checked);
		
		// Aloitetaan inputin analysointi alueiden etsinnalla, jota kautta ohjelma siirtyy automaattisesti seuraaviin vaiheisiin:
		detectAreas(bw_m, document.getElementById("AreaSearchDst").value); // Ei kaytossa talla hetkella --> keskitytaan tesseractiin nyt
	    
	    //tesseract(img.src); // recognize text using Tesseract.js
	}
}


function toggleImage() {
	var toggle = document.getElementById("ToggleImage");
	if (toggle.checked) {
		document.getElementById("Drawing").style.display = "block";
	}
	else {
		document.getElementById("Drawing").style.display = "none";
	}
}

/**
 * Updates the progress bar's text content
 * 
 * @param percent {number} perentage completed
 * @param seconds {number} timer start seconds
 */
function updateProgressBar(percent, seconds) {
    // calculates estimated runtime from parameters
    const elapsed = Math.round((Date.now()-seconds)/1000);
    const estimate = Math.round((elapsed/percent)*(100-percent));

    // formats the variables to a readable texts
    const str_percent = `${percent}% Complete`;
    const str_seconds = `Time elapsed ${elapsed} second(s)`;
    const str_estimate =`ETA ${estimate} second(s)`

    // changes the text content of a progress bar
    const text = `${str_percent}, ${str_seconds}, ${str_estimate}`;
    document.getElementById("ProgressBar").textContent = text;
}

/**
 * Optical Character Recognition (OSD) using Tesseract.js
 * 
 * @param file {File} File object, img or canvas element, Blob object,
 *   path or URL to an image, base64 encoded image
 */
async function tesseract(file) {
    // start timer
    const timer = Date.now();
    
    const options = {
	//workerPath: 'lib/worker.min.js', <--  aiheuttaa errorin (ei pysty lataamaan (MIME ERROR))
	//corePath: 'lib/tesseract-core.wasm.js', <-- aiheuttaa errorin, (ei pysty lataamaan (MIME ERROR))
	//langPath: 'tessdata', <-- toimii, mutta ei ole valttamaton?
	logger: progress
    }

    // Default paths to the Tesseract's dependencies
    // worker: https://unpkg.com/browse/tesseract.js@2.1.3/dist/worker.min.js
    // core:   https://unpkg.com/tesseract.js-core@2.1.0/tesseract-core.wasm.js
    // lang:   https://tessdata.projectnaptha.com/4.0.0
    
    // TODO: langPath vaihtaminen epäonnistuu
    // TODO: traineddataa ei taideta käyttää

    function progress(e) {
	if (e.status === "recognizing text") {
	    // changes the text content of a progress bar
	    let percent = parseInt(e.progress * 100, 10);
	    updateProgressBar(percent, timer);
	}
    }
    
    // run tesseract in a background thread
    const worker = Tesseract.createWorker(options);
    
    // show detailed information
    Tesseract.setLogging(false);
    work();

    async function work() {
	// inits worker thread
	await worker.load();
	await worker.loadLanguage('eng');
	await worker.initialize('eng');

	// Optical Character Recognition (OCR)
	let result = await worker.recognize(file);

	// stops worker thread
	await worker.terminate();

	// draws lines, words and symbols
	drawGroup(result.data.lines, 'black');
	drawGroup(result.data.words, 'black');
	drawGroup(result.data.symbols, 'black');

	function drawGroup(group, color) {
	    group.forEach(obj => {
		// objects top left and bottom right corners
		let topleft = [obj.bbox.x0, obj.bbox.y0];
		let bottomright = [obj.bbox.x1, obj.bbox.y1];

		// draws a square around the object
		drawArea(topleft, bottomright, color); // drawing.js
	    });
	}

	// changes the text content of a output textarea
	const textarea = document.getElementById("TextOutput")
	textarea.value = result.data.text;
    }
}
