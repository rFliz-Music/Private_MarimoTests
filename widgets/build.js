// const esbuild = require("esbuild");


// async function main() {

//     const ctx = await esbuild.context({
//         entryPoints: [
//             "src/widget_markov_viz.js",
//             "src/widget_sampler.js",
//         ],
//         bundle: true,
//         outdir: "dist",
//         format: "esm",
//     });

//     await ctx.watch();

//     console.log("👀 Watching...");

// }

// main().catch(console.error);


const esbuild = require("esbuild");

async function main() {

    const ctx = await esbuild.context({
        entryPoints: [
            "src/widget_markov_viz.js",
            "src/widget_sampler.js",
        ],
        bundle: true,
        outdir: "dist",
        format: "esm",

        plugins: [{
            name: "build-status",

            setup(build) {

                build.onStart(() => {
                    console.clear();
                    console.log("👀 Watching...");                    
                });

                build.onEnd(result => {

                    if (result.errors.length > 0) {
                        console.log("❌ Build failed. ❌");
                    } else {
                        console.log("✨ Build complete ✨");
                    }                    

                });

            }
        }]
    });

    await ctx.watch();

    console.log("👀 Watching...");
}

main().catch(console.error);