import { useEffect } from "react";

import "./app.css";
import {
	isRouteErrorResponse,
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";

import { usePuterStore } from "~/lib/puter";

import type { Route } from "./+types/root";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Mona+Sans:ital,wght@0,200..900;1,200..900&display=swap",
		referrerPolicy: "no-referrer",
	},
];

export function HydrateFallback() {
	return (
		<main className="grid min-h-dvh place-items-center px-4 text-center">
			<div role="status" className="rounded-3xl bg-white/80 px-8 py-6 shadow-lg backdrop-blur-sm">
				<p className="text-lg font-semibold text-gray-800">Loading Resumind…</p>
			</div>
		</main>
	);
}

export function Layout({ children }: { children: React.ReactNode }) {
	const { init } = usePuterStore();

	useEffect(() => {
		init();
	}, [init]);

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="theme-color" content="#eaf2ff" />
				<meta name="referrer" content="strict-origin-when-cross-origin" />
				<Meta />
				<Links />
			</head>
			<body suppressHydrationWarning>
				<script
					dangerouslySetInnerHTML={{
						__html: "globalThis.puter_report_app_open = false;",
					}}
				/>
				<script
					src="https://js.puter.com/v2/"
					async
					fetchPriority="high"
					referrerPolicy="no-referrer"
				></script>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404 ? "The requested page could not be found." : error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="grid min-h-dvh place-items-center px-4 py-12">
			<section className="w-full max-w-2xl rounded-3xl bg-white p-6 text-center shadow-xl sm:p-10">
				<p className="mb-2 text-sm font-semibold tracking-widest text-blue-700 uppercase">
					Resumind
				</p>
				<h1>{message}</h1>
				<p className="mt-4 text-gray-600">{details}</p>
				<Link to="/" className="primary-button mt-8 inline-flex w-fit justify-center">
					Back to homepage
				</Link>
				{stack && (
					<pre className="mt-6 w-full overflow-x-auto rounded-xl bg-gray-950 p-4 text-left text-white">
						<code>{stack}</code>
					</pre>
				)}
			</section>
		</main>
	);
}
