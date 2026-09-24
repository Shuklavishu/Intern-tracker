import { useState, memo } from "react";
import { Card } from "./Theme";

// ---------- Interactive Glow Line & Area Chart ----------
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
    const [activeMetric, setActiveMetric] = useState("score"); // 'score' | 'tasks'

    // Filter data based on selected timeframe
    const rawData = dataPoints || DEFAULT_YEARLY_DATA;
    const activeDataPoints = (() => {
        if (timeframe === "1M") return rawData.slice(-2);
        if (timeframe === "3M") return rawData.slice(-Math.min(4, rawData.length));
        if (timeframe === "6M") return rawData.slice(-Math.min(6, rawData.length));
        return rawData; // '1Y' or full dataset
    })();

    // Compute max/min for scaling SVG
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

    // Build smooth Bezier path
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
        <Card className="p-4 mb-4 position-relative overflow-hidden" style={{ border: "1px solid rgba(186, 215, 247, 0.18)" }}>
            {/* Header Control Panel */}
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                <div>
                    <div className="d-flex align-items-center gap-2">
                        <span className="p-2 rounded-3 d-inline-flex align-items-center justify-content-center" style={{ background: "rgba(224, 86, 38, 0.15)", color: "#e05626" }}>
                            <i className="bi bi-graph-up-arrow fs-5"></i>
                        </span>
                        <div>
                            <h5 className="font-display text-skywash m-0 fs-5">{title}</h5>
                            <div className="text-fog small">{subtitle} &middot; {getMetricLabel()}</div>
                        </div>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                    {/* Metric Selector Pill */}
                    <div className="d-inline-flex p-1 rounded-pill" style={{ background: "rgba(199, 211, 234, 0.06)", border: "1px solid rgba(186, 215, 247, 0.12)" }}>
                        {[
                            { id: "score", label: "Score" },
                            { id: "tasks", label: "Tasks" },
                        ].map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setActiveMetric(m.id)}
                                className={`btn btn-sm rounded-pill px-3 py-1 extra-small fw-semibold transition-all ${
                                    activeMetric === m.id ? "bg-violet text-white shadow-sm" : "text-moon border-0"
                                }`}
                                style={activeMetric === m.id ? { backgroundColor: "#e05626" } : {}}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>

                    {/* Timeframe Selector Pill */}
                    <div className="d-inline-flex p-1 rounded-pill" style={{ background: "rgba(199, 211, 234, 0.06)", border: "1px solid rgba(186, 215, 247, 0.12)" }}>
                        {["1M", "3M", "6M", "1Y"].map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                className={`btn btn-sm rounded-pill px-2 py-1 extra-small fw-bold transition-all ${
                                    timeframe === tf ? "text-white shadow-sm" : "text-fog border-0"
                                }`}
                                style={timeframe === tf ? { background: "linear-gradient(135deg, #e05626, #f97316)" } : {}}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="row g-2 mb-3 p-3 rounded-3" style={{ background: "rgba(186, 214, 247, 0.03)", border: "1px solid rgba(186, 215, 247, 0.08)" }}>
                <div className="col-4 border-end border-secondary border-opacity-10 text-center">
                    <div className="text-fog extra-small font-eyebrow">CURRENT SCORE</div>
                    <div className="fs-5 fw-bold text-skywash">
                        {lastPt?.score ?? 8.9}{" "}
                        <span className={`extra-small fw-normal ${scoreDiff >= 0 ? "text-success" : "text-danger"}`}>
                            <i className={`bi bi-arrow-${scoreDiff >= 0 ? "up" : "down"}`}></i> {scoreDiff >= 0 ? `+${scoreDiff.toFixed(1)}` : scoreDiff.toFixed(1)} ({timeframe})
                        </span>
                    </div>
                </div>
                <div className="col-4 border-end border-secondary border-opacity-10 text-center">
                    <div className="text-fog extra-small font-eyebrow">COHORT BENCHMARK</div>
                    <div className="fs-5 fw-bold text-frost">{lastPt?.benchmark ?? 8.1} <span className="text-fog extra-small fw-normal">Avg</span></div>
                </div>
                <div className="col-4 text-center">
                    <div className="text-fog extra-small font-eyebrow">TARGET ACHIEVEMENT</div>
                    <div className="fs-5 fw-bold text-warning">{lastPt?.tasks ?? 35} Tasks <span className="text-success extra-small fw-normal"><i className="bi bi-check-circle"></i> Completed</span></div>
                </div>
            </div>

            {/* SVG Interactive Chart */}
            <div className="position-relative w-100 my-2" style={{ height: svgHeight }}>
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-100 h-100" preserveAspectRatio="none">
                    <defs>
                        {/* Glow filter */}
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>

                        {/* Gradient Fill */}
                        <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#e05626" stopOpacity="0.45" />
                            <stop offset="60%" stopColor="#e05626" stopOpacity="0.08" />
                            <stop offset="100%" stopColor="#e05626" stopOpacity="0.0" />
                        </linearGradient>

                        <linearGradient id="benchmarkGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.6" />
                        </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="rgba(186, 215, 247, 0.07)" strokeDasharray="4 4" />
                    <line x1={paddingX} y1={paddingY + chartH / 2} x2={svgWidth - paddingX} y2={paddingY + chartH / 2} stroke="rgba(186, 215, 247, 0.07)" strokeDasharray="4 4" />
                    <line x1={paddingX} y1={paddingY + chartH} x2={svgWidth - paddingX} y2={paddingY + chartH} stroke="rgba(186, 215, 247, 0.12)" />

                    {/* Area under curve */}
                    <path d={areaPath} fill="url(#neonGradient)" />

                    {/* Benchmark dotted trendline */}
                    <path d={benchmarkLinePath} fill="none" stroke="rgba(56, 189, 248, 0.5)" strokeWidth="2" strokeDasharray="6 6" />

                    {/* Main Line stroke with glow */}
                    <path d={mainLinePath} fill="none" stroke="#e05626" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow)" />

                    {/* Interactive Data Points */}
                    {points.map((pt, idx) => (
                        <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)}>
                            {/* Hover pulse circle */}
                            <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={hoveredPoint?.label === pt.label ? 10 : 5}
                                fill="var(--color-midnight-canvas, #05060f)"
                                stroke="#e05626"
                                strokeWidth={hoveredPoint?.label === pt.label ? "4" : "2.5"}
                                style={{ transition: "all 0.2s ease" }}
                            />
                            {/* Data value label on top */}
                            <text
                                x={pt.x}
                                y={pt.y - 12}
                                fill="var(--color-frost-glow, #ffffff)"
                                fontSize="11"
                                fontWeight="700"
                                textAnchor="middle"
                            >
                                {pt[activeMetric]}
                            </text>

                            {/* X axis month labels */}
                            <text
                                x={pt.x}
                                y={svgHeight - 12}
                                fill={hoveredPoint?.label === pt.label ? "var(--color-frost-glow, #ffffff)" : "var(--color-fog-veil, #9da7ba)"}
                                fontSize="11"
                                fontWeight={hoveredPoint?.label === pt.label ? "700" : "500"}
                                textAnchor="middle"
                            >
                                {pt.label}
                            </text>
                        </g>
                    ))}
                </svg>

                {/* Hover Tooltip Popup */}
                {hoveredPoint && (
                    <div
                        className="position-absolute glass-modal p-2 rounded-3 shadow-lg pointer-events-none transition-all"
                        style={{
                            left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                            top: `${(hoveredPoint.y / svgHeight) * 100 - 30}%`,
                            transform: "translate(-50%, -100%)",
                            zIndex: 10,
                            minWidth: 140,
                            border: "1px solid rgba(224, 86, 38, 0.4)",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.6)"
                        }}
                    >
                        <div className="text-frost extra-small fw-bold font-display border-bottom border-secondary border-opacity-20 pb-1 mb-1">
                            {hoveredPoint.label} Details
                        </div>
                        <div className="d-flex justify-content-between text-moon extra-small py-0.5">
                            <span>Score:</span> <strong className="text-skywash">{hoveredPoint.score} / 10</strong>
                        </div>
                        <div className="d-flex justify-content-between text-moon extra-small py-0.5">
                            <span>Tasks:</span> <strong className="text-info">{hoveredPoint.tasks} completed</strong>
                        </div>
                    </div>
                )}
            </div>

            <div className="d-flex align-items-center justify-content-between border-top border-secondary border-opacity-10 pt-2 text-fog extra-small">
                <div className="d-flex align-items-center gap-3">
                    <span className="d-flex align-items-center gap-1">
                        <span className="d-inline-block rounded-circle" style={{ width: 8, height: 8, backgroundColor: "#e05626" }}></span> Actual Performance
                    </span>
                    <span className="d-flex align-items-center gap-1">
                        <span className="d-inline-block rounded-circle" style={{ width: 8, height: 8, backgroundColor: "#38bdf8" }}></span> Cohort Benchmark
                    </span>
                </div>
                <div>Updated today &middot; 100% Verified Ledger</div>
            </div>
        </Card>
    );
});

