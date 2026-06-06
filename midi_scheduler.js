import * as d3 from "https://esm.sh/d3@7";

function render({ model, el }) {
    const width = 800;
    const height = 600;

    const svg = d3.select(el)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // -----------------------------
    // MIDI ENGINE (simple global)
    // -----------------------------
    let midiOut = null;

    async function initMIDI() {
        const access = await navigator.requestMIDIAccess();
        const outputs = Array.from(access.outputs.values());
        if (!outputs.length) {
            console.warn("No MIDI outputs found");
            return;
        }
        midiOut = outputs[0];
        console.log("MIDI ready:", midiOut.name);
    }

    function noteOn(pitch, velocity) {
        if (!midiOut) return;
        midiOut.send([0x90, pitch, velocity]);
    }

    function noteOff(pitch) {
        if (!midiOut) return;
        midiOut.send([0x80, pitch, 0]);
    }

    initMIDI();

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

        const start = performance.now();

        for (const e of events) {
            const [pitch, velocity, duration, start_time] = e;

            const startDelay = start_time * 1000;
            const stopDelay = (start_time + duration) * 1000;

            // NOTE ON
            const t1 = setTimeout(() => {
                noteOn(pitch, velocity);
            }, startDelay);

            // NOTE OFF
            const t2 = setTimeout(() => {
                noteOff(pitch);
            }, stopDelay);

            timeouts.push(t1, t2);
        }
    }

    // -----------------------------
    // UPDATE FROM PYTHON
    // -----------------------------
    function update() {
        const raw = JSON.parse(model.get("timeline") || "[]");

        // expects:
        // [[pitch, velocity, duration, start_time], ...]
        events = raw;

        schedule(events);
    }

    model.on("change:timeline", update);
    update();
}

export default { render };