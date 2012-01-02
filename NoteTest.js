var pressed = [];
var attack;
var decay;
var sustain;
var release;

function audioCallback(buffer, channelCount){
    var gens = ctrl.pull();
    var bl = buffer.length;
    var gl = gens.length;

	// loop through each sample in the buffer
	for (current=0; current<bl; current+= channelCount){
		sample = 0;
        for (i=0; i<gl; i++){
			gens[i].generate();
			sample += gens[i].getMix()*0.5;
		}

		// Fill buffer for each channel
		for (n=0; n<channelCount; n++){
			buffer[current + n] = sample;
		}
	}
}

function onReady() {
    dev = audioLib.AudioDevice(audioCallback, 2);
    ctrl = new KeyboardController();
    document.addEventListener('keyup', onKeyup, true);
    document.addEventListener('keydown', onKeydown, true);
    toggleEnvelope("off");
}


function onKeyup(event) {
    pressed.splice(pressed.indexOf(event.keyCode), 1);
    ctrl.releaseKeyByID(event.keyCode);
}


function onKeydown(event) {
    if (pressed.indexOf(event.keyCode) !== -1) {
        return;
    }

    pressed.push(event.keyCode);

    var n;
    switch (String.fromCharCode(event.keyCode)) {
        case "Q": n = "A3"; break;
        case "W": n = "A#3"; break;
        case "E": n = "B3"; break;
        case "R": n = "C3"; break;
        case "T": n = "C#3"; break;
        case "Y": n = "D3"; break;
        case "U": n = "D#3"; break;
        case "I": n = "E3"; break;
        case "O": n = "F3"; break;
        case "A": n = "F#3"; break;
        case "S": n = "G3"; break;
        case "D": n = "G#3"; break;
        case "F": n = "A4"; break;
        case "G": n = "A#4"; break;
        case "H": n = "B4"; break;
        case "J": n = "C4"; break;
        case "K": n = "C#4"; break;
        case "L": n = "D4"; break;
        case "Z": n = "D#4"; break;
        case "X": n = "E4"; break;
        case "C": n = "F4"; break;
        case "V": n = "F#4"; break;
        case "B": n = "G4"; break;
        case "N": n = "G#4"; break;
        case "M": n = "A5"; break;
    }

    if (!n) {return;}
    osc = audioLib.generators.Note(dev.sampleRate, n);
    osc.waveShape = document.getElementById("waveform").value;
    if (document.getElementById("envelope").value == "on") {
        osc.setEnvelope(new audioLib.ADSREnvelope(this.sampleRate, attack, decay, 1, release, sustain, release));
    }
    ctrl.pressKey(osc, event.keyCode);
}

function toggleEnvelope(value) {
    if (document.getElementById("envelope").value == "on" || value=="off") {
        document.getElementById("envelope").value = "off";
        document.getElementById("envelopeLabel").style.visibility = 'hidden';
        document.getElementById("adsr").style.visibility = 'hidden';
    } else {
        document.getElementById("envelope").value = "on";
        document.getElementById("envelopeLabel").style.visibility = 'visible';
        document.getElementById("adsr").style.visibility = 'visible';
        onEnvelopeChange();
    }
}

function onEnvelopeChange() {
    attack = document.getElementById("attackTime").value;
    decay = document.getElementById("decayTime").value;
    sustain = document.getElementById("sustainTime").value;
    release = document.getElementById("releaseTime").value;

    if (sustain == 0) {
        sustain = null; // null sustain allows us to hold the key down
    }
    document.getElementById("envelopeLabel").innerHTML = "A:" + attack + "ms, D:" + decay + "ms, S:" + sustain + "ms, R:" + release + "ms";
}