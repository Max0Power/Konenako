/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 02.09.2020
 */
 
"use strict";


/**
 * Sivuston valmistuessa asetetaan ohjelman päätoiminnot eli kuvan analysointi
 */
window.onload = function() {
	// Haetaan Käyttäjän syöte komponentti:
	var fileInput = document.getElementById("FileInput");
	// Haetaan TextArea, joka toimii OutPuttina:
	var textOutput = document.getElementById("TextOutput");
	textOutput.value = "Work in progress... ... ..."; // <------------------------------- TODO: Poista tai aseta output textareaan tutoriaali teksti... esim. "Convert your image to text"... 
	// Asetetaan eventti käyttäjän antaessa tiedosto:
	fileInput.addEventListener("change", function(e) {
		// Luodaan kuva elementti ja asetetaan sourceksi käyttäjän ohjelmalle syöttämä kuva:
		var img = new Image();
		img.src = URL.createObjectURL(fileInput.files[0]);
		// Kun käyttäjän syöttämä kuva on valmis --> luetaan kuvan pikselit ja analysoidaan kuvan sisältö tekstiksi
		img.onload = function(e) {
			var pixels = readImageToPixelArray(img);
			
			// TODO: PixelsToTextAnalyzer --> jonka tehtävä on tunnistaa kuvasta löytyvä teksti ja kirjoittaa se tektilaatikkoon
			
			textOutput.value = "First Pixel Color Is: " + pixels[0][0].toString(); // <---- TODO: Poista, Asetettu vain place holderiksi ennen kuin toimintoja ruvetaan tekemään!
		}
	});
}


/**
 * Lukee ladatun kuvan datan kaksiulotteiseksi pikselitaulukoksi, joka syötetaan PixelsToTextAnalysoijalle
 * @param {Image} img - Latautunut Image elementti, josta pikselit luetaan
 * @return {Two dimensional Pixel array} - Palauttaa kaksi ulotteisen pikseli taulukon kuvasta --> koostuu Pixel olioista, jotka sisältävät 
 */
function readImageToPixelArray(img) {
	
	// Luodaan kanvas, johon kuva piirretaan valiaikaisesti:
	var canvas = document.createElement("canvas");
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	// Kuvan piirto kanvakselle:
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0);
	// Otetaan kuvan data, joka on yksiulotteinen taulukko:
	var imgData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight).data;
	// Luodaan palautettava pikselitaulukko ja otetaan kuvan datasta pikselit:
	var pixelArray = new Array(img.naturalWidth);
	var imgDataPixelIndex = 0;
	for (var x = 0; x < img.naturalWidth; x++) {
		var tmpArray = new Array(img.naturalHeight);
		for (var y = 0; y < img.naturalHeight; y++) {
			tmpArray[y] = new Pixel(imgData[imgDataPixelIndex], imgData[imgDataPixelIndex+1], imgData[imgDataPixelIndex+2], imgData[imgDataPixelIndex+3]);
			imgDataPixelIndex += 4;
		}
		pixelArray[x] = tmpArray;
	}
	// Palautetaan lopuksi kuvasta saatu pikselitaulukko:
	return pixelArray;
}

/**
 * Luokka pikselille, joka sisältää yksittäisen pikselin värin
 */
class Pixel {
	
	/**
	 * Muodostaja pikselille, joka sisaltaa pikselin varin RGBA formaatissa:
	 * @param {number 0-255} r - punasen värin määrä
	 * @param {number 0-255} g - vihreän värin määrä
	 * @param {number 0-255} b - sinisen värin määrä
	 * @param {number 0-255} a - läpinäkyvyys
	 */
	constructor(r, g, b, a) {
		// Tarkistus, etta luvut ovat valilla [0, 255]
		if (r < 0) r = 0;
		if (g < 0) g = 0;
		if (b < 0) b = 0;
		if (a < 0) a = 0;
		if (r > 255) r = 255;
		if (g > 255) g = 255;
		if (b > 255) b = 255;
		if (a > 255) a = 255;
		// Varien asetus oliolle
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
	
	toString() {
		return this.r + ", " + this.g + ", " + this.b + ", " + this.a;
	}
}