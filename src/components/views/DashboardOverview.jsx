import { Card, GradeChip, PillButton, AudienceBadge } from "../../Theme";
import {
    InteractivePerformanceChart,
    CompetencyBreakdownChart,
    CircularProgressRing,
    EnhancedStatCard
} from "../../Charts";

export default function DashboardOverview({
    title = "System Overview",
    subtitle = "Key performance indicators and status metrics",
    role = "admin",
    stats = [],
    notices = [],
    onViewAllNotices,
    chartTitle,
    chartSubtitle,
    chartDataPoints = null,
    internScore = null
}) {
    return (
        <div>
            <div className="mb-4">
                <h2 className="font-display text-skywash m-0">{title}</h2>
                <div className="text-fog small">{subtitle}</div>
            </div>

            {/* Top Stat Metrics */}
            <div className="row g-3 mb-4">
                {role === "intern" && internScore !== null && (
                    <div className="col-12 col-sm-6 col-lg-3">
                        <Card className="p-3 text-start h-100 d-flex flex-column justify-content-between">
                            <div className="text-fog small mb-1">My Overall Grade Score</div>
                            <GradeChip score={internScore} />
                        </Card>
                    </div>
                )}
                {stats.map((stat, idx) => (
                    <div key={idx} className="col-12 col-sm-6 col-lg-3">
                        <EnhancedStatCard
                            label={stat.label}
                            value={stat.value}
                            trend={stat.trend}
                            trendUp={stat.trendUp !== undefined ? stat.trendUp : true}
                            icon={stat.icon}
                        />
                    </div>
                ))}
            </div>

            {/* Performance Trajectory Area Chart */}
            <InteractivePerformanceChart
                title={chartTitle || "Performance & Score Dynamics"}
                subtitle={chartSubtitle || "Real-time evaluation & cohort benchmark analytics"}
                dataPoints={chartDataPoints}
            />

            {/* Competency & Progress Rings */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-lg-8">
                    <CompetencyBreakdownChart title="Competency Distribution Matrix" />
                </div>
                <div className="col-12 col-lg-4">
                    <CircularProgressRing
                        percentage={role === "intern" ? 92 : (role === "mentor" ? 90 : 85)}
                        label={role === "intern" ? "Task Completion Rate" : "Cohort Task Completion"}
                        subtext="Target >= 80%"
                    />
                </div>
            </div>

            {/* Recent Notices Preview */}
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="font-display text-skywash m-0">Recent Broadcast Notices</h5>
                {onViewAllNotices && (
                    <PillButton variant="ghost" className="py-1 px-3 fs-7" onClick={onViewAllNotices}>
                        View all notices <i className="bi bi-arrow-right ms-1"></i>
                    </PillButton>
                )}
            </div>

            <div className="ems-table-wrapper mb-4">
                <table className="ems-table">
                    <thead>
                        <tr>
                            <th>Notice ID</th>
                            <th>Title</th>
                            <th>Audience</th>
                            <th>Created By</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notices.slice(0, 3).map((n) => (
                            <tr key={n.id}>
                                <td className="fw-semibold text-frost">{n.id}</td>
                                <td>{n.title}</td>
                                <td><AudienceBadge audience={n.audience} /></td>
                                <td>{n.createdBy}</td>
                                <td className="text-fog small">{n.date}</td>
                            </tr>
                        ))}
                        {notices.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center text-fog py-3">No active broadcast notices.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
