import { Link } from "react-router";

import ScoreCircle from "./ScoreCircle";

const ResumeCard = ({
	resume: { id, companyName, jobTitle, feedback, imagePath },
}: {
	resume: Resume;
}) => {
	return (
		<Link to={`/resume/${id}`} className="resume-card animate-in duration-1000 fade-in">
			<div className="resume-card-header">
				<div className="flex flex-col gap-2">
					<h2 className="font-bold wrap-break-word text-black!">{companyName}</h2>
					<h3 className="text-lg wrap-break-word text-gray-500">{jobTitle}</h3>
				</div>
				<div className="shrink-0">
					<ScoreCircle score={feedback.overallScore} />
				</div>
			</div>

			<div className="gradient-border animate-in duration-1000 fade-in">
				<div className="size-full">
					<img
						src={imagePath}
						alt="resume"
						className="h-87.5 w-full object-cover object-top max-sm:h-50"
					/>
				</div>
			</div>
		</Link>
	);
};

export default ResumeCard;
