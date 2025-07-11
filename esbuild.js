// build.js
const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["./src/hypertoroid.ts"],
    outfile: "./dist/hypertoroid.js",
    bundle: true,
    minify: false,
    sourcemap: true,
    target: ["es2020"],
    format: "esm", // or 'cjs' if you're publishing CommonJS
    platform: "node",
    external: [], // add external deps here like ['react']
    tsconfig: "./tsconfig.json",
  })
  .catch(() => process.exit(1));
