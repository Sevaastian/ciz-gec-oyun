const SoundFX = {
    ctx: null,
    isMuted: false,
    bgmTimer: null,
    step: 0,

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBGM();
        } else {
            this.startBGM();
        }
        return this.isMuted;
    },

    startBGM() {
        if (this.isMuted) return;
        this.init();
        if (this.bgmTimer) return;

        // Synthwave / Sürüş Bas & Melodi Notaları (Hz)
        const bassLine = [110, 110, 146.83, 146.83, 130.81, 130.81, 164.81, 146.83];
        const melodyLine = [440, 0, 523.25, 587.33, 659.25, 0, 587.33, 523.25];

        this.bgmTimer = setInterval(() => {
            if (this.isMuted || !this.ctx) return;
            const now = this.ctx.currentTime;
            const idx = this.step % bassLine.length;

            // 1. Bas Vuruşu
            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            bassOsc.type = 'triangle';
            bassOsc.frequency.setValueAtTime(bassLine[idx], now);
            bassGain.gain.setValueAtTime(0.06, now);
            bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            bassOsc.connect(bassGain);
            bassGain.connect(this.ctx.destination);
            bassOsc.start(now);
            bassOsc.stop(now + 0.22);

            // 2. Hafif Ritim (Hi-Hat)
            if (this.step % 2 === 1) {
                const hatOsc = this.ctx.createOscillator();
                const hatGain = this.ctx.createGain();
                hatOsc.type = 'square';
                hatOsc.frequency.setValueAtTime(800, now);
                hatGain.gain.setValueAtTime(0.015, now);
                hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                hatOsc.connect(hatGain);
                hatGain.connect(this.ctx.destination);
                hatOsc.start(now);
                hatOsc.stop(now + 0.05);
            }

            // 3. Arka Plan Melodisi
            const melFreq = melodyLine[idx];
            if (melFreq > 0) {
                const melOsc = this.ctx.createOscillator();
                const melGain = this.ctx.createGain();
                melOsc.type = 'sine';
                melOsc.frequency.setValueAtTime(melFreq, now);
                melGain.gain.setValueAtTime(0.035, now);
                melGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                melOsc.connect(melGain);
                melGain.connect(this.ctx.destination);
                melOsc.start(now);
                melOsc.stop(now + 0.25);
            }

            this.step++;
        }, 240); // Tempo (250 BPM sekizlik nota hissi)
    },

    stopBGM() {
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    },

    playCoin() {
        if (this.isMuted) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
    },

    playBuy() {
        if (this.isMuted) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    },

    playCrash() {
        if (this.isMuted) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
    }
};
