import marimo

__generated_with = "0.23.6"
app = marimo.App()


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # The Tonnetz and Transformation Music Theory

    Since the XIX century there has been an interest in developing a theory of harmony which explicates chord profressions as resultant of an algebra of operations or a grupoid-like structure.

    This coincides with the formalized development of abstarct algebra / group theory spawning from Galois theory.

    For the purposes of this notebook, we need only concern ourselves with the lattice strucute known as the *Tonnetz*.

    First desribed by Leonard Euler in the late XVII century, the Tonnetz is the geomtric realization of the generative group $Z_{12}$ under addition. it is a structure that captures certain harmonic relationships of interest for western musoc theory.

    We will use it throughough these notebooks as a sort of generative engine as well as a resource to understand some of the more advanced concepts explained after.
    """)
    return


@app.cell
def _():
    import marimo as mo
    import numpy as np

    return mo, np


@app.cell
def _(np):
    x = np.array([0,4,7])

    a = np.array([-1,0,0])
    b = np.array([0,-1,0])
    c = np.array([0,0,-1])

    result = (x + (1*a) + (2*b) + (3*c))

    result % 12


    return


if __name__ == "__main__":
    app.run()
