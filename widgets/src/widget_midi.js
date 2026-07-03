// import * as d3 from "https://esm.sh/d3@7";
import * as d3 from "d3";

function render({ model, el }) {
    const width = 800;
    const height = 600;

    const svg = d3.select(el)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // -----------------------------
    // MIDI ENGINE
    // -----------------------------
    let midiOut = null;
    let midiReady = false;

    async function initMIDI() {
        try {
            const access = await navigator.requestMIDIAccess();
            const outputs = Array.from(access.outputs.values());

            if (!outputs.length) {
                console.warn("No MIDI outputs found");
                return;
            }

            midiOut = outputs[0];
            midiReady = true;

            console.log("MIDI ready:", midiOut.name);

        } catch (err) {
            console.warn("MIDI init failed:", err);
        }
    }

    function noteOn(pitch, velocity) {
        if (!midiReady || !midiOut) return;
        midiOut.send([0x90, pitch, velocity]);
    }

    function noteOff(pitch) {
        if (!midiReady || !midiOut) return;
        midiOut.send([0x80, pitch, 0]);
    }

    // -----------------------------
    // UI CONTROLS
    // -----------------------------
    const controls = document.createElement("div");
    controls.style.display = "flex";
    controls.style.gap = "10px";
    controls.style.margin = "10px";

    const initBtn = document.createElement("button");
    initBtn.textContent = "🎹 Init MIDI";

    const playBtn = document.createElement("button");
    playBtn.textContent = "▶ Play Timeline";

    controls.appendChild(initBtn);
    controls.appendChild(playBtn);
    el.appendChild(controls);

    initBtn.onclick = async () => {
        await initMIDI();
    };

    // -----------------------------
    // TIMELINE STATE
    // -----------------------------
    let events = [];
    let timeouts = [];

    function clearSchedule() {
        for (const t of timeouts) clearTimeout(t);
        timeouts = [];
    }

    // -----------------------------
    // CORE SCHEDULER
    // -----------------------------
    function schedule(events) {
        clearSchedule();

        for (const e of events) {
            const [pitch, velocity, duration, start_time] = e;

            const startDelay = start_time * 1000;
            const stopDelay = (start_time + duration) * 1000;

            const t1 = setTimeout(() => {
                noteOn(pitch, velocity);
            }, startDelay);

            const t2 = setTimeout(() => {
                noteOff(pitch);
            }, stopDelay);

            timeouts.push(t1, t2);
        }
    }

    // -----------------------------
    // PLAY BUTTON
    // -----------------------------
    playBtn.onclick = () => {
        const raw = JSON.parse(model.get("timeline") || "[]");
        events = raw;
        schedule(events);
    };

    // -----------------------------
    // UPDATE FROM PYTHON
    // -----------------------------
    function update() {
        const raw = JSON.parse(model.get("timeline") || "[]");
        events = raw;
    }

    model.on("change:timeline", update);
    update();
}

export default { render };