import { cn } from "@/shared/lib/utils";

interface KineticTitleProps {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
}

/**
 * 단어 단위 스태거 타이틀 — 마운트 시 단어가 차례로 떠올라 정착한다.
 * 애니메이션은 .kinetic-title CSS(prefers-reduced-motion 가드 포함)가 담당.
 * 단어 사이 공백은 inline-block에서 잘리지 않도록 NBSP로 span 안에 넣는다.
 */
export function KineticTitle({ text, as: Tag = "h2", className }: KineticTitleProps) {
  const words = text.split(" ");
  return (
    <Tag className={cn("kinetic-title", className)}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} style={{ "--word-index": i } as React.CSSProperties}>
          {word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </Tag>
  );
}
