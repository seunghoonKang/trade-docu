/** 한 PDF 페이지에서 뽑아낸 표 한 장 — Excel 시트 하나에 대응한다(plan: 페이지=시트). */
export interface ExtractedPage {
  /** Excel 시트명 + 리뷰 탭 라벨. */
  sheetName: string;
  /** 행×열 격자. 빈 칸은 "". */
  rows: string[][];
  /** 어느 경로로 뽑았는지 — UI 배지/안내에 사용. */
  source: "text" | "ocr" | "empty";
}

/** 추출 진행 상태 — 업로드 후 페이지별 진행률 표시에 사용. */
export interface ExtractProgress {
  page: number;
  total: number;
  /** text=디지털 추출, ocr=스캔 폴백(모델 로드/추론 중). */
  phase: "text" | "ocr";
}
