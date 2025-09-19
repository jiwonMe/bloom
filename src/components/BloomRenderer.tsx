import React, { useEffect, useRef } from "react";
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
 */
const BloomRenderer: React.FC<BloomRendererProps> = ({ 
  diagram, 
  className,
  width = 400,
  height = 400 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
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
  );
};

export default BloomRenderer;
