// widgets/build.js
const esbuild = require("esbuild");


esbuild.build({
    entryPoints: ["src/widget_markov.js"],
    bundle: true,
    outfile: "dist/widget_markov.js",
    format: "esm"
  })
  
  esbuild.build({
    entryPoints: ["src/widget_sampler.js"],
    bundle: true,
    outfile: "dist/widget_sampler.js",
    format: "esm"
  })

