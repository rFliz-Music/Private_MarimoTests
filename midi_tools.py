import time
import threading
import mido
import numpy as np

def _play_single_note(port_name, pitch, velocity, duration, start_time, t0):
    """
    Runs inside its own thread so notes can overlap.
    """
    with mido.open_output(port_name) as port:
        # wait until the scheduled onset
        now = time.time() - t0
        if start_time > now:
            time.sleep(start_time - now)

        # Note on
        port.send(mido.Message('note_on', note=pitch, velocity=velocity))

        # Hold
        time.sleep(duration * 0.96)

        # Note off
        port.send(mido.Message('note_off', note=pitch, velocity=0))


def play_event_tuples(events, port_name="IAC Driver Bus 1"):
    """
    events: list of (pitch, velocity, duration, start_time)
    Spawns a thread for each note so durations never block the timeline.
    """
    # consistent ordering
    events = sorted(events, key=lambda e: e[3])

    t0 = time.time()
    threads = []

    for pitch, velocity, duration, start_time in events:
        # spawn note thread
        th = threading.Thread(
            target=_play_single_note,
            args=(port_name, int(pitch), int(velocity), duration, start_time, t0)
        )
        th.daemon = True
        th.start()
        threads.append(th)

    # optional: wait for all notes to finish
    for th in threads:
        th.join()



# enrich an event list with a "start time" value in order to make it ready to be midi sequenced.
def structure_midi_sequence(event_list):    
    event_list = np.array(event_list)
    return np.c_[event_list, np.cumsum(event_list[:, 2]) - event_list[:, 2]]
    