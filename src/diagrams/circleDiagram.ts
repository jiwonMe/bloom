/**
 * 원형 다이어그램 생성 모듈
 * 
 * Penrose Bloom을 사용하여 중심 원을 둘러싸고 있는 위성 원들을 시각화합니다.
 * 이 모듈은 도메인 정의, 스타일 적용, 인스턴스 생성의 세 단계로 구성됩니다.
 */

// @ts-expect-error Remote URL import isn't resolved by TS; types provided via BloomTypes
import * as bloomRuntime from "https://penrose.cs.cmu.edu/bloom.min.js";
import type { Diagram, DiagramBuilder } from "@penrose/bloom";

const bloom = bloomRuntime as unknown as typeof import("@penrose/bloom");

/**
 * 도메인 정의 함수
 * 
 * 원형 다이어그램에서 사용할 기본 타입과 관계를 정의합니다.
 * - CenterCircle: 중심에 위치하는 원을 나타내는 타입
 * - SatelliteCircle: 중심 원 주위를 도는 위성 원을 나타내는 타입
 * - Connection: 중심 원과 위성 원을 연결하는 선을 나타내는 타입
 * - OrbitAround: 위성 원이 중심 원 주위를 공전하는 관계를 나타내는 술어
 * 
 * @param db - Bloom 다이어그램 빌더 인스턴스
 * @returns 정의된 도메인 타입들과 술어
 */
const defineDomain = (db: DiagramBuilder) => {
    const CenterCircle = db.type(); // 중심 원 타입 정의
    const SatelliteCircle = db.type(); // 위성 원 타입 정의
    const Connection = db.type(); // 연결선 타입 정의
    const OrbitAround = db.predicate(); // 궤도 관계 술어 정의

    return { CenterCircle, SatelliteCircle, Connection, OrbitAround };
}

/**
 * 인스턴스 정의 함수 (Substance)
 * 
 * 실제 다이어그램에 표시될 구체적인 객체 인스턴스들을 생성하고
 * 이들 간의 관계를 설정합니다.
 * - 중심 원 1개
 * - 위성 원 6개
 * - 각 위성 원과 중심 원을 연결하는 연결선들
 * 
 * @param _db - Bloom 다이어그램 빌더 인스턴스 (사용되지 않음)
 * @param domain - defineDomain에서 반환된 도메인 타입들
 * @returns 생성된 인스턴스들 (중심 원, 위성 원들, 연결선들)
 */
const defineSubstance = (_db: DiagramBuilder, domain: ReturnType<typeof defineDomain>) => {
    const { CenterCircle, SatelliteCircle, Connection, OrbitAround } = domain;
    
    // 구체적인 인스턴스 생성
    const center = CenterCircle(); // 중심 원 인스턴스
    const satellites = Array.from({ length: 6 }, () => SatelliteCircle()); // 위성 원 6개 인스턴스
    const connections = satellites.map(() => Connection()); // 각 위성 원에 대한 연결선 인스턴스
    
    // 관계 설정: 각 위성 원이 중심 원 주위를 공전하는 관계
    satellites.forEach((satellite, index) => {
        OrbitAround(connections[index], satellite, center);
    });

    return { center, satellites, connections };
}

/**
 * 스타일 적용 함수
 * 
 * 정의된 도메인 타입들에 시각적 스타일과 제약조건을 적용합니다.
 * - CenterCircle들은 큰 파란색 원으로 표시
 * - SatelliteCircle들은 작은 주황색 원으로 표시  
 * - Connection들은 중심 원과 위성 원을 연결하는 회색 선으로 표시
 * - 위성 원들이 중심 원 주위에 일정한 거리를 유지하도록 제약조건 적용
 * - 위성 원들 간의 최소 거리 제약조건 적용
 * 
 * @param db - Bloom 다이어그램 빌더 인스턴스
 * @param domain - defineDomain에서 반환된 도메인 타입들
 */
