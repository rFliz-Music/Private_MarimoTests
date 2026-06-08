import * as Tone from "https://esm.sh/tone";


function render({ model, el }) {

    const config = JSON.parse(
        model.get("sampler_data") || "{}"
    );

    createSampler(el, config);

    model.on("change:sampler_data", () => {

        const config = JSON.parse(
            model.get("sampler_data") || "{}"
        );

        el.innerHTML = "";

        createSampler(el, config);
    });
}


export default { render };




//  =======

function createSampler(el, config = {}) {

    // const DEFAULT_SAMPLE =
    //     "https://tonejs.github.io/audio/salamander/C4.mp3";

    // const sampleUrl =
    //     config.sample_url || DEFAULT_SAMPLE;

    // const timeline =
    //     config.timeline || [
    //         [60, 100, 1.0, 0.0],
    //         [64, 100, 1.0, 0.0],
    //         [67, 100, 1.0, 0.0],
    //     ];

    // ------------------------
    // UI
    // ------------------------

    const container = document.createElement("div");

    const initBtn = document.createElement("button");
    initBtn.textContent = "Initialize Audio";

    const playBtn = document.createElement("button");
    playBtn.textContent = "Play";

    playBtn.disabled = true;

    container.appendChild(initBtn);
    container.appendChild(playBtn);

    el.appendChild(container);

    // ------------------------
    // Tone Related Stuff
    // ------------------------

    let sampler = null;

    

    async function initAudio() {
        await Tone.start();

        const samples = JSON.parse(model.get("samples") || "{}");
        const timeline = JSON.parse(model.get("timeline") || "[]");

        // Objects
        const reverb = new Tone.Reverb({
            decay: 6,
            wet: 0.45}
        ).toDestination();

        sampler = new Tone.Sampler(map_samples()).connect(reverb);

        await Tone.loaded();

        console.log("Sampler loaded");

        playBtn.disabled = false;
    }



    function scheduleTimeline() {

        if (!sampler) return;

        Tone.Transport.stop();
        Tone.Transport.cancel();

        for (const event of timeline) {

            const [pitch, velocity, duration, start_time] = event;
            

            Tone.Transport.schedule((time) => {

                sampler.triggerAttackRelease(
                    Tone.Frequency(pitch,"midi").toNote(),
                    duration,
                    time,
                    velocity / 127
                );

            }, start_time);
        }

        Tone.Transport.start();
    }

    initBtn.onclick = initAudio;
    playBtn.onclick = scheduleTimeline;
}



function map_samples() {
    const chromatic = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    const startOctave = 3;
    const numOctaves = 1;

    const samples = Object.fromEntries(
    Array.from({ length: numOctaves }, (_, octaveOffset) => startOctave + octaveOffset)
        .flatMap(octave =>
        chromatic.map(note => `${note}${octave}`)
        )
        .map((note, i) => [note, `./synth_samples/SynthSample_${i}.wav`])
    );

    return {urls : samples};
    
}


// Utility Functions
function int_noise(max_int) {
    return Math.floor(Math.random() * (max_int+1))
}

function choice(arr_options) {
    return arr_options[Math.floor(Math.random() * arr_options.length)]
}
