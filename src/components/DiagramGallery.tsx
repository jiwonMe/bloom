import React, { useCallback, useState } from "react";
import { useDiagram } from "@/hooks/useDiagram";
import BloomRenderer from "@/components/BloomRenderer";
import { createArrowDiagram } from "@/diagrams/arrowDiagram";
import { createCircleDiagram } from "@/diagrams/circleDiagram";
import { createEigenDiagram } from "@/diagrams/eigenDiagram";
import { createGeometryDiagram } from "@/diagrams/geometryDiagram";
import { cn } from "@/lib/utils";

// 다이어그램 타입 정의
type DiagramType = "arrow" | "circle" | "eigen" | "geometry";

interface DiagramConfig {
  id: DiagramType;
  title: string;
  description: string;
  buildFunction: () => Promise<any>;
}

/**
 * 여러 다이어그램을 보여주는 갤러리 컴포넌트
 * useDiagram 훅과 BloomRenderer 컴포넌트의 재사용성을 시연
 */
const DiagramGallery: React.FC = () => {
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramType>("geometry");
  const [fontSize, setFontSize] = useState<number>(12);

  // 다이어그램 설정 배열
  const diagrams: DiagramConfig[] = [
    {
      id: "arrow",
      title: "화살표 다이어그램",
      description: "두 점을 화살표로 연결한 기본 그래프 구조",
      buildFunction: createArrowDiagram,
    },
    {
      id: "circle",
      title: "원형 배치 다이어그램", 
      description: "중심 원 주위에 위성 원들이 배치된 구조",
      buildFunction: createCircleDiagram,
    },
    {
      id: "eigen",
      title: "고유벡터 다이어그램",
      description: "선형 변환의 고유벡터와 고유공간을 시각화",
      buildFunction: createEigenDiagram,
    },
    {
      id: "geometry",
      title: "기하학 다이어그램",
      description: "원과 현, 반지름, 수직이등분선을 포함한 복잡한 기하학적 구조",
      buildFunction: createGeometryDiagram,
    },
  ];

  // 현재 선택된 다이어그램 설정
  const currentConfig = diagrams.find(d => d.id === selectedDiagram)!;

  // useDiagram 훅 사용 - 선택된 다이어그램에 따라 동적으로 변경
  const diagram = useDiagram(
    useCallback(() => {
      // geometry 다이어그램의 경우 fontSize 파라미터 전달
      if (selectedDiagram === "geometry") {
        return createGeometryDiagram(fontSize);
      }
      return currentConfig.buildFunction();
    }, [selectedDiagram, fontSize])
  );

  return (
    <div className={cn(
      // 전체 컨테이너
      "w-full min-h-screen",
      "bg-gradient-to-br from-blue-50 to-indigo-100",
      "p-6"
    )}>
      {/* 헤더 섹션 */}
      <div className={cn(
        // 헤더 레이아웃
        "text-center mb-8"
      )}>
        <h1 className={cn(
          // 메인 제목
          "text-4xl font-bold text-gray-900 mb-2",
          "tracking-tight"
        )}>
          Bloom 다이어그램 갤러리
        </h1>
        <p className={cn(
          // 부제목
          "text-lg text-gray-600",
          "max-w-2xl mx-auto"
        )}>
          useDiagram 훅과 BloomRenderer 컴포넌트를 활용한 재사용 가능한 다이어그램 시스템
        </p>
      </div>

      {/* 다이어그램 선택 탭 */}
      <div className={cn(
        // 탭 컨테이너
        "flex justify-center mb-8"
      )}>
        <div className={cn(
          // 탭 그룹 스타일
          "flex bg-white rounded-lg shadow-md p-1",
          "border border-gray-200"
        )}>
          {diagrams.map((config) => (
            <button
              key={config.id}
              onClick={() => setSelectedDiagram(config.id)}
              className={cn(
                // 기본 탭 스타일
                "px-6 py-3 rounded-md font-medium transition-all duration-200",
                "text-sm",
                // 선택 상태에 따른 조건부 스타일
                selectedDiagram === config.id
                  ? [
                      // 선택된 탭
                      "bg-blue-600 text-white",
                      "shadow-md"
                    ]
                  : [
                      // 선택되지 않은 탭
                      "text-gray-600 hover:text-gray-900",
                      "hover:bg-gray-50"
                    ]
              )}
            >
              {config.title}
            </button>
          ))}
        </div>
      </div>

      {/* 다이어그램 표시 영역 */}
      <div className={cn(
        // 메인 콘텐츠 영역
        "max-w-4xl mx-auto",
        "bg-white rounded-2xl shadow-xl p-8"
      )}>
        {/* 현재 다이어그램 정보 */}
        <div className={cn(
          // 정보 섹션
          "text-center mb-6"
        )}>
          <h2 className={cn(
            // 다이어그램 제목
            "text-2xl font-semibold text-gray-800 mb-2"
          )}>
            {currentConfig.title}
          </h2>
          <p className={cn(
            // 다이어그램 설명
            "text-gray-600"
          )}>
            {currentConfig.description}
          </p>
        </div>

        {/* Geometry 다이어그램용 폰트 크기 슬라이더 */}
        {selectedDiagram === "geometry" && (
          <div className={cn(
            // 슬라이더 컨테이너
            "mb-6 px-8",
            "bg-gray-50 rounded-lg p-4"
          )}>
            <div className={cn(
              // 슬라이더 레이블
              "flex items-center justify-between mb-2"
            )}>
              <label className={cn(
                // 레이블 텍스트
                "text-sm font-medium text-gray-700"
              )}>
                라벨 텍스트 크기
              </label>
              <span className={cn(
                // 현재 값 표시
                "text-sm font-semibold text-blue-600",
                "bg-blue-50 px-2 py-1 rounded"
              )}>
                {fontSize}px
              </span>
            </div>
            <input
              type="range"
              min="8"
              max="24"
              step="1"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className={cn(
                // 슬라이더 스타일
                "w-full h-2 bg-gray-200 rounded-lg",
                "appearance-none cursor-pointer",
                // 커스텀 슬라이더 트랙
                "[&::-webkit-slider-track]:rounded-lg",
                "[&::-webkit-slider-track]:bg-gray-200",
                // 커스텀 슬라이더 썸
                "[&::-webkit-slider-thumb]:appearance-none",
                "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
                "[&::-webkit-slider-thumb]:rounded-full",
                "[&::-webkit-slider-thumb]:bg-blue-600",
                "[&::-webkit-slider-thumb]:shadow-md",
                "[&::-webkit-slider-thumb]:hover:bg-blue-700",
                "[&::-webkit-slider-thumb]:transition-colors",
                // Firefox 지원
                "[&::-moz-range-track]:rounded-lg",
                "[&::-moz-range-track]:bg-gray-200",
                "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4",
                "[&::-moz-range-thumb]:rounded-full",
                "[&::-moz-range-thumb]:bg-blue-600",
                "[&::-moz-range-thumb]:border-0",
                "[&::-moz-range-thumb]:shadow-md",
                "[&::-moz-range-thumb]:hover:bg-blue-700",
                "[&::-moz-range-thumb]:transition-colors"
              )}
            />
            <div className={cn(
              // 슬라이더 값 범위 표시
              "flex justify-between mt-1"
            )}>
              <span className="text-xs text-gray-500">8px</span>
              <span className="text-xs text-gray-500">24px</span>
            </div>
          </div>
        )}

        {/* 다이어그램 렌더러 */}
        <div className={cn(
          // 렌더러 컨테이너
          "flex justify-center"
        )}>
          <BloomRenderer 
            diagram={diagram}
            className={cn(
              // 렌더러 스타일
              "border-2 border-gray-200",
              "rounded-xl bg-white",
              // 상호작용 효과
              "hover:border-blue-300 transition-colors duration-200"
            )}
            width={
              selectedDiagram === "circle" ? 500 : 
              selectedDiagram === "eigen" ? 500 : 
              selectedDiagram === "geometry" ? 500 : 400
            }
            height={
              selectedDiagram === "circle" ? 500 : 
              selectedDiagram === "eigen" ? 400 :
              selectedDiagram === "geometry" ? 500 : 400
            }
          />
        </div>

        {/* 로딩 상태 또는 상호작용 안내 */}
        <div className={cn(
          // 하단 정보 영역
          "text-center mt-6"
        )}>
          {!diagram ? (
            <p className={cn(
              // 로딩 상태
              "text-gray-500 animate-pulse"
            )}>
              다이어그램을 생성하는 중...
            </p>
          ) : (
            <p className={cn(
              // 상호작용 안내
              "text-sm text-gray-500"
            )}>
              💡 {
                selectedDiagram === "eigen" 
                  ? "기저벡터와 점을 드래그하여 선형 변환을 조작할 수 있습니다"
                  : selectedDiagram === "geometry"
                  ? "점들을 드래그하여 기하학적 관계를 탐색할 수 있습니다"
                  : "원을 드래그하여 이동시킬 수 있습니다"
              }
            </p>
          )}
        </div>
      </div>

      {/* 기술 정보 섹션 */}
      <div className={cn(
        // 기술 정보 컨테이너
        "max-w-4xl mx-auto mt-8",
        "bg-white rounded-xl shadow-md p-6"
      )}>
        <h3 className={cn(
          // 섹션 제목
          "text-lg font-semibold text-gray-800 mb-4"
        )}>
          🔧 구현 특징
        </h3>
        <div className={cn(
          // 특징 목록 그리드
          "grid md:grid-cols-2 gap-4 text-sm text-gray-600"
        )}>
          <div>
            <strong>useDiagram 훅:</strong> 비동기 다이어그램 생성과 상태 관리
          </div>
          <div>
            <strong>BloomRenderer:</strong> 다이어그램 DOM 렌더링 분리
          </div>
          <div>
            <strong>모듈화된 다이어그램:</strong> 재사용 가능한 다이어그램 함수들
          </div>
          <div>
            <strong>Tailwind CSS:</strong> cn 유틸리티로 조건부 스타일링
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagramGallery;