const applyStyle = (db: DiagramBuilder, domain: ReturnType<typeof defineDomain>) => {
    // Bloom DSL 요소들 구조분해
    const { ensure, forall, forallWhere, circle, line } = db;
    
    // 스타일 상수 정의
    const centerRadius = 40; // 중심 원 반지름 (픽셀)
    const satelliteRadius = 25; // 위성 원 반지름 (픽셀)
    const orbitRadius = 150; // 공전 궤도 반지름 (픽셀)

    // 모든 CenterCircle 타입 인스턴스에 대한 시각적 표현 정의
    forall({ c: domain.CenterCircle }, ({ c }) => {
        c.icon = circle({
            r: centerRadius, // 원의 반지름
            fillColor: [0.2, 0.4, 0.8, 1.0], // 파란색 채우기
            strokeColor: [0.1, 0.2, 0.4, 1.0], // 진한 파란색 테두리
            strokeWidth: 3, // 테두리 두께
            drag: true, // 사용자가 드래그할 수 있도록 설정
        });
    });

    // 모든 SatelliteCircle 타입 인스턴스에 대한 시각적 표현 정의
    forall({ s: domain.SatelliteCircle }, ({ s }) => {
        s.icon = circle({
            r: satelliteRadius, // 원의 반지름
            fillColor: [0.8, 0.4, 0.2, 1.0], // 주황색 채우기
            strokeColor: [0.4, 0.2, 0.1, 1.0], // 진한 주황색 테두리
            strokeWidth: 2, // 테두리 두께
            drag: true, // 사용자가 드래그할 수 있도록 설정
        });
    });

    // 궤도 관계가 있는 Connection에 대한 시각적 표현 정의
    forallWhere(
        { conn: domain.Connection, sat: domain.SatelliteCircle, center: domain.CenterCircle }, // 변수 선언
        ({ conn, sat, center }) => domain.OrbitAround.test(conn, sat, center), // 조건: conn이 sat와 center를 연결하는 경우
        ({ conn, sat, center }) => {
            // 벡터 계산을 통한 연결선 위치 결정
            const centerToSat = bloom.ops.vsub(sat.icon.center, center.icon.center); // 중심에서 위성으로의 벡터
            const direction = bloom.ops.vnormalize(centerToSat); // 정규화된 방향 벡터
            
            // 원의 경계에서 시작/끝나도록 오프셋 계산
            const startOffset = bloom.ops.vmul(centerRadius + 5, direction);
            const endOffset = bloom.ops.vmul(satelliteRadius + 5, direction);
            
            // 실제 연결선의 시작점과 끝점 계산
            const start = bloom.ops.vadd(center.icon.center, startOffset); // 시작점 = 중심 + 오프셋
            const end = bloom.ops.vsub(sat.icon.center, endOffset); // 끝점 = 위성 중심 - 오프셋

            // 연결선 생성 및 스타일 적용
            conn.icon = line({
                start: start as [number, number], // 시작 좌표
                end: end as [number, number], // 끝 좌표
                strokeColor: [0.5, 0.5, 0.5, 0.6], // 반투명 회색
                strokeWidth: 1.5, // 선 두께
            });

            // 제약조건: 위성들이 중심 주위에 적절한 거리를 유지
            // 모든 위성 원이 중심 원으로부터 일정한 거리(궤도 반지름)를 유지하도록 함
            ensure(
                bloom.constraints.equal(
                    bloom.ops.vdist(sat.icon.center, center.icon.center), // 중심과 위성 사이 거리
                    orbitRadius // 목표 궤도 반지름
                )
            );
        }
    );

    // 위성들 간의 간격 유지 제약조건
    // 모든 SatelliteCircle 타입 인스턴스 쌍에 대해 최소 거리를 보장하여 겹치지 않도록 함
    // Bloom은 자동으로 동일한 객체에 대한 제약조건은 무시하므로 조건 없이 적용 가능
    forall(
        { sat1: domain.SatelliteCircle, sat2: domain.SatelliteCircle }, // 두 위성 원 변수 선언
        ({ sat1, sat2 }) => {
            ensure(
                bloom.constraints.greaterThan(
                    bloom.ops.vdist(sat1.icon.center, sat2.icon.center), // 두 위성 사이 거리
                    2 * satelliteRadius + 30 // 최소 허용 거리 (반지름 * 2 + 여백)
                )
            );
        }
    );
}

/**
 * 원형 다이어그램 생성 메인 함수
 * 
 * 중심 원을 둘러싸고 있는 위성 원들을 원형으로 배치한 다이어그램을 시각화합니다.
 * Penrose Bloom의 3단계 접근법을 사용합니다:
 * 1. Domain: 타입과 관계 정의
 * 2. Substance: 구체적인 인스턴스 생성
 * 3. Style: 시각적 표현 적용
 * 
 * @returns Promise<Diagram> - 생성된 Bloom 다이어그램 객체
 * 
 * @example
 * ```typescript
 * const diagram = await createCircleDiagram();
 * const element = diagram.getInteractiveElement();
 * container.appendChild(element);
 * ```
 */
export async function createCircleDiagram(): Promise<Diagram> {
    // 1. 다이어그램 빌더 초기화
    const db = new bloom.DiagramBuilder(
        bloom.canvas(500, 500), // 캔버스 크기 (500x500 픽셀) - 더 큰 캔버스
        "circle-diagram", // 고유한 다이어그램 식별자
        42 // 랜덤 시드값 (일관된 레이아웃을 위해)
    );

    // 2. 3단계 다이어그램 구성 과정
    const domain = defineDomain(db); // 도메인 타입과 관계 정의
    defineSubstance(db, domain); // 구체적인 인스턴스 생성 및 관계 설정
    applyStyle(db, domain); // 시각적 스타일과 제약조건 적용

    // 3. 다이어그램 빌드 및 반환
    // 이 과정에서 Penrose 최적화 엔진이 제약조건을 만족하는 레이아웃을 계산
    return await db.build();
}
