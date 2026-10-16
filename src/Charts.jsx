import { useState, memo } from "react";
import { Card } from "./Theme";

// ---------- Interactive Performance Line & Area Chart ----------
const DEFAULT_YEARLY_DATA = [
    { label: "Nov '25", score: 6.5, benchmark: 6.2, tasks: 10 },
    { label: "Dec '25", score: 6.8, benchmark: 6.5, tasks: 14 },
    { label: "Jan", score: 7.0, benchmark: 6.8, tasks: 16 },
    { label: "Feb", score: 7.1, benchmark: 6.9, tasks: 18 },
    { label: "Mar", score: 7.3, benchmark: 7.1, tasks: 20 },
    { label: "Apr", score: 7.5, benchmark: 7.3, tasks: 22 },
    { label: "May", score: 7.2, benchmark: 7.0, tasks: 12 },
    { label: "Jun", score: 7.8, benchmark: 7.4, tasks: 18 },
    { label: "Jul", score: 8.1, benchmark: 7.6, tasks: 24 },
    { label: "Aug", score: 8.4, benchmark: 7.9, tasks: 29 },
    { label: "Sep", score: 8.9, benchmark: 8.1, tasks: 35 },
    { label: "Oct (Proj)", score: 9.3, benchmark: 8.3, tasks: 42 },
];

