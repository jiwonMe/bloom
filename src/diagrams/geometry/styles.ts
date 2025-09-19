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
    const { ensure, forall, forallWhere, circle, line, text, polygon, layer, equation, input, encourage, path } = db;

    // Point
    forall({ p: domain.Point }, ({ p }) => {
        p.icon = circle({
            r: 3,
            fillColor: [0.5, 0.5, 0.5, 0.01],
            drag: true,
        });
    });

    // Circle
    // forall({ c: domain.Circle }, ({ c }) => {
    //     c.icon = circle({
    //         r: 100,
    //         fillColor: [0.5, 0.5, 0.5, 0],
    //         strokeColor: [0.5, 0.5, 0.5, 1],
    //         strokeWidth: 1,
    //     });
    // });

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

    // CircleRadius
    forallWhere(
        { c: domain.Circle, o: domain.Point, r: domain.Point },
        ({ c, o, r }) => domain.DrawCircleWithRadius.test(c, o, r),
        ({ c, o, r }) => {
            c.circle = circle({
                r: bloom.ops.vdist(o.icon.center, r.icon.center),
                fillColor: [0.5, 0.5, 0.5, 0],
                center: o.icon.center,
                strokeColor: [0.5, 0.5, 0.5, 1],
                strokeWidth: 1,
            })
        }
    );

    // Circumcircle: 외접원 그리기
    forallWhere(
        { c: domain.Circle, p: domain.Point, q: domain.Point, r: domain.Point },
        ({ c, p, q, r }) => domain.DrawCircumcircle.test(c, p, q, r),
        ({ c, p, q, r }) => {
            // 세 점의 좌표를 가져옴
            const [x1, y1] = p.icon.center;
            const [x2, y2] = q.icon.center;
            const [x3, y3] = r.icon.center;
            
            // 외접원의 중심 계산 (수학적 공식 사용)
            // D = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2))
            const d = bloom.mul(
                2, 
                bloom.add(
                    bloom.mul(x1, bloom.sub(y2, y3)), 
                    bloom.add(
                        bloom.mul(x2, bloom.sub(y3, y1)), 
                        bloom.mul(x3, bloom.sub(y1, y2))
                    )
                )
            );
            
            // ux = ((x1² + y1²) * (y2 - y3) + (x2² + y2²) * (y3 - y1) + (x3² + y3²) * (y1 - y2)) / D
            const ux = bloom.div(
                bloom.add(
                    bloom.mul(
                        bloom.add(bloom.mul(x1, x1), bloom.mul(y1, y1)), 
                        bloom.sub(y2, y3)
                    ),
                    bloom.add(
                        bloom.mul(
                            bloom.add(bloom.mul(x2, x2), bloom.mul(y2, y2)), 
                            bloom.sub(y3, y1)
                        ),
                        bloom.mul(
                            bloom.add(bloom.mul(x3, x3), bloom.mul(y3, y3)), 
                            bloom.sub(y1, y2)
                        )
                    )
                ), 
                d
            );
            
            // uy = ((x1² + y1²) * (x3 - x2) + (x2² + y2²) * (x1 - x3) + (x3² + y3²) * (x2 - x1)) / D
            const uy = bloom.div(
                bloom.add(
                    bloom.mul(
                        bloom.add(bloom.mul(x1, x1), bloom.mul(y1, y1)), 
                        bloom.sub(x3, x2)
                    ),
                    bloom.add(
                        bloom.mul(
                            bloom.add(bloom.mul(x2, x2), bloom.mul(y2, y2)), 
                            bloom.sub(x1, x3)
                        ),
                        bloom.mul(
                            bloom.add(bloom.mul(x3, x3), bloom.mul(y3, y3)), 
                            bloom.sub(x2, x1)
                        )
                    )
                ), 
                d
            );
            
            const circumcenter = [ux, uy];
            
            // 외접원의 반지름 계산 (중심에서 임의의 점까지의 거리)
            const circumradius = bloom.ops.vdist(circumcenter, p.icon.center);
            
            c.circle = circle({
                r: circumradius,
                fillColor: [0.5, 0.5, 0.5, 0],
                center: circumcenter as [number, number],
                strokeColor: [0.5, 0.5, 0.5, 1],
                strokeWidth: 1,
                ensureOnCanvas: false,
            })
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

    forallWhere(
        { s: domain.Edge },
        ({ s }) => domain.LabelPredicate.test(s),
        ({ s }) => {
            const center = bloom.ops.vdiv(bloom.ops.vadd(s.icon.start, s.icon.end), 2);

            
            const edgeNormalVector = bloom.ops.vnormalize(bloom.ops.vsub(s.icon.end, s.icon.start));
            // edgeNormalVector 에 수직한 벡터
            const perpendicularVector = [edgeNormalVector[1], bloom.mul(-1, edgeNormalVector[0])];

            // edge에 수직하고 center를 지나는 선분을 생성
            // edge의 방향 벡터를 정규화

            s.path = path({
                d: bloom.makePath(s.icon.start, s.icon.end, 30, 0),
                fillColor: [0.5, 0.5, 0.5, 0],
                strokeColor: [0, 0, 0, 1],
                strokeWidth: 0.5,
                strokeStyle: "dashed",
                strokeDasharray: "2 2",
            });

            s.circle = circle({
                r: 10,
                fillColor: [1, 1, 1, 1],
            })

            s.text = equation({
                string: s.label || "d",
                fontSize: "12px",
                fillColor: [0.5, 0.5, 0.5, 1],
                ensureOnCanvas: false,
            });

    
            // s.text.center = center;
            ensure(bloom.constraints.equal(bloom.ops.vdist(
                s.text.center,
                bloom.ops.vadd(center, bloom.ops.vmul(15, perpendicularVector))
            ), 0));
            ensure(bloom.constraints.equal(bloom.ops.vdist(s.circle.center, s.text.center), 0));
        }
    );

    forall({ p: domain.Point }, ({ p }) => {
        p.text = equation({
            string: p.label || "Unnamed",
            fontSize: "12px",
            fillColor: [0.5, 0.5, 0.5, 1],
        });

        ensure(bloom.constraints.equal(bloom.ops.vdist(p.icon.center, p.text.center), 15));
    });
};