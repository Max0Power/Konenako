/**
 * @author Jussi Parviainen ja Harri Linna
 * @version 22.10.2020
 */
 
"use strict";

/**
 * @
 */
onmessage = function(event) {
    const args = event.data;
    const sqrs = kok();

    postMessage(sqrs);
    close();
}


function kok() {
	var hessu = 0;
	for(i = 0; i < 1000000; i++) {
		for(var j = 0; j < 1000000; j++) {
			hessu++;
		}
	}
}