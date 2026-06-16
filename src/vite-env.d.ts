/// <reference types="vite/client" />

declare module "*.ttf" {
  const src: string;
  export default src;
}

// @paddlejs-models/ocr 는 타입 선언을 제공하지 않는다(브라우저 PP-OCR).
// 실제 사용처(ocrFallback.ts)에서 좁은 인터페이스로 캐스팅해 쓴다.
declare module "@paddlejs-models/ocr";
