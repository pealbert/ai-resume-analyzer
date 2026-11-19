import { useEffect, useId, useRef, useState } from "react";

const ScoreGauge = ({ score }: { score: number }) => {
	const gradientId = useId();
	const [pathLength, setPathLength] = useState(0);
	const pathRef = useRef<SVGPathElement>(null);

	const safeScore = Math.min(100, Math.max(0, score));
	const percentage = safeScore / 100;

	useEffect(() => {
		if (pathRef.current) {
			setPathLength(pathRef.current.getTotalLength());
		}
	}, []);

	return (
		<div
			className="flex flex-col items-center"
			role="img"
			aria-label={`Overall score: ${safeScore} out of 100`}
		>
			<div className="relative h-20 w-40">
				<svg aria-hidden="true" viewBox="0 0 100 50" className="h-full w-full">
					<defs>
						<linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" stopColor="#a78bfa" />
							<stop offset="100%" stopColor="#fca5a5" />
						</linearGradient>
					</defs>

					{/* Background arc */}
					<path
						d="M10,50 A40,40 0 0,1 90,50"
						fill="none"
						stroke="#e5e7eb"
						strokeWidth="10"
						strokeLinecap="round"
					/>

					{/* Foreground arc with rounded ends */}
					<path
						ref={pathRef}
						d="M10,50 A40,40 0 0,1 90,50"
						fill="none"
						stroke={`url(#${gradientId})`}
						strokeWidth="10"
						strokeLinecap="round"
						strokeDasharray={pathLength}
						strokeDashoffset={pathLength * (1 - percentage)}
					/>
				</svg>

				<div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
					<div className="pt-4 text-xl font-semibold" aria-hidden="true">
						{safeScore}/100
					</div>
				</div>
			</div>
		</div>
	);
};

export default ScoreGauge;
