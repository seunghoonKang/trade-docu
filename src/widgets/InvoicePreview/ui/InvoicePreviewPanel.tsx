import { useEffect, useRef, useState } from "react";
import type { Invoice } from "@/entities/invoice/model";
import { InvoicePreview } from "./InvoicePreview";

const PAPER_WIDTH_PX = 794;
const PAPER_MIN_HEIGHT_PX = 1123;
const PANEL_PADDING_PX = 64;

type PreviewData = Omit<Invoice, "id" | "userId" | "createdAt">;

export function InvoicePreviewPanel({ data }: { data: PreviewData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [paperHeight, setPaperHeight] = useState(PAPER_MIN_HEIGHT_PX);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateScale = () => {
      const available = node.clientWidth - PANEL_PADDING_PX;
      if (available <= 0) return;
      setScale(Math.min(1, available / PAPER_WIDTH_PX));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = paperRef.current;
    if (!node) return;

    const updateHeight = () => setPaperHeight(node.offsetHeight);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, [data]);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full justify-center overflow-y-auto overflow-x-hidden p-8"
    >
      <div
        className="shrink-0"
        style={{
          width: PAPER_WIDTH_PX * scale,
          height: paperHeight * scale,
        }}
      >
        <div
          ref={paperRef}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: PAPER_WIDTH_PX,
          }}
        >
          <InvoicePreview data={data} />
        </div>
      </div>
    </div>
  );
}
