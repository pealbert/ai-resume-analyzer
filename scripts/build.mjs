import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

const SPA_SUCCESS_MARKER = "SPA Mode: Generated";
const SPA_ENTRY = "build/client/index.html";
const FORCE_EXIT_DELAY_MS = 2_000;
const FORCE_EXIT_FALLBACK_MS = 1_000;

const build = spawn("vp", ["build"], {
	env: process.env,
	stdio: ["inherit", "pipe", "pipe"],
});

let outputTail = "";
let forceExitTimer;
let forcedExit = false;

const finishVercelBuild = () => {
	if (forcedExit) return;
	forcedExit = true;

	if (!existsSync(SPA_ENTRY)) {
		console.error(`Build reported success, but ${SPA_ENTRY} does not exist.`);
		build.kill("SIGTERM");
		process.exit(1);
	}

	console.log("Vercel SPA output verified; closing the lingering build process.");
	build.kill("SIGTERM");
	setTimeout(() => process.exit(0), FORCE_EXIT_FALLBACK_MS);
};

const forwardOutput = (target) => (chunk) => {
	const text = chunk.toString();
	target.write(text);
	outputTail = (outputTail + text).slice(-1_024);

	if (
		process.env.VERCEL === "1" &&
		outputTail.includes(SPA_SUCCESS_MARKER) &&
		forceExitTimer === undefined
	) {
		forceExitTimer = setTimeout(finishVercelBuild, FORCE_EXIT_DELAY_MS);
	}
};

build.stdout.on("data", forwardOutput(process.stdout));
build.stderr.on("data", forwardOutput(process.stderr));

build.on("error", (error) => {
	console.error("Unable to start the Vite+ production build.", error);
	process.exit(1);
});

build.on("exit", (code, signal) => {
	if (forceExitTimer !== undefined) clearTimeout(forceExitTimer);
	if (forcedExit && signal === "SIGTERM") process.exit(0);
	process.exit(code ?? 1);
});
