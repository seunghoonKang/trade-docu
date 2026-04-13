import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { Invoice } from "../../entities/invoice/model";

type FormData = Omit<Invoice, "id" | "userId" | "createdAt">;

function resolveOklchColors(element: HTMLElement) {
  const all = [element, ...Array.from(element.querySelectorAll("*"))] as HTMLElement[];
  const overrides: { el: HTMLElement; prop: string; original: string }[] = [];

  for (const el of all) {
    const computed = getComputedStyle(el);
    for (const prop of ["color", "background-color", "border-color", "border-top-color", "border-bottom-color", "border-left-color", "border-right-color"]) {
      const value = computed.getPropertyValue(prop);
      if (value.includes("oklch")) {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = value;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        const rgb = a < 255 ? `rgba(${r},${g},${b},${(a / 255).toFixed(2)})` : `rgb(${r},${g},${b})`;
        const camelProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        overrides.push({ el, prop: camelProp, original: el.style[camelProp as any] });
        (el.style as any)[camelProp] = rgb;
      }
    }
  }

  return () => {
    for (const { el, prop, original } of overrides) {
      (el.style as any)[prop] = original;
    }
  };
}

export async function generatePdf(data: FormData) {
  const element = document.getElementById("invoice-preview");
  if (!element) return;

  const restore = resolveOklchColors(element);

  try {
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
  } finally {
    restore();
  }
}
