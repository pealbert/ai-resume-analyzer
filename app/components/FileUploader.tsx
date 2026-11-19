import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import { formatSize } from "~/lib/utils";

interface FileUploaderProps {
	onFileSelect?: (file: File | null) => void;
	onFileError?: (message: string) => void;
	error?: string;
}

const FileUploader = ({ onFileSelect, onFileError, error }: FileUploaderProps) => {
	const [file, setFile] = useState<File | null>(null);

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			const selectedFile = acceptedFiles[0] || null;

			setFile(selectedFile);
			onFileSelect?.(selectedFile);
			onFileError?.("");
		},
		[onFileError, onFileSelect],
	);
	const { getRootProps, getInputProps, inputRef } = useDropzone({
		onDrop,
		onDropRejected: (rejections) => {
			const code = rejections[0]?.errors[0]?.code;
			const message =
				code === "file-too-large"
					? "The PDF must be 20 MB or smaller."
					: "Choose a valid PDF file.";
			setFile(null);
			onFileSelect?.(null);
			onFileError?.(message);
		},
		multiple: false,
		accept: { "application/pdf": [".pdf"] },
		maxSize: 20 * 1024 * 1024,
	});

	const handleRemove = () => {
		setFile(null);
		onFileSelect?.(null);

		if (inputRef.current) {
			inputRef.current.value = "";
		}
	};

	return (
		<div className="gradient-border w-full">
			<div
				{...getRootProps({
					className:
						"min-w-0 rounded-xl focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-600",
					"aria-describedby": error ? "uploader-help uploader-error" : "uploader-help",
					"aria-invalid": error ? "true" : "false",
					"aria-label": "Choose a PDF resume or drag and drop it here",
				})}
			>
				<input {...getInputProps({ id: "uploader", name: "resume" })} />

				<div className="cursor-pointer space-y-4">
					{file ? (
						<div
							className="uploader-selected-file min-w-0 gap-3"
							onClick={(e) => e.stopPropagation()}
						>
							<img src="/images/pdf.png" alt="" className="size-9 shrink-0 sm:size-10" />
							<div className="min-w-0 flex-1">
								<div className="min-w-0">
									<p className="truncate text-sm font-medium text-gray-700">{file.name}</p>
									<p className="text-sm text-gray-500">{formatSize(file.size)}</p>
								</div>
							</div>

							<button
								type="button"
								className="shrink-0 cursor-pointer rounded-full p-2 hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
								onClick={handleRemove}
								aria-label="Remove selected file"
							>
								<img src="/icons/cross.svg" alt="" className="size-4" />
							</button>
						</div>
					) : (
						<div className="px-2 py-3 text-center sm:px-4 sm:py-5">
							<div className="mx-auto mb-2 flex size-16 items-center justify-center">
								<img src="/icons/info.svg" alt="" className="size-14 sm:size-16" />
							</div>
							<p className="text-base text-gray-500 sm:text-lg">
								<span className="font-semibold">Click to upload</span> or drag and drop
							</p>
							<p className="text-sm text-gray-500 sm:text-base">PDF (max 20MB)</p>
						</div>
					)}
				</div>
			</div>
			<p id="uploader-help" className="mt-2 px-1 text-sm text-gray-600">
				PDF only, up to 20 MB.
			</p>
			{error ? (
				<p id="uploader-error" role="alert" className="mt-1 px-1 text-sm font-medium text-red-700">
					{error}
				</p>
			) : null}
		</div>
	);
};

export default FileUploader;
