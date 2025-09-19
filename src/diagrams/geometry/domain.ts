import type { DiagramBuilder, Substance } from "@penrose/bloom";

/**
 * 도메인 정의 함수
 * 
 * 기하학적 도형과 관계를 정의합니다.
 * - Point: 점을 나타내는 타입
 * - Circle: 원을 나타내는 타입  
 * - Segment: 선분을 나타내는 타입
 * - 각종 기하학적 관계 술어들
 */
export const defineDomain = (db: DiagramBuilder) => {


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
