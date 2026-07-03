// import * as Tone from "https://esm.sh/tone";
import * as Tone from "tone";
import "./widget_sampler.css";
import { EventTimelinePlayer, EventStreamPlayer } from "./engine_audio.js";

function render({ model, el }) {

    createWidget(el);

    model.on("change:timeline", () => {   
        console.log("Timeline Updated")
    });
    
    function createWidget(el) {

        const ui = new SamplerWidgetUI()        
        const audio = new AudioEngine(model)
        const controller = new SamplerController(ui,audio);
        
        el.appendChild(ui.container);            
    }
}


export default { render };


//  =============================================================================================
//  =============================================================================================
//  =============================================================================================

// options should be a JS object corresponding to non-default properties in the slider
function named_slider(name, options) {
    const slider_container = document.createElement('div')
        slider_container.style.display = 'flex'
        slider_container.style.flexDirection = 'row'

    const label = document.createElement('label') 
        label.innerHTML = name

    const slider = document.createElement("input");
    for (const [key, value] of Object.entries(options)) {
        slider[key] = value
    }

    slider_container.appendChild(slider)
    slider_container.appendChild(label)

    return {
        "container" : slider_container,
        "slider" : slider
    }
}


class SamplerWidgetUI {
    constructor() {

        this.container = document.createElement("div");
        this.container.id = "SamplerWidget_container"

        // Buttons
        this.initBtn = document.createElement("button");
        this.initBtn.textContent = "Initialize Sampler";

        this.playBtn = document.createElement("button");
        this.playBtn.textContent = "Play";
        this.playBtn.style.display = "none";

        this.stopBtn = document.createElement("button");
        this.stopBtn.textContent = "Stop";
        this.stopBtn.style.display = "none";

        // Audio Controls
        this.reverb_slider = named_slider("Reverb Level", {
            type : "range",
            min : 0,
            max : 1,
            step : 0.01,
            value : 0.45
        });
        this.reverb_slider['container'].style.display = "none"
       
        this.container.appendChild(this.initBtn);
        this.container.appendChild(this.playBtn);
        this.container.appendChild(this.stopBtn);
        this.container.appendChild(this.reverb_slider['container'])
    }
}


class AudioEngine {
    constructor(model) {
        this.samples = null
        this.sampler = null;    
        this.streamPlayer = null;    
        this.timelinePlayer = null;
        this.reverb = null;
        this.model = model
    }

    async init() {                 
        await Tone.start();
        this.samples = this.model.get("samples");                
                    
        // Objects
        this.reverb = new Tone.Reverb({
            decay: 6,
            wet: 0.45
        }).toDestination();

        this.sampler = new Tone.Sampler({
            urls: this.samples, 
            attack: 0.05, 
            release: 0.5
        }).connect(this.reverb);                        

        await Tone.loaded();
        console.log("Sampler loaded");

        this.streamPlayer = new EventStreamPlayer(this.model, this.sampler);
        this.timelinePlayer = new EventTimelinePlayer(this.model, this.sampler);
     }     
}


// Callbacks defined here
class SamplerController {
    constructor(ui, audio) {

        this.ui = ui;
        this.audio = audio;
        this.wireCallbacks();
    }

    wireCallbacks() {

        this.ui.initBtn.onclick = () => this.init();
        this.ui.playBtn.onclick = () => { this.audio.streamPlayer.start() };
        this.ui.stopBtn.onclick = () => { this.audio.streamPlayer.stop() };
        this.ui.reverb_slider['slider'].oninput = () => { 
            this.audio.reverb.wet.value = parseFloat(this.ui.reverb_slider['slider'].value)
        };
    }

    async init() {
        await this.audio.init();
        this.ui.playBtn.style.display = "flex";
        this.ui.stopBtn.style.display = "flex";
        this.ui.reverb_slider['container'].style.display = "flex";
        this.ui.initBtn.style.display ="none";        
    }
}




// //  ==================================================================
// //  ======================= Event Schedulers =========================
// //  ==================================================================


// class EventTimelinePlayer {
//     constructor(model, sampler) {
//         this.model = model;
//         this.sampler = sampler;
//     };

//     // Play Currently Stored Timeline [Pitch, Velocity, Duration, StartTime]
//     scheduleTimeline(timeline) {        
//         if (!this.sampler) return;

//         Tone.Transport.stop();
//         Tone.Transport.cancel();

//         for (const event of timeline) {

//             const [pitch, velocity, duration, start_time] = event;
            
//             Tone.Transport.schedule((time) => {
//                 this.sampler.triggerAttackRelease(
//                     Tone.Frequency(pitch,"midi").toNote(),
//                     duration,
//                     time,
//                     velocity / 127
//                 );
//             }, start_time);

