export const AVATAR_MAX_INPUT_BYTES = 10 * 1024 * 1024;
export const AVATAR_MAX_DIMENSION = 384;
export const AVATAR_OUTPUT_TYPE = "image/webp" as const;
export const AVATAR_OUTPUT_QUALITY = 0.82;
export const AVATAR_MAX_OUTPUT_BYTES = 300 * 1024;
export const AVATAR_INPUT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type AvatarInputType = (typeof AVATAR_INPUT_TYPES)[number];

export function getAvatarTargetDimensions(
  width: number,
  height: number,
  maxDimension = AVATAR_MAX_DIMENSION,
): { width: number; height: number } {
  if (width <= 0 || height <= 0) {
    return { width: 0, height: 0 };
  }
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export function validateAvatarInput(file: File): AvatarInputType | null {
  if (!AVATAR_INPUT_TYPES.includes(file.type as AvatarInputType)) return null;
  if (file.size > AVATAR_MAX_INPUT_BYTES) return null;
  return file.type as AvatarInputType;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to encode avatar"))),
      type,
      quality,
    );
  });
}

async function loadImageSource(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    throw { code: "invalid_avatar" };
  }
}

export async function prepareAvatarFile(file: File): Promise<File> {
  if (!validateAvatarInput(file)) {
    throw { code: "invalid_avatar" };
  }

  const bitmap = await loadImageSource(file);
  const { width, height } = getAvatarTargetDimensions(bitmap.width, bitmap.height);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not supported");

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = AVATAR_OUTPUT_QUALITY;
  let blob = await canvasToBlob(canvas, AVATAR_OUTPUT_TYPE, quality);

  while (blob.size > AVATAR_MAX_OUTPUT_BYTES && quality > 0.5) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, AVATAR_OUTPUT_TYPE, quality);
  }

  return new File([blob], "avatar.webp", { type: AVATAR_OUTPUT_TYPE });
}
