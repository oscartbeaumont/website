import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { onCleanup, onMount } from "solid-js";
import { isServer } from "solid-js/web";

const initPdf = () => new jsPDF("p", "px", "a4");

export const defaultDocumentStyles = (() => {
	const doc = initPdf();

	return {
		width: `${doc.internal.pageSize.width * 2}px`,
		height: `${doc.internal.pageSize.height * 2}px`,
	};
})();

export function CaptureAsPdf() {
	onMount(() => {
		if (isServer) return;

		// Keyboard handler
		window.addEventListener("keydown", handler);
		onCleanup(() => window.removeEventListener("keydown", handler));
	});

	const generatePdf = (callback: (pdf: any) => void) => {
		const doc = document.getElementById("document");
		if (!doc) throw new Error("Element with 'id=document' not found");

		html2canvas(doc, {
			scale: 10,
		}).then((canvas) => {
			const imgData = canvas.toDataURL("image/jpeg", 1.0);
			const pdf = initPdf();
			pdf.setDocumentProperties({
				title: "Invoice",
				author: "Oscar Beaumont",
			});
			pdf.addImage(
				imgData,
				"JPEG",
				0,
				0,
				pdf.internal.pageSize.getWidth(),
				pdf.internal.pageSize.getHeight(),
			);
			callback(pdf);
		});
	};

	const handler = (e: KeyboardEvent) => {
		if ((e.metaKey || e.ctrlKey) && e.key === "s") {
			e.preventDefault();
			generatePdf((pdf) => pdf.save("invoice.pdf"));
		}
	};

	return (
		<div class="p-4 flex space-x-2">
			<button
				type="button"
				class="bg-white hover:bg-gray-200 text-black font-bold py-2 px-4 rounded"
				onClick={() => generatePdf((pdf) => pdf.save("invoice.pdf"))}
			>
				Save
			</button>
			<button
				type="button"
				class="bg-white hover:bg-gray-200 text-black font-bold py-2 px-4 rounded"
				onClick={() =>
					generatePdf((pdf) => window.open(pdf.output("bloburl"), "_blank"))
				}
			>
				Preview
			</button>
			t
		</div>
	);
}
