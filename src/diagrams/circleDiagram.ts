// @ts-expect-error Remote URL import isn't resolved by TS; types provided via BloomTypes
import * as bloomRuntime from "https://penrose.cs.cmu.edu/bloom.min.js";
import type { Diagram } from "@penrose/bloom";

const bloom = bloomRuntime as unknown as typeof import("@penrose/bloom");

/**
 * 여러 개의 원이 원형으로 배치된 다이어그램 생성
 * 중심 원을 둘러싸고 있는 위성 원들을 시각화
 */
export async function createCircleDiagram(): Promise<Diagram> {
  // 다이어그램 빌더 초기화
  const db = new bloom.DiagramBuilder(
    bloom.canvas(500, 500), // 더 큰 캔버스
    "circle-diagram", // 다이어그램 ID
    42 // 다른 시드값으로 다른 배치 생성
  );

  // Bloom DSL 요소들 구조분해
  const { type, predicate, forall, forallWhere, ensure, circle, line } = db;

  // 타입 정의
  const CenterCircle = type(); // 중심 원
  const SatelliteCircle = type(); // 위성 원
  const Connection = type(); // 연결선
  const OrbitAround = predicate(); // 궤도 관계

  // 인스턴스 생성 - 중심 원 1개와 위성 원 6개
  const center = CenterCircle();
  const satellites = Array.from({ length: 6 }, () => SatelliteCircle());
  const connections = satellites.map(() => Connection());

  // 관계 정의: 각 위성 원이 중심 원 주위를 공전
  satellites.forEach((satellite, index) => {
    OrbitAround(connections[index], satellite, center);
  });

  // 스타일 상수
  const centerRadius = 40; // 중심 원 반지름
  const satelliteRadius = 25; // 위성 원 반지름
  const orbitRadius = 150; // 공전 궤도 반지름

  // 중심 원 스타일링
  forall({ c: CenterCircle }, ({ c }) => {
    c.icon = circle({
      r: centerRadius,
      fillColor: [0.2, 0.4, 0.8, 1.0], // 파란색
      strokeColor: [0.1, 0.2, 0.4, 1.0], // 진한 파란색 테두리
      strokeWidth: 3,
      drag: true,
    });
  });

  // 위성 원 스타일링
  forall({ s: SatelliteCircle }, ({ s }) => {
    s.icon = circle({
      r: satelliteRadius,
      fillColor: [0.8, 0.4, 0.2, 1.0], // 주황색
      strokeColor: [0.4, 0.2, 0.1, 1.0], // 진한 주황색 테두리
      strokeWidth: 2,
      drag: true,
    });
  });

  // 궤도 연결선 스타일링
  forallWhere(
    { conn: Connection, sat: SatelliteCircle, center: CenterCircle },
    ({ conn, sat, center }) => OrbitAround.test(conn, sat, center),
    ({ conn, sat, center }) => {
      // 중심에서 위성으로의 벡터
      const centerToSat = bloom.ops.vsub(sat.icon.center, center.icon.center);
      const direction = bloom.ops.vnormalize(centerToSat);
      
      // 연결선 시작점과 끝점 계산 (원의 경계에서 시작/끝)
      const startOffset = bloom.ops.vmul(centerRadius + 5, direction);
      const endOffset = bloom.ops.vmul(satelliteRadius + 5, direction);
      
      const start = bloom.ops.vadd(center.icon.center, startOffset);
      const end = bloom.ops.vsub(sat.icon.center, endOffset);

      conn.icon = line({
        start: start as [number, number],
        end: end as [number, number],
        strokeColor: [0.5, 0.5, 0.5, 0.6], // 반투명 회색
        strokeWidth: 1.5,
      });

      // 제약조건: 위성들이 중심 주위에 적절한 거리를 유지
      ensure(
        bloom.constraints.equal(
          bloom.ops.vdist(sat.icon.center, center.icon.center),
          orbitRadius
        )
      );
    }
  );

  // 위성들 간의 간격 유지 제약조건
  for (let i = 0; i < satellites.length; i++) {
    for (let j = i + 1; j < satellites.length; j++) {
      const sat1 = satellites[i];
      const sat2 = satellites[j];
      
      ensure(
        bloom.constraints.greaterThan(
          bloom.ops.vdist(sat1.icon.center, sat2.icon.center),
          2 * satelliteRadius + 30 // 최소 간격
        )
      );
    }
  }

  return await db.build();
}
