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
import type { Diagram, DiagramBuilder, Substance, Type } from "@penrose/bloom";

const bloom = bloomRuntime as unknown as typeof import("@penrose/bloom");

type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

/**
 * 도메인 정의 함수
 * 
 * 기하학적 도형과 관계를 정의합니다.
 * - Point: 점을 나타내는 타입
 * - Circle: 원을 나타내는 타입  
 * - Segment: 선분을 나타내는 타입
 * - 각종 기하학적 관계 술어들
 */
const defineDomain = (db: DiagramBuilder) => {


    // 기본 도형 타입들
    const Point = db.type();

    const Edge = db.type();
    const Connects = db.predicate();

    const Segment = (pointA: Substance, pointB: Substance) => {
        const edge = Edge();
        Connects(edge, pointA, pointB);
        return edge;
    };

    const Perpendicular = db.predicate();

    const On = db.predicate();

    const Label = db.predicate();

    return {
        Point, Segment, Edge, Connects, Perpendicular, On, Label,
    };
};



/**
 * 인스턴스 정의 함수 (Substance)
 * 
 * 실제 기하학적 구조를 생성합니다.
 */
const defineSubstance = (_db: DiagramBuilder, domain: ReturnType<typeof defineDomain>) => {
    const {
        Point, Segment, On, Perpendicular,
    } = domain;

    // 점들 생성
    const A = Point();
    const B = Point();
    const C = Point();

    const D = Point();
    const E = Point();
    const F = Point();

    const G = Point();

    // 선분들 생성
    const AB = Segment(A, B);
    const BC = Segment(B, C);
    const AC = Segment(A, C);

    // A에서 BC에 수직인 선분 AH 생성
    const AD = Segment(A, D);
    Perpendicular(BC, AD);
    const BE = Segment(B, E);
    Perpendicular(AC, BE);
    const CF = Segment(C, F);
    Perpendicular(AB, CF);

    On(D, BC);
    On(E, AC);
    On(F, AB);

    On(G, AD);
    On(G, BE);
    On(G, CF);

    A.name = "A";
    B.name = "B";
    C.name = "C";
    D.name = "D";
    E.name = "E";
    F.name = "F";
    G.name = "G";


    return {
        A, B, C, AB, BC, AC, AD, BE, CF, D, E, F, G, Perpendicular, On,
    };
};

/**
 * 스타일 적용 함수
 * 
 * 기하학적 도형들에 시각적 스타일을 적용합니다.
 */
const applyStyle = (db: DiagramBuilder, domain: ReturnType<typeof defineDomain>) => {
    const { ensure, forall, forallWhere, circle, line, text, polygon, layer, equation, input, encourage } = db;

    // Point
    forall({ p: domain.Point }, ({ p }) => {
        p.icon = circle({
            r: 3,
            fillColor: [0.5, 0.5, 0.5, 1],
            drag: true,
        });

        p.text = equation({
            string: p.name || "Unnamed",
            fontSize: "12px",
            fillColor: [0.5, 0.5, 0.5, 1],
        });

        ensure(bloom.constraints.equal(bloom.ops.vdist(p.icon.center, p.text.center), 15));
    });

    // Connects
    forallWhere(
        { s: domain.Edge, p: domain.Point, q: domain.Point },
        ({ s, p, q }) => domain.Connects.test(s, p, q),
        ({ s, p, q }) => {
            s.icon = line({
                start: p.icon.center,
                end: q.icon.center,
                strokeColor: [0.5, 0.5, 0.5, 1],
                strokeWidth: 1,
            });
        }
    );



    // On
    forallWhere(
        { s: domain.Edge, p: domain.Point },
        ({ s, p }) => domain.On.test(p, s),
        ({ s, p }) => {
            const v1 = bloom.ops.vsub(p.icon.center, s.icon.start);
            const v1Norm = bloom.ops.vnormalize(v1);    
            const v2 = bloom.ops.vsub(s.icon.end, p.icon.center);
            const v2Norm = bloom.ops.vnormalize(v2);

            const distance = bloom.ops.vdist(v1Norm, v2Norm);
            ensure(bloom.constraints.equal(distance, 0));
        }
    );

    // Perpendicular
    forallWhere(
        { s1: domain.Edge, s2: domain.Edge },
        ({ s1, s2 }) => domain.Perpendicular.test(s1, s2),
        ({ s1, s2 }) => {
            const v1 = bloom.ops.vnormalize(bloom.ops.vsub(s1.icon.start, s1.icon.end));
            const v2 = bloom.ops.vnormalize(bloom.ops.vsub(s2.icon.start, s2.icon.end));

            const dotProduct = bloom.ops.vdot(v1, v2);

            ensure(bloom.constraints.equal(dotProduct, 0));
        }
    );

    // Point Label과 Segment 사이의 거리 제약조건
    // forall({ s: domain.Edge, p: domain.Point }, ({ s, p }) => {
    //     const v1 = bloom.ops.vsub(s.icon.start, s.icon.end);
    //     const v2 = bloom.ops.vsub(p.icon.center, s.icon.start);

    //     const dotProduct = bloom.ops.vdot(v1, v2);

    //     ensure(bloom.constraints.greaterThan(dotProduct, 5));
    // });
};

/**
 * 기하학 다이어그램 생성 메인 함수
 * 
 * 원과 현, 반지름, 수직이등분선을 포함하는 복잡한 기하학적 구조를 시각화합니다.
 */
export async function createGeometryDiagram(): Promise<Diagram> {
    // 다이어그램 빌더 초기화
    const db = new bloom.DiagramBuilder(
        bloom.canvas(500, 500), // 캔버스 크기
        "geometry-diagram", // 다이어그램 식별자
        123 // 랜덤 시드
    );

    // 3단계 다이어그램 구성
    const domain = defineDomain(db);
    defineSubstance(db, domain);
    applyStyle(db, domain);

    // 다이어그램 빌드 및 반환
    return await db.build();
}
