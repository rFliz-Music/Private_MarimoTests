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

    return Path, anywidget, json, np, traitlets


@app.cell
def _(Path, anywidget, traitlets):
    class MidiWidget(anywidget.AnyWidget):
        _esm = Path("./midi_scheduler.js").read_text()
        timeline = traitlets.Unicode("{}").tag(sync=True)

    widget = MidiWidget()    



    w = MidiWidget()
    return (w,)


@app.cell
def _(json, np, w):
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

    w.timeline = json.dumps(timeline)
    w
    return


@app.cell
def _(np):
    + np.random.randint(10)
    return


if __name__ == "__main__":
    app.run()
