import type { DiagramBuilder, Substance } from "@penrose/bloom";

/**
 * 기하학 도메인 정의 함수
 * 
 * Penrose Bloom을 사용하여 기하학적 도형과 관계를 정의합니다.
 * 이 함수는 다음과 같은 기하학적 요소들을 제공합니다:
 * 
 * @param db DiagramBuilder 인스턴스
 * @returns 기하학적 타입과 술어들을 포함한 객체
 * 
 * 제공되는 타입들:
 * - Point: 2D 평면상의 점
 * - Edge: 두 점을 연결하는 모서리
 * - Circle: 중심과 반지름을 가진 원
 * 
 * 제공되는 술어들:
 * - Connects: 모서리가 두 점을 연결함을 나타냄
 * - Perpendicular: 두 선분이 수직임을 나타냄
 * - On: 한 점이 다른 도형 위에 있음을 나타냄
 * - DrawCircleWithRadius: 원을 중심과 반지름으로 그림
 * - LabelPredicate: 도형에 라벨을 부착함
 * 
 * 헬퍼 함수들:
 * - Segment: 두 점을 연결하는 선분을 생성
 * - CircleRadius: 중심과 반지름으로 원을 생성
 * - Label: 도형에 텍스트 라벨을 추가
 */
export const defineDomain = (db: DiagramBuilder) => {
    // ===== 기본 기하학적 타입 정의 =====
    
    /**
     * Point 타입
     * 2D 평면상의 점을 나타냅니다.
     * 좌표 (x, y)를 가집니다.
     */
    const Point = db.type();

    /**
     * Edge 타입
     * 두 점을 연결하는 모서리를 나타냅니다.
     * 선분, 직선, 곡선 등을 표현할 수 있습니다.
     */
    const Edge = db.type();
    
    /**
     * Connects 술어
     * 모서리가 두 점을 연결함을 나타내는 관계입니다.
     * 사용법: Connects(edge, pointA, pointB)
     */
    const Connects = db.predicate();

    /**
     * Segment 헬퍼 함수
     * 두 점을 연결하는 선분을 생성합니다.
     * 
     * @param pointA 시작점
     * @param pointB 끝점
     * @returns 두 점을 연결하는 Edge 인스턴스
     */
    const Segment = (pointA: Substance, pointB: Substance) => {
        const edge = Edge();
        Connects(edge, pointA, pointB);
        return edge;
    };

    /**
     * Circle 타입
     * 중심점과 반지름을 가진 원을 나타냅니다.
     */
    const Circle = db.type();
    
    /**
     * DrawCircleWithRadius 술어
     * 원을 중심점과 반지름으로 그리는 관계를 나타냅니다.
     * 사용법: DrawCircleWithRadius(circle, center, radius)
     */
    const DrawCircleWithRadius = db.predicate();

    /**
     * CircleRadius 헬퍼 함수
     * 중심점과 반지름을 이용해 원을 생성합니다.
     * 
     * @param center 원의 중심점
     * @param radius 원의 반지름 (Point 타입)
     * @returns Circle 인스턴스
     */
    const CircleRadius = (center: Substance, radius: Substance) => {
        const circle = Circle();
        DrawCircleWithRadius(circle, center, radius);
        return circle;
    };

    /**
     * DrawCircumcircle 술어
     * 세 점을 지나는 외접원을 그리는 관계를 나타냅니다.
     * 사용법: DrawCircumcircle(circle, pointA, pointB, pointC)
     */
    const DrawCircumcircle = db.predicate();

    /**
     * Circumcircle 헬퍼 함수
     * 세 점을 지나는 외접원을 생성합니다.
     * 
     * @param pointA 첫 번째 점
     * @param pointB 두 번째 점
     * @param pointC 세 번째 점
     * @returns Circle 인스턴스
     */
    const Circumcircle = (pointA: Substance, pointB: Substance, pointC: Substance) => {
        const circle = Circle();
        DrawCircumcircle(circle, pointA, pointB, pointC);
        return circle;
    };

    // ===== 기하학적 관계 술어들 =====
    
    /**
     * Perpendicular 술어
     * 두 선분이 서로 수직(90도)임을 나타내는 관계입니다.
     * 사용법: Perpendicular(segment1, segment2)
     */
    const Perpendicular = db.predicate();

    /**
     * On 술어
     * 한 점이 다른 기하학적 도형(선분, 원 등) 위에 있음을 나타내는 관계입니다.
     * 사용법: On(point, shape)
     */
    const On = db.predicate();

    // ===== 라벨링 시스템 =====
    
    /**
     * LabelPredicate 술어
     * 도형에 텍스트 라벨이 부착되어 있음을 나타내는 관계입니다.
     */
    const LabelPredicate = db.predicate();

    /**
     * Label 헬퍼 함수
     * 기하학적 객체에 텍스트 라벨을 추가합니다.
     * 
     * @param obj 라벨을 추가할 기하학적 객체
     * @param label 표시할 텍스트 라벨
     * @returns LabelPredicate 인스턴스
     */
    const Label = (obj: Substance, label: string) => {
        obj.label = label;
        const labelPredicate = LabelPredicate(obj);
        return labelPredicate;
    };

    // ===== 반환되는 도메인 요소들 =====
    return {
        // 기본 타입들
        Point,           // 점 타입
        Edge,            // 모서리 타입
        Circle,          // 원 타입
        
        // 헬퍼 함수들
        Segment,         // 선분 생성 함수
        CircleRadius,    // 원 생성 함수
        Circumcircle,    // 외접원 생성 함수
        Label,           // 라벨 추가 함수
        
        // 술어들
        Connects,        // 연결 관계
        Perpendicular,   // 수직 관계
        On,              // 위치 관계
        DrawCircleWithRadius, // 원 그리기 관계
        DrawCircumcircle, // 외접원 그리기 관계
        LabelPredicate   // 라벨 관계
    };
};
