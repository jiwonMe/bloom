/**
 * 고유벡터 다이어그램 생성 모듈
 * 
 * Penrose Bloom을 사용하여 선형 변환의 고유벡터와 고유공간을 시각화합니다.
 * 기저벡터, 변환된 점, 고유공간 직선을 포함한 대화형 선형대수 시각화를 제공합니다.
 */

// @ts-expect-error Remote URL import isn't resolved by TS; types provided via BloomTypes
import * as bloomRuntime from "https://penrose.cs.cmu.edu/bloom.min.js";
import type { Diagram, DiagramBuilder } from "@penrose/bloom";

const bloom = bloomRuntime as unknown as typeof import("@penrose/bloom");

/**
 * 도메인 정의 함수
 * 
 * 고유벡터 다이어그램에서 사용할 기본 타입과 관계를 정의합니다.
 * - Axis: 좌표축을 나타내는 타입
 * - TickMark: 축 위의 눈금을 나타내는 타입
 * - BasisVector: 기저벡터를 나타내는 타입
 * - MappedPoint: 변환되는 점을 나타내는 타입
 * - EigenspaceLine: 고유공간 직선을 나타내는 타입
 * - Horizontal/Vertical: 축의 방향을 나타내는 술어
 * - OnAxis: 눈금이 축 위에 있음을 나타내는 술어
 * 
 * @param db - Bloom 다이어그램 빌더 인스턴스
 * @returns 정의된 도메인 타입들과 술어
 */
const defineDomain = (db: DiagramBuilder) => {
    const Axis = db.type(); // 축 타입 정의
    const TickMark = db.type(); // 눈금 타입 정의
    const BasisVector = db.type(); // 기저벡터 타입 정의
    const MappedPoint = db.type(); // 변환점 타입 정의
    const EigenspaceLine = db.type(); // 고유공간 직선 타입 정의
    
    const Horizontal = db.predicate(); // 수평축 술어 정의
    const Vertical = db.predicate(); // 수직축 술어 정의
    const OnAxis = db.predicate(); // 축 위 위치 술어 정의

    return { 
        Axis, 
        TickMark, 
        BasisVector, 
        MappedPoint, 
        EigenspaceLine,
        Horizontal, 
        Vertical, 
        OnAxis 
    };
}

/**
 * 인스턴스 정의 함수 (Substance)
 * 
 * 실제 다이어그램에 표시될 구체적인 객체 인스턴스들을 생성하고
 * 이들 간의 관계를 설정합니다.
 * - X축과 Y축
 * - 각 축의 눈금들
 * - 두 개의 기저벡터 (a1, a2)
 * - 변환되는 점 v1
 * - 두 개의 고유공간 직선 (s1, s2)
 * 
 * @param _db - Bloom 다이어그램 빌더 인스턴스 (사용되지 않음)
 * @param domain - defineDomain에서 반환된 도메인 타입들
 * @returns 생성된 인스턴스들
 */
const defineSubstance = (_db: DiagramBuilder, domain: ReturnType<typeof defineDomain>) => {
    const { Axis, TickMark, BasisVector, MappedPoint, EigenspaceLine, Horizontal, Vertical, OnAxis } = domain;
    
    // 좌표축 생성
    const xAxis = Axis();
    Horizontal(xAxis);
    
    const yAxis = Axis();
    Vertical(yAxis);
    
    // 눈금 생성 (각 축에 6개씩)
    const numTickMarks = 6;
    const tickMarks = [];
    
    for (let i = 0; i < numTickMarks; ++i) {
        const xTick = TickMark();
        OnAxis(xTick, xAxis);
        tickMarks.push(xTick);
        
        const yTick = TickMark();
        OnAxis(yTick, yAxis);
        tickMarks.push(yTick);
    }
    
    // 기저벡터 생성
    const ihat = BasisVector();
    const jhat = BasisVector();
    
    // 변환되는 점 생성
    const p = MappedPoint();
    
    // 고유공간 직선 생성
    const el1 = EigenspaceLine();
    const el2 = EigenspaceLine();

    return { 
        xAxis, 
        yAxis, 
        tickMarks, 
        ihat, 
        jhat, 
        p, 
        el1, 
        el2 
    };
}

