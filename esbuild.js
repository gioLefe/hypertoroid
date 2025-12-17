import { build } from "esbuild";
import { existsSync, rmSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

// Check if clean should be skipped via command line argument
const shouldClean = !process.argv.includes("--no-clean");

// Clean dist folder before building (unless --no-clean is passed)
const distPath = "./dist";
if (shouldClean && existsSync(distPath)) {
  rmSync(distPath, { recursive: true, force: true });
  console.log("🧹 Cleaned dist folder");
} else if (!shouldClean) {
  console.log("⏭️  Skipped cleaning dist folder");
}

// Ensure dist folder exists
if (!existsSync(distPath)) {
  mkdirSync(distPath, { recursive: true });
}

// Generate TypeScript declarations first
console.log("📝 Generating TypeScript declarations...");
try {
  execSync(
    "npx tsc --declaration --emitDeclarationOnly --declarationMap --outDir ./dist",
    { stdio: "inherit" }
  );
  console.log("✅ TypeScript declarations generated");
} catch (error) {
  console.error("❌ TypeScript declaration generation failed:", error.message);
  process.exit(1);
}

// Build with esbuild
build({
    entryPoints: ["./src/hypertoroid.ts"],
    outfile: "./dist/hypertoroid.js",
    bundle: true,
    minify: false,
    sourcemap: true,
    target: ["es2020"],
    format: "esm",
    platform: "node",
    external: [],
    tsconfig: "./tsconfig.json",
  })
  .then(() => {
    console.log("✅ Build completed successfully");

    // Create package.json in dist for proper module resolution
    const packageJson = {
      name: "hypertoroid",
      type: "module",
      main: "./hypertoroid.js",
      types: "./hypertoroid.d.ts",
    };

    writeFileSync(
      join(distPath, "package.json"),
      JSON.stringify(packageJson, null, 2)
    );
    console.log("📦 Created package.json in dist folder");
  })
  .catch((error) => {
    console.error("❌ Build failed:", error);
    process.exit(1);
  });
