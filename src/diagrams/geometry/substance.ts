// @ts-expect-error Remote URL import isn't resolved by TS; types provided via BloomTypes
import * as bloomRuntime from "https://penrose.cs.cmu.edu/bloom.min.js";
import type { DiagramBuilder } from "@penrose/bloom";
import { defineDomain } from "./domain";

/**
 * 원과 접선의 관계를 나타내는 인스턴스 정의 함수 (Substance)
 * 
 * 점 C에서 원 O에 그어지는 두 접선과 접점 A, B를 표현합니다.
 * 
 * 구성 요소:
 * - 원의 중심 O
 * - 원 위의 반지름을 결정하는 점 R  
 * - 원 외부의 점 C
 * - 원과 접선의 접점 A, B
 * - 접선 CA, CB
 * - 중심과 접점을 연결하는 반지름 OA, OB
 * 
 * 기하학적 제약조건:
 * - A, B는 원 위의 점
 * - CA ⊥ OA (접선과 반지름은 수직)
 * - CB ⊥ OB (접선과 반지름은 수직)
 */
export const defineSubstance = (_db: DiagramBuilder, domain: ReturnType<typeof defineDomain>) => {
    const {
        Point,           // 점 타입
        Segment,         // 선분 생성 함수
        CircleRadius,    // 원 생성 함수 
        On,              // 위치 관계 술어
        Perpendicular,   // 수직 관계 술어
        Label,           // 라벨 추가 함수
        NotEqual,        // 다른 점 관계 술어
    } = domain;

    // ===== 기본 점들 정의 =====
    
    /**
     * 원의 중심점 O
     * 모든 반지름의 시작점이 되는 중심점입니다.
     */
    const O = Point();
    
    /**
     * 반지름을 결정하는 점 R
     * 원의 크기를 정의하기 위한 원 위의 점입니다.
     */
    const R = Point();
    
    /**
     * 원 외부의 점 C  
     * 이 점에서 원에 두 개의 접선을 그을 수 있습니다.
     */
    const C = Point();
    
    /**
     * 접점 A
     * 점 C에서 그은 첫 번째 접선이 원과 만나는 점입니다.
     */
    const A = Point();
    
    /**
     * 접점 B
     * 점 C에서 그은 두 번째 접선이 원과 만나는 점입니다.
     */
    const B = Point();

    NotEqual(A, B);
    // ===== 원 생성 =====
    
    /**
     * 중심이 O이고 점 R을 지나는 원
     * CircleRadius 함수를 사용하여 중심과 반지름 점으로 원을 정의합니다.
     */
    const circle = CircleRadius(O, R);

    // ===== 선분들 생성 =====
    
    /**
     * 접선 CA
     * 점 C에서 접점 A로 그어지는 접선입니다.
     */
    const CA = Segment(C, A);
    
    /**
     * 접선 CB  
     * 점 C에서 접점 B로 그어지는 접선입니다.
     */
    const CB = Segment(C, B);
    
    /**
     * 반지름 OA
     * 원의 중심 O에서 접점 A로 그어지는 반지름입니다.
     */
    const OA = Segment(O, A);
    
    /**
     * 반지름 OB
     * 원의 중심 O에서 접점 B로 그어지는 반지름입니다.
     */
    const OB = Segment(O, B);
    
    /**
     * 반지름 OR
     * 원의 중심 O에서 반지름 결정점 R로 그어지는 반지름입니다.
     */
    const OR = Segment(O, R);

    // ===== 기하학적 제약조건 설정 =====
    
    /**
     * 점 A가 원 위에 있음을 명시
     * 접점 A는 반드시 원의 둘레 위에 위치해야 합니다.
     */
    On(A, circle);
    
    /**
     * 점 B가 원 위에 있음을 명시  
     * 접점 B는 반드시 원의 둘레 위에 위치해야 합니다.
     */
    On(B, circle);
    
    /**
     * 점 R이 원 위에 있음을 명시
     * 반지름 결정점 R은 원의 둘레 위에 위치해야 합니다.
     */
    On(R, circle);
    
    /**
     * 접선 CA와 반지름 OA가 수직 관계
     * 접선의 기본 성질: 접선은 그 접점에서 그은 반지름과 수직입니다.
     */
    Perpendicular(CA, OA);
    
    /**
     * 접선 CB와 반지름 OB가 수직 관계
     * 접선의 기본 성질: 접선은 그 접점에서 그은 반지름과 수직입니다.
     */
    Perpendicular(CB, OB);

    // ===== 라벨 설정 =====
    
    // 점들에 라벨 부여
    O.label = "O";    // 원의 중심
    C.label = "C";    // 외부점  
    A.label = "A";    // 첫 번째 접점
    B.label = "B";    // 두 번째 접점
    R.label = "R";    // 반지름 결정점
    
    // 선분들에 라벨 부여
    Label(CA, "");    // 접선 CA (라벨 없음)
    Label(CB, "");    // 접선 CB (라벨 없음)  
    Label(OA, "r");   // 반지름 OA
    Label(OB, "r");   // 반지름 OB
    Label(OR, "r");   // 반지름 OR

    // ===== 반환값 =====
    
    /**
     * 생성된 모든 기하학적 객체들을 반환합니다.
     * 이 객체들은 스타일 시스템에서 시각적으로 렌더링됩니다.
     */
    return {
        // 점들
        O,      // 원의 중심
        C,      // 외부점
        A,      // 첫 번째 접점  
        B,      // 두 번째 접점
        R,      // 반지름 결정점
        
        // 선분들
        CA,     // 접선 CA
        CB,     // 접선 CB
        OA,     // 반지름 OA
        OB,     // 반지름 OB
        OR,     // 반지름 OR
        
        // 원
        circle, // 중심이 O인 원
        
        // 제약조건들 (디버깅용)
        On,           // 위치 관계
        Perpendicular // 수직 관계
    };
};