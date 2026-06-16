import { reconstructTable, type PositionedText } from "./reconstructTable";

/**
 * 스캔(텍스트 레이어 없는) 페이지용 OCR 폴백.
 *
 * `@paddlejs-models/ocr`(PaddleJS, 브라우저 PP-OCR)를 **동적 import**로 lazy 로드한다 —
 * 메인 번들·디지털 경로엔 영향 없음. 모델 가중치도 첫 호출 때만 받는다.
 *
 * 한계(plan에서 합의): 기본 모델은 중/영/숫자 인식 — **한글은 미지원**.
 * 무역서류는 대부분 영문·숫자라 폴백으론 충분하고, 오차는 리뷰 그리드에서 교정한다.
 */

type OcrModule = {
  init: () => Promise<void>;
  recognize: (
    img: HTMLImageElement,
    option?: { canvas?: HTMLCanvasElement },
  ) => Promise<{ text: string[]; points: number[][][] }>;
};

let ready: Promise<OcrModule> | null = null;

async function getOcr(): Promise<OcrModule> {
  if (!ready) {
    ready = import("@paddlejs-models/ocr").then(async (mod) => {
      const ocr = mod as unknown as OcrModule;
      await ocr.init();
      return ocr;
    });
  }
  return ready;
}

/** PaddleJS 입력은 HTMLImageElement가 가장 안전 — 캔버스를 이미지로 변환해 넘긴다. */
function canvasToImage(canvas: HTMLCanvasElement): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("ocr_image_decode_failed"));
    img.src = canvas.toDataURL("image/png");
  });
}

/** points[i]의 코너 좌표들 → 바운딩 박스. 형태가 어긋나면 null. */
function boxFromPoints(points: number[][] | undefined): {
  x: number;
  y: number;
  width: number;
  height: number;
} | null {
  if (!points || points.length === 0) return null;
  const xs = points.map((p) => p?.[0]).filter((v): v is number => typeof v === "number");
  const ys = points.map((p) => p?.[1]).filter((v): v is number => typeof v === "number");
  if (xs.length === 0 || ys.length === 0) return null;
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
}

export async function ocrCanvasToRows(canvas: HTMLCanvasElement): Promise<string[][]> {
  const ocr = await getOcr();
  const img = await canvasToImage(canvas);
  const res = await ocr.recognize(img);

  const texts = Array.isArray(res?.text) ? res.text : [];
  if (texts.length === 0) return [];

  const items: PositionedText[] = [];
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    if (!text || !text.trim()) continue;
    const box = boxFromPoints(res.points?.[i]);
    if (box) {
      items.push({ text, ...box });
    } else {
      // 좌표가 없으면 한 줄에 하나씩 세로로 쌓이도록 단조 증가 y 부여.
      items.push({ text, x: 0, y: i * 12, width: text.length * 6, height: 10 });
    }
  }
  return reconstructTable(items);
}
