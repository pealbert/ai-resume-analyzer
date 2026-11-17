import { useEffect, useState } from "react";
import { Link } from "react-router";

import { usePuterStore } from "~/lib/puter";

import ScoreCircle from "./ScoreCircle";

const ResumeCard = ({
	resume: { id, companyName, jobTitle, feedback, imagePath },
}: {
	resume: Resume;
}) => {
	const { fs } = usePuterStore();
	const [resumeUrl, setResumeUrl] = useState("");

	useEffect(() => {
		let cancelled = false;
		let objectUrl = "";

		const loadResume = async () => {
			const blob = await fs.read(imagePath);
			if (!blob || cancelled) return;

			objectUrl = URL.createObjectURL(blob);
			setResumeUrl(objectUrl);
		};

		void loadResume();

		return () => {
			cancelled = true;
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [fs, imagePath]);

	return (
		<Link to={`/resume/${id}`} className="resume-card animate-in duration-1000 fade-in">
			<div className="resume-card-header">
				<div className="flex flex-col gap-2">
					{companyName && <h2 className="font-bold wrap-break-word text-black!">{companyName}</h2>}
					{jobTitle && <h3 className="text-lg wrap-break-word text-gray-500">{jobTitle}</h3>}
					{!companyName && !jobTitle && <h2 className="font-bold text-black!">Resume</h2>}
				</div>
				<div className="shrink-0">
					<ScoreCircle score={feedback?.overallScore ?? 0} />
				</div>
			</div>

			{resumeUrl && (
				<div className="gradient-border animate-in duration-1000 fade-in">
					<div className="size-full">
						<img
							src={resumeUrl}
							alt="resume"
							className="h-87.5 w-full object-cover object-top max-sm:h-50"
						/>
					</div>
				</div>
			)}
		</Link>
	);
};

export default ResumeCard;
