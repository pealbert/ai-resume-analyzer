import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite-plus";

export default defineConfig({
	plugins: [tailwindcss(), reactRouter()],
	resolve: {
		tsconfigPaths: true,
	},
	fmt: {
		ignorePatterns: [
			"node_modules/**",
			"build/**",
			"dist/**",
			".agents/**",
			".tmp/**",
			"skills-lock.json",
		],
		useTabs: true,
		singleQuote: false,
		sortImports: true,
		sortTailwindcss: {
			stylesheet: "./app/app.css",
			functions: ["clsx", "cn", "cva"],
			preserveDuplicates: false,
		},
		sortPackageJson: true,
	},

	lint: {
		ignorePatterns: ["node_modules/**", "build/**", "dist/**", ".agents/**", ".tmp/**"],
		jsPlugins: [
			{
				name: "vite-plus",
				specifier: "vite-plus/oxlint-plugin",
			},
		],
		rules: {
			"vite-plus/prefer-vite-plus-imports": "error",
		},
		options: {
			typeAware: true,
			typeCheck: true,
		},
	},
});
