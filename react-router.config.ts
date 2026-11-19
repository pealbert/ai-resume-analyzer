import type { Config } from "@react-router/dev/config";

export default {
	// Puter.js is browser-only, so this app is deployed as a static SPA.
	ssr: false,
} satisfies Config;
