import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import ATS from "~/components/ATS";
import Details from "~/components/Details";
import Summary from "~/components/Summary";
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
	const { auth, isLoading, fs, kv } = usePuterStore();
	const { id } = useParams();
	const [imageUrl, setImageUrl] = useState("");
	const [resumeUrl, setResumeUrl] = useState("");
	const [feedback, setFeedback] = useState<Feedback | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading && !auth.isAuthenticated) void navigate(`/auth?next=/resume/${id}`);
	}, [isLoading]);

	useEffect(() => {
		const loadResume = async () => {
			const resume = await kv.get(`resume:${id}`);
			if (!resume) return;

			const data = JSON.parse(resume);
			const resumeBlob = await fs.read(data.resumePath);
			if (!resumeBlob) return;

			const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
			const resumeUrl = URL.createObjectURL(pdfBlob);
			setResumeUrl(resumeUrl);

			const imageBlob = await fs.read(data.imagePath);
			if (!imageBlob) return;

			const imageUrl = URL.createObjectURL(imageBlob);
			setImageUrl(imageUrl);

			setFeedback(data.feedback);
		};

		void loadResume();
	}, [id]);

	return (
		<main className="pt-0!">
			<nav className="resume-nav">
				<Link to="/" className="back-button">
					<img src="/icons/back.svg" alt="logo" className="size-2.5" />
					<span className="text-sm font-semibold text-gray-800">Back to Homepage</span>
				</Link>
			</nav>
			<div className="flex w-full flex-row max-lg:flex-col-reverse">
				<section className="feedback-section sticky top-0 h-screen items-center justify-center bg-[url('/images/bg-small.svg')] bg-cover">
					{imageUrl && resumeUrl && (
						<div className="gradient-border h-9/10 animate-in duration-1000 fade-in max-2xl:size-fit max-sm:m-0">
							<a href={resumeUrl} target="_blank">
								<img
									src={imageUrl}
									alt=""
									className="size-full rounded-2xl object-contain"
									title="resume"
								/>
							</a>
						</div>
					)}
				</section>
				<section className="feedback-section">
					<h2 className="text-4xl font-bold text-black!">Resume Review</h2>
					{feedback ? (
						<div className="flex animate-in flex-col gap-8 duration-1000 fade-in">
							<Summary feedback={feedback} />
							<ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
							<Details feedback={feedback} />
						</div>
					) : (
						<img src="/images/resume-scan-2.gif" alt="" className="w-full" />
					)}
				</section>
			</div>
		</main>
	);
};

export default Resume;
