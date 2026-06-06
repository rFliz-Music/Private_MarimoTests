import marimo

__generated_with = "0.23.6"
app = marimo.App(width="medium")


@app.cell
def _():
    from pathlib import Path
    import json

    import marimo as mo
    import numpy as np
    from midi_tools import play_event_tuples, structure_midi_sequence
    from markov_tools import MarkovChain, MarkovChainNode, EventTuple, global_MarkovWalk

    import anywidget
    import traitlets


    return Path, anywidget, json, np, traitlets


@app.cell
def _(Path, anywidget, traitlets):
    class MarkovChainWidget(anywidget.AnyWidget):
        _esm = Path("./markov_widget.js").read_text()
        graph_data = traitlets.Unicode("{}").tag(sync=True)

    widget = MarkovChainWidget()    

    return (widget,)


@app.cell
def _(json, np, widget):


    A = np.array([
        [0.0, 0.1, 0.0],
        [0.1, 0.0, 0.3],
        [0.1, 0.0, 0.0],
    ])

    widget.graph_data = json.dumps({
        "matrix": A.tolist(),
        "threshold": 0.05
    })

    widget
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
