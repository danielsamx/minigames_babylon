/**
 * AudioManager - Sistema de audio procedural usando Web Audio API.
 * Genera todos los sonidos del juego sin archivos externos.
 */
export class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.bgNodes = []; // Nodos del bucle de fondo activo
        this.bgInterval = null;

        this._init();
    }

    _init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.45;
            this.masterGain.connect(this.ctx.destination);
        } catch (e) {
            console.warn('AudioManager: Web Audio API no disponible.', e);
        }
    }

    _resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // ─────────────────────────────────────────────
    //  Helpers de síntesis
    // ─────────────────────────────────────────────

    /**
     * Crea un oscilador simple con envelope ADSR.
     * @returns el nodo GainNode (envelope)
     */
    _playTone(freq, type, attack, sustain, release, gainPeak = 0.4, startTime = null) {
        if (!this.ctx) return null;
        const t = startTime !== null ? startTime : this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(gainPeak, t + attack);
        gain.gain.setValueAtTime(gainPeak, t + attack + sustain);
        gain.gain.exponentialRampToValueAtTime(0.001, t + attack + sustain + release);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + attack + sustain + release + 0.05);

        return { osc, gain };
    }

    /**
     * Tono con glide (frecuencia que varía en el tiempo).
     */
    _playGlide(freqStart, freqEnd, type, duration, gainPeak = 0.3, startTime = null) {
        if (!this.ctx) return null;
        const t = startTime !== null ? startTime : this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freqStart, t);
        osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);

        gain.gain.setValueAtTime(gainPeak, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + duration + 0.05);
    }

    /**
     * Añade reverb simple mediante un ConvolverNode de ruido sintético.
     */
    _createReverb(seconds = 1.5, decay = 2.0) {
        if (!this.ctx) return null;
        const rate = this.ctx.sampleRate;
        const length = rate * seconds;
        const buf = this.ctx.createBuffer(2, length, rate);
        for (let c = 0; c < 2; c++) {
            const channel = buf.getChannelData(c);
            for (let i = 0; i < length; i++) {
                channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
            }
        }
        const conv = this.ctx.createConvolver();
        conv.buffer = buf;
        return conv;
    }

    // ─────────────────────────────────────────────
    //  SONIDOS DE EFECTOS
    // ─────────────────────────────────────────────

    /** Impacto/hit corto y brillante */
    playHit() {
        this._resume();
        this._playTone(880, 'sine', 0.01, 0.05, 0.15, 0.5);
        this._playTone(1320, 'triangle', 0.01, 0.03, 0.1, 0.3);
    }

    /** Sonido de cruzar un aro - chime ascendente */
    playRing() {
        this._resume();
        const t = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // Do-Mi-Sol-Do agudo
        notes.forEach((freq, i) => {
            this._playTone(freq, 'sine', 0.01, 0.08, 0.3, 0.35, t + i * 0.07);
        });
    }

    /** Sonido de disparo láser */
    playShoot() {
        this._resume();
        this._playGlide(1200, 200, 'sawtooth', 0.18, 0.4);
    }

    /** Sonido de encontrar objeto */
    playCollect() {
        this._resume();
        const t = this.ctx.currentTime;
        [440, 550, 660, 880].forEach((f, i) => {
            this._playTone(f, 'triangle', 0.01, 0.06, 0.2, 0.4, t + i * 0.06);
        });
    }

    /** Tick urgente para cronómetro bajo */
    playTick() {
        this._resume();
        this._playTone(440, 'square', 0.005, 0.02, 0.05, 0.6);
    }

    // ─────────────────────────────────────────────
    //  VICTORIA
    // ─────────────────────────────────────────────
    playVictory() {
        this._resume();
        this.stopBackground();
        const t = this.ctx.currentTime;
        // Fanfare: Do-Mi-Sol-Do-Mi-Sol-Do8
        const melody = [
            { f: 523.25, d: 0.12 },
            { f: 659.25, d: 0.12 },
            { f: 783.99, d: 0.12 },
            { f: 1046.50, d: 0.25 },
            { f: 783.99, d: 0.10 },
            { f: 1046.50, d: 0.10 },
            { f: 1318.51, d: 0.5 },
        ];
        let offset = 0;
        melody.forEach(note => {
            this._playTone(note.f, 'sine', 0.02, note.d, 0.15, 0.6, t + offset);
            this._playTone(note.f / 2, 'triangle', 0.02, note.d, 0.15, 0.25, t + offset);
            offset += note.d + 0.03;
        });
    }

    // ─────────────────────────────────────────────
    //  GAME OVER
    // ─────────────────────────────────────────────
    playGameOver() {
        this._resume();
        this.stopBackground();
        const t = this.ctx.currentTime;
        // Descenso siniestro
        const descend = [
            { f: 440, d: 0.2 },
            { f: 370, d: 0.2 },
            { f: 311, d: 0.2 },
            { f: 261, d: 0.3 },
            { f: 220, d: 0.4 },
            { f: 185, d: 0.6 },
        ];
        let offset = 0;
        descend.forEach(note => {
            this._playTone(note.f, 'sawtooth', 0.05, note.d, 0.2, 0.45, t + offset);
            this._playTone(note.f * 1.5, 'sine', 0.01, note.d * 0.8, 0.15, 0.15, t + offset);
            offset += note.d + 0.02;
        });
        // Boom final
        this._playGlide(100, 40, 'sine', 0.8, 0.6, t + offset);
    }

    // ─────────────────────────────────────────────
    //  MÚSICA DE FONDO POR ESCENA
    // ─────────────────────────────────────────────

    stopBackground() {
        if (this.bgInterval) {
            clearInterval(this.bgInterval);
            this.bgInterval = null;
        }
        this.bgNodes.forEach(n => {
            try {
                if (n.osc) { n.osc.stop(); n.osc.disconnect(); }
                if (n.gain) n.gain.disconnect();
            } catch (e) { /* ya detenido */ }
        });
        this.bgNodes = [];
    }

    stopAll() {
        this.stopBackground();
    }

    /**
     * Reproduce la música ambiental de la escena indicada.
     * @param {string} sceneKey
     */
    playBackground(sceneKey) {
        this._resume();
        this.stopBackground();

        switch (sceneKey) {
            case 'arcRotate':       this._bgArcRotate();        break;
            case 'free':            this._bgFree();             break;
            case 'follow':          this._bgFollow();           break;
            case 'anaglyph':        this._bgAnaglyph();         break;
            case 'deviceOrientation': this._bgDeviceOrientation(); break;
        }
    }

    // ─── Órbita Cósmica: sintetizador espacial suave ───────────────────────────
    _bgArcRotate() {
        if (!this.ctx) return;
        // Pad espacial: dos osciladores en frecuencias de quinta con detuning
        const base = 110;
        const drones = [
            { f: base,       type: 'sine',     g: 0.12 },
            { f: base * 1.5, type: 'sine',     g: 0.08 },
            { f: base * 2,   type: 'triangle', g: 0.04 },
            { f: base * 0.5, type: 'sine',     g: 0.06 },
        ];

        const reverb = this._createReverb(3, 3);
        reverb.connect(this.masterGain);

        drones.forEach(d => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();

            osc.type = d.type;
            osc.frequency.value = d.f + (Math.random() - 0.5) * 2;

            lfo.type = 'sine';
            lfo.frequency.value = 0.12 + Math.random() * 0.08;
            lfoGain.gain.value = d.f * 0.008;
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);

            gain.gain.value = 0;
            gain.gain.linearRampToValueAtTime(d.g, this.ctx.currentTime + 2.5);

            osc.connect(gain);
            gain.connect(reverb);
            gain.connect(this.masterGain);

            lfo.start();
            osc.start();
            this.bgNodes.push({ osc, gain });
            this.bgNodes.push({ osc: lfo, gain: lfoGain });
        });

        // Arpeggio lento cada 4 segundos
        const arpNotes = [base * 2, base * 2.5, base * 3, base * 4, base * 3, base * 2.5];
        let arpIdx = 0;
        this.bgInterval = setInterval(() => {
            if (!this.ctx) return;
            const freq = arpNotes[arpIdx % arpNotes.length];
            this._playTone(freq, 'sine', 0.05, 0.5, 1.5, 0.08);
            arpIdx++;
        }, 1800);
    }

    // ─── La Galería Prohibida: arpeggio de piano suave ─────────────────────────
    _bgFree() {
        if (!this.ctx) return;
        const scale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
        let idx = 0;
        let dir = 1;

        // Bajo suave continuo
        const bass = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bass.type = 'sine';
        bass.frequency.value = 65.41;
        bassGain.gain.value = 0.06;
        bass.connect(bassGain);
        bassGain.connect(this.masterGain);
        bass.start();
        this.bgNodes.push({ osc: bass, gain: bassGain });

        this.bgInterval = setInterval(() => {
            if (!this.ctx) return;
            const freq = scale[idx % scale.length];
            this._playTone(freq, 'triangle', 0.01, 0.1, 0.4, 0.18);
            // Armonía suave
            this._playTone(freq * 1.5, 'sine', 0.01, 0.1, 0.4, 0.06);
            idx += dir;
            if (idx >= scale.length - 1 || idx <= 0) dir *= -1;
        }, 350);
    }

    // ─── Piloto de Estrellas: onda cuadrada rítmica de acción ──────────────────
    _bgFollow() {
        if (!this.ctx) return;
        const tempo = 0.22; // ~270 BPM (rápido, acción)
        const bassNotes = [110, 110, 146.83, 110, 130.81, 110, 98, 110];
        let beat = 0;

        // Pad rítmico de fondo
        const padOsc = this.ctx.createOscillator();
        const padGain = this.ctx.createGain();
        padOsc.type = 'sawtooth';
        padOsc.frequency.value = 55;
        padGain.gain.value = 0.04;
        padOsc.connect(padGain);
        padGain.connect(this.masterGain);
        padOsc.start();
        this.bgNodes.push({ osc: padOsc, gain: padGain });

        this.bgInterval = setInterval(() => {
            if (!this.ctx) return;
            const freq = bassNotes[beat % bassNotes.length];
            this._playTone(freq, 'square', 0.005, tempo * 0.6, 0.04, 0.3);
            if (beat % 4 === 0) {
                this._playTone(freq * 4, 'sine', 0.005, 0.05, 0.1, 0.1);
            }
            beat++;
        }, tempo * 1000);
    }

    // ─── El Laberinto del Tiempo: bajos pulsantes tensos ──────────────────────
    _bgAnaglyph() {
        if (!this.ctx) return;
        // Pulso bajo y tenso
        const droneOsc = this.ctx.createOscillator();
        const droneGain = this.ctx.createGain();
        droneOsc.type = 'sawtooth';
        droneOsc.frequency.value = 55;
        droneGain.gain.value = 0.08;
        droneOsc.connect(droneGain);
        droneGain.connect(this.masterGain);
        droneOsc.start();
        this.bgNodes.push({ osc: droneOsc, gain: droneGain });

        // Trémolos en el gain para el pulso
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 2.2;
        lfoGain.gain.value = 0.06;
        lfo.connect(lfoGain);
        lfoGain.connect(droneGain.gain);
        lfo.start();
        this.bgNodes.push({ osc: lfo, gain: lfoGain });

        // Notas disonantes aleatorias
        const tension = [73.42, 77.78, 82.41, 87.31, 92.50];
        let ti = 0;
        this.bgInterval = setInterval(() => {
            if (!this.ctx) return;
            this._playTone(tension[ti % tension.length], 'sawtooth', 0.05, 0.3, 0.6, 0.2);
            ti++;
        }, 900);
    }

    // ─── Cazador de Asteroides: radar sci-fi pulsante ─────────────────────────
    _bgDeviceOrientation() {
        if (!this.ctx) return;
        // Zumbido de radar de fondo
        const radarOsc = this.ctx.createOscillator();
        const radarGain = this.ctx.createGain();
        radarOsc.type = 'sine';
        radarOsc.frequency.value = 220;
        radarGain.gain.value = 0.04;
        radarOsc.connect(radarGain);
        radarGain.connect(this.masterGain);
        radarOsc.start();
        this.bgNodes.push({ osc: radarOsc, gain: radarGain });

        // Beeps periódicos tipo radar
        let ping = 0;
        this.bgInterval = setInterval(() => {
            if (!this.ctx) return;
            // Beep principal
            this._playTone(880, 'sine', 0.005, 0.04, 0.15, 0.35);
            if (ping % 4 === 0) {
                // Sweep bajo
                this._playGlide(440, 880, 'sine', 0.25, 0.12);
            }
            ping++;
        }, 600);
    }
}
