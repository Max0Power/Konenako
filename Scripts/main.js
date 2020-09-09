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
		img.src = "Images/Example.png";
	}
	// Kun käyttäjän syöttämä kuva on valmis --> luetaan kuvan pikselit ja analysoidaan kuvan sisältö tekstiksi
	img.onload = function(e) {
	    var g_m = readImageToGrayscaleMatrix(img);

	    // valitaan käytettävä thresholding method
	    var select = document.getElementById("Threshold")
	    var option = select.options[select.selectedIndex].text;
	    var threshold = undefined;
	    switch (option) {
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
		
		// Merkkien etsiminen ja ryhmayttaminen:
		var characterGroups = groupCharacters(findCharacters(bw_m));
		
		// Outputin kirjoittaminen tekstiksi:
		var txt = "";
		for (var i = 0; i < characterGroups.length; i++) {
			txt = txt + characterGroups[i].toString();
			if (characterGroups[i].lineBreak === true) txt = txt + "/n";
			else if (i < chracterGroups.length - 1) txt = txt + " ";
		}
		
		document.getElementById("TextOutput").value = "First Pixel Color Is: " + bw_m[0][0].toString(); // <---- TODO: Poista, Asetettu vain place holderiksi ennen kuin toimintoja ruvetaan tekemään!
		
		drawPixelArray(bw_m);
	}
}


function drawPixelArray(matrix) {
	var canvas = document.getElementById("Grayscale");
	
	canvas.width = matrix.length;
	canvas.height = matrix[0].length;
	
	var ctx = canvas.getContext("2d");
	
	var imgData = ctx.createImageData(matrix.length, matrix[0].length);
	var data = imgData.data;
	var imageDataIndex = 0;
	for (var x = 0; x < matrix.length; x++) {
		for (var y = 0; y < matrix[0].length; y++) {
			data[imageDataIndex] = matrix[x][y];
			data[imageDataIndex + 1] = matrix[x][y];
			data[imageDataIndex + 2] = matrix[x][y];
		        data[imageDataIndex + 3] = 255;
			imageDataIndex += 4;
		}
	}
	
	ctx.putImageData(imgData, 0, 0);
	
	
	
}

function toggleImage() {
	var toggle = document.getElementById("ToggleImage");
	if (toggle.checked) {
		document.getElementById("Grayscale").style.display = "block";
	}
	else {
		document.getElementById("Grayscale").style.display = "none";
	}
}
