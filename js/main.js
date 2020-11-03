/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 02.09.2020
 * @version 10.10.2020, Tesseract
 */
 
"use strict";


var INTERVAL;
var SECONDS;


/**
 * Sivuston valmistuessa asetetaan ohjelman päätoiminnot eli kuvan analysointi
 */
window.onload = function() {
    // Luodaan vaste data:
    CHARACTER_COMPARISON_DATA = makeCharacterComparisonData();
    /*
    var test = makeCharacter("a", 128, "Arial");
    drawPixelArray(test);
    
    var hogtest = hog(test);
    drawHOG(hogtest);
    console.log(hogtest);
    */
	
	// Paivitetaan UI:
	toggleImage();
	toggleSettings();
	handleBlackAndWhiteConversionUI();
	handleSpacingUI() 
	// Analysoidaan kuva tekstiksi:
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
		img.src = "images/Greeting.png";
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
	if (document.getElementById("ToggleImage").checked) {
		document.getElementById("UserImgCanvas").style.display = "block";
	}
	else {
		document.getElementById("UserImgCanvas").style.display = "none";
	}
}


/*
 * Piilottaa/esittaa asetus -osion, jossa kayttaja pystyy tarvittaessa saatamaan kuvasta tekstiksi prosessissa kaytettaviin parametrehin.
 */
function toggleSettings() {
	if (document.getElementById("ToggleSettings").checked) {
		document.getElementById("Settings").style.display = "block";
	}
	else {
		document.getElementById("Settings").style.display = "none";
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


/**
 * Asetuksissa olevan Black And white conversion threshold method valinnan perusteella ("Automatic"|"Custom") piilotetaan/esitetaan html komponentit, joilla voi vaikuttaa mustavalkomuunnokseen
 */
function handleBlackAndWhiteConversionUI() {
	var slider = document.getElementById("BlackAndWhiteThresholdSlider");
	var num_input = document.getElementById("BlackAndWhiteThresholdValue");
	
	if (document.getElementById("BlackAndWhiteThresholdMethod").value === "automatic") {
		slider.style.visibility = "hidden"; 
		num_input.style.visibility = "hidden"; 
	}
	else {
		slider.style.visibility = "visible";
		num_input.style.visibility = "visible";
	}
}


/**
 * Kayttajan vaihtaessa asetuksissa olevan "BlackAndWhiteThresholdSlider" -sliderin arvoa --> paivittaa arvon "BlackAndWhiteThresholdValue" -inputtiin
 */
function blackAndWhiteThresholdSliderOnInput() {
	var slider = document.getElementById("BlackAndWhiteThresholdSlider");
	var num_input = document.getElementById("BlackAndWhiteThresholdValue");
	
	num_input.value = slider.value;
}


/**
 * Kayttajan vaihtaessa asetuksissa olevan "BlackAndWhiteThresholdValue" -inputin arvoa --> paivittaa arvon "BlackAndWhiteThresholdSlider" -slideriin
 */
function blackAndWhiterThresholdValueOnInput() {
	var slider = document.getElementById("BlackAndWhiteThresholdSlider");
	var num_input = document.getElementById("BlackAndWhiteThresholdValue");
	
	slider.value = num_input.value;
}


/**
 * Asetuksissa olevan Spacing method valinnan perusteella ("Automatic"|"Custom") piilotetaan/esitetaan html komponentit, joilla voi vaikuttaa valejen maaritykseen
 */
function handleSpacingUI() {
	var slider = document.getElementById("SpacingSlider");
	var num_input = document.getElementById("SpacingValue");
	
	if (document.getElementById("SpacingMethod").value === "automatic") {
		slider.style.visibility = "hidden"; 
		num_input.style.visibility = "hidden"; 
	}
	else {
		slider.style.visibility = "visible";
		num_input.style.visibility = "visible";
	}
}


/**
 * Kayttajan vaihtaessa asetuksissa olevan "SpacingSlider" -sliderin arvoa --> paivittaa arvon "SpacingValue" -inputtiin
 */
function spacingSliderOnInput() {
	var slider = document.getElementById("SpacingSlider");
	var num_input = document.getElementById("SpacingValue");
	
	num_input.value = slider.value / 100;
}


/**
 * Kayttajan vaihtaessa asetuksissa olevan "SpacingValue" -inputin arvoa --> paivittaa arvon "SpacingSlider" -slideriin 
 */
function spacingValueOnInput() {
	var slider = document.getElementById("SpacingSlider");
	var num_input = document.getElementById("SpacingValue");
	
	slider.value = num_input.value * 100;
}
