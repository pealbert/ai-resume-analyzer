import { useEffect, useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router";

import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { parseFeedback } from "~/lib/feedback";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";

import { prepareInstructions } from "../../constants";

const Upload = () => {
	const { auth, isLoading, puterReady, fs, ai, kv } = usePuterStore();
	const [isProcessing, setIsProcessing] = useState(false);
	const [statusText, setStatusText] = useState("");
	const [errorText, setErrorText] = useState("");
	const [fileError, setFileError] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		if (puterReady && !isLoading && !auth.isAuthenticated) {
			void navigate("/auth?next=/upload", { replace: true });
		}
	}, [auth.isAuthenticated, isLoading, navigate, puterReady]);

	const handleFileSelect = (file: File | null) => {
		setFile(file);
		if (file) setFileError("");
	};

	const handleAnalyze = async ({
		companyName,
		jobTitle,
		jobDescription,
		file,
	}: {
		companyName: string;
		jobTitle: string;
		jobDescription: string;
		file: File;
	}) => {
		setIsProcessing(true);
		setErrorText("");

		try {
			setStatusText("Uploading the file...");
			const uploadedFile = await fs.upload([file]);
			if (!uploadedFile) {
				throw new Error("Failed to upload the PDF. Please try again.");
			}

			setStatusText("Converting to image...");
			const imageFile = await convertPdfToImage(file);
			if (!imageFile.file) {
				throw new Error(imageFile.error ?? "Failed to prepare the PDF preview.");
			}

			setStatusText("Uploading the image...");
			const uploadedImage = await fs.upload([imageFile.file]);
			if (!uploadedImage) {
				throw new Error("Failed to upload the PDF preview. Please try again.");
			}

			setStatusText("Preparing data...");
			const uuid = generateUUID();
			const data = {
				id: uuid,
				resumePath: uploadedFile.path,
				imagePath: uploadedImage.path,
				companyName,
				jobTitle,
				jobDescription,
				feedback: null as Feedback | null,
			};

			setStatusText("Analyzing...");
			const response = await ai.feedback(
				uploadedFile.path,
				prepareInstructions({ jobTitle, jobDescription }),
			);
			if (!response) {
				throw new Error("The analyzer did not return a response. Please try again.");
			}

			const { content } = response.message;
			const firstContent = Array.isArray(content) ? content[0] : undefined;
			const feedbackText =
				typeof content === "string"
					? content
					: typeof firstContent === "object" &&
						  firstContent !== null &&
						  "text" in firstContent &&
						  typeof firstContent.text === "string"
						? firstContent.text
						: null;

			if (!feedbackText) {
				throw new Error("The analyzer returned an empty response. Please try again.");
			}

			data.feedback = parseFeedback(feedbackText);
			const saved = await kv.set(`resume:${uuid}`, JSON.stringify(data));
			if (!saved) throw new Error("The analysis could not be saved. Please try again.");

			setStatusText("Analysis complete, redirecting...");
			void navigate(`/resume/${uuid}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unexpected error";
			setErrorText(message);
			setStatusText("");
		} finally {
			setIsProcessing(false);
		}
	};

	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);

		const companyNameValue = formData.get("company-name");
		const jobTitleValue = formData.get("job-title");
		const jobDescriptionValue = formData.get("job-description");
		const companyName = typeof companyNameValue === "string" ? companyNameValue : "";
		const jobTitle = typeof jobTitleValue === "string" ? jobTitleValue : "";
		const jobDescription = typeof jobDescriptionValue === "string" ? jobDescriptionValue : "";

		if (!file) {
			setFileError("Choose a PDF resume before starting the analysis.");
			return;
		}
		void handleAnalyze({ companyName, jobTitle, jobDescription, file });
	};

	return (
		<main className="overflow-x-hidden bg-[url('/images/bg-main.svg')] bg-cover bg-center bg-no-repeat">
			<Navbar />

			<section className="main-section pb-10 sm:pb-14 lg:pb-20" aria-busy={isProcessing}>
				<div className="page-heading max-w-5xl py-8 sm:py-12 lg:py-16">
					<h1>Smart feedback for your dream job</h1>
					{isProcessing ? (
						<div
							role="status"
							aria-live="polite"
							className="flex w-full flex-col items-center gap-4"
						>
							<h2>{statusText}</h2>
							<img
								src="/images/resume-scan.gif"
								alt=""
								className="aspect-video h-auto w-full max-w-4xl object-contain"
							/>
						</div>
					) : (
						<h2>Drop your resume for an ATS score and improvement tips</h2>
					)}
					{!isProcessing && errorText ? (
						<div
							role="alert"
							className="w-full max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-left text-red-800"
						>
							<p className="font-semibold">Analysis could not be completed</p>
							<p className="mt-1 text-sm">{errorText}</p>
						</div>
					) : null}
					{!isProcessing && (
						<form
							id="upload-form"
							onSubmit={handleSubmit}
							className="mt-4 w-full max-w-3xl gap-5 rounded-3xl border border-white/70 bg-white/55 p-4 text-left shadow-xl shadow-blue-200/30 backdrop-blur-sm sm:mt-6 sm:gap-6 sm:p-6 lg:mt-8 lg:p-8"
						>
							<div className="grid w-full min-w-0 grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
								<div className="form-div min-w-0">
									<label htmlFor="company-name">Company name (optional)</label>
									<input
										type="text"
										name="company-name"
										id="company-name"
										autoComplete="organization"
										placeholder="Acme"
										maxLength={120}
									/>
								</div>
								<div className="form-div min-w-0">
									<label htmlFor="job-title">Job title (optional)</label>
									<input
										type="text"
										name="job-title"
										id="job-title"
										autoComplete="organization-title"
										placeholder="Frontend developer"
										maxLength={120}
									/>
								</div>
							</div>
							<div className="form-div">
								<label htmlFor="job-description">Job description (optional)</label>
								<textarea
									rows={5}
									name="job-description"
									id="job-description"
									placeholder="Paste the role requirements for more tailored feedback"
									maxLength={12_000}
									className="min-h-32 resize-y"
								/>
							</div>
							<div className="form-div">
								<label htmlFor="uploader">Upload Resume</label>
								<FileUploader
									onFileSelect={handleFileSelect}
									onFileError={setFileError}
									error={fileError}
								/>
							</div>

							<button type="submit" className="primary-button min-h-12">
								Analyze Resume
							</button>
						</form>
					)}
				</div>
			</section>
		</main>
	);
};

export default Upload;
