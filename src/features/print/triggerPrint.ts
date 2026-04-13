export function triggerPrint() {
  const element = document.getElementById("invoice-preview");
  if (!element) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const styles = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join("\n");
      } catch {
        return "";
      }
    })
    .join("\n");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print Invoice</title>
      <style>${styles}</style>
      <style>
        body { margin: 0; padding: 24px; background: white; font-family: "Noto Sans KR", sans-serif; }
      </style>
    </head>
    <body>${element.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
}
