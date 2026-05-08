import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import type { Invoice } from "@/entities/invoice/model";

type FormData = Omit<Invoice, "id" | "userId" | "createdAt">;

export async function generatePdf(data: FormData) {
  const element = document.getElementById("invoice-preview");
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");
  const imgWidth = 210;
  const pageHeight = 297;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF("p", "mm", "a4");
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  const filename = `PI_${data.invoiceNo || "draft"}_${data.date || "undated"}.pdf`;
  pdf.save(filename);
}
