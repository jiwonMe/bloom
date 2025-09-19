import React, { useCallback } from "react";
import { useDiagram } from "@/hooks/useDiagram";
import BloomRenderer from "@/components/BloomRenderer";
import { createArrowDiagram } from "@/diagrams/arrowDiagram";
import { cn } from "@/lib/utils";

const BloomDiagram: React.FC = () => {
  // useDiagram 훅을 사용하여 다이어그램 생성
  // useCallback으로 함수를 메모이제이션하여 불필요한 재생성 방지
  const diagram = useDiagram(
    useCallback(() => createArrowDiagram(), [])
  );

  return (
    <div 
      className={cn(
        // 컨테이너 레이아웃
        "w-full h-full",
        "flex flex-col items-center justify-center",
        // 배경 및 패딩
        "bg-gray-50 p-4"
      )}
    >
      {/* 다이어그램 제목 */}
      <h2 className={cn(
        // 제목 스타일
        "text-2xl font-bold text-gray-800 mb-4",
        // 타이포그래피
        "tracking-tight"
      )}>
        Bloom 다이어그램 예제
      </h2>
      
      {/* 다이어그램 렌더러 */}
      <BloomRenderer 
        diagram={diagram}
        className={cn(
          // 렌더러 컨테이너 스타일
          "border-2 border-blue-200",
          "rounded-xl shadow-lg",
          // 호버 효과
          "hover:shadow-xl transition-shadow duration-200"
        )}
        width={200}
        height={200}
      />
      
      {/* 로딩 상태 표시 */}
      {!diagram && (
        <p className={cn(
          // 로딩 텍스트 스타일
          "text-gray-500 text-sm mt-2",
          // 애니메이션
          "animate-pulse"
        )}>
          다이어그램을 생성하는 중...
        </p>
      )}
    </div>
  );
};

export default BloomDiagram;