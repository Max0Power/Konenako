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
		var pixelArray = readImageToGrayscalePixelArray(img);
		
		// Merkkien etsiminen ja ryhmayttaminen:
		var characterGroups = groupCharacters(findCharacters(pixelArray));
		
		// Outputin kirjoittaminen tekstiksi:
		var txt = "";
		for (var i = 0; i < characterGroups.length; i++) {
			txt = txt + characterGroups[i].toString();
			if (characterGroups[i].lineBreak === true) txt = txt + "/n";
			else if (i < chracterGroups.length - 1) txt = txt + " ";
		}
		
		document.getElementById("TextOutput").value = "First Pixel Color Is: " + pixelArray[0][0].toString(); // <---- TODO: Poista, Asetettu vain place holderiksi ennen kuin toimintoja ruvetaan tekemään!
		
		drawPixelArray(pixelArray);
	}
}


function drawPixelArray(pixelArray) {
	var canvas = document.getElementById("Grayscale");
	
	canvas.width = pixelArray.length;
	canvas.height = pixelArray[0].length;
	
	var ctx = canvas.getContext("2d");
	
	var imgData = ctx.createImageData(pixelArray.length, pixelArray[0].length);
	var data = imgData.data;
	var imageDataIndex = 0;
	for (var x = 0; x < pixelArray.length; x++) {
		for (var y = 0; y < pixelArray[0].length; y++) {
			data[imageDataIndex] = pixelArray[x][y].r;
			data[imageDataIndex + 1] = pixelArray[x][y].g;
			data[imageDataIndex + 2] = pixelArray[x][y].b;
			data[imageDataIndex + 3] = pixelArray[x][y].a;
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