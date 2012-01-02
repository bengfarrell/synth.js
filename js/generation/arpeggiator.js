audioLib.generators('Arpeggiator', function (sampleRate, arpeggiatorRate, notes, octave, autoReverse){
    // extend Oscillator
    for ( var prop in audioLib.generators.Oscillator.prototype) {
        this[prop] = audioLib.generators.Oscillator.prototype[prop];
    }

    // do constructor routine for Note and Oscillator
	var	that = this;

    // extend Note
    that.getMix = audioLib.generators.Note.getMix;

    if (autoReverse === undefined) {
        that.autoReverse = true;
    } else {
        that.autoReverse = autoReverse;
    }
    that.buildFrequencies(notes, octave);
	that.waveTable	= new Float32Array(1);
	that.sampleRate = sampleRate;
	that.waveShapes	= that.waveShapes.slice(0);
    that.arpStep = 0;
    that.arpIndex = 0;
    that.arpeggiatorRate = arpeggiatorRate;
    that.releasePhase = false;
    that.released = false;

    /**
     * override generate function
     */
    that.generate = function(){
		var	self	= this,
			f	= +self.frequency,
			pw	= self.pulseWidth,
			p	= self.phase;
		f += f * self.fm;
		self.phase	= (p + f / self.sampleRate / 2) % 1;
		p		= (self.phase + self.phaseOffset) % 1;
		self._p		= p < pw ? p / pw : (p-pw) / (1-pw);

        self.arpStep ++;
        if (self.arpStep > self.sampleRate * self.arpeggiatorRate) {
            self.arpStep = 0;
            self.arpIndex ++;
            if (self.arpIndex >= self.frequencies.length) {
                self.arpIndex = 0;
            }
            self.frequency = self.frequencies[self.arpIndex];
        }
	}

     /**
     * override get mix
     */
   /* that.getMix = function(){
        // if there's no envelope, then just return the normal sound
        if (!this._envelope) {
            return this[this.waveShape]();
        }

        var buffer = new Float32Array(1);
        this._envelope.append(buffer, 1);

        // state #5 is a timed release, so enter the release phase if here
        if (this._envelope.state === 5) {
            this.releasePhase = true;
        }

        // if in the release phase, release key when state cycles back to 0
        if (this.releasePhase && this._envelope.state === 0) {//} && this.released === false) {
            this.released = true;
            return 0;
        }

        // if released, don't return any buffer
        if (this.released === true) {
            return 0;
        } else {
        	return this[this.waveShape]() * buffer[0];
        }
    }*/
}, {
    buildFrequencies: function(notes, octave) {
        var self = this;
        self.frequencies = [];
        if (!(notes instanceof Array)) { // work with either a chord structure...
            notes = ChordFactory.createNotations(notes, octave);
        }

        for (var c = 0; c < notes.length; c++) { // ...or array of notations
            self.frequencies.push( Note.getFrequencyForNotation(notes[c]) )
        }

        if (self.autoReverse == true) {
            for (var c = notes.length-2; c > 0; c--) {
                self.frequencies.push( Note.getFrequencyForNotation(notes[c]) )
            }
        }
        self.frequency = self.frequencies[0];
    }
});