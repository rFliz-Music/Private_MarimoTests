// import * as Tone from "tone";
// import "./widget_sampler.css";
// import { EventTimelinePlayer, EventStreamPlayer } from "./engine_audio.js";



// // export function createSampler({ model, el }) {

// //     const ui = new SamplerWidgetUI();
// //     const audio = new AudioEngine(model);
// //     const controller = new SamplerController(ui, audio);

// //     el.appendChild(ui.container);

// //     model.on("change:timeline", () => {
// //         console.log("Timeline Updated");
// //     });

// //     return {ui,audio,controller};
// // }


// // // Widget Adapter
// function render({ model, el }) {
//     // return createSampler({ model, el });
//     const ui = new SamplerWidgetUI();
//     const audio = new AudioEngine(model);
//     const controller = new SamplerController(ui, audio);

//     el.appendChild(ui.container);

//     model.on("change:timeline", () => {
//         console.log("Timeline Updated");
//     });
// }


// export default { render };


// export class SamplerWidget {
//     constructor(el, model) {
//         this.el = el
//         this.ui = new SamplerWidgetUI();
//         this.audio = new AudioEngine(model);
//         this.controller = new SamplerController(this.ui, this.audio);   
//     }

// }


// //  =============================================================================================
// //  =============================================================================================
// //  =============================================================================================

// // options should be a JS object corresponding to non-default properties in the slider
// function named_slider(name, options) {
//     const slider_container = document.createElement('div')
//         slider_container.style.display = 'flex'
//         slider_container.style.flexDirection = 'row'

//     const label = document.createElement('label') 
//         label.innerHTML = name

//     const slider = document.createElement("input");
//     for (const [key, value] of Object.entries(options)) {
//         slider[key] = value
//     }

//     slider_container.appendChild(slider)
//     slider_container.appendChild(label)

//     return {
//         "container" : slider_container,
//         "slider" : slider
//     }
// }


// export class SamplerWidgetUI {
//     constructor() {

//         this.container = document.createElement("div");
//         this.container.id = "SamplerWidget_container"

//         // Buttons
//         this.initBtn = document.createElement("button");
//         this.initBtn.textContent = "Initialize Sampler";

//         this.playBtn = document.createElement("button");
//         this.playBtn.textContent = "Play";
//         this.playBtn.style.display = "none";

//         this.stopBtn = document.createElement("button");
//         this.stopBtn.textContent = "Stop";
//         this.stopBtn.style.display = "none";

//         // Audio Controls
//         this.reverb_slider = named_slider("Reverb Level", {
//             type : "range",
//             min : 0,
//             max : 1,
//             step : 0.01,
//             value : 0.45
//         });
//         this.reverb_slider['container'].style.display = "none"
       
//         this.container.appendChild(this.initBtn);
//         this.container.appendChild(this.playBtn);
//         this.container.appendChild(this.stopBtn);
//         this.container.appendChild(this.reverb_slider['container'])
//     }
// }


// export class AudioEngine {
//     constructor(model) {
//         this.samples = null
//         this.sampler = null;    
//         this.streamPlayer = null;    
//         this.timelinePlayer = null;
//         this.reverb = null;
//         this.model = model
//     }

//     async init() {                 
//         await Tone.start();
//         this.samples = this.model.get("samples");                
                    
//         // Objects
//         this.reverb = new Tone.Reverb({
//             decay: 6,
//             wet: 0.45
//         }).toDestination();

//         this.sampler = new Tone.Sampler({
//             urls: this.samples, 
//             attack: 0.05, 
//             release: 0.5
//         }).connect(this.reverb);                        

//         await Tone.loaded();
//         console.log("Sampler loaded");

//         this.streamPlayer = new EventStreamPlayer(this.model, this.sampler);
//         this.timelinePlayer = new EventTimelinePlayer(this.model, this.sampler);
//      }     
// }


// // Callbacks defined here
// export class SamplerController {
//     constructor(ui, audio) {

//         this.ui = ui;
//         this.audio = audio;
//         this.wireCallbacks();
//     }

//     wireCallbacks() {

//         this.ui.initBtn.onclick = () => this.init();
//         this.ui.playBtn.onclick = () => { this.audio.streamPlayer.start() };
//         this.ui.stopBtn.onclick = () => { this.audio.streamPlayer.stop() };
//         this.ui.reverb_slider['slider'].oninput = () => { 
//             this.audio.reverb.wet.value = parseFloat(this.ui.reverb_slider['slider'].value)
//         };
//     }

