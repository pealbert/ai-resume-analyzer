import ScoreBadge from "./ScoreBadge";
import ScoreGauge from "./ScoreGauge";

const Category = ({ title, score }: { title: string; score: number }) => {
	const textColor = score > 70 ? "text-green-600" : score > 49 ? "text-yellow-600" : "text-red-600";

	return (
		<div className="resume-summary px-2 sm:px-4">
			<div className="category">
				<div className="flex min-w-0 flex-wrap items-center gap-2">
					<p className="text-lg sm:text-2xl">{title}</p>
					<ScoreBadge score={score} />
				</div>
				<p className="shrink-0 text-lg sm:text-2xl">
					<span className={textColor}>{score}</span>/100
				</p>
			</div>
		</div>
	);
};

const Summary = ({ feedback }: { feedback: Feedback }) => {
	return (
		<div className="w-full rounded-2xl bg-white shadow-md">
			<div className="flex flex-col items-center gap-4 p-4 text-center sm:flex-row sm:gap-8 sm:text-left">
				<ScoreGauge score={feedback.overallScore} />

				<div className="flex flex-col gap-2">
					<h2 className="text-2xl font-bold">Your Resume Score</h2>
					<p className="text-sm text-gray-500">
						This score is calculated based on the variables listed below.
					</p>
				</div>
			</div>

			<Category title="Tone & Style" score={feedback.toneAndStyle.score} />
			<Category title="Content" score={feedback.content.score} />
			<Category title="Structure" score={feedback.structure.score} />
			<Category title="Skills" score={feedback.skills.score} />
		</div>
	);
};

export default Summary;
