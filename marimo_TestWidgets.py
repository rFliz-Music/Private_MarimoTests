import marimo

__generated_with = "0.23.6"
app = marimo.App()


@app.cell
def _():
    from pathlib import Path
    import marimo
    import json

    import anywidget
    import traitlets

    import numpy as np

    return anywidget, np, traitlets


@app.cell
def _():
    # class MidiWidget(anywidget.AnyWidget):
    #     _esm = Path("./widget_midi.js").read_text()
    #     timeline = traitlets.Unicode("{}").tag(sync=True)

    # widget = MidiWidget()    

    # w = MidiWidget()
    return


@app.cell
def _():
    # class SamplerWidget(anywidget.AnyWidget):
    #     _esm = Path("./widget_sampler.js").read_text()
    #     sampler_data = traitlets.Unicode("{}").tag(sync=True)

    # widget = SamplerWidget()    

    # w = SamplerWidget()
    return


@app.class_definition
class SampleBank:
    def __init__(self, base_url: str):
        self.base_url = base_url

    def map_chromatic(self, start_octave=3, num_octaves=1):
        chromatic = ["C", "C#", "D", "D#", "E", "F",
                     "F#", "G", "G#", "A", "A#", "B"]

        notes = [
            f"{note}{octave}"
            for octave in range(start_octave, start_octave + num_octaves)
            for note in chromatic
        ]

        samples = {
            note: f"{self.base_url}/{note}.wav"
            for note in notes
        }

        return samples


@app.cell
def _():
    banky = SampleBank(
        # "https://cdn.jsdelivr.net/gh/yourname/repo/synth_samples"
        "Kakita"
    )

    samplesy = banky.map_chromatic(start_octave=3, num_octaves=2)

    samplesy
    return


@app.cell
def _(anywidget, traitlets):
    class SamplerWidget(anywidget.AnyWidget):
        _esm = "widget_sampler.js"

        samples = traitlets.Dict().tag(sync=True)
        timeline = traitlets.List().tag(sync=True)

        def __init__(self, samples=None, timeline=None, **kwargs):
            super().__init__(**kwargs)
            self.samples = samples or {}
            self.timeline = timeline or []

    return (SamplerWidget,)


@app.cell
def _(SamplerWidget, np, samples):
    def int_noise(span):
        return np.random.randint(span)-(span*0.5)

    def choice(items):
        return int(np.random.choice(items))


    timeline = [
        [60 + choice([-12,0]), 50 + int_noise(10), 4, 0.01],
        [65 + choice([-12,0]), 50 + int_noise(20), 4, 0.25],
        [67 + choice([-12,0]), 50 + int_noise(20), 4, 0.5],
        [70 + choice([-12,0]), 50 + int_noise(10), 4, 0.75],
    ]


    w = SamplerWidget(
        samples=samples,
        timeline=timeline
    )


    # w.timeline = json.dumps(timeline)
    w
    return


@app.cell
def _(np):
    + np.random.randint(10)
    return


@app.cell
def _():
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
