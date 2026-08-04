document.addEventListener("DOMContentLoaded", () => {
    const envelopeOverlay = document.getElementById("envelopeOverlay");
    const envelopeWrapper = document.getElementById("envelopeWrapper");
    const mainContent = document.getElementById("mainContent");
    
    const musicBtn = document.getElementById("musicBtn");
    const confettiBtn = document.getElementById("confettiBtn");
    const cakeContainer = document.getElementById("cakeContainer");

    let audioCtx = null;
    let isPlaying = false;
    let timeoutIds = [];

    // Open Envelope Function
    function openEnvelope() {
        const envelope = document.querySelector(".envelope");
        if (envelope.classList.contains("open")) return;

        envelope.classList.add("open");
        createPetals();

        setTimeout(() => {
            envelopeOverlay.classList.add("fade-out");
            setTimeout(() => {
                envelopeOverlay.style.display = "none";
            }, 1000);

            mainContent.classList.remove("hidden");
            triggerConfetti();
            
            if (!isPlaying) {
                isPlaying = true;
                if (musicBtn) musicBtn.textContent = "⏸️ Pause Music";
                startTune();
            }
        }, 800);
    }

    if (envelopeWrapper) {
        envelopeWrapper.addEventListener("click", openEnvelope);
    }

    // Petals generator
    function createPetals() {
        const petalsContainer = document.getElementById("petalsContainer");
        if (!petalsContainer) return;
        const flowerIcons = ["🌸", "🌹", "🌷", "🌺", "✨", "💖"];

        for (let i = 0; i < 35; i++) {
            const petal = document.createElement("div");
            petal.className = "petal";
            petal.innerHTML = flowerIcons[Math.floor(Math.random() * flowerIcons.length)];

            petal.style.left = Math.random() * 100 + "vw";
            petal.style.top = "-50px";
            petal.style.setProperty("--rx", (Math.random() - 0.5) * 200 + "px");
            petal.style.animationDelay = Math.random() * 0.8 + "s";

            petalsContainer.appendChild(petal);

            setTimeout(() => {
                petal.remove();
            }, 3000);
        }
    }

    // Audio Synthesizer
    const notes = [
        { f: 264, d: 0.35 }, { f: 264, d: 0.15 }, { f: 297, d: 0.5 }, { f: 264, d: 0.5 }, { f: 352, d: 0.5 }, { f: 330, d: 1.0 },
        { f: 264, d: 0.35 }, { f: 264, d: 0.15 }, { f: 297, d: 0.5 }, { f: 264, d: 0.5 }, { f: 396, d: 0.5 }, { f: 352, d: 1.0 },
        { f: 264, d: 0.35 }, { f: 264, d: 0.15 }, { f: 528, d: 0.5 }, { f: 440, d: 0.5 }, { f: 352, d: 0.5 }, { f: 330, d: 0.5 }, { f: 297, d: 0.5 },
        { f: 466, d: 0.35 }, { f: 466, d: 0.15 }, { f: 440, d: 0.5 }, { f: 352, d: 0.5 }, { f: 396, d: 0.5 }, { f: 352, d: 1.2 }
    ];

    function playNote(freq, duration, time) {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration - 0.05);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(time);
        osc.stop(time + duration);
    }

    function startTune() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }

        let cumulativeDelay = 0;

        notes.forEach((note) => {
            const id = setTimeout(() => {
                if (isPlaying) {
                    playNote(note.f, note.d, audioCtx.currentTime);
                }
            }, cumulativeDelay * 1000);
            timeoutIds.push(id);
            cumulativeDelay += note.d + 0.05;
        });

        const totalDuration = cumulativeDelay * 1000;
        const loopId = setTimeout(() => {
            if (isPlaying) startTune();
        }, totalDuration);
        timeoutIds.push(loopId);
    }

    function stopTune() {
        timeoutIds.forEach(id => clearTimeout(id));
        timeoutIds = [];
    }

    if (musicBtn) {
        musicBtn.addEventListener("click", () => {
            if (!isPlaying) {
                isPlaying = true;
                musicBtn.textContent = "⏸️ Pause Music";
                startTune();
            } else {
                isPlaying = false;
                musicBtn.textContent = "🎵 Play Music";
                stopTune();
            }
        });
    }

    function triggerConfetti() {
        if (typeof confetti === "function") {
            confetti({
                particleCount: 90,
                spread: 80,
                origin: { y: 0.6 }
            });
        }
    }

    if (confettiBtn) confettiBtn.addEventListener("click", triggerConfetti);

    if (cakeContainer) {
        cakeContainer.addEventListener("click", (e) => {
            for (let i = 0; i < 6; i++) {
                createHeart(e.clientX, e.clientY);
            }
            triggerConfetti();
        });
    }

    function createHeart(x, y) {
        const heart = document.createElement("div");
        heart.className = "dynamic-heart";
        heart.innerHTML = ["❤️", "💖", "✨", "💕", "🌸"][Math.floor(Math.random() * 5)];
        
        const tx = (Math.random() - 0.5) * 160 + "px";
        const ty = (Math.random() - 0.5) * 160 + "px";
        
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;
        heart.style.setProperty("--tx", tx);
        heart.style.setProperty("--ty", ty);

        document.body.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, 1200);
    }
});