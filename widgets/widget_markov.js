import * as d3 from "https://esm.sh/d3@7";

function render({ model, el }) {
    const width = 1000;
    const height = 600;

    d3.select(el).style("position", "relative")

    // On Hover Data showing
    const tooltip = d3.select(el)
        .append("div")
        .style("position", "absolute")
        .style("background", "black")
        .style("border", "2px solid grey")
        .style("padding", "5px")
        .style("font-size", "15px")
        .style("z-index", "99999")
        .style("opacity", 0);

    const svg = d3.select(el)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);        

    svg.append("defs").append("marker")
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

    const g = svg.append("g");

    const zoom = d3.zoom()
        .scaleExtent([0.25, 3])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });

    svg.call(zoom);

    // Take a stochastic matrix and turn it into a nodes,links list
    function adjacencyToGraph(matrix, threshold = 0.0) {
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


    function update() {
        const raw = JSON.parse(model.get("graph_data"));

        const matrix = raw.matrix;
        const threshold = raw.threshold ?? 0.0;

        const { nodes, links } = adjacencyToGraph(matrix, threshold);

        g.selectAll("*").remove();

        const maxWeight = d3.max(links, d => d.weight) || 1;

        const link = g.append("g")
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke", "#888")
            .attr("stroke-opacity", d => 1)            
            .attr("stroke-width", 1.25)
            .attr("marker-end", "url(#arrowhead)");


        // =================== Nodes ===================
        const node = g.append("g")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));
                
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
                tooltip
                    .style("opacity", 1)
                    .html(`Node ${d.id}`);
            })
            .on("mousemove", (event) => {
                tooltip
                    .style("left", `${event.offsetX + 10}px`)
                    .style("top", `${event.offsetY - 30}px`);
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });
        // =============================================


        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links)
                .id(d => d.id)
                .distance(100)
                .strength(1))
            .force("charge", d3.forceManyBody().strength(-250))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(20));

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }

    model.on("change:graph_data", update);
    update();
}


export default { render };


