/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 02.09.2020
 * @version 10.10.2020, Tesseract
 */
 
"use strict";

// TODO: luokka Character, kirjoitetaan omaan javascript tiedostoon
// TODO: luokka CharacterGroup, kirjoitetaan omaan javasctript tiedostoon

var INTERVAL;

var SECONDS;

/**
 * Sivuston valmistuessa asetetaan ohjelman päätoiminnot eli kuvan analysointi
 */
window.onload = function() {
	// Haetaan TextArea, joka toimii OutPuttina:
	var textOutput = document.getElementById("TextOutput");

	analyzeUserInput();
}


/**
 * Hakee kuvan File Inputista ja suorittaa tekstin tunnistuksen
 */
function analyzeUserInput() {
    clearInterval(INTERVAL);

    SECONDS = Date.now();
    updateProgressBar(0, SECONDS);

    var textOutput = document.getElementById("TextOutput");
    textOutput.value = "";
    
	// Luodaan kuva elementti ja asetetaan sourceksi käyttäjän ohjelmalle syöttämä kuva:
	var img = new Image();
	
		// Haetaan Käyttäjän syöte komponentti:
	var fileInput = document.getElementById("FileInput");
		if (fileInput.files.length > 0) {
		img.src = URL.createObjectURL(fileInput.files[0]);
	}
	else {
		img.src = "images/Example2.png";
	}
	// Kun käyttäjän syöttämä kuva on valmis --> luetaan kuvan pikselit ja analysoidaan kuvan sisältö tekstiksi
    img.onload = function(e) {
	// grayscale muunnos:
	var g_m = readImageToGrayscaleMatrix(img);
	
	// mustavalko muunnos:
	var bw_m = grayscaleToBlackAndWhite(g_m, document.getElementById("InvertColors").checked);
	
	
	// Yksinaisten pikslien filtterointi pois:
	bw_m = removeNoise(bw_m, 1);
	
	// Aloitetaan inputin analysointi alueiden etsinnalla, jota kautta ohjelma siirtyy automaattisesti seuraaviin vaiheisiin:
	detectAreas(bw_m, 1, document.getElementById("AreaSearchDst").value);
    }
}


/**
 * Piilottaa/esittaa kayttajan syottaman kuvan
 */
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
 * Kopioi TextOutput -laatikon tekstin 
 */
function copyToClipboard() {
    var textOutput = document.getElementById("TextOutput");
    textOutput.select();
    textOutput.setSelectionRange(0, 99999);
    document.execCommand("copy");
}
