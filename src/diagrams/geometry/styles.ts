// @ts-expect-error Remote URL import isn't resolved by TS; types provided via BloomTypes
import * as bloomRuntime from "https://penrose.cs.cmu.edu/bloom.min.js";
import type { DiagramBuilder } from "@penrose/bloom";
import { defineDomain } from "./domain";

const bloom = bloomRuntime as unknown as typeof import("@penrose/bloom");

type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

/**
 * 스타일 적용 함수
 * 
 * 기하학적 도형들에 시각적 스타일을 적용합니다.
 */
export const applyStyle = (db: DiagramBuilder, domain: ReturnType<typeof defineDomain>) => {
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