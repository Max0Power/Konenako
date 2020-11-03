/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 15.09.2020
 * Kanvasille piirtamisen funktiot
 */
 
"use strict";

// ORIGINAL_USER_IMAGE_CANVAS on ohjelman muistissa oleva kanvas, johon piirtaminen tapahtuu ilman skaalausta.
// Kayttajalle esitettava kuva ("UserImgCanvas") piirretaan peilaamalla ORIGINAL_USER_IMAGE_CANVAS:ssa oleva sisalto.
// Tama menettely takaa, etta kayttajalle esitettava skaalattu kuva on aina hyvalaatuinen.
var ORIGINAL_USER_IMAGE_CANVAS = null;


/**
 * Piirtaa funktiolle annetun matriisin, joka esitetaan kayttajalle "UserImgCanvas" -elementissa
 */
function drawPixelArray(matrix) {
	
	// Otetaan kuvan leveys ja korkeus:
	var width = matrix.length;
	var height = matrix[0].length;

	// Jos ohjelman muistissa olevaa ORIGINAL_USER_IMAGE_CANVAS -kanvasia ei ole viela olemassa --> alustetaan se:
	if (ORIGINAL_USER_IMAGE_CANVAS == null) {		
		ORIGINAL_USER_IMAGE_CANVAS = document.createElement('canvas');
	}
	
	// Asetetaan kanvasin leveys ja korkeus vastaamaan matriisissa olevien pikselien maaraa:
	ORIGINAL_USER_IMAGE_CANVAS.width = width;
	ORIGINAL_USER_IMAGE_CANVAS.height = height;
	// Haetaan ctx ja pyyhitaan kanvasissa jo oleva sisalto:
	var ctx = ORIGINAL_USER_IMAGE_CANVAS.getContext("2d");
	ctx.clearRect(0, 0, width, height);
	
	// Muunnetaan matriisissa olevat pikselit ImageDataksi:
	var imgData = ctx.createImageData(width, height);
	var data = imgData.data;
	for (var x = 0; x < width; x++) {
		for (var y = 0; y < height; y++) {
			var pixelIndex = y * (width * 4) + (x * 4);
			data[pixelIndex] = matrix[x][y];
			data[pixelIndex + 1] = matrix[x][y];
			data[pixelIndex + 2] = matrix[x][y];
		    data[pixelIndex + 3] = 255;
		}
	}
	
	// Piirretaan ImageData kanvasiin:
	ctx.putImageData(imgData, 0, 0);
	
	// Paivitetaan Kayttajalle esitettava kanvas ORIGINAL_USER_IMAGE_CANVAS -kanvasissa olevaan sisaltoon: 
	updateUserImageCanvas();
}


/**
 * Piirtaa alueen kayttajalle esitettavaan "UserImgCanvas" -elementtiin.
 * Huom! Kanvasille tulee olla piirretty ensiksi jotakin drawPixelArray -funktiolla, jotta alueita voi piirtaa!
 */
function drawArea(topLeft, bottomRight, color) {
	
	// ORIGINAL_USER_IMAGE_CANVAS pitaa olla olemassa, jotta alueita voidaan piirtaa:
	if (ORIGINAL_USER_IMAGE_CANVAS == null) return;
	
	// Haetaan ORIGINAL_USER_IMAGE_CANVAS konteksti ja piirretaan alue siihen:
	var ctx = ORIGINAL_USER_IMAGE_CANVAS.getContext("2d");
	ctx.strokeStyle = color;
	ctx.lineWidth = 1;
	ctx.strokeRect(topLeft[0] - 1, topLeft[1] - 1,
	Math.abs(bottomRight[0] - topLeft[0]) + 3, Math.abs(bottomRight[1] - topLeft[1]) + 3);	
	
	// Paivitetaan Kayttajalle esitettava kanvas ORIGINAL_USER_IMAGE_CANVAS -kanvasissa olevaan sisaltoon: 
	updateUserImageCanvas();
}


/**
 * Paivittaa ohjelman muistissa olevan ORIGINAL_USER_IMAGE_CANVAS -kanvasin sisallon kayttajalle esitettavaan "UserImgCanvas" -elementtiin.
 * Piirto funktioilla: drawPixelArray(...) ja drawArea(...) tapahtuu ORIGINAL_USER_IMAGE_CANVAS -elementtiin ja talla funktiolla siina
 * oleva sisalto paivitetaan kayttajalle nahtavaksi.
 * Funktio myos huolehtii, etta kayttajalle esitettava kuva ei ole suurempi kuin sille annettu container -elementti ("UserImgCanvasContainer").
 */
function updateUserImageCanvas() {
	// ORIGINAL_USER_IMAGE_CANVAS pitaa olla olemassa, jotta kayttajalle esitettava kanvas voidaan paivittaa!
	if (ORIGINAL_USER_IMAGE_CANVAS == null) return;
	
	// Otetaan ORIGINAL_USER_IMAGE_CANVAS olevat tiedot leveydesta ja korkeudesta:
	var original_width = ORIGINAL_USER_IMAGE_CANVAS.width;
	var original_height = ORIGINAL_USER_IMAGE_CANVAS.height;
	
	// Alustetaan kayttajalle nakyvan kanvasin leveys ja korkeus:
	var new_width = ORIGINAL_USER_IMAGE_CANVAS.width;
	var new_height = ORIGINAL_USER_IMAGE_CANVAS.height;
	
	// Suoritetaan tarvittaessa skaalaus, jos leveys on suurempaa kuin containerin leveys:
	var canvas_container = document.getElementById("UserImgCanvasContainer");
	if (original_width > canvas_container.clientWidth) {
		var height_multiplier = canvas_container.clientWidth / original_width;
		new_width = canvas_container.clientWidth;
		new_height = parseInt(height_multiplier * original_height, 10);
	}
	
	// Haetaan kayttajalle esitettava kanvas ja asetetaan sen koko:
	var user_img_canvas = document.getElementById("UserImgCanvas");
	user_img_canvas.width = new_width;
	user_img_canvas.height = new_height;
	
	// Haetaan kayttajalle esitettavan kanvasin ctx, suoritetaan pyyhkiminen ja piirretaan ORIGINAL_USER_IMAGE_CANVAS -kanvasissa oleva sisalto: 
	var ctx = user_img_canvas.getContext("2d");
	ctx.clearRect(0, 0, user_img_canvas.width, user_img_canvas.height);
	ctx.drawImage(ORIGINAL_USER_IMAGE_CANVAS, 0, 0, original_width, original_height, 0, 0, new_width, new_height);
}


/**
 * Piirtofunktio, jota voi tarvittaessa kayttaa nopeaan testaukseen
 */
function testingDrawPixelArray(parent_div, matrix) {
	var canvas = document.createElement("CANVAS");
	parent_div.appendChild(canvas);
	
	canvas.width = matrix.length;
	canvas.height = matrix[0].length;
	
	var ctx = canvas.getContext("2d");
	
	var imgData = ctx.createImageData(matrix.length, matrix[0].length);
	var data = imgData.data;
	
	for (var x = 0; x < matrix.length; x++) {
		for (var y = 0; y < matrix[0].length; y++) {
			var pixelIndex = y * (matrix.length * 4) + (x * 4);
			data[pixelIndex] = matrix[x][y];
			data[pixelIndex + 1] = matrix[x][y];
			data[pixelIndex + 2] = matrix[x][y];
		    data[pixelIndex + 3] = 255;
		}
	}
	parent_div.appendChild(document.createElement("br"));
	
	ctx.putImageData(imgData, 0, 0);
}