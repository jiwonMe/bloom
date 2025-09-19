/**
 * 기하학 다이어그램 생성 모듈
 * 
 * 주어진 domain, style, substance를 기반으로 원과 현, 반지름, 수직이등분선을 
 * 포함하는 복잡한 기하학적 구조를 시각화합니다.
 * 
 * 구성 요소:
 * - 원 F를 중심으로 하는 원
 * - 현 AC, EC 
 * - 반지름 FB, FD, FC
 * - 수직이등분선 Fd, Fb
 * - 지름 EA
 */

// @ts-expect-error Remote URL import isn't resolved by TS; types provided via BloomTypes
import * as bloomRuntime from "https://penrose.cs.cmu.edu/bloom.min.js";
import type { Diagram, DiagramBuilder } from "@penrose/bloom";
import { defineDomain } from "./geometry/domain";
import { applyStyle } from "./geometry/styles";
import { defineSubstance } from "./geometry/substance";
const bloom = bloomRuntime as unknown as typeof import("@penrose/bloom");
/**
 * 기하학 다이어그램 생성 메인 함수
 * 
 * 원과 현, 반지름, 수직이등분선을 포함하는 복잡한 기하학적 구조를 시각화합니다.
 * @param fontSize - 라벨 텍스트 크기 (기본값: 12)
 */
export async function createGeometryDiagram(fontSize: number = 12): Promise<Diagram> {
    // 다이어그램 빌더 초기화
    const db = new bloom.DiagramBuilder(
        bloom.canvas(500, 500), // 캔버스 크기
        "geometry-diagram", // 다이어그램 식별자
        12433552 // 랜덤 시드
    );

    // 3단계 다이어그램 구성
    const domain = defineDomain(db);
    defineSubstance(db, domain);
    applyStyle(db, domain, fontSize);

    // 다이어그램 빌드 및 반환
    return await db.build();
}
