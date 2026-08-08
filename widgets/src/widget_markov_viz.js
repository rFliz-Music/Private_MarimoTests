// import * as d3 from "https://esm.sh/d3@7";
import * as d3 from "d3";
import { GraphTheme } from "./graph_themes.js";



// Marimo Widget Specific Wrapper
function render({ model, el }) {    
    const graph = new MarkovGraph(el)
    model.on("change:graph_data", () => graph.updateGraph(JSON.parse(model.get("graph_data"))));
    graph.updateGraph(JSON.parse(model.get("graph_data")));
    
}



export class MarkovGraph {

    constructor(el, width=400, height=400) {

        this.el = el;

        this.width = width;
        this.height = height;

        d3.select(el).style("position", "relative");


        this.svg = d3.select(el)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("viewBox", [0, 0, this.width, this.height]);


       //  On Clicking the Background
       this.svg.on("click", (e) => {                        
            if (this.selectedNode) {
                this.selectedNode.setSelected(false)
                this.selectedNode = null            
            }            
        })            
            

        // Contextual Menu (Hover nodes)
        this.tooltip = applyStyles(d3.select(el).append("div"), GraphTheme.tooltip.styles);

        // FIXME: Check this out
        // Arrowheads
        const marker = applyAttributes(
            this.svg.append("defs").append("marker"),
            GraphTheme.arrowhead
        );

        applyAttributes(
            marker.append("path"),
            GraphTheme.arrowhead.path
        );
    

        // Graph DOM object
        this.g = this.svg.append("g");

        this.zoom = d3.zoom()
            .scaleExtent([0.25, 3])
            .on("zoom", (event) => {
                this.g.attr("transform", event.transform);
            });

        this.svg.call(this.zoom);

        // Graph node objects
        this.graphNodes = []
        this.selectedNode = null;
    }


    // Transform an adjacency matrix into a Nodes & Edges list representation.
    adjacencyToGraph(matrix, threshold = 0.0) {
        const n = matrix.length;

        const nodes = d3.range(n).map(i => ({ id: i }));
        const links = [];

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {

                const w = matrix[i][j]; 
                if (w > threshold) {
                    // links.push({source: i, target: j, weight: w });

                    const reciprocal = matrix[j][i] > threshold;
                    links.push({ source: i, target: j, weight: w,
                        curvature: reciprocal ? 30 : 0
                    });
                }
            }
        }

        return { nodes, links };
    }


    updateGraph(graph_data) {

        this.graphNodes = [];
        this.selectedNode = null;

        const matrix = graph_data.matrix;
        const threshold = graph_data.threshold ?? 0;
    
        const { nodes, links } =
            this.adjacencyToGraph(matrix, threshold);
    
        this.g.selectAll("*").remove();
    
        //------------------------------------------------
        // Links
        //------------------------------------------------
            

        this.graphLinks = this.g.append("g")
            .selectAll("path")
            .data(links)
            .join("path")
            .attr("stroke", "#888")
            .attr("stroke-width", 1.25)
            .attr("fill", "none")
            .attr("marker-end", "url(#arrowhead)");


        // applyAttributes(this.graphLinks, GraphTheme.edge)
    
        //------------------------------------------------
        // Nodes
        //------------------------------------------------        
    
        for (const nodeData of nodes) {
            this.graphNodes.push(
                new GraphNode(this, nodeData)
            );
        }
    
        //------------------------------------------------
        // Force Simulation
        //------------------------------------------------
    
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

            this.graphLinks.attr("d", link =>
                curvedLinkPath(
                    link.source,
                    link.target,
                    link.curvature
                )
            );
    
            for (const node of this.graphNodes) {
                node.updatePosition();
            }
        });
    
    }     

    selectNode(node) {
        if (this.selectedNode)
            this.selectedNode.setSelected(false);
    
        this.selectedNode = node;
    
        if (node)
            node.setSelected(true);
    }

}






