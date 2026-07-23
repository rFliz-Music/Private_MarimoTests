import marimo

__generated_with = "0.23.6"
app = marimo.App()


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # Marimo Development Test Notebook

    ## To Do

    - Test Graphic Markov Widget
    - ~~Write **esbundler** bundler so development can be made modular~~
    - ~~Refactor now that we have infinite stream capabilities.~~
    - ~~Set callback function system so Widget can talk to python (currently only python talks to the widget)~~


    ## References

    ### The one... The Generalized Tonnetz (Tymoczko)
    https://dmitri.mycpanel.princeton.edu/tonnetzes.pdf

    ### PK-Nets
    http://repmus.ircam.fr/_media/moreno/pk-nets_pnm_draft_version.pdf

    ### CUBE DANCE 🔥!!!
    https://alexpof.github.io/interactive_mathmusic/Pmn_graphs/pmn_graphs.html

    ### Three Conceptions of Musical Distance
    https://dmitri.mycpanel.princeton.edu/files/publications/distance.pdf
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

    return (
        EventTuple,
        MarkovChain,
        SampleBank,
        SamplerWidget,
        eventHandler_MC,
        mo,
        np,
    )


@app.cell
def _(np):

    def int_noise(span):
        return np.random.randint(span)-(span*0.5)

    def choice(items):
        return np.random.choice(items)



    SESSION = {'mc': None}    
    return SESSION, choice


@app.cell
def _(EventTuple, MarkovChain, SESSION, choice, np):
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

    # print(mc.nodeDict)

    SESSION['mc'] = mc
    return (mc,)


@app.cell
def _(mc):
    print(mc.matrix)
    return


@app.cell
def _(SESSION, SampleBank, SamplerWidget, eventHandler_MC):


    bank = SampleBank("https://cdn.jsdelivr.net/gh/rFliz-music/Private_MarimoTests@main/synth_samples")

    samples = bank.map_chromatic(start_octave=3, num_octaves=2)


    w = SamplerWidget(samples=samples)
    w.observe(lambda change: eventHandler_MC(change, w, SESSION), names="event")   


    w
    return


@app.cell
def _():
    # timeline = [
    #     [60 + choice([-12,0]), 50 + int_noise(10), 4, 0.01],
    #     [62 + choice([-12,0]), 50 + int_noise(20), 4, 0.25],
    #     [67 + choice([-12,0]), 50 + int_noise(20), 4, 0.5],
    #     [70 + choice([-12,0]), 50 + int_noise(10), 4, 0.75],
    # ]    
    return


@app.cell
def _():
    # mc.add_node(EventTuple(choice(pc_set) + choice([-12,0]), 100, 0.2, 0.75 * tempo))
    # mc.add_node(EventTuple(choice(pc_set) + choice([-12,0]), 100, 0.1, 0.125 * tempo))
    # mc.add_node(EventTuple(choice(pc_set) + choice([-12,0]), 100, 0.1, 0.5 * tempo))
    # mc.add_node(EventTuple(choice(pc_set) + choice([-12,0]), 100, 0.1, 0.333 * tempo))


    # mc.matrix = np.array([
    #     [0,1,1,1],
    #     [1,0,1,1],
    #     [1,1,0,1],
    #     [1,1,1,0]
    # ])
    return


if __name__ == "__main__":
    app.run()
