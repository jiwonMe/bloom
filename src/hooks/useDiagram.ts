import { useEffect, useState } from "react";
import type { Diagram } from "@penrose/bloom";

/**
 * Bloom Diagram 생성 전용 훅. build 함수(비동기)를 받아 Diagram|null을 반환.
 * 사용 예: const diagram = useDiagram(useCallback(() => basisVectors(true), []));
 */
export function useDiagram(buildFn: () => Promise<Diagram>): Diagram | null {
  const [diagram, setDiagram] = useState<Diagram | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    // 다이어그램 초기화
    setDiagram(null);

    (async () => {
      try {
        const built = await buildFn();
        if (!cancelled) {
          setDiagram(built);
        }
      } catch (err) {
        console.error("useDiagram build error", err);
        if (!cancelled) {
          setDiagram(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [buildFn]); // buildFn을 의존성 배열에 추가

  return diagram;
}

export default useDiagram;

