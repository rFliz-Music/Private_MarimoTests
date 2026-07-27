// import * as d3 from "https://esm.sh/d3@7";
import * as d3 from "d3";

// Marimo Widget Specific Wrapper
function render({ model, el }) {    
    const graph = new MarkovGraph(el)
    model.on("change:graph_data", () => graph.updateGraph(JSON.parse(model.get("graph_data"))));
    graph.updateGraph(model.get("graph_data"));
    
}




export class MarkovGraph {

    constructor(el) {

        this.el = el;

        this.width = 1000;
        this.height = 600;

        d3.select(el).style("position", "relative");

        this.tooltip = d3.select(el)
            .append("div")
            .style("position", "absolute")
            .style("background", "black")
            .style("border", "2px solid grey")
            .style("padding", "5px")
            .style("font-size", "15px")
            .style("z-index", "99999")
            .style("opacity", 0);

        this.svg = d3.select(el)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("viewBox", [0, 0, this.width, this.height]);

        this.svg.append("defs").append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "-0 -5 10 10")
            .attr("refX", 38)
            .attr("refY", 0)
            .attr("orient", "auto")
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .append("path")
            .attr("d", "M 0,-5 L 10,0 L 0,5")
            .attr("fill", "#888");

        // Grtaph DOM object
        this.g = this.svg.append("g");

        this.zoom = d3.zoom()
            .scaleExtent([0.25, 3])
            .on("zoom", (event) => {
                this.g.attr("transform", event.transform);
            });

        this.svg.call(this.zoom);

        // Graph node objects
        this.graphNodes = []
    }



    adjacencyToGraph(matrix, threshold = 0.0) {
        const n = matrix.length;

        const nodes = d3.range(n).map(i => ({ id: i }));
        const links = [];

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {

                const w = matrix[i][j]; 
                if (w > threshold) {
                    links.push({
                        source: i,
                        target: j,
                        weight: w
                    });
                }
            }
        }

        return { nodes, links };
    }



    // Takes a raw graph data object e.g: {mattrix : [[0,0,0],[0,2,1]], threshold: 0.1} and constructs and updates d3's rendering
    updateGraph(graph_data) {

        const matrix = graph_data.matrix;
        const threshold = graph_data.threshold ?? 0;

        const { nodes, links } = this.adjacencyToGraph(matrix, threshold);

        this.g.selectAll("*").remove();

        const link = this.g.append("g")
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke", "#888")
            .attr("stroke-opacity", 1)
            .attr("stroke-width", 1.25)
            .attr("marker-end", "url(#arrowhead)");

        const node = this.g.append("g")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .call(
                d3.drag()
                    .on("start", (e, d) => this.dragStarted(e, d))
                    .on("drag", (e, d) => this.dragged(e, d))
                    .on("end", (e, d) => this.dragEnded(e, d))
            );

        
        node.append("circle")
            .attr("r", 20)
            .attr("fill", "#4C78A8")                                    
            .attr("stroke", "#99b1e8")
            .attr("stroke-width", 1.5);

        node.append("text")
            .text(d => d.id)
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("font-size", "11px")
            .attr("fill", "white")
            .attr("pointer-events", "none");

        node.select("circle")

            .on("mouseover", (event, d) => {

                this.tooltip
                    .style("opacity", 1)
                    .html(`Node ${d.id}`);

            })

            .on("mousemove", (event) => {

                this.tooltip
                    .style("left", `${event.offsetX + 10}px`)
                    .style("top", `${event.offsetY - 30}px`);

            })

            .on("mouseout", () => {

                this.tooltip.style("opacity", 0);

            });

        this.simulation = d3.forceSimulation(nodes)
            .force(
                "link",
                d3.forceLink(links)
                    .id(d => d.id)
                    .distance(100)
                    .strength(1)
            )
            .force(
                "charge",
                d3.forceManyBody().strength(-250)
            )
            .force(
                "center",
                d3.forceCenter(
                    this.width / 2,
                    this.height / 2
                )
            )
            .force(
                "collision",
                d3.forceCollide().radius(20)
            );

        this.simulation.on("tick", () => {

            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node.attr(
                "transform",
                d => `translate(${d.x},${d.y})`
            );

        });

    }

    dragStarted(event, d) {

        if (!event.active)
            this.simulation.alphaTarget(0.3).restart();

        d.fx = d.x;
        d.fy = d.y;

    }

    dragged(event, d) {

        d.fx = event.x;
        d.fy = event.y;

    }

    dragEnded(event, d) {

        if (!event.active)
            this.simulation.alphaTarget(0);

        d.fx = null;
        d.fy = null;

    }

}


// Each node controls how it should be styled based on its current boolean modifiers: [selected, hovered, playing]
// these modifiers are tiggered from the UI (selected, hovered) and from the EventStream (playing)
class GraphNode {

    constructor(data, g) {

        this.data = data;

        this.selected = false;
        this.hovered = false;
        this.playing = false;

        this.group = g.append("g");
        this.circle = this.group.append("circle");
        this.label = this.group.append("text");

    }

    setSelected(v) {
        this.selected = v;
        this.refreshStyle();
    }

    setHovered(v) {
        this.hovered = v;
        this.refreshStyle();
    }

    setPlaying(v) {
        this.playing = v;
        this.refreshStyle();
    }

    refreshStyle() {

        let fill = "#4C78A8";
    
        if (this.playing)
            fill = "#4CAF50";
    
        if (this.hovered)
            fill = "#FFD54F";
    
        if (this.selected)
            fill = "#FF7043";
    
        this.circle.attr("fill", fill);
    
    }

}





export default { render };

