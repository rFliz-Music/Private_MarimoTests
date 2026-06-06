import numpy as np
from dataclasses import dataclass


# A Markov Chain Node can be of two types, a regular Midi EventTuple or a MarkovChainNode.

@dataclass
class EventTuple:
    pitch: int
    velocity: int
    duration: float

    @property
    def asArray(self):
        return [self.pitch, self.velocity, self.duration]


@dataclass
class MarkovChainNode:
    duration: float 
    start_idx: int
    chain: "MarkovChain"



class MarkovChain:
    def __init__(self):
        self.matrix = np.zeros((0, 0), dtype=float)
        self.nodeDict = {} # index -> node_value (could be of type event tuple or another markov chain...)  

    @property
    def n_states(self):
        return len(self.matrix)

    # We re-write the whole matrix when adding a new node.
    # returns the index of the node for reference
    def add_node(self, node_val):        
        n = self.n_states        
        self.nodeDict[n] = node_val

        new_matrix = np.zeros((n + 1, n + 1))
        new_matrix[:n, :n] = self.matrix

        self.matrix = new_matrix

        return n


    def connect(self, src, dst, weight=1.0):
        """
        Set the weight of edge src -> dst.
        """
        self.matrix[src, dst] = weight


    def disconnect(self, src, dst):
        self.matrix[src, dst] = 0.0


    def probabilities(self, state):
        row = self.matrix[state]
        total = row.sum()

        if total == 0:
            raise ValueError(
                f"State {state} has no outgoing connections."
            )
        return row / total


    def step(self, state):
        probs = self.probabilities(state)
        return np.random.choice(self.n_states, p=probs)


    def walk(self, start, length):
        current = start
        out = [current]

        for _ in range(length - 1):
            current = self.step(current)
            out.append(current)

        return out
    

#  ========

# Given the coarsest markov chain in a markov chain ensemble and an integer n, 
# generate n number of steps in a markov walk relevant to the coarsest markov chain

def global_MarkovWalk(mc, n, start_idx=0):
    global_seq = [mc.nodeDict[x] for x in mc.walk(start_idx, n)]    

    out = []

    for node in global_seq:
        if type(node).__name__ == "EventTuple":
            out.append([node.pitch, node.velocity, node.duration])            
        else:
            nodeDict = node.chain.nodeDict
            current = node.start_idx
            # delta = nodeDict[current].duration
            delta = 0

            working = True

            while working:                
                current = node.chain.step(current)
                current_duration = nodeDict[current].duration
                event = nodeDict[current].asArray

                delta += current_duration 

                # if the current event's duration is greater than the parent node's duration.
                if delta > node.duration: 
                    working = False
                    event[2] = (event[2] - (delta - node.duration)) # Trim the offending event's duration to fit

                out.append(event)

    return out

