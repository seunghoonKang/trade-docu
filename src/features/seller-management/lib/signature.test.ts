import { describe, it, expect } from "vitest";
import { validateSignatureInput } from "./signature";

describe("validateSignatureInput", () => {
  it("accepts png within size limit", () => {
    const file = new File([new Uint8Array(100)], "seal.png", { type: "image/png" });
    expect(validateSignatureInput(file)).toBe("image/png");
  });

  it("rejects unsupported types", () => {
    const file = new File([new Uint8Array(100)], "doc.pdf", { type: "application/pdf" });
    expect(validateSignatureInput(file)).toBeNull();
  });

  it("rejects oversized files", () => {
    const file = new File([new Uint8Array(6 * 1024 * 1024)], "big.png", { type: "image/png" });
    expect(validateSignatureInput(file)).toBeNull();
  });
});