//         }
//         Tone.Transport.start();
//     }

// }



// class EventStreamPlayer {
//     constructor(model, sampler) {

//         this.model = model;
//         this.sampler = sampler;
//         this.active = false;
//         this.waitingForChunk = false;
//         this.refillTimer = null;
//         this.scheduledUntil = 0;

//         this.chunkSize = 4;
//         this.lookahead = 2;

//         // Track Tone Transport event IDs
//         this.scheduledEventIds = [];

//         // receive Python chunks
//         this.model.on("change:chunk", () => {
//             const chunk = this.model.get("chunk");
//             console.log(chunk.events)
//             this.receiveChunk(chunk.events);
//         });
//     }

    
//     // PUBLIC API
//     start() {

//         if (this.active) return;

//         console.log("Starting stream player");

//         this.active = true;
//         this.waitingForChunk = false;
//         this.scheduledUntil = 0;

//         this.scheduledEventIds = [];

//         Tone.Transport.stop();
//         Tone.Transport.cancel();

//         this.requestChunk();
//         Tone.Transport.start();
//     }

//     stop() {

//         console.log("Stopping stream player");

//         this.active = false;
//         this.waitingForChunk = false;

//         if (this.refillTimer) {
//             clearTimeout(this.refillTimer);
//             this.refillTimer = null;
//         }

//         // Explicit cleanup
//         for (const evt of this.scheduledEventIds) {
//             Tone.Transport.clear(evt.id);
//         }

//         this.scheduledEventIds = [];

//         Tone.Transport.stop();
//         Tone.Transport.cancel();

//         this.scheduledUntil = 0;
//     }

    
//     // PYTHON COMMUNICATION    
//     requestChunk() {

//         if (!this.active) return;
//         if (this.waitingForChunk) return;

//         console.log("JS: Requesting chunk");

//         this.waitingForChunk = true;

//         this.model.set("event", {
//             type: "request_chunk",
//             n: this.chunkSize,
//             timestamp: Date.now()
//         });

//         this.model.save_changes();

//         console.log("JS: requested!");
//     }

//     receiveChunk(chunk) {
//         if (!this.active) return;

//         // if (!chunk || chunk.length === 0) {
//         //     console.warn("Ignoring empty chunk");    
//         //     return;
//         // }

//         console.log("JS: Received chunk", chunk);
//         this.waitingForChunk = false;
//         this.scheduleChunk(chunk);
//     }

    
//     // EVENT CLEANUP
//     cleanupOldEvents() {

//         const current = Tone.Transport.seconds;
//         const keep = [];
//         for (const evt of this.scheduledEventIds) {

//             // Remove events that are safely in the past
//             if (evt.time < current - 1) {
//                 Tone.Transport.clear(evt.id);
//             } else {
//                 keep.push(evt);
//             }
//         }

//         this.scheduledEventIds = keep;

//         // Debugging
//         console.log(
//             "Active scheduled events:",
//             this.scheduledEventIds.length
//         );
//     }

    

//     // SCHEDULING    
//     scheduleChunk(chunk) {

//         this.cleanupOldEvents();

//         let localTime = this.scheduledUntil;

//         for (const event of chunk) {

//             const [pitch, velocity, duration, delta] = event;  
//             const id = Tone.Transport.schedule((time) => {

//                 this.sampler.triggerAttackRelease(
//                     Tone.Frequency(pitch, "midi").toNote(),
//                     duration,
//                     time,
//                     velocity / 127
//                 );

//             }, localTime);

//             this.scheduledEventIds.push({id, time: localTime});
//             localTime += delta;
//         }

//         this.scheduledUntil = localTime;

//         this.scheduleRefillWakeup();
//     }

//     // =========================================================
//     // REFILL TIMING
//     // =========================================================

//     scheduleRefillWakeup() {

//         if (!this.active) return;

//         if (this.refillTimer) {
//             clearTimeout(this.refillTimer);
//             this.refillTimer = null;
//         }

//         const current = Tone.Transport.seconds;

//         const timeUntilRefill =
//             this.scheduledUntil - this.lookahead - current;

//         const delayMs =
//             Math.max(0, timeUntilRefill * 1000);

//         this.refillTimer = setTimeout(() => {
//             if (!this.active) return;
//             this.requestChunk();
//         }, delayMs);
//     }
// }



//  ========================================================
//  ==================== Misc Utils ========================
//  ========================================================

// Utility Functions
function int_noise(max_int) {
    return Math.floor(Math.random() * (max_int+1))
}

function choice(arr_options) {
    return arr_options[Math.floor(Math.random() * arr_options.length)]
}
