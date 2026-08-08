// graph_theme.js

export const GraphTheme = {

    // Contextual menu when hovering over nodes
    tooltip: {

        styles: {
            position: "absolute",
            background: "grey",
            border: "2px solid grey",
            padding: "5px",
            fontSize: "15px",
            zIndex: 99999,
            opacity: 0,
        }

    },

    // Node Labels
    label: {
        "text-anchor": "middle",
        "dy": "0.35em",
        "font-size": "11px",
        "fill": "white",
        "pointer-events": "none",
    },

    // Graph Nodes
    node: {
        
        normal: {
            r: 20,
            fill: "#4C78A8",            
            stroke: "#99b1e8",
            strokeWidth: 1.5,
        },
        hovered: {
            stroke: "#ffffff",
        },
        selected: {
            fill: "#f39c12",
        },
        playing: {
            stroke: "#00ff00",
        }

    },

    // Graph Edges
    edge: {

        stroke: "#888",        
        "stroke-width": 1.25,
        "stroke-opacity": 1,
        "marker-end": "url(#arrowhead)"        
    },

    // Arrowhead connecting nodes
    arrowhead: {
        id: "arrowhead",
        viewBox: "-0 -5 10 10",        
        refX: 10,
        refY: 0,
        orient: "auto",
        markerWidth: 6,
        markerHeight: 6,


        path: {
            d: "M 0,-5 L 10,0 L 0,5",            
            fill: "#888",            
        }
    },

};