// ---------- Competency & Skills Bar Chart ----------
export const CompetencyBreakdownChart = memo(function CompetencyBreakdownChart({
    title = "Competency & Skill Evaluation Breakdown",
    criteriaList = [
        { name: "Quality of Work", score: 9.2, target: 8.5, color: "#e05626" },
        { name: "Technical Execution", score: 8.8, target: 8.0, color: "#06b6d4" },
        { name: "Communication & Sync", score: 8.4, target: 7.5, color: "#8b5cf6" },
        { name: "Initiative & Problem Solving", score: 9.0, target: 8.2, color: "#10b981" },
        { name: "Teamwork & Collaboration", score: 8.6, target: 8.0, color: "#f59e0b" },
    ]
}) {
    return (
        <Card className="p-4 mb-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h5 className="font-display text-skywash m-0 fs-5">
                        <i className="bi bi-bar-chart-line me-2 text-warning"></i> {title}
                    </h5>
                    <div className="text-fog small">Multi-attribute scoring matrix across key evaluation parameters</div>
                </div>
            </div>

            <div className="d-flex flex-column gap-3">
                {criteriaList.map((item) => {
                    const pct = (item.score / 10) * 100;
                    return (
                        <div key={item.name} className="p-3 rounded-3" style={{ background: "rgba(186, 214, 247, 0.03)", border: "1px solid rgba(186, 215, 247, 0.08)" }}>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <span className="font-display text-frost fw-medium small">{item.name}</span>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="badge rounded-pill px-2 py-1 extra-small" style={{ background: "rgba(199, 211, 234, 0.1)", color: "#c7d3ea" }}>
                                        Target: {item.target}
                                    </span>
                                    <span className="fw-bold text-skywash fs-6">{item.score.toFixed(1)} <span className="text-fog extra-small font-normal">/ 10</span></span>
                                </div>
                            </div>

                            {/* Animated Dual Bar Track */}
                            <div className="position-relative w-100 rounded-pill overflow-hidden" style={{ height: 10, background: "rgba(199,211,234,0.08)" }}>
                                <div
                                    className="h-100 rounded-pill transition-all"
                                    style={{
                                        width: `${pct}%`,
                                        background: `linear-gradient(90deg, ${item.color} 0%, #e05626 100%)`,
                                        boxShadow: `0 0 10px ${item.color}aa`
                                    }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
});

// ---------- Circular SVG Progress Ring Gauge ----------
export const CircularProgressRing = memo(function CircularProgressRing({
    percentage = 94,
    size = 140,
    strokeWidth = 12,
    label = "Task Completion Rate",
    subtext = "Target >= 85%"
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <Card className="p-4 mb-4 text-center d-flex flex-column align-items-center justify-content-center">
            <div className="text-fog small font-eyebrow mb-2">{label}</div>
            
            <div className="position-relative d-inline-flex align-items-center justify-content-center my-2" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="rgba(199, 211, 234, 0.08)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#e05626"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        style={{
                            transition: "stroke-dashoffset 0.8s ease-in-out",
                            filter: "drop-shadow(0 0 8px rgba(224, 86, 38, 0.5))"
                        }}
                    />
                </svg>
                <div className="position-absolute text-center">
                    <div className="fs-3 fw-bold text-skywash leading-none">{percentage}%</div>
                    <div className="text-fog extra-small">Punctual</div>
                </div>
            </div>

            <div className="text-moon extra-small mt-2">{subtext}</div>
        </Card>
    );
});

// ---------- Enhanced StatCard with Sparkline ----------
export const EnhancedStatCard = memo(function EnhancedStatCard({ label, value, trend = "+5.4%", trendUp = true, icon = "bi-speedometer2" }) {
    return (
        <Card className="p-3 h-100 text-start d-flex flex-column justify-content-between position-relative overflow-hidden" style={{ border: "1px solid rgba(186, 215, 247, 0.14)" }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-fog small font-medium">{label}</span>
                <span className={`badge rounded-pill px-2 py-1 extra-small ${trendUp ? "bg-success-subtle text-success border border-success-subtle" : "bg-danger-subtle text-danger border border-danger-subtle"}`}>
                    <i className={`bi ${trendUp ? "bi-arrow-up-right" : "bi-arrow-down-right"} me-1`}></i> {trend}
                </span>
            </div>

            <div className="d-flex align-items-baseline justify-content-between mt-1">
                <div className="fs-2 fw-bold text-skywash font-display">{value}</div>
                <i className={`bi ${icon} fs-3 text-secondary opacity-50`}></i>
            </div>
        </Card>
    );
});