export const InteractivePerformanceChart = memo(function InteractivePerformanceChart({
    title = "Performance & Score Dynamics",
    subtitle = "Real-time evaluation & cohort benchmark analytics",
    dataPoints = null
}) {
    const [timeframe, setTimeframe] = useState("3M");
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [activeMetric, setActiveMetric] = useState("score");

    const rawData = dataPoints || DEFAULT_YEARLY_DATA;
    const activeDataPoints = (() => {
        if (timeframe === "1M") return rawData.slice(-2);
        if (timeframe === "3M") return rawData.slice(-Math.min(4, rawData.length));
        if (timeframe === "6M") return rawData.slice(-Math.min(6, rawData.length));
        return rawData;
    })();

    const values = activeDataPoints.map((d) => d[activeMetric] ?? 0);
    const maxVal = values.length ? Math.max(...values, 10) : 10;
    const minVal = values.length ? Math.min(...values, 0) : 0;

    const svgWidth = 600;
    const svgHeight = 220;
    const paddingX = 50;
    const paddingY = 40;
    const chartW = svgWidth - paddingX * 2;
    const chartH = svgHeight - paddingY * 2;

    const points = activeDataPoints.map((d, index) => {
        const x = paddingX + (index / Math.max(activeDataPoints.length - 1, 1)) * chartW;
        const val = d[activeMetric] ?? 0;
        const normalized = (val - minVal) / (maxVal - minVal || 1);
        const y = paddingY + chartH - normalized * chartH;
        return { x, y, ...d };
    });

    const benchmarkPoints = activeDataPoints.map((d, index) => {
        const x = paddingX + (index / Math.max(activeDataPoints.length - 1, 1)) * chartW;
        const val = d.benchmark ?? 0;
        const normalized = (val - minVal) / (maxVal - minVal || 1);
        const y = paddingY + chartH - normalized * chartH;
        return { x, y };
    });

    const buildBezierPath = (pts) => {
        if (!pts || pts.length === 0) return "";
        let path = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const curr = pts[i];
            const next = pts[i + 1];
            const cp1x = curr.x + (next.x - curr.x) / 2;
            const cp1y = curr.y;
            const cp2x = curr.x + (next.x - curr.x) / 2;
            const cp2y = next.y;
            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
        }
        return path;
    };

    const mainLinePath = buildBezierPath(points);
    const benchmarkLinePath = buildBezierPath(benchmarkPoints);
    const lastPt = points.length ? points[points.length - 1] : null;
    const firstPt = points.length ? points[0] : null;
    const areaPath = (lastPt && firstPt)
        ? `${mainLinePath} L ${lastPt.x} ${svgHeight - paddingY + 10} L ${firstPt.x} ${svgHeight - paddingY + 10} Z`
        : "";

    const scoreDiff = (lastPt?.score || 0) - (firstPt?.score || 0);

    const getMetricLabel = () => {
        if (activeMetric === "score") return "Evaluation Score (0 - 10)";
        return "Logged Tasks Completed";
    };

    return (
        <Card className="p-4 mb-4 position-relative overflow-hidden">
            {/* Header Control Panel */}
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                <div className="text-start">
                    <div className="d-flex align-items-center gap-2">
                        <span className="p-2 d-inline-flex align-items-center justify-content-center" style={{ background: "var(--accent-subtle)", color: "var(--accent)", borderRadius: "var(--radius)" }}>
                            <i className="ph ph-chart-line-up fs-5"></i>
                        </span>
                        <div>
                            <h5 className="font-display m-0 fs-5" style={{ color: "var(--text-primary)" }}>{title}</h5>
                            <div className="text-secondary small">{subtitle} &middot; {getMetricLabel()}</div>
                        </div>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                    {/* Metric Selector */}
                    <div className="d-inline-flex p-1" style={{ background: "var(--bg-surface-elevated)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)" }}>
                        {[
                            { id: "score", label: "Score" },
                            { id: "tasks", label: "Tasks" },
                        ].map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setActiveMetric(m.id)}
                                className={`btn btn-sm px-2.5 py-1 extra-small fw-medium ${
                                    activeMetric === m.id ? "btn-primary-accent text-white" : "btn-link text-secondary text-decoration-none"
                                }`}
                                style={{ borderRadius: "var(--radius)", fontSize: "12px" }}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>

                    {/* Timeframe Selector */}
                    <div className="d-inline-flex p-1" style={{ background: "var(--bg-surface-elevated)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)" }}>
                        {["1M", "3M", "6M", "1Y"].map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                className={`btn btn-sm px-2 py-1 extra-small fw-medium ${
                                    timeframe === tf ? "btn-primary-accent text-white" : "btn-link text-secondary text-decoration-none"
                                }`}
                                style={{ borderRadius: "var(--radius)", fontSize: "12px" }}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="row g-2 mb-3 p-2.5 p-sm-3 text-start" style={{ background: "var(--bg-surface-elevated)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)" }}>
                <div className="col-4 border-end border-secondary border-opacity-15">
                    <div className="text-secondary small font-monospace text-truncate" style={{ fontSize: "10px" }}>CURRENT SCORE</div>
                    <div className="fs-6 fs-sm-5 fw-bold font-display" style={{ color: "var(--text-primary)" }}>
                        {lastPt?.score ?? 8.9}{" "}
                        <span className={`small fw-normal ${scoreDiff >= 0 ? "text-success" : "text-danger"}`}>
                            <i className={`ph ph-arrow-${scoreDiff >= 0 ? "up" : "down"}`}></i> {scoreDiff >= 0 ? `+${scoreDiff.toFixed(1)}` : scoreDiff.toFixed(1)}
                        </span>
                    </div>
                </div>
                <div className="col-4 border-end border-secondary border-opacity-15">
                    <div className="text-secondary small font-monospace text-truncate" style={{ fontSize: "10px" }}>BENCHMARK</div>
                    <div className="fs-6 fs-sm-5 fw-bold font-display" style={{ color: "var(--text-primary)" }}>
                        {lastPt?.benchmark ?? 8.1} <span className="text-secondary small fw-normal d-none d-sm-inline">Avg</span>
                    </div>
                </div>
                <div className="col-4">
                    <div className="text-secondary small font-monospace text-truncate" style={{ fontSize: "10px" }}>TASKS</div>
                    <div className="fs-6 fs-sm-5 fw-bold font-display" style={{ color: "var(--text-primary)" }}>
                        {lastPt?.tasks ?? 35} <span className="text-secondary small fw-normal d-none d-sm-inline">Done</span>
                    </div>
                </div>
            </div>

            {/* SVG Chart */}
            <div className="position-relative w-100 my-2" style={{ height: svgHeight }}>
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-100 h-100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="singleAccentGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="var(--border-color)" strokeDasharray="3 3" opacity="0.6" />
                    <line x1={paddingX} y1={paddingY + chartH / 2} x2={svgWidth - paddingX} y2={paddingY + chartH / 2} stroke="var(--border-color)" strokeDasharray="3 3" opacity="0.6" />
                    <line x1={paddingX} y1={paddingY + chartH} x2={svgWidth - paddingX} y2={paddingY + chartH} stroke="var(--border-color)" opacity="0.9" />

                    {/* Area under curve */}
                    <path d={areaPath} fill="url(#singleAccentGrad)" />

                    {/* Benchmark dotted line */}
                    <path d={benchmarkLinePath} fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />

                    {/* Main Line stroke */}
                    <path d={mainLinePath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />

                    {/* Interactive Data Points */}
                    {points.map((pt, idx) => (
                        <g key={idx} style={{ cursor: "pointer" }} onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)}>
                            <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={hoveredPoint?.label === pt.label ? 7 : 4}
                                fill="var(--bg-canvas)"
                                stroke="#2563eb"
                                strokeWidth="2"
                            />
                            <text
                                x={pt.x}
                                y={pt.y - 10}
                                fill="var(--text-primary)"
                                fontSize="11"
                                fontWeight="600"
                                textAnchor="middle"
                            >
                                {pt[activeMetric]}
                            </text>
                            <text
                                x={pt.x}
                                y={svgHeight - 12}
                                fill={hoveredPoint?.label === pt.label ? "var(--text-primary)" : "var(--text-secondary)"}
                                fontSize="11"
                                fontWeight={hoveredPoint?.label === pt.label ? "600" : "400"}
                                textAnchor="middle"
                            >
                                {pt.label}
                            </text>
                        </g>
                    ))}
                </svg>

                {/* Tooltip */}
                {hoveredPoint && (
                    <div
                        className="position-absolute p-2 border text-start"
                        style={{
                            left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                            top: `${(hoveredPoint.y / svgHeight) * 100 - 25}%`,
                            transform: "translate(-50%, -100%)",
                            zIndex: 10,
                            minWidth: 130,
                            backgroundColor: "var(--bg-surface)",
                            borderColor: "var(--border-color)",
                            borderRadius: "var(--radius)",
                            pointerEvents: "none"
                        }}
                    >
                        <div className="small fw-semibold border-bottom pb-1 mb-1" style={{ color: "var(--text-primary)" }}>
                            {hoveredPoint.label}
                        </div>
                        <div className="d-flex justify-content-between text-secondary small">
                            <span>Score:</span> <strong style={{ color: "var(--text-primary)" }}>{hoveredPoint.score} / 10</strong>
                        </div>
                        <div className="d-flex justify-content-between text-secondary small">
                            <span>Tasks:</span> <strong style={{ color: "var(--accent)" }}>{hoveredPoint.tasks} done</strong>
                        </div>
                    </div>
                )}
            </div>

            <div className="d-flex align-items-center justify-content-between border-top border-secondary border-opacity-15 pt-2 text-secondary small">
                <div className="d-flex align-items-center gap-3">
                    <span className="d-flex align-items-center gap-1.5">
                        <span className="d-inline-block" style={{ width: 8, height: 8, backgroundColor: "var(--accent)", borderRadius: "2px" }}></span> Performance
                    </span>
                    <span className="d-flex align-items-center gap-1.5">
                        <span className="d-inline-block" style={{ width: 8, height: 8, backgroundColor: "var(--text-secondary)", borderRadius: "2px" }}></span> Benchmark
                    </span>
                </div>
                <div>Cohort Record &middot; Verified</div>
            </div>
        </Card>
    );
});

