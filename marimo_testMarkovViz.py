import marimo

__generated_with = "0.23.6"
app = marimo.App()


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # Testing Markov Graph Viz Widget

    Alright, Here we are again, we're goingto have to sprint this... for now let's just make it so we can display matrix data written in python and be able to "play the markov chain" by specifying a starting node and animate the playing in real time, seeing which node is active at what time :D
    """)
    return


@app.cell
def _():
    import sys
    sys.path.append("./python_scripts")


    from markov_tools import MarkovChain, MarkovChainNode, EventTuple, global_MarkovWalk

    from pathlib import Path
    import marimo as mo
    import json
    import traceback


    import anywidget
    import traitlets

    import numpy as np

    from widget_sampler import SampleBank, SamplerWidget, eventHandler_MC

    return Path, anywidget, json, mo, np, traitlets


@app.cell
def _(Path, anywidget, traitlets):
    class MarkovChainWidget(anywidget.AnyWidget):
        _esm = Path("./widgets/dist/widget_markov.js").read_text()
        graph_data = traitlets.Unicode("{}").tag(sync=True)

    widget = MarkovChainWidget()    
    return (widget,)


@app.cell
def _(json, np, widget):


    A = np.array([
        [0.0, 0.1, 0.0],
        [0.1, 0.0, 0.3],
        [0.1, 0.0, 0.0],    
        [0.0, 0.2, 0.0],  
    ])

    widget.graph_data = json.dumps({
        "matrix": A.tolist(),
        "threshold": 0.01
    })

    widget
    return


app._unparsable_cell(
    r"""
    |
    """,
    name="_"
)


if __name__ == "__main__":
    app.run()
