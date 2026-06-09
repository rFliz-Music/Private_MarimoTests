import marimo

__generated_with = "0.23.6"
app = marimo.App()


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # Development Test Notebook

    ## To Do

    Set callback function system so Widget can talk to python (currently only python talks to the widget)
    """)
    return


@app.cell
def _():
    from pathlib import Path
    import marimo as mo
    import json

    import anywidget
    import traitlets

    import numpy as np

    return anywidget, mo, np, traitlets


@app.cell
def _():
    # Given a URL containing references to audio files, 
    # provides multiple ways to map note names (across octaves) to individual URLS
    class SampleBank:
        def __init__(self, base_url: str, prefix="SynthSample_"):
            self.base_url = base_url
            self.prefix = prefix

        def map_chromatic(self, start_octave=3, num_octaves=1):
            chromatic = ["C", "C#", "D", "D#", "E", "F",
                         "F#", "G", "G#", "A", "A#", "B"]

            notes = [
                f"{note}{octave}"
                for octave in range(start_octave, start_octave + num_octaves)
                for note in chromatic
            ]

            samples = {
                note: f"{self.base_url}/{self.prefix}{i}.wav"
                for i, note in enumerate(notes)
            }

            return samples



    def testPythonFunc(change):
        print("🔥 You did it! from the inside! 🔥")
        return 


    # def generate_timeline():    
    #     return [
    #         [60, 80, 0.5, 0],
    #         [62, 70, 0.5, 0.5],
    #         [67, 90, 0.5, 1.0],
    #     ]
    return SampleBank, testPythonFunc


@app.cell
def _(anywidget, traitlets):
    class SamplerWidget(anywidget.AnyWidget):
        _esm = "./widgets/widget_sampler.js"

        # State
        samples = traitlets.Dict().tag(sync=True)
        timeline = traitlets.List().tag(sync=True)

        # events (callbacks)
        event = traitlets.Dict(default_value={}).tag(sync=True)

    return (SamplerWidget,)


@app.cell
def _(np):
    def int_noise(span):
        return np.random.randint(span)-(span*0.5)

    def choice(items):
        return int(np.random.choice(items))


    timeline = [
        [60 + choice([-12,0]), 50 + int_noise(10), 4, 0.01],
        [62 + choice([-12,0]), 50 + int_noise(20), 4, 0.25],
        [67 + choice([-12,0]), 50 + int_noise(20), 4, 0.5],
        [70 + choice([-12,0]), 50 + int_noise(10), 4, 0.75],
    ]
    return choice, int_noise, timeline


@app.cell
def _(SampleBank, SamplerWidget, testPythonFunc, timeline):


    bank = SampleBank("https://cdn.jsdelivr.net/gh/rFliz-music/Private_MarimoTests@main/synth_samples")

    samples = bank.map_chromatic(start_octave=3, num_octaves=2)

    w = SamplerWidget(samples=samples, timeline=timeline)


    def handle_event(change):
        event = change["new"]    

        match event["type"]:
            case "generate_timeline":                        
                testPythonFunc(change)   
                print(event['property'])

        w.event = dict({"type":""})  # reset trigger



    w.observe(handle_event, names="event")   

    w
    return (w,)


@app.cell
def _(choice, int_noise, w):
    w.timeline = [
        [60 + choice([-12,0]), 50 + int_noise(10), 4, 0.01],
        [62 + choice([-12,0]), 50 + int_noise(20), 4, 0.25],
        [67 + choice([-12,0]), 50 + int_noise(20), 4, 0.5],
        [70 + choice([-12,0,-7]), 50 + int_noise(10), 4, 0.75],
    ]
    return


@app.cell
def _():
    # print(w.event)

    # w.event = {"type": "generate_timeline"}
    return


@app.cell
def _():
    return


@app.cell
def _():
    return


@app.cell
def _():
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
