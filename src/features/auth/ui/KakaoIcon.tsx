import { cn } from "@/shared/lib/utils";

interface KakaoIconProps {
  className?: string;
}

/** Official Kakao Talk bubble mark (Kakao brand asset shape). */
export function KakaoIcon({ className }: KakaoIconProps) {
  return (
    <svg className={cn("size-5", className)} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3C6.477 3 2 6.48 2 10.791c0 2.758 1.817 5.177 4.545 6.536l-1.15 4.218c-.066.244.17.452.385.31l4.964-3.26c.41.056.83.087 1.256.087 5.523 0 10-3.48 10-7.791S17.523 3 12 3z" />
    </svg>
  );
}