// Each node controls how it should be styled based on its current boolean modifiers: [selected, hovered, playing]
// these modifiers are triggered from the UI (selected, hovered) and from the EventStream (playing)
class GraphNode {
    constructor(graph, data) {

        this.graph = graph;
        this.data = data;

        this.selected = false;
        this.hovered = false;
        this.playing = false;

        // Group includes both the Node and its label
        this.group = graph.g.append("g");

        this.circle = this.group.append("circle")
        applyAttributes(this.circle, GraphTheme.node.normal)

        this.label = this.group.append("text").text(data.id)
        applyAttributes(this.label, GraphTheme.label)

        this.group.call(
            d3.drag()
                .on("start", (e) => this.dragStarted(e, this))
                .on("drag",  (e) => this.dragged(e, this))
                .on("end",   (e) => this.dragEnded(e, this))
        );

        this.circle
            .on("mouseover", (event) => {
                this.setHovered(true);
                this.graph.tooltip
                    .style("opacity", 1)
                    .html(`Node ${this.data.id}`);

            })
            .on("mousemove", (event) => {
                this.graph.tooltip
                    .style("left", `${event.offsetX + 10}px`)
                    .style("top", `${event.offsetY - 30}px`);

            })
            .on("mouseout", () => {
                this.setHovered(false);
                this.graph.tooltip
                    .style("opacity", 0);

            })
            .on("click", (e) => {
                e.stopPropagation();                
                this.graph.selectNode(this);
                // console.log(`Clicked Node ${this.data.id}!`)
                // console.log(data)
            });

    }

    updatePosition() {
        this.group.attr(
            "transform",
            `translate(${this.data.x},${this.data.y})`
        );
    }


    refreshStyle() {

        let fill = "#4C78A8";
        let stroke = "#99b1e8";
        let radius = 20;
    
        if (this.selected) {        
            fill = GraphTheme.node.selected.fill;            
        }
    
        if (this.playing) {            
            stroke = GraphTheme.node.playing.stroke;            
        }
    
        if (this.hovered) {            
            stroke = GraphTheme.node.hovered.stroke;                               
        }
    
        this.circle
            .attr("fill", fill)
            .attr("stroke", stroke)
            .attr("r", radius);

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


    //  Dragging
    dragStarted(event) {
        if (!event.active)
            this.graph.simulation.alphaTarget(0.3).restart();

        this.data.fx = this.data.x;
        this.data.fy = this.data.y;
        this.graph.tooltip.style("opacity", 0);
    }

    dragged(event) {
        this.data.fx = event.x;
        this.data.fy = event.y;
        this.graph.tooltip.style("opacity", 0);
    }

    dragEnded(event) {
        if (!event.active)
            this.graph.simulation.alphaTarget(0);

        this.data.fx = null;
        this.data.fy = null;
    }

}




// =======================
// ======= Helpers =======
// =======================


function applyStyles(selection, styles) {
    Object.entries(styles).forEach(([key, value]) => {
        selection.style(key, value);
    });

    return selection;
}


function applyAttributes(selection, attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
        selection.attr(key, value);
    });

    return selection;
}





// ======================================================
// ================= Geometry Rendering =================
// ======================================================



function curvedLinkPath(source, target, curvature = 40, radius = 20) {

    const dx = target.x - source.x;
    const dy = target.y - source.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    // Control point
    const mx = (source.x + target.x) / 2;
    const my = (source.y + target.y) / 2;

    const px = -dy / distance;
    const py = dx / distance;

    const cx = mx + px * curvature;
    const cy = my + py * curvature;


    // Source endpoint:
    // move from source toward the control point
    const sx = cx - source.x;
    const sy = cy - source.y;

    const sourceDistance = Math.sqrt(sx * sx + sy * sy);

    const start = {
        x: source.x + (sx / sourceDistance) * radius,
        y: source.y + (sy / sourceDistance) * radius
    };


    // Target endpoint:
    // move from target toward the control point
    const tx = cx - target.x;
    const ty = cy - target.y;

    const targetDistance = Math.sqrt(tx * tx + ty * ty);

    const end = {
        x: target.x + (tx / targetDistance) * radius,
        y: target.y + (ty / targetDistance) * radius
    };


    return `M ${start.x},${start.y} Q ${cx},${cy} ${end.x},${end.y}`;
}





export default { render };

