import { jsPDF } from "jspdf";
import { onCleanup, onMount } from "solid-js";
import html2canvas from "html2canvas";

const initPdf = () => new jsPDF("p", "px", "a4");

export function CaptureAsPdf() {
  onMount(() => {
    const doc = initPdf();
    document.getElementById("document")!.style.width = `${
      doc.internal.pageSize.width * 2
    }px`;
    document.getElementById("document")!.style.height = `${
      doc.internal.pageSize.height * 2
    }px`;
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
        pdf.internal.pageSize.getHeight()
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

  window.addEventListener("keydown", handler);
  onCleanup(() => window.removeEventListener("keydown", handler));

  return (
    <div class="p-4 flex space-x-2">
      <button
        class="bg-white hover:bg-gray-200 text-black font-bold py-2 px-4 rounded"
        onClick={() => generatePdf((pdf) => pdf.save("invoice.pdf"))}
      >
        Save
      </button>
      <button
        class="bg-white hover:bg-gray-200 text-black font-bold py-2 px-4 rounded"
        onClick={() =>
          generatePdf((pdf) => window.open(pdf.output("bloburl"), "_blank"))
        }
      >
        Preview
      </button>
    </div>
  );
}
