import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";

import type { Route } from "./+types/home";

export function meta(_args: Route.MetaArgs) {
	return [
		{
			title: "Resumind",
		},
		{
			name: "description",
			content: "Smart feedback for your dream job!",
		},
	];
}

export default function Home() {
	const { auth, isLoading, puterReady, kv } = usePuterStore();
	const navigate = useNavigate();
	const [resumes, setResumes] = useState<Resume[]>([]);
	const [loadingResumes, setLoadingResumes] = useState(true);
	const [unavailableResumeCount, setUnavailableResumeCount] = useState(0);
	const [loadError, setLoadError] = useState("");

	useEffect(() => {
		if (puterReady && !isLoading && !auth.isAuthenticated) {
			void navigate("/auth?next=/", { replace: true });
		}
	}, [auth.isAuthenticated, isLoading, navigate, puterReady]);

	useEffect(() => {
		if (!puterReady || isLoading || !auth.isAuthenticated) return;

		let cancelled = false;

		const loadResumes = async () => {
			setLoadingResumes(true);
			setLoadError("");

			try {
				const storedResumes = (await kv.list("resume:*", true)) as KVItem[] | undefined;
				const parsedResumes: Resume[] = [];
				let unavailableCount = 0;

				for (const storedResume of storedResumes ?? []) {
					try {
						const resume = JSON.parse(storedResume.value) as Partial<Resume>;
						if (
							typeof resume.id === "string" &&
							typeof resume.imagePath === "string" &&
							typeof resume.resumePath === "string" &&
							resume.feedback != null &&
							Number.isFinite(resume.feedback.overallScore)
						) {
							parsedResumes.push(resume as Resume);
						} else {
							unavailableCount += 1;
						}
					} catch {
						unavailableCount += 1;
					}
				}

				if (!cancelled) {
					setResumes(parsedResumes);
					setUnavailableResumeCount(unavailableCount);
				}
			} catch (error) {
				if (!cancelled) {
					setLoadError(error instanceof Error ? error.message : "Failed to load resumes");
				}
			} finally {
				if (!cancelled) setLoadingResumes(false);
			}
		};

		void loadResumes();

		return () => {
			cancelled = true;
		};
	}, [auth.isAuthenticated, isLoading, kv, puterReady]);

	return (
		<main className="bg-[url('/images/bg-main.svg')] bg-cover">
			<Navbar />

			<section className="main-section">
				<div className="page-heading pt-16">
					<h1>Track Your Applications & Resume Ratings</h1>
					{!loadingResumes && !loadError && resumes.length === 0 && unavailableResumeCount === 0 ? (
						<h2>No resumes found. Upload your first resume to get feedback.</h2>
					) : (
						<h2>Review your submissions and check AI-powered feedback.</h2>
					)}
				</div>

				{loadingResumes && (
					<div role="status" className="flex flex-col items-center justify-center gap-3">
						<img
							src="/images/resume-scan-2.gif"
							alt=""
							className="aspect-square w-50 object-contain"
						/>
						<p className="text-gray-600">Loading your resumes…</p>
					</div>
				)}

				{!loadingResumes && loadError && (
					<p className="text-center text-red-600">Could not load resumes: {loadError}</p>
				)}

				{!loadingResumes && !loadError && resumes.length === 0 && (
					<div className="flex flex-col items-center justify-center gap-4">
						<Link to="/upload" className="primary-button w-fit text-xl font-semibold">
							Upload Resume
						</Link>
					</div>
				)}

				{!loadingResumes && unavailableResumeCount > 0 && (
					<p className="pt-10 text-center text-gray-600">
						{unavailableResumeCount === 1
							? "One resume is still being analyzed or is unavailable."
							: `${unavailableResumeCount} resumes are still being analyzed or are unavailable.`}
					</p>
				)}

				{!loadingResumes && resumes.length > 0 && (
					<div className="resumes-section">
						{resumes.map((resume) => (
							<ResumeCard key={resume.id} resume={resume} />
						))}
					</div>
				)}
			</section>
		</main>
	);
}