//     async init() {
//         await this.audio.init();
//         this.ui.playBtn.style.display = "flex";
//         this.ui.stopBtn.style.display = "flex";
//         this.ui.reverb_slider['container'].style.display = "flex";
//         this.ui.initBtn.style.display ="none";        
//     }
// }





// //  ========================================================
// //  ==================== Misc Utils ========================
// //  ========================================================

// // Utility Functions
// function int_noise(max_int) {
//     return Math.floor(Math.random() * (max_int+1))
// }

// function choice(arr_options) {
//     return arr_options[Math.floor(Math.random() * arr_options.length)]
// }



import * as Tone from "tone";
import "./widget_sampler.css";
import {
    EventTimelinePlayer,
    EventStreamPlayer
} from "./engine_audio.js";


// ============================================================
// AnyWidget Adapter
// ============================================================

function render({ model, el }) {

    const sampler = new SamplerWidget(el, model);

    model.on("change:timeline", () => {
        console.log("Timeline Updated");
    });

    return sampler;
}

export default { render };


// ============================================================
// Sampler Widget
// ============================================================

export class SamplerWidget {

    constructor(el, model) {

        this.el = el;
        this.model = model;

        this.ui = new SamplerWidgetUI();
        this.audio = new AudioEngine(model);
        this.controller = new SamplerController(
            this.ui,
            this.audio
        );

        this.el.appendChild(this.ui.container);
    }
}


// ============================================================
// UI
// ============================================================

function named_slider(name, options) {

    const container = document.createElement("div");

    container.style.display = "flex";
    container.style.flexDirection = "row";

    const label = document.createElement("label");
    label.innerHTML = name;

    const slider = document.createElement("input");

    for (const [key, value] of Object.entries(options)) {
        slider[key] = value;
    }

    container.appendChild(slider);
    container.appendChild(label);

    return {
        container,
        slider
    };
}


export class SamplerWidgetUI {

    constructor() {

        this.container = document.createElement("div");
        this.container.id = "SamplerWidget_container";

        // ----------------------------------------------------
        // Buttons
        // ----------------------------------------------------

        this.initBtn = document.createElement("button");
        this.initBtn.textContent = "Initialize Sampler";

        this.playBtn = document.createElement("button");
        this.playBtn.textContent = "Play";
        this.playBtn.style.display = "none";

        this.stopBtn = document.createElement("button");
        this.stopBtn.textContent = "Stop";
        this.stopBtn.style.display = "none";

        // ----------------------------------------------------
        // Audio Controls
        // ----------------------------------------------------

        this.reverb_slider = named_slider("Reverb Level", {
            type: "range",
            min: 0,
            max: 1,
            step: 0.01,
            value: 0.45
        });

        this.reverb_slider.container.style.display = "none";

        // ----------------------------------------------------
        // Assemble UI
        // ----------------------------------------------------

        this.container.appendChild(this.initBtn);
        this.container.appendChild(this.playBtn);
        this.container.appendChild(this.stopBtn);
        this.container.appendChild(this.reverb_slider.container);
    }
}


// ============================================================
// Audio Engine
// ============================================================

export class AudioEngine {

    constructor(model) {

        this.model = model;

        this.samples = null;
        this.sampler = null;

        this.streamPlayer = null;
        this.timelinePlayer = null;

        this.reverb = null;
    }

    async init() {

        await Tone.start();

        this.samples = this.model.get("samples");

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

        this.streamPlayer = new EventStreamPlayer(
            this.model,
            this.sampler
        );

        this.timelinePlayer = new EventTimelinePlayer(
            this.model,
            this.sampler
        );
    }
}


// ============================================================
// Controller
// ============================================================

export class SamplerController {

    constructor(ui, audio) {

        this.ui = ui;
        this.audio = audio;

        this.wireCallbacks();
    }

    wireCallbacks() {

        this.ui.initBtn.onclick = () => this.init();

        this.ui.playBtn.onclick = () => {
            this.audio.streamPlayer.start();
        };

        this.ui.stopBtn.onclick = () => {
            this.audio.streamPlayer.stop();
        };

        this.ui.reverb_slider.slider.oninput = () => {

            this.audio.reverb.wet.value =
                parseFloat(
                    this.ui.reverb_slider.slider.value
                );
        };
    }

    async init() {

        await this.audio.init();

        this.ui.playBtn.style.display = "flex";
        this.ui.stopBtn.style.display = "flex";

        this.ui.reverb_slider.container.style.display = "flex";

        this.ui.initBtn.style.display = "none";
    }
}