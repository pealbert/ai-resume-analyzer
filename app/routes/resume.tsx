import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import ATS from "~/components/ATS";
import Details from "~/components/Details";
import Summary from "~/components/Summary";
import { isFeedback } from "~/lib/feedback";
import { usePuterStore } from "~/lib/puter";

export const meta = () => [
	{
		title: "Resumind | Review",
	},
	{
		name: "description",
		content: "Detailed overview of your resume",
	},
];

const Resume = () => {
	const { auth, isLoading, puterReady, fs, kv } = usePuterStore();
	const { id } = useParams();
	const [imageUrl, setImageUrl] = useState("");
	const [resumeUrl, setResumeUrl] = useState("");
	const [feedback, setFeedback] = useState<Feedback | null>(null);
	const [loadError, setLoadError] = useState("");
	const [loadingResume, setLoadingResume] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		if (puterReady && !isLoading && !auth.isAuthenticated) {
			void navigate(`/auth?next=/resume/${id ?? ""}`, { replace: true });
		}
	}, [auth.isAuthenticated, id, isLoading, navigate, puterReady]);

	useEffect(() => {
		if (!puterReady || isLoading || !auth.isAuthenticated || !id) return;

		let cancelled = false;
		let nextResumeUrl = "";
		let nextImageUrl = "";

		const loadResume = async () => {
			setLoadingResume(true);
			setLoadError("");
			setFeedback(null);
			setResumeUrl("");
			setImageUrl("");

			try {
				const storedResume = await kv.get(`resume:${id}`);
				if (!storedResume) throw new Error("This resume could not be found.");

				const data: unknown = JSON.parse(storedResume);
				if (
					data === null ||
					typeof data !== "object" ||
					typeof Reflect.get(data, "resumePath") !== "string" ||
					typeof Reflect.get(data, "imagePath") !== "string" ||
					!isFeedback(Reflect.get(data, "feedback"))
				) {
					throw new Error("The saved resume data is incomplete or invalid.");
				}

				const [resumeBlob, imageBlob] = await Promise.all([
					fs.read(Reflect.get(data, "resumePath") as string),
					fs.read(Reflect.get(data, "imagePath") as string),
				]);
				if (!resumeBlob || !imageBlob) throw new Error("The resume files are unavailable.");

				nextResumeUrl = URL.createObjectURL(new Blob([resumeBlob], { type: "application/pdf" }));
				nextImageUrl = URL.createObjectURL(imageBlob);

				if (cancelled) {
					URL.revokeObjectURL(nextResumeUrl);
					URL.revokeObjectURL(nextImageUrl);
					nextResumeUrl = "";
					nextImageUrl = "";
					return;
				}
				setResumeUrl(nextResumeUrl);
				setImageUrl(nextImageUrl);
				setFeedback(Reflect.get(data, "feedback") as Feedback);
			} catch (error) {
				if (!cancelled) {
					setLoadError(error instanceof Error ? error.message : "Failed to load the resume.");
				}
			} finally {
				if (!cancelled) setLoadingResume(false);
			}
		};

		void loadResume();

		return () => {
			cancelled = true;
			if (nextResumeUrl) URL.revokeObjectURL(nextResumeUrl);
			if (nextImageUrl) URL.revokeObjectURL(nextImageUrl);
		};
	}, [auth.isAuthenticated, fs, id, isLoading, kv, puterReady]);

	return (
		<main className="pt-0!">
			<nav className="resume-nav">
				<Link to="/" className="back-button">
					<img src="/icons/back.svg" alt="" className="size-2.5" />
					<span className="text-sm font-semibold text-gray-800">Back to Homepage</span>
				</Link>
			</nav>
			<div className="flex w-full flex-col-reverse lg:flex-row">
				<section className="feedback-section items-center justify-center bg-[url('/images/bg-small.svg')] bg-cover lg:sticky lg:top-0 lg:h-dvh">
					{imageUrl && resumeUrl && (
						<div className="gradient-border w-full max-w-3xl animate-in duration-1000 fade-in lg:max-h-[90dvh] lg:w-auto">
							<a
								href={resumeUrl}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Open the original resume PDF in a new tab"
							>
								<img
									src={imageUrl}
									alt="First-page preview of the uploaded resume"
									className="max-h-[80dvh] w-full rounded-2xl object-contain"
								/>
							</a>
						</div>
					)}
				</section>
				<section className="feedback-section" aria-busy={loadingResume}>
					<h2 className="text-4xl font-bold text-black!">Resume Review</h2>
					{loadError ? (
						<div
							role="alert"
							className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800"
						>
							<p className="font-semibold">We could not load this review.</p>
							<p className="mt-1">{loadError}</p>
						</div>
					) : feedback ? (
						<div className="flex animate-in flex-col gap-8 duration-1000 fade-in">
							<Summary feedback={feedback} />
							<ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
							<Details feedback={feedback} />
						</div>
					) : (
						<div role="status" className="flex flex-col items-center gap-3">
							<img
								src="/images/resume-scan-2.gif"
								alt=""
								className="aspect-square w-full max-w-sm object-contain"
							/>
							<p className="text-gray-600">Loading your review…</p>
						</div>
					)}
				</section>
			</div>
		</main>
	);
};

export default Resume;
