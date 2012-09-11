audioLib.generators('Note', function (sampleRate, notation, octave){
    // do constructor routine for Note and Oscillator
    var	that = this;
    that.superconstruct();
    that.sampleRate = sampleRate;
    that.waveTable	= new Float32Array(1);
    that.waveShapes	= this.waveShapes.slice(0);
    that.releasePhase = false;
    that.released = false;

    // are we defining the octave separately?  If so add it
    if (octave) {
        notation += octave;
    }
    that.frequency = Note.getFrequencyForNotation(notation);
}, {
    /**
     * reset key phase so we can use the key again
     */
    resetKeyPhase: function() {
        this.releasePhase = false;
        this.released = false;
    },


    /**
     * release key - trigger the release phase if not done
     */
    releaseKey: function() {
        if (!this.released) {
            this.releasePhase = true;

            if (this._envelope) {
                this._envelope.triggerGate(false);
            } else {
                this.released = true;
            }
        }
    },

     /**
     * override get mix
     */
    getMix: function(){
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
        if (this.releasePhase && this._envelope.state === 0) {
            this.released = true;
            return 0;
        }

        // if released, don't return any buffer
        if (this.released == true) {
            return 0;
        } else {
        	return this[this.waveShape]() * buffer[0];
        }
    },

    /**
     * set notation
     *
     * @param notation
     */
    setNotation: function(value) {
        this.frequency = Note.getFrequencyForNotation(value);
    },

    /**
     * set envelope
     *
     * @param envelope
     */
    setEnvelope: function(value) {
        this._envelope = value;
        if (value) {
            this._envelope.triggerGate(true);
        }
    },

    /**
     * get envelope
     *
     * @return envelope
     */
    getEnvelope: function(value) {
        return this._envelope;
    }
});

// extend Oscillator to note
for ( var prop in audioLib.generators.Oscillator.prototype) {
    if (prop != "getMix" &&
        prop != "__CLASSCONSTRUCTOR") {
        audioLib.generators.Note.prototype[prop] = audioLib.generators.Oscillator.prototype[prop];
    }
    audioLib.generators.Note.prototype["superconstruct"] = audioLib.generators.Oscillator.prototype["__CLASSCONSTRUCTOR"];
}