// ---------- Competency & Skills Bar Chart ----------
export const CompetencyBreakdownChart = memo(function CompetencyBreakdownChart({
    title = "Competency Distribution",
    subtitle = "Multi-attribute scoring matrix across key evaluation parameters",
    criteriaList = [
        { key: "qualityOfWork", name: "Quality of Work", score: 9.2, target: 8.5 },
        { key: "technicalExecution", name: "Technical Execution", score: 8.8, target: 8.0 },
        { key: "communication", name: "Communication & Sync", score: 8.4, target: 7.5 },
        { key: "initiative", name: "Initiative & Problem Solving", score: 9.0, target: 8.2 },
        { key: "teamwork", name: "Teamwork & Collaboration", score: 8.6, target: 8.0 },
    ],
    editable = false,
    onCriteriaChange,
    onSave,
    saving = false,
    saved = false,
    onPreset,
    overallScore
}) {
    const avgScore = overallScore !== undefined
        ? overallScore
        : (criteriaList.reduce((acc, c) => acc + (Number(c.score) || 0), 0) / (criteriaList.length || 1));

    return (
        <Card className="p-4 mb-4 text-start">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                <div className="text-start">
                    <h5 className="font-display m-0 fs-5 d-flex align-items-center gap-2" style={{ color: "var(--text-primary)" }}>
                        <i className="ph ph-chart-bar text-primary"></i> {title}
                    </h5>
                    <div className="text-secondary small">{subtitle}</div>
                </div>
                {editable && (
                    <div className="d-flex align-items-center gap-2">
                        <span className="text-secondary small">Overall:</span>
                        <span className="badge px-2.5 py-1 fw-bold fs-6" style={{ backgroundColor: "var(--accent)", color: "var(--accent-fg)", borderRadius: "var(--radius)" }}>
                            {Number(avgScore).toFixed(1)} / 10
                        </span>
                    </div>
                )}
            </div>

            <div className="d-flex flex-column gap-3">
                {criteriaList.map((item) => {
                    const currentScore = Number(item.score) || 0;
                    const pct = Math.max(0, Math.min(100, (currentScore / 10) * 100));
                    return (
                        <div key={item.key || item.name} className="p-3" style={{ background: "var(--bg-surface-elevated)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)" }}>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <span className="font-display fw-medium small" style={{ color: "var(--text-primary)" }}>{item.name}</span>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="badge px-2 py-0.5 text-secondary" style={{ background: "var(--bg-subtle)", borderRadius: "var(--radius)", fontSize: "11px" }}>
                                        Target: {item.target}
                                    </span>
                                    <span className="fw-bold fs-6" style={{ color: "var(--text-primary)" }}>
                                        {currentScore.toFixed(1)} <span className="text-secondary small fw-normal">/ 10</span>
                                    </span>
                                </div>
                            </div>

                            {/* Crisp Bar Track */}
                            <div className="position-relative w-100 overflow-hidden" style={{ height: 8, background: "var(--bg-subtle)", borderRadius: "var(--radius)" }}>
                                <div
                                    className="h-100"
                                    style={{
                                        width: `${pct}%`,
                                        background: "var(--accent)",
                                        borderRadius: "var(--radius)"
                                    }}
                                ></div>
                            </div>

                            {/* Interactive Slider */}
                            {editable && (
                                <div className="mt-3 pt-2 d-flex align-items-center gap-3">
                                    <span className="text-secondary small" style={{ width: 28, fontSize: "11px" }}>1.0</span>
                                    <input
                                        type="range"
                                        className="form-range flex-grow-1"
                                        min="1"
                                        max="10"
                                        step="0.1"
                                        value={currentScore}
                                        onChange={(e) => onCriteriaChange && onCriteriaChange(item.key || item.name, parseFloat(e.target.value))}
                                        style={{ accentColor: "var(--accent)" }}
                                    />
                                    <span className="text-secondary small" style={{ width: 34, fontSize: "11px" }}>10.0</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Bottom Controls */}
            {editable && (
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pt-3 mt-3 border-top border-secondary border-opacity-15">
                    <div className="d-flex flex-wrap align-items-center gap-2">
                        <span className="text-secondary small font-monospace" style={{ fontSize: "11px" }}>Presets:</span>
                        <button
                            type="button"
                            className="btn btn-sm btn-secondary-flat py-1 px-2 small"
                            onClick={() => onPreset && onPreset(9.2)}
                        >
                            High (9.2)
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-secondary-flat py-1 px-2 small"
                            onClick={() => onPreset && onPreset(8.2)}
                        >
                            Standard (8.2)
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-secondary-flat py-1 px-2 small"
                            onClick={() => onPreset && onPreset(7.0)}
                        >
                            Developing (7.0)
                        </button>
                    </div>

                    {onSave && (
                        <button
                            type="button"
                            className={`btn ${saved ? "btn-success" : "btn-primary-accent"} d-flex align-items-center gap-2 px-3 py-1.5`}
                            onClick={onSave}
                            disabled={saving}
                        >
                            {saved ? (
                                <>
                                    <i className="ph ph-check-circle fs-6"></i>
                                    <span>Saved to Database</span>
                                </>
                            ) : saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status"></span>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <i className="ph ph-floppy-disk fs-6"></i>
                                    <span>Save Performance Evaluation</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            )}
        </Card>
    );
});

// ---------- Enhanced StatCard with Clean Metrics ----------
export const EnhancedStatCard = memo(function EnhancedStatCard({ label, value, trend = "+5.4%", trendUp = true, icon = "ph-gauge" }) {
    const phIcon = icon.startsWith("ph-") ? icon : icon.replace("bi-", "ph-");

    return (
        <Card className="p-3 h-100 text-start d-flex flex-column justify-content-between position-relative">
            <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-medium">{label}</span>
                <span
                    className="badge px-2 py-0.5"
                    style={{
                        backgroundColor: trendUp ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                        color: trendUp ? "#10b981" : "#ef4444",
                        border: `1px solid ${trendUp ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)"}`,
                        fontSize: "11px",
                        borderRadius: "var(--radius)"
                    }}
                >
                    <i className={`ph ${trendUp ? "ph-arrow-up-right" : "ph-arrow-down-right"} me-0.5`}></i> {trend}
                </span>
            </div>

            <div className="d-flex align-items-baseline justify-content-between mt-1">
                <div className="fs-2 fw-bold font-display" style={{ color: "var(--text-primary)" }}>{value}</div>
                <i className={`ph ${phIcon} fs-3 text-secondary opacity-50`}></i>
            </div>
        </Card>
    );
});
