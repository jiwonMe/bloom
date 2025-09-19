/**
 * 화살표 다이어그램 생성 모듈
 * 
 * Penrose Bloom을 사용하여 두 점을 화살표로 연결하는 기본적인 그래프 구조를 생성합니다.
 * 이 모듈은 도메인 정의, 스타일 적용, 인스턴스 생성의 세 단계로 구성됩니다.
 */

// @ts-expect-error Remote URL import isn't resolved by TS; types provided via BloomTypes
import * as bloomRuntime from "https://penrose.cs.cmu.edu/bloom.min.js";
import type { Diagram, DiagramBuilder } from "@penrose/bloom";

const bloom = bloomRuntime as unknown as typeof import("@penrose/bloom");

/**
 * 도메인 정의 함수
 * 
 * 다이어그램에서 사용할 기본 타입과 관계를 정의합니다.
 * - Point: 점을 나타내는 타입
 * - Arrow: 화살표를 나타내는 타입  
 * - Connects: 화살표가 두 점을 연결하는 관계를 나타내는 술어
 * 
 * @param db - Bloom 다이어그램 빌더 인스턴스
 * @returns 정의된 도메인 타입들과 술어
 */
const defineDomain = (db: DiagramBuilder) => {
    const Point = db.type(); // 점 타입 정의
    const Arrow = db.type(); // 화살표 타입 정의
    const Connects = db.predicate(); // 연결 관계 술어 정의

    return { Point, Arrow, Connects };
}

/**
 * 인스턴스 정의 함수 (Substance)
 * 
 * 실제 다이어그램에 표시될 구체적인 객체 인스턴스들을 생성하고
 * 이들 간의 관계를 설정합니다.
 * 
 * @param _db - Bloom 다이어그램 빌더 인스턴스 (사용되지 않음)
 * @param domain - defineDomain에서 반환된 도메인 타입들
 * @returns 생성된 인스턴스들 (두 점과 화살표)
 */
const defineSubstance = (_db: DiagramBuilder, domain: ReturnType<typeof defineDomain>) => {
    const { Point, Arrow, Connects } = domain;
    
    // 구체적인 인스턴스 생성
    const p1 = Point(); // 첫 번째 점 인스턴스
    const p2 = Point(); // 두 번째 점 인스턴스
    const arrow = Arrow(); // 화살표 인스턴스
    
    // 관계 설정: arrow가 p1에서 p2로의 연결을 나타냄
    Connects(arrow, p1, p2);

    return { p1, p2, arrow };
}

/**
 * 스타일 적용 함수
 * 
 * 정의된 도메인 타입들에 시각적 스타일과 제약조건을 적용합니다.
 * - Point들은 드래그 가능한 원으로 표시
 * - Arrow들은 두 점을 연결하는 화살표 선으로 표시
 * - 점들 사이의 최소 거리 제약조건 적용
 * 
 * @param db - Bloom 다이어그램 빌더 인스턴스
 * @param domain - defineDomain에서 반환된 도메인 타입들
 */
const applyStyle = (db: DiagramBuilder, domain: ReturnType<typeof defineDomain>) => {
    // Bloom DSL 요소들 구조분해
    const { ensure, forall, forallWhere, circle, line } = db;
    
    // 스타일 상수 정의
    const pointRad = 30; // 점의 반지름 (픽셀)
    const pointMargin = 10; // 점과 화살표 사이 여백 (픽셀)

    // 모든 Point 타입 인스턴스에 대한 시각적 표현 정의
    forall({ p: domain.Point }, ({ p }) => {
        p.icon = circle({
            r: pointRad, // 원의 반지름
            drag: true, // 사용자가 드래그할 수 있도록 설정
        });
    });

    // 연결 관계가 있는 Arrow에 대한 시각적 표현 정의
    forallWhere(
        { a: domain.Arrow, p: domain.Point, q: domain.Point }, // 변수 선언
        ({ a, p, q }) => domain.Connects.test(a, p, q), // 조건: a가 p와 q를 연결하는 경우
        ({ a, p, q }) => {
            // 벡터 계산을 통한 화살표 위치 결정
            const pq = bloom.ops.vsub(q.icon.center, p.icon.center); // p에서 q로의 벡터
            const pqNorm = bloom.ops.vnormalize(pq); // 정규화된 방향 벡터
            
            // 점의 경계에서 시작/끝나도록 오프셋 계산
            const pStart = bloom.ops.vmul(pointRad + pointMargin, pqNorm);
            
            // 실제 화살표의 시작점과 끝점 계산
            const start = bloom.ops.vadd(p.icon.center, pStart); // 시작점 = 중심 + 오프셋
            const end = bloom.ops.vsub(q.icon.center, pStart); // 끝점 = 중심 - 오프셋

            // 화살표 선 생성 및 스타일 적용
            a.icon = line({
                start: start as [number, number], // 시작 좌표
                end: end as [number, number], // 끝 좌표
                endArrowhead: "straight", // 끝에 직선형 화살표 머리 추가
            });

            // 제약조건: 두 점 사이의 최소 거리 보장
            // 점들이 너무 가까워지지 않도록 하여 화살표가 제대로 보이게 함
            ensure(
                bloom.constraints.greaterThan(
                    bloom.ops.vdist(p.icon.center, q.icon.center), // 두 점 중심 사이 거리
                    2 * (pointRad + pointMargin) + 20 // 최소 허용 거리
                )
            );
        }
    );
}



/**
 * 화살표 다이어그램 생성 메인 함수
 * 
 * 두 점을 화살표로 연결하는 기본적인 그래프 구조를 시각화합니다.
 * Penrose Bloom의 3단계 접근법을 사용합니다:
 * 1. Domain: 타입과 관계 정의
 * 2. Substance: 구체적인 인스턴스 생성
 * 3. Style: 시각적 표현 적용
 * 
 * @returns Promise<Diagram> - 생성된 Bloom 다이어그램 객체
 * 
 * @example
 * ```typescript
 * const diagram = await createArrowDiagram();
 * const element = diagram.getInteractiveElement();
 * container.appendChild(element);
 * ```
 */
export async function createArrowDiagram(): Promise<Diagram> {
    // 1. 다이어그램 빌더 초기화
    const db = new bloom.DiagramBuilder(
        bloom.canvas(400, 400), // 캔버스 크기 (400x400 픽셀)
        "arrow-diagram", // 고유한 다이어그램 식별자
        1 // 랜덤 시드값 (일관된 레이아웃을 위해)
    );

    // 2. 3단계 다이어그램 구성 과정
    const domain = defineDomain(db); // 도메인 타입과 관계 정의
    defineSubstance(db, domain); // 구체적인 인스턴스 생성 및 관계 설정
    applyStyle(db, domain); // 시각적 스타일과 제약조건 적용

    // 3. 다이어그램 빌드 및 반환
    // 이 과정에서 Penrose 최적화 엔진이 제약조건을 만족하는 레이아웃을 계산
    return await db.build();
}