/**
 * 스타일 적용 함수
 * 
 * 정의된 도메인 타입들에 시각적 스타일과 제약조건을 적용합니다.
 * - 좌표축과 눈금 표시
 * - 기저벡터를 색상이 다른 화살표로 표시
 * - 변환점과 그 이미지를 점선으로 연결
 * - 고유공간을 직선으로 표시
 * - 드래그 가능한 핸들 제공
 * 
 * @param db - Bloom 다이어그램 빌더 인스턴스
 * @param domain - defineDomain에서 반환된 도메인 타입들
 * @param substance - defineSubstance에서 반환된 인스턴스들
 */
const applyStyle = (
    db: DiagramBuilder, 
    domain: ReturnType<typeof defineDomain>,
    substance: ReturnType<typeof defineSubstance>
) => {
    // Bloom DSL 요소들 구조분해
    const { ensure, forall, forallWhere, circle, line, equation, layer, input } = db;
    
    // 레이아웃 상수 정의
    const canvasWidth = 500;
    const canvasHeight = 400;
    const origin: [number, number] = [-canvasHeight / 6, (-2 * canvasHeight) / 5];
    const axesWidth = (2 * canvasWidth) / 4;
    const axesHeight = (2 * canvasWidth) / 3;
    const topLeft: [number, number] = [origin[0], origin[1] + axesHeight];
    const bottomRight: [number, number] = [origin[0] + axesWidth, origin[1]];
    
    const numTickMarks = 6;
    const xScale = axesWidth / (numTickMarks - 1);
    const yScale = axesHeight / (numTickMarks - 1);

    // 좌표축 스타일 적용
    forall({ a: domain.Axis }, ({ a }) => {
        if (domain.Horizontal.test(a)) {
            a.icon = line({
                start: origin,
                end: bottomRight,
                strokeColor: [0, 0, 0, 1], // 검은색
                strokeWidth: 2,
            });
        } else if (domain.Vertical.test(a)) {
            a.icon = line({
                start: origin,
                end: topLeft,
                strokeColor: [0, 0, 0, 1], // 검은색
                strokeWidth: 2,
            });
        }
    });

    // 수평 눈금 스타일 적용
    forallWhere(
        { t: domain.TickMark, a: domain.Axis },
        ({ t, a }) => domain.OnAxis.test(t, a) && domain.Horizontal.test(a),
        ({ t }, n) => {
            const len = 10;
            const start: [number, number] = [origin[0] + n * xScale, origin[1]];
            const end: [number, number] = [start[0], start[1] - len];

            t.icon = line({
                start,
                end,
                strokeColor: [0, 0, 0, 1],
                strokeWidth: 1,
            });

            t.text = equation({
                string: `${n}`,
                center: bloom.ops.vadd(end, [0, -10]) as [number, number],
                fontSize: "12px",
            });
        }
    );

    // 수직 눈금 스타일 적용
    forallWhere(
        { t: domain.TickMark, a: domain.Axis },
        ({ t, a }) => domain.OnAxis.test(t, a) && domain.Vertical.test(a),
        ({ t }, n) => {
            const len = 10;
            const start: [number, number] = [origin[0], origin[1] + n * yScale];
            const end: [number, number] = [start[0] - len, start[1]];

            t.icon = line({
                start,
                end,
                strokeColor: [0, 0, 0, 1],
                strokeWidth: 1,
            });

            t.text = equation({
                string: `${n}`,
                center: bloom.ops.vadd(end, [-10, 0]) as [number, number],
                fontSize: "12px",
            });
        }
    );

    // 기저벡터 초기 설정 및 스타일 적용
    substance.ihat.label = "a_1";
    substance.ihat.canvasVec = [
        input({ init: 1 * xScale + origin[0], optimized: false }),
        input({ init: 0.4 * yScale + origin[1], optimized: false }),
    ];
    substance.ihat.color = [0.2, 0.6, 0.86, 1]; // 파란색

    substance.jhat.label = "a_2";
    substance.jhat.canvasVec = [
        input({ init: 0.5 * xScale + origin[0], optimized: false }),
        input({ init: 1 * yScale + origin[1], optimized: false }),
    ];
    substance.jhat.color = [0.18, 0.8, 0.44, 1]; // 초록색

    // 변환점 초기 설정
    substance.p.canvasV1 = [
        input({ init: 1.5 * xScale + origin[0], optimized: false }),
        input({ init: 3.0 * yScale + origin[1], optimized: false }),
    ];

    // 모든 기저벡터에 대한 스타일 적용
    forall({ v: domain.BasisVector }, ({ v }) => {
        v.vec = bloom.ops.ewvvdiv(bloom.ops.vsub(v.canvasVec, origin), [xScale, yScale]);

        v.arrow = line({
            start: origin,
            end: v.canvasVec,
            strokeWidth: 5,
            endArrowhead: "straight",
            endArrowheadSize: 0.4,
            strokeColor: v.color,
        });

        v.handle = circle({
            r: 30,
            fillColor: [0, 0, 0, 0.1],
            center: v.canvasVec,
            drag: true,
            dragConstraint: ([x, y]) => [
                Math.max(origin[0], x),
                Math.max(origin[1], y),
            ],
        });

        v.text = equation({
            string: v.label,
            fontSize: "24px",
            fillColor: v.color,
        });

        ensure(bloom.constraints.disjoint(v.text, v.arrow, 5));
        ensure(bloom.constraints.contains(v.handle, v.text));
        ensure(bloom.constraints.greaterThan(v.vec[0], origin[0]));
        ensure(bloom.constraints.greaterThan(v.vec[1], origin[1]));
    });

    // 변환점에 대한 스타일 적용
    forall({ p: domain.MappedPoint }, ({ p }, n) => {
        p.v1 = bloom.ops.ewvvdiv(bloom.ops.vsub(p.canvasV1, origin), [xScale, yScale]);
        p.v2 = bloom.ops.mvmul(bloom.ops.mtrans([substance.ihat.vec, substance.jhat.vec]), p.v1);

        p.canvasV2 = bloom.ops.vadd(bloom.ops.ewvvmul(p.v2, [xScale, yScale]), origin);

        p.color = [0.91, 0.3, 0.24, 1]; // 빨간색

        // 원본 점
        p.icon1 = circle({
            r: 5,
            fillColor: p.color,
            center: p.canvasV1,
        });

        p.text1 = equation({
            string: `v_${n + 1}`,
            fontSize: "24px",
            fillColor: p.color,
        });

        // 변환된 점
        p.icon2 = circle({
            r: 5,
            fillColor: p.color,
            center: p.canvasV2,
            ensureOnCanvas: false,
        });

        p.text2 = equation({
            string: `Av_${n + 1}`,
            fontSize: "24px",
            fillColor: p.color,
            ensureOnCanvas: false,
        });

        // 연결선
        p.line = line({
            start: p.canvasV1,
            end: p.canvasV2,
            strokeStyle: "dashed",
            strokeColor: [0.5, 0.5, 0.5, 0.7],
            ensureOnCanvas: false,
        });

        // 드래그 핸들
        p.handle = circle({
            r: 30,
            fillColor: [0, 0, 0, 0.1],
            center: p.canvasV1,
            drag: true,
            dragConstraint: ([x, y]) => [
                Math.max(origin[0], x),
                Math.max(origin[1], y),
            ],
        });

        // 제약조건들
        ensure(bloom.constraints.disjoint(p.text1, p.icon1, 5));
        ensure(bloom.constraints.disjoint(p.text1, p.icon2, 5));
        ensure(bloom.constraints.disjoint(p.text2, p.icon1, 5));
        ensure(bloom.constraints.disjoint(p.text2, p.icon2, 5));
        ensure(bloom.constraints.disjoint(p.text1, p.text2, 5));
        ensure(bloom.constraints.disjoint(p.text1, p.line, 5));
        ensure(bloom.constraints.disjoint(p.text2, p.line, 5));
        ensure(bloom.constraints.contains(p.handle, p.text1));
        ensure(bloom.constraints.lessThan(bloom.ops.vdist(p.text2.center, p.canvasV2), 15));

        layer(p.line, p.icon1);
    });

    // 고유공간 직선 계산 및 스타일 적용
    const [a, c] = substance.ihat.vec;
    const [b, d] = substance.jhat.vec;

    // 첫 번째 고유공간 직선
    substance.el1.vec = bloom.ops.vnormalize([
        bloom.div(
            bloom.mul(
                -1,
                bloom.add(
                    bloom.add(bloom.mul(-1, a), d),
                    bloom.sqrt(
                        bloom.add(
                            bloom.add(bloom.add(bloom.mul(a, a), bloom.mul(4, bloom.mul(b, c))), bloom.mul(-2, bloom.mul(a, d))),
                            bloom.mul(d, d),
                        ),
                    ),
                ),
            ),
            bloom.mul(2, c),
        ),
        1,
    ]);

    // 두 번째 고유공간 직선
    substance.el2.vec = bloom.ops.vnormalize([
        bloom.div(
            bloom.mul(
                -1,
                bloom.add(
                    bloom.add(bloom.mul(-1, a), d),
                    bloom.mul(
                        -1,
                        bloom.sqrt(
                            bloom.add(
                                bloom.add(bloom.add(bloom.mul(a, a), bloom.mul(4, bloom.mul(b, c))), bloom.mul(-2, bloom.mul(a, d))),
                                bloom.mul(d, d),
                            ),
                        ),
                    ),
                ),
            ),
            bloom.mul(2, c),
        ),
        1,
    ]);

    // 고유공간 직선 스타일 적용
    forall({ e: domain.EigenspaceLine }, ({ e }, i) => {
        e.icon = line({
            start: origin,
            end: bloom.ops.vadd(bloom.ops.vmul(400, e.vec), origin) as [number, number],
            strokeWidth: 2,
            strokeColor: [0.6, 0.6, 0.6, 0.8],
        });

        e.text = equation({
            string: `s_${i + 1}`,
            center: bloom.ops.vadd(bloom.ops.vmul(200, e.vec), origin) as [number, number],
            fontSize: "24px",
            fillColor: [0.4, 0.4, 0.4, 1],
        });

        e.textBackground = circle({
            r: 20,
            fillColor: [1, 1, 1, 1],
            center: bloom.ops.vadd(bloom.ops.vmul(200, e.vec), origin) as [number, number],
        });

        layer(e.icon, e.textBackground);
        layer(e.textBackground, e.text);
    });

    // 고유공간 직선이 축보다 뒤에 오도록 레이어 설정
    forall({ e: domain.EigenspaceLine, a: domain.Axis }, ({ e, a }) => {
        layer(e.textBackground, a.icon);
    });
}

