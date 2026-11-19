import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

import { usePuterStore } from "~/lib/puter";

export const meta = () => [
	{
		title: "Resumind | Auth",
	},
	{
		name: "description",
		content: "Log into your account",
	},
];

const Auth = () => {
	const { isLoading, error, auth } = usePuterStore();
	const location = useLocation();
	const requestedNext = new URLSearchParams(location.search).get("next");
	const next =
		requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/";
	const navigate = useNavigate();

	useEffect(() => {
		if (auth.isAuthenticated) void navigate(next, { replace: true });
	}, [auth.isAuthenticated, navigate, next]);

	return (
		<main className="flex min-h-screen items-center justify-center bg-[url('/images/bg-main.svg')] bg-cover px-4 py-6 sm:px-6 sm:py-8">
			<div className="gradient-border w-full max-w-2xl p-2 shadow-lg sm:p-4">
				<section className="flex min-w-0 flex-col gap-6 rounded-2xl bg-white p-6 sm:gap-8 sm:p-10">
					<div className="flex min-w-0 flex-col items-center gap-2 text-center">
						<h1>Welcome</h1>
						<h2>Log In to Continue Your Job Journey</h2>
					</div>
					<div className="w-full min-w-0">
						{error ? (
							<p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-center text-red-800">
								{error}
							</p>
						) : null}
						{isLoading ? (
							<button type="button" className="auth-button animate-pulse" disabled>
								<span>Checking your account…</span>
							</button>
						) : auth.isAuthenticated ? (
							<button type="button" className="auth-button" onClick={auth.signOut}>
								Log out
							</button>
						) : (
							<button type="button" className="auth-button" onClick={auth.signIn}>
								Log in with Puter
							</button>
						)}
					</div>
				</section>
			</div>
		</main>
	);
};

export default Auth;
