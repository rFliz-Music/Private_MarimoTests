// // import * as Tone from "tone";
// import { MarkovGraph } from "./widget_markov_viz.js";
// import { SamplerWidget } from "./widget_sampler.js";


// // What we need is a way to get our samples into the embeded sampler widget
// export function render({ model, el }) {

//     const graphEl = document.createElement("div");
//     const samplerEl = document.createElement("div");

//     el.appendChild(graphEl);
//     el.appendChild(samplerEl);


//     const graph = new MarkovGraph(el);
//     model.on("change:graph_data", () => graph.updateGraph(JSON.parse(model.get("graph_data"))));
//     graph.updateGraph(JSON.parse(model.get("graph_data")));     

    
//     const sampler = new SamplerWidget(el, model);
//     el.appendChild(sampler.ui.conatainer);    


//     model.on("change:timeline", () => {
//         console.log("Timeline Updated");
//     });


//     // const sampler = createSampler({model, el});

//     // orchestration goes here

// }



// export default { render };




import { MarkovGraph } from "./widget_markov_viz.js";
import { SamplerWidget } from "./widget_sampler.js";


export function render({ model, el }) {

    const graphEl = document.createElement("div");
    const samplerEl = document.createElement("div");

    el.appendChild(graphEl);
    el.appendChild(samplerEl);


    // --------------------------------------------------------
    // Graph
    // --------------------------------------------------------

    const graph = new MarkovGraph(graphEl);

    const updateGraph = () => {
        graph.updateGraph(
            JSON.parse(model.get("graph_data"))
        );
    };

    model.on("change:graph_data", updateGraph);

    updateGraph();


    // --------------------------------------------------------
    // Sampler
    // --------------------------------------------------------

    const sampler = new SamplerWidget(
        samplerEl,
        model
    );


    // --------------------------------------------------------
    // Orchestration
    // --------------------------------------------------------

    // graph <-> sampler logic will eventually go here


    return {
        graph,
        sampler
    };
}


export default { render };