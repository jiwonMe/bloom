// @ts-expect-error Remote URL import isn't resolved by TS; types provided via BloomTypes
import * as bloomRuntime from "https://penrose.cs.cmu.edu/bloom.min.js";
import type { DiagramBuilder } from "@penrose/bloom";
import { defineDomain } from "./domain";

/**
 * 인스턴스 정의 함수 (Substance)
 * 
 * 실제 기하학적 구조를 생성합니다.
 */
export const defineSubstance = (_db: DiagramBuilder, domain: ReturnType<typeof defineDomain>) => {
    const {
        Point, Segment, On, Perpendicular, Label, CircleRadius, Circumcircle,
    } = domain;

    // 점들 생성
    const A = Point();
    const B = Point();
    const C = Point();

    const D = Point();
    const E = Point();
    const F = Point();

    const G = Point();

    const c = CircleRadius(G, F);

    Circumcircle(A, B, C);

    // 선분들 생성
    const AB = Segment(A, B);
    const BC = Segment(B, C);
    const AC = Segment(A, C);
    Label(AB, "a");
    Label(BC, "b");
    Label(AC, "c");

    const GF = Segment(G, F);
    Label(GF, "r");

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

    A.label = "A";
    B.label = "B";
    C.label = "C";
    D.label = "D";
    E.label = "E";
    F.label = "F";
    G.label = "G";


    return {
        A, B, C, AB, BC, AC, AD, BE, CF, D, E, F, G, Perpendicular, On,
    };
};