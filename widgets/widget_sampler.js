import * as Tone from "https://esm.sh/tone";


function render({ model, el }) {

    createSampler(el);


        model.on("change:timeline", () => {   
            console.log("Timeline Updated")
        });
     

    //  =============================================================================================

    function createSampler(el) {

        // ------------------------
        // UI
        // ------------------------

        const container = document.createElement("div");

        // Buttons
        const initBtn = document.createElement("button");
        initBtn.textContent = "Initialize Audio ";

        const playBtn = document.createElement("button");
        playBtn.textContent = "Play";
        playBtn.disabled = true;

        const generateBtn = document.createElement("button");
        generateBtn.textContent = "Python Callback";

        container.appendChild(initBtn);
        container.appendChild(playBtn);
        container.appendChild(generateBtn);

        el.appendChild(container);

        // ------------------------
        // Tone Related Stuff
        // ------------------------

        let sampler = null;


        async function initAudio() {
            await Tone.start();


            const samples = model.get("samples");
            const timeline = model.get("timeline");            

            // Objects
            const reverb = new Tone.Reverb({
                decay: 6,
                wet: 0.45}
            ).toDestination();

            sampler = new Tone.Sampler(samples).connect(reverb);

            await Tone.loaded();

            console.log("Sampler loaded");

            playBtn.disabled = false;
        }



        function scheduleTimeline() {

            const timeline = model.get("timeline");
          
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

        // Callbacks :D
        initBtn.onclick = initAudio;
        playBtn.onclick = scheduleTimeline;
        generateBtn.onclick = () => {
          const event = {
              type: "generate_timeline",
              property: "this is a property",
              timestamp: Date.now()
            }            
            
            console.log("Sending event:", event);
          
            model.set("event", event);            
            model.save_changes(); // This sends the modified traits across the widget bridge
        };
    }
}


export default { render };




//  =======


// Utility Functions
function int_noise(max_int) {
    return Math.floor(Math.random() * (max_int+1))
}

function choice(arr_options) {
    return arr_options[Math.floor(Math.random() * arr_options.length)]
}
