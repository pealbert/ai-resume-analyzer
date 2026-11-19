import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

export interface PdfConversionResult {
	file: File | null;
	error?: string;
}

type PdfJs = typeof import("pdfjs-dist");

let pdfjsLib: PdfJs | null = null;
let loadPromise: Promise<PdfJs> | null = null;

async function loadPdfJs(): Promise<PdfJs> {
	if (pdfjsLib) return pdfjsLib;
	if (loadPromise) return loadPromise;

	loadPromise = import("pdfjs-dist").then((lib) => {
		lib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
		pdfjsLib = lib;
		return lib;
	});

	return loadPromise;
}

export async function convertPdfToImage(file: File): Promise<PdfConversionResult> {
	try {
		const lib = await loadPdfJs();

		const arrayBuffer = await file.arrayBuffer();
		const loadingTask = lib.getDocument({ data: arrayBuffer });
		const pdf = await loadingTask.promise;
		const page = await pdf.getPage(1);

		const baseViewport = page.getViewport({ scale: 1 });
		const longestSide = Math.max(baseViewport.width, baseViewport.height);
		const scale = Math.min(2, 1800 / longestSide);
		const viewport = page.getViewport({ scale });
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");

		canvas.width = viewport.width;
		canvas.height = viewport.height;

		if (!context) {
			return {
				file: null,
				error: "Failed to create a canvas rendering context",
			};
		}

		context.imageSmoothingEnabled = true;
		context.imageSmoothingQuality = "high";

		await page.render({ canvas, canvasContext: context, viewport }).promise;

		const result = await new Promise<PdfConversionResult>((resolve) => {
			canvas.toBlob(
				(blob) => {
					if (blob) {
						// Create a File from the blob with the same name as the pdf
						const originalName = file.name.replace(/\.pdf$/i, "");
						const imageFile = new File([blob], `${originalName}.png`, {
							type: "image/png",
						});

						resolve({
							file: imageFile,
						});
					} else {
						resolve({
							file: null,
							error: "Failed to create image blob",
						});
					}
				},
				"image/png",
				1,
			);
		});

		await loadingTask.destroy();
		return result;
	} catch (err) {
		return {
			file: null,
			error: `Failed to convert PDF: ${err instanceof Error ? err.message : String(err)}`,
		};
	}
}
