function createWidget(el) {

    // ------------------------
    // UI
    // ------------------------
    // const container = document.createElement("div");
    // container.id = "SamplerWidget_container"

    // // Buttons
    // const initBtn = document.createElement("button");
    // initBtn.textContent = "Initialize Sampler";

    // const playBtn = document.createElement("button");
    // playBtn.textContent = "Play";
    // playBtn.style.display = "none";

    // const stopBtn = document.createElement("button");
    // stopBtn.textContent = "Stop";
    // stopBtn.style.display = "none";


    // const ui_reverb = document.createElement("input");

    // ui_reverb.type = "range";
    // ui_reverb.min = 0;
    // ui_reverb.max = 1;
    // ui_reverb.step = 0.01;
    // ui_reverb.value = 0.45;
    

    // container.appendChild(initBtn);
    // container.appendChild(playBtn);
    // container.appendChild(stopBtn);

    // container.appendChild(ui_reverb)

    const ui = new SamplerWidgetUI()        
    const audio = new AudioEngine(model)
    const controller = new SamplerController(ui,audio);
    
    el.appendChild(ui.container);

    // ========================== Callbacks! ==========================
    
    // initBtn.onclick = initAudio;                
    // playBtn.onclick = () => { streamPlayer.start() }
    // stopBtn.onclick = () => { streamPlayer.stop() }
    // ui_reverb.addEventListener("input", () => {            
    //     reverb.wet.value = parseFloat(ui_reverb.value);
    // });

    // ------------------------
    // Tone Related Stuff
    // ------------------------

    // let sampler = null;    
    // let streamPlayer = null;    
    // let timelinePlayer = null;
    // let reverb = null;


    // async function initAudio() {
    //         await Tone.start();
    //         const samples = model.get("samples");                
                        
    //         // Objects
    //         reverb = new Tone.Reverb({
    //             decay: 6,
    //             wet: 0.45
    //         }).toDestination();

    //         sampler = new Tone.Sampler({
    //             urls: samples, 
    //             attack: 0.05, 
    //             release: 0.5
    //         }).connect(reverb);                        

    //         await Tone.loaded();
    //         console.log("Sampler loaded");

    //         streamPlayer = new EventStreamPlayer(model, sampler);
    //         timelinePlayer = new EventTimelinePlayer(model, sampler);

    //         playBtn.style.display = "flex";
    //         stopBtn.style.display = "flex";
    //         initBtn.style.display = "none"
    // }
    
}
