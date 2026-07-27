// widgets/build.js
const esbuild = require("esbuild");


// esbuild.build({
//     entryPoints: ["src/widget_markov_viz.js"],
//     bundle: true,
//     outfile: "dist/widget_markov_viz.js",
//     format: "esm",
//   })
  
//   esbuild.build({
//     entryPoints: ["src/widget_sampler.js"],
//     bundle: true,
//     outfile: "dist/widget_sampler.js",
//     format: "esm"
//   })

async function main() {

    const ctx = await esbuild.context({
        entryPoints: [
            "src/widget_markov_viz.js",
            "src/widget_sampler.js",
        ],
        bundle: true,
        outdir: "dist",
        format: "esm",
    });

    await ctx.watch();

    console.log("👀 Watching...");

}

main().catch(console.error);