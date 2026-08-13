import marimo

__generated_with = "0.23.6"
app = marimo.App()


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # Testing Markov Widget Full

    Alright, Here we are again, we're goingto have to sprint this... for now let's just make it so we can display matrix data written in python and be able to "play the markov chain" by specifying a starting node and animate the playing in real time, seeing which node is active at what time :D

    To Do:

    - On **Click Node**:
     - ~~Highlight node~~
     - Update *Session* object to know which node index is selected

    - On **Play**:
     -  begin markov chain dispatch and highlight event that is currently playing.
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

    from widget_sampler import SampleBank, SamplerWidget
    from widget_handlers import MarkovHandler

    return (
        EventTuple,
        MarkovChain,
        MarkovHandler,
        Path,
        SampleBank,
        anywidget,
        json,
        mo,
        np,
        traitlets,
    )


@app.cell
def _(EventTuple, MarkovChain, np):

    def int_noise(span):
        return np.random.randint(span)-(span*0.5)

    def choice(items):
        return np.random.choice(items)

    # ------------------------------------------------

    # Markov Chain Stuff
    NODE_NUM = 8
    pc_set = np.array([0,2,4,5,7,9,11]) + 48
    tempo = 0.5
    mc = MarkovChain()

    # Matrix row random number generator
    rnGen_rows = np.random.default_rng()


    for _ in range(NODE_NUM):
        pitch = int(choice(pc_set)) + 0
        vel = int(choice([100,70]))
        dur = float(choice([0.125,0.111,0.333]) * tempo)
        delta = float(choice([0.75, 0.25, 0.5, 2]) * tempo)

        mc.add_node(EventTuple(pitch, vel, dur, delta))


    # Instructions on how to build a matrix
    mc.matrix = rnGen_rows.integers(0,2, size=(NODE_NUM, NODE_NUM))



    SESSION = {'mc': mc}    
    return (SESSION,)


@app.cell
def _(
    MarkovHandler,
    Path,
    SESSION,
    SampleBank,
    anywidget,
    json,
    np,
    traitlets,
):

    bank = SampleBank("https://cdn.jsdelivr.net/gh/rFliz-music/Private_MarimoTests@main/synth_samples")

    samples = bank.map_chromatic(start_octave=3, num_octaves=2)


    class MarkovVizWidget(anywidget.AnyWidget):
        _esm = Path("./widgets/dist/widget_FULL.js").read_text()    
        _css = "./widgets/dist/widget_sampler.css"

    
        graph_data = traitlets.Unicode("{}").tag(sync=True)
        samples = traitlets.Dict().tag(sync=True)
        timeline = traitlets.List().tag(sync=True) # Scheduled Timeline (with start time per event)

        chunk = traitlets.Dict().tag(sync=True) # Event Buffer
        event = traitlets.Dict(default_value={}).tag(sync=True)




    widgetViz = MarkovVizWidget(samples=samples)   
    handler = MarkovHandler(widgetViz, SESSION)
    widgetViz.observe(lambda change: handler.dispatch(change), names="event")   


    A = np.array([
        [0.0, 0.1, 0.0, 0.0, 0.0, 0.0],
        [0.0, 0.0, 0.1, 0.0, 0.0, 0.0],
        [0.1, 0.0, 0.0, 0.1, 0.0, 0.0],
        [0.0, 0.0, 0.0, 0.0, 0.1, 0.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.1],
        [0.1, 0.0, 0.0, 0.1, 0.0, 0.0],
    ])

    widgetViz.graph_data = json.dumps({
        "matrix": A.tolist(),
        "threshold": 0.01
    })

    widgetViz
    return


@app.cell
def _():
    return


@app.cell
def _():


    # def int_noise(span):
    #     return np.random.randint(span)-(span*0.5)

    # def choice(items):
    #     return np.random.choice(items)



    # SESSION = {'mc': None}    


    # # Markov Chain Stuff
    # NODE_NUM = 8
    # pc_set = np.array([0,2,4,5,7,9,11]) + 48
    # tempo = 0.5
    # mc = MarkovChain()

    # # Matrix row random number generator
    # rnGen_rows = np.random.default_rng()



    # for _ in range(NODE_NUM):
    #     pitch = int(choice(pc_set)) + 0
    #     vel = int(choice([100,70]))
    #     dur = float(choice([0.125,0.111,0.333]) * tempo)
    #     delta = float(choice([0.75, 0.25, 0.5, 2]) * tempo)

    #     mc.add_node(EventTuple(pitch, vel, dur, delta))


    # # Instructions on how to build a matrix
    # mc.matrix = rnGen_rows.integers(0,2, size=(NODE_NUM, NODE_NUM))

    # # print(mc.nodeDict)

    # SESSION['mc'] = mc



    # bank = SampleBank("https://cdn.jsdelivr.net/gh/rFliz-music/Private_MarimoTests@main/synth_samples")

    # samples = bank.map_chromatic(start_octave=3, num_octaves=2)
    return


if __name__ == "__main__":
    app.run()
