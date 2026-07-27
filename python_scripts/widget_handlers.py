from markov_tools import *
import traceback


# Widget Event handlers to implement notebook-specific behavior

#  Base Class
class WidgetHandler:
    def __init__(self, widget, session=None):
        self.widget = widget
        self.session = session or {}

    def dispatch(self, change):
        event = change["new"]
        try:
            self.handle(event)
        except Exception:
            traceback.print_exc()
        finally:
            self.widget.event = {"type": ""}


# ======================================================
# ===================== SUBCLASSES =====================
# ======================================================


# Markov Chain Sampler Widget
class MarkovHandler(WidgetHandler):    
    def handle(self, event):
         match event["type"]:
            case "generate_timeline":                        
                pass
            case "request_chunk":     
                # print("Python: JS Requested events!")
                n = event["n"]    
                events = global_MarkovWalk(self.session['mc'], 
                                        n, 
                                        self.session['mc'].lastPlayed,
                                        include_start=False)             
                # print(f"Python: Serving: {events}!")
                # Forcing Uniqueness                
                self.widget.chunk = {
                    "events" : events,
                    "timestamp" : np.random.random(),
                }