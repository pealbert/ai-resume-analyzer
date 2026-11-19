import { describe, expect, it } from "vite-plus/test";

import { parseFeedback } from "./feedback";

const validFeedback = {
	overallScore: 82,
	ATS: { score: 78, tips: [{ type: "good", tip: "Clear headings" }] },
	toneAndStyle: { score: 80, tips: [] },
	content: { score: 84, tips: [] },
	structure: { score: 86, tips: [] },
	skills: { score: 82, tips: [] },
};

describe("parseFeedback", () => {
	it("accepts a valid analyzer response", () => {
		expect(parseFeedback(JSON.stringify(validFeedback))).toEqual(validFeedback);
	});

	it("accepts JSON wrapped in a markdown code fence", () => {
		expect(parseFeedback(`\`\`\`json\n${JSON.stringify(validFeedback)}\n\`\`\``)).toEqual(
			validFeedback,
		);
	});

	it("rejects out-of-range or incomplete feedback", () => {
		expect(() => parseFeedback(JSON.stringify({ ...validFeedback, overallScore: 120 }))).toThrow(
			"unexpected format",
		);
	});
});