/**
 * 고유벡터 다이어그램 생성 메인 함수
 * 
 * 선형 변환의 고유벡터와 고유공간을 시각화하는 대화형 다이어그램을 생성합니다.
 * 기저벡터를 드래그하여 변환 행렬을 변경할 수 있고, 실시간으로 고유공간이 업데이트됩니다.
 * Penrose Bloom의 3단계 접근법을 사용합니다:
 * 1. Domain: 타입과 관계 정의
 * 2. Substance: 구체적인 인스턴스 생성
 * 3. Style: 시각적 표현 적용
 * 
 * @returns Promise<Diagram> - 생성된 Bloom 다이어그램 객체
 * 
 * @example
 * ```typescript
 * const diagram = await createEigenDiagram();
 * const element = diagram.getInteractiveElement();
 * container.appendChild(element);
 * ```
 */
export async function createEigenDiagram(): Promise<Diagram> {
    // 1. 다이어그램 빌더 초기화
    const db = new bloom.DiagramBuilder(
        bloom.canvas(500, 400), // 캔버스 크기 (500x400 픽셀)
        "eigen-diagram", // 고유한 다이어그램 식별자
        1 // 랜덤 시드값 (일관된 레이아웃을 위해)
    );

    // 2. 3단계 다이어그램 구성 과정
    const domain = defineDomain(db); // 도메인 타입과 관계 정의
    const substance = defineSubstance(db, domain); // 구체적인 인스턴스 생성 및 관계 설정
    applyStyle(db, domain, substance); // 시각적 스타일과 제약조건 적용

    // 3. 다이어그램 빌드 및 반환
    // 이 과정에서 Penrose 최적화 엔진이 제약조건을 만족하는 레이아웃을 계산
    return await db.build();
}
