import anywidget
import traitlets
import traceback

from markov_tools import *


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
            note: f"{self.base_url}/{self.prefix}{i}.ogg"
            for i, note in enumerate(notes)
        }

        return samples
    



class SamplerWidget(anywidget.AnyWidget):
    _esm = "./widgets/dist/widget_sampler.js"
    _css = "./widgets/dist/widget_sampler.css"

    # State
    samples = traitlets.Dict().tag(sync=True)
    timeline = traitlets.List().tag(sync=True) # Scheduled Timeline (with start time per event)

    chunk = traitlets.Dict().tag(sync=True) # Event Buffer

    # events (callbacks)
    event = traitlets.Dict(default_value={}).tag(sync=True)



# The Event handler is the one that creates the markov chain behavior...
# by describing the callbacks for the more generic samper widget :D 
def eventHandler_MC(change, widg, session):    
    try:
        event = change["new"]  
        match event["type"]:
            case "generate_timeline":                        
                # testPythonFunc(change)                
                # print(event['property'])
                pass

            case "request_chunk":     
                # print("Python: JS Requested events!")
                n = event["n"]    
                events = global_MarkovWalk(session['mc'], 
                                        n, 
                                        session['mc'].lastPlayed,
                                        include_start=False)             

                # print(f"Python: Serving: {events}!")

                # Forcing Uniqueness                
                widg.chunk = {
                    "events" : events,
                    "timestamp" : np.random.random(),
                }


        widg.event = dict({"type":""})  # reset trigger

    except BaseException:       
        print("Something went wrong :/") 
        traceback.print_exc()
        print("Traceback end.")
