/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 02.09.2020
 */
 
"use strict";

// TODO: luokka Character, kirjoitetaan omaan javascript tiedostoon
// TODO: luokka CharacterGroup, kirjoitetaan omaan javasctript tiedostoon


/**
 * Sivuston valmistuessa asetetaan ohjelman päätoiminnot eli kuvan analysointi
 */
window.onload = function() {
	// Haetaan TextArea, joka toimii OutPuttina:
	var textOutput = document.getElementById("TextOutput");
	textOutput.value = "Work in progress... ... ..."; // <------------------------------- TODO: Poista tai aseta output textareaan tutoriaali teksti... esim. "Convert your image to text"...

	analyzeUserInput();
}

function analyzeUserInput() {	
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
	    var g_m = readImageToGrayscaleMatrix(img);
	    //var g_m = makeCharacter("H", "256px Arial");
	    //g_m = scaleMatrix(g_m,128,128);

	    // valitaan käytettävä thresholding method
	    var select = document.getElementById("Threshold")
	    var option = select.options[select.selectedIndex].text;
	    var threshold = undefined;
	    switch (option) {
	    case "Default":
		threshold = 128;
	    case "Iterative Selection":
		threshold = iterativeSelectionThreshold(g_m);
		break;
	    case "BHT":
		threshold = balancedHistogramThreshold(g_m);
		break;
	    case "Otsu's Threshold":
		threshold = otsuThreshold(g_m);
		break;
	    default:
		console.log("operation not yet supported");
		break;
	    }
	    
	    var bw_m = convertGrayscaleToBlackAndWhite(g_m, threshold);
		
		// Alueitten etsiminen:
		detectAreas(bw_m, 2);
		
		/*
		var characterGroups = groupCharacters(characters);
		
		// Outputin kirjoittaminen tekstiksi:
		var txt = "";
		for (var i = 0; i < characterGroups.length; i++) {
			txt = txt + characterGroups[i].toString();
			if (characterGroups[i].lineBreak === true) txt = txt + "/n";
			else if (i < chracterGroups.length - 1) txt = txt + " ";
		}
		
		document.getElementById("TextOutput").value = "First Pixel Color Is: " + bw_m[0][0].toString(); // <---- TODO: Poista, Asetettu vain place holderiksi ennen kuin toimintoja ruvetaan tekemään!
		*/
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
 * param percent {number} perentage completed
 * param seconds {number} timer start seconds
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
    const text = `${str_percent} ${str_seconds} ${str_estimate}`;
    document.getElementById("ProgressBar").textContent = text;
}
