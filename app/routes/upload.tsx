import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router";

import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";

import { prepareInstructions } from "../../constants";

const Upload = () => {
	const { fs, ai, kv } = usePuterStore();
	const [isProcessing, setIsProcessing] = useState(false);
	const [statusText, setStatusText] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const navigate = useNavigate();

	const handleFileSelect = (file: File | null) => {
		setFile(file);
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

		try {
			setStatusText("Uploading the file...");
			const uploadedFile = await fs.upload([file]);
			if (!uploadedFile) {
				setStatusText("Error: Failed to upload file");
				return;
			}

			setStatusText("Converting to image...");
			const imageFile = await convertPdfToImage(file);
			if (!imageFile.file) {
				setStatusText(`Error: ${imageFile.error ?? "Failed to convert PDF to image"}`);
				return;
			}

			setStatusText("Uploading the image...");
			const uploadedImage = await fs.upload([imageFile.file]);
			if (!uploadedImage) {
				setStatusText("Error: Failed to upload image");
				return;
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
				setStatusText("Error: Failed to analyze resume");
				return;
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
				setStatusText("Error: The analyzer returned an invalid response");
				return;
			}

			data.feedback = JSON.parse(feedbackText) as Feedback;
			await kv.set(`resume:${uuid}`, JSON.stringify(data));

			setStatusText("Analysis complete, redirecting...");
			void navigate(`/resume/${uuid}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unexpected error";
			setStatusText(`Error: ${message}`);
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

		if (!file) return;
		void handleAnalyze({ companyName, jobTitle, jobDescription, file });
	};

	return (
		<main className="overflow-x-hidden bg-[url('/images/bg-main.svg')] bg-cover bg-center bg-no-repeat">
			<Navbar />

			<section className="main-section pb-10 sm:pb-14 lg:pb-20">
				<div className="page-heading max-w-5xl py-8 sm:py-12 lg:py-16">
					<h1>Smart feedback for your dream job</h1>
					{isProcessing ? (
						<>
							<h2>{statusText}</h2>
							<img src="/images/resume-scan.gif" alt="" className="h-auto w-full max-w-4xl" />
						</>
					) : (
						<h2>Drop your resume for an ATS score and improvement tips</h2>
					)}
					{!isProcessing && (
						<form
							id="upload-form"
							onSubmit={handleSubmit}
							className="mt-4 w-full max-w-3xl gap-5 rounded-3xl border border-white/70 bg-white/55 p-4 text-left shadow-xl shadow-blue-200/30 backdrop-blur-sm sm:mt-6 sm:gap-6 sm:p-6 lg:mt-8 lg:p-8"
						>
							<div className="grid w-full min-w-0 grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
								<div className="form-div min-w-0">
									<label htmlFor="company-name">Company Name</label>
									<input
										type="text"
										name="company-name"
										id="company-name"
										placeholder="Company Name"
									/>
								</div>
								<div className="form-div min-w-0">
									<label htmlFor="job-title">Job Title</label>
									<input type="text" name="job-title" id="job-title" placeholder="Job Title" />
								</div>
							</div>
							<div className="form-div">
								<label htmlFor="job-description">Job Description</label>
								<textarea
									rows={5}
									name="job-description"
									id="job-description"
									placeholder="Job Description"
									className="min-h-32 resize-y"
								/>
							</div>
							<div className="form-div">
								<label htmlFor="uploader">Upload Resume</label>
								<FileUploader onFileSelect={handleFileSelect} />
							</div>

							<button type="submit" className="primary-button min-h-11 sm:min-h-12">
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
