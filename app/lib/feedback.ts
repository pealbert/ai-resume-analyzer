const isScore = (value: unknown): value is number =>
	typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;

const isTipType = (value: unknown): value is "good" | "improve" =>
	value === "good" || value === "improve";

const hasAtsTips = (value: unknown): value is Feedback["ATS"]["tips"] =>
	Array.isArray(value) &&
	value.every(
		(tip) =>
			tip !== null &&
			typeof tip === "object" &&
			isTipType(Reflect.get(tip, "type")) &&
			typeof Reflect.get(tip, "tip") === "string",
	);

const hasDetailedTips = (value: unknown): value is Feedback["toneAndStyle"]["tips"] =>
	Array.isArray(value) &&
	value.every(
		(tip) =>
			tip !== null &&
			typeof tip === "object" &&
			isTipType(Reflect.get(tip, "type")) &&
			typeof Reflect.get(tip, "tip") === "string" &&
			typeof Reflect.get(tip, "explanation") === "string",
	);

const isCategory = (value: unknown, detailed: boolean): boolean =>
	value !== null &&
	typeof value === "object" &&
	isScore(Reflect.get(value, "score")) &&
	(detailed ? hasDetailedTips(Reflect.get(value, "tips")) : hasAtsTips(Reflect.get(value, "tips")));

export const isFeedback = (value: unknown): value is Feedback =>
	value !== null &&
	typeof value === "object" &&
	isScore(Reflect.get(value, "overallScore")) &&
	isCategory(Reflect.get(value, "ATS"), false) &&
	isCategory(Reflect.get(value, "toneAndStyle"), true) &&
	isCategory(Reflect.get(value, "content"), true) &&
	isCategory(Reflect.get(value, "structure"), true) &&
	isCategory(Reflect.get(value, "skills"), true);

export function parseFeedback(text: string): Feedback {
	const normalized = text
		.trim()
		.replace(/^```(?:json)?\s*/i, "")
		.replace(/\s*```$/, "");
	const parsed: unknown = JSON.parse(normalized);

	if (!isFeedback(parsed)) {
		throw new Error("The analyzer returned feedback in an unexpected format. Please try again.");
	}

	return parsed;
}
