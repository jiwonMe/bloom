import React, { useEffect, useRef, useState } from "react";
import type { Diagram } from "@penrose/bloom";
import { cn } from "@/lib/utils";

interface BloomRendererProps {
  diagram: Diagram | null;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Bloom 다이어그램 렌더링 전용 컴포넌트
 * 다이어그램 객체를 받아서 DOM에 렌더링하는 역할만 담당
 * SVG 복사 기능 포함
 */
const BloomRenderer: React.FC<BloomRendererProps> = ({ 
  diagram, 
  className,
  width = 400,
  height = 400 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copyFeedback, setCopyFeedback] = useState<string>("");

  useEffect(() => {
    if (!containerRef.current || !diagram) return;

    // 기존 내용을 지우고 새로운 다이어그램 추가
    containerRef.current.innerHTML = '';
    
    try {
      const interactiveElement = diagram.getInteractiveElement();
      containerRef.current.appendChild(interactiveElement);
    } catch (error) {
      console.error("BloomRenderer: 다이어그램 렌더링 실패", error);
    }
  }, [diagram]);

  // SVG 복사 함수
  const copySvgToClipboard = async () => {
    if (!containerRef.current) return;

    // SVG 요소 찾기
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) {
      setCopyFeedback("SVG를 찾을 수 없습니다");
      setTimeout(() => setCopyFeedback(""), 2000);
      return;
    }

    try {
      // SVG를 문자열로 변환
      const svgString = new XMLSerializer().serializeToString(svgElement);
      
      // 클립보드에 복사
      await navigator.clipboard.writeText(svgString);
      
      // 성공 피드백
      setCopyFeedback("SVG가 복사되었습니다!");
      setTimeout(() => setCopyFeedback(""), 2000);
    } catch (error) {
      console.error("SVG 복사 실패:", error);
      setCopyFeedback("복사 실패");
      setTimeout(() => setCopyFeedback(""), 2000);
    }
  };

  return (
    <div className="relative">
      {/* SVG 복사 버튼 */}
      {diagram && (
        <button
          onClick={copySvgToClipboard}
          className={cn(
            // 위치 - 우측 상단
            "absolute top-2 right-2 z-10",
            // 버튼 스타일
            "px-3 py-1.5 text-sm",
            "bg-blue-500 hover:bg-blue-600",
            "text-white font-medium",
            "rounded-md shadow-sm",
            "transition-colors duration-200",
            // 포커스 스타일
            "focus:outline-none focus:ring-2",
            "focus:ring-blue-500 focus:ring-offset-2"
          )}
        >
          SVG 복사
        </button>
      )}

      {/* 복사 피드백 메시지 */}
      {copyFeedback && (
        <div className={cn(
          // 위치 - 중앙 상단
          "absolute top-2 left-1/2 -translate-x-1/2 z-20",
          // 스타일
          "px-4 py-2 text-sm",
          copyFeedback.includes("실패") || copyFeedback.includes("찾을 수 없") 
            ? "bg-red-100 text-red-700" 
            : "bg-green-100 text-green-700",
          "rounded-md shadow-md",
          "animate-fade-in-out"
        )}>
          {copyFeedback}
        </div>
      )}

      {/* 다이어그램 컨테이너 */}
      <div 
        ref={containerRef}
        className={cn(
          // 기본 스타일 - 중앙 정렬 컨테이너
          "w-full h-full",
          "flex items-center justify-center",
          // 다이어그램 표시 영역
          "border border-gray-200 rounded-lg",
          "bg-white shadow-sm",
          className
        )}
        style={{ minWidth: width, minHeight: height }}
      />
    </div>
  );
};

export default BloomRenderer;
