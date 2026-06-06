export const SIGNATURE_BUCKET = "signatures";
export const SIGNATURE_STORAGE_FILE = "signature.png";

export const SIGNATURE_MAX_INPUT_BYTES = 5 * 1024 * 1024;
export const SIGNATURE_MAX_DIMENSION = 800;
export const SIGNATURE_OUTPUT_TYPE = "image/png" as const;
export const SIGNATURE_MAX_OUTPUT_BYTES = 800 * 1024;
export const SIGNATURE_INPUT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type SignatureInputType = (typeof SIGNATURE_INPUT_TYPES)[number];

export function getSignatureStoragePath(userId: string): string {
  return `${userId}/${SIGNATURE_STORAGE_FILE}`;
}

export function getSignatureStoragePaths(userId: string): string[] {
  return [
    `${userId}/${SIGNATURE_STORAGE_FILE}`,
    `${userId}/signature.webp`,
  ];
}

export function validateSignatureInput(file: File): SignatureInputType | null {
  if (!SIGNATURE_INPUT_TYPES.includes(file.type as SignatureInputType)) return null;
  if (file.size > SIGNATURE_MAX_INPUT_BYTES) return null;
  return file.type as SignatureInputType;
}

function getTargetDimensions(width: number, height: number): { width: number; height: number } {
  if (width <= 0 || height <= 0) return { width: 0, height: 0 };
  const scale = Math.min(1, SIGNATURE_MAX_DIMENSION / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to encode signature"))),
      SIGNATURE_OUTPUT_TYPE,
    );
  });
}

async function loadImageSource(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    throw { code: "invalid_signature" };
  }
}

export async function prepareSignatureFile(file: File): Promise<File> {
  if (!validateSignatureInput(file)) {
    throw { code: "invalid_signature" };
  }

  const bitmap = await loadImageSource(file);
  const { width, height } = getTargetDimensions(bitmap.width, bitmap.height);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not supported");

  context.clearRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await canvasToBlob(canvas);
  if (blob.size > SIGNATURE_MAX_OUTPUT_BYTES) {
    throw { code: "invalid_signature" };
  }

  return new File([blob], SIGNATURE_STORAGE_FILE, { type: SIGNATURE_OUTPUT_TYPE });
}
