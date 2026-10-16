import { Card, GradeChip, PillButton, AudienceBadge, EmptyState } from "../../Theme";
import {
    CompetencyBreakdownChart,
    EnhancedStatCard
} from "../../Charts";

export default function DashboardOverview({
    title = "System Overview",
    subtitle = "Key performance indicators and status metrics",
    role = "admin",
    stats = [],
    notices = [],
    onViewAllNotices,
    internScore = null,
    internshipInfo = null,
    goals = [],
    interns = []
}) {
    const formatGoalDate = (dueStr) => {
        if (!dueStr) return "No date set";
        if (/^\d{4}-\d{2}-\d{2}$/.test(dueStr)) {
            try {
                const [y, m, d] = dueStr.split("-").map(Number);
                const date = new Date(y, m - 1, d);
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            } catch {
                return dueStr;
            }
        }
        return dueStr;
    };

    const resolveInternName = (g) => {
        if (g.internName && g.internName !== "Intern") return g.internName;
        if (typeof g.intern === "object" && g.intern?.name) return g.intern.name;
        if (typeof g.intern === "string" && !/^[0-9a-fA-F]{24}$/.test(g.intern)) return g.intern;
        const targetId = g.internId || (typeof g.intern === "string" ? g.intern : g.intern?._id);
        if (targetId && interns.length > 0) {
            const found = interns.find((i) => String(i.id || i._id) === String(targetId));
            if (found) return found.name;
        }
        return g.internName || (typeof g.intern === "string" ? g.intern : "Intern");
    };

    const activeGoals = (goals || []).filter((g) => g && g.status !== "Completed" && (Number(g.progress) || 0) < 100);
    const displayGoals = activeGoals.length > 0 ? activeGoals : (goals || []);

    return (
        <div className="text-start">
            <div className="mb-4 text-start">
                <h2 className="font-display h3 m-0" style={{ color: "var(--text-primary)" }}>{title}</h2>
                <div className="text-secondary small mt-1" style={{ maxWidth: "65ch" }}>{subtitle}</div>
            </div>

            {/* Intern Dates & Time Remaining Card */}
            {role === "intern" && internshipInfo && (
                <Card className="p-4 mb-4">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{ width: 40, height: 40, background: "var(--accent-subtle)", color: "var(--accent)", borderRadius: "var(--radius)" }}
                            >
                                <i className="ph ph-calendar fs-5"></i>
                            </div>
                            <div>
                                <div className="d-flex align-items-center gap-2">
                                    <h5 className="font-display m-0 fs-6" style={{ color: "var(--text-primary)" }}>Internship Period</h5>
                                    <span
                                        className="badge extra-small px-2 py-0.5"
                                        style={{
                                            backgroundColor: internshipInfo.state === "Ongoing" ? "rgba(16, 185, 129, 0.12)" : "var(--bg-subtle)",
                                            color: internshipInfo.state === "Ongoing" ? "#10b981" : "var(--text-secondary)",
                                            borderRadius: "var(--radius)"
                                        }}
                                    >
                                        {internshipInfo.state}
                                    </span>
                                </div>
                                <div className="small mt-0.5 text-secondary">
                                    {internshipInfo.startDate && internshipInfo.endDate ? (
                                        <span>{internshipInfo.startDate} &rarr; {internshipInfo.endDate}</span>
                                    ) : (
                                        <span>Dates not set by Administrator</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="text-start text-sm-end">
                            <div className="text-secondary small font-monospace" style={{ fontSize: "11px" }}>TIME REMAINING</div>
                            <div className="fs-5 fw-bold font-display" style={{ color: "var(--text-primary)" }}>{internshipInfo.remainingLabel}</div>
                            <div className="text-secondary small">{internshipInfo.durationLabel} total duration</div>
                        </div>
                    </div>

                    {/* Timeline Progress Bar */}
                    {internshipInfo.startDate && internshipInfo.endDate && (
                        <div className="pt-3 border-top border-secondary border-opacity-15">
                            <div className="d-flex justify-content-between align-items-center text-secondary small mb-1.5">
                                <span>Program Timeline Progress</span>
                                <span className="fw-semibold" style={{ color: "var(--text-primary)" }}>
                                    {internshipInfo.progress}% ({internshipInfo.daysRemaining} days remaining of {internshipInfo.totalDays})
                                </span>
                            </div>
                            <div className="progress" style={{ height: "6px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius)" }}>
                                <div
                                    className="progress-bar"
                                    role="progressbar"
                                    style={{
                                        width: `${internshipInfo.progress}%`,
                                        backgroundColor: "var(--accent)",
                                        borderRadius: "var(--radius)"
                                    }}
                                ></div>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {/* Top Stat Metrics */}
            <div className="row g-3 mb-4">
                {role === "intern" && internScore !== null && (
                    <div className="col-12 col-sm-6 col-lg-3">
                        <Card className="p-3 text-start h-100 d-flex flex-column justify-content-between">
                            <div className="text-secondary small mb-1">My Overall Grade Score</div>
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

            {/* Competency & Goals Cards */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-lg-8">
                    <CompetencyBreakdownChart title="Competency Distribution Matrix" />
                </div>
                <div className="col-12 col-lg-4">
                    <Card className="p-4 mb-4 h-100 d-flex flex-column">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="d-flex align-items-center gap-2">
                                <i className="ph ph-flag" style={{ color: "var(--accent)" }}></i>
                                <h5 className="font-display m-0 fs-6" style={{ color: "var(--text-primary)" }}>
                                    {role === "intern" ? "My Goals & Deadlines" : "Active Goals & Deadlines"}
                                </h5>
                            </div>
                            <span className="badge" style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent)", borderRadius: "var(--radius)", fontSize: "11px" }}>
                                {displayGoals.length} {displayGoals.length === 1 ? "Goal" : "Goals"}
                            </span>
                        </div>

                        <div className="d-flex flex-column gap-2 flex-grow-1 overflow-auto" style={{ maxHeight: "280px" }}>
                            {displayGoals.length > 0 ? (
                                displayGoals.map((g, idx) => {
                                    const isCompleted = g.status === "Completed" || (Number(g.progress) || 0) >= 100;
                                    const assignedTo = resolveInternName(g);
                                    return (
                                        <div
                                            key={g.id || g._id || idx}
                                            className="p-3 text-start"
                                            style={{
                                                background: "var(--bg-surface-elevated)",
                                                border: "1px solid var(--border-color)",
                                                borderRadius: "var(--radius)"
                                            }}
                                        >
                                            <div className="d-flex align-items-start justify-content-between gap-2 mb-1">
                                                <span className="fw-semibold small text-truncate" style={{ color: "var(--text-primary)" }} title={g.title}>
                                                    {g.title}
                                                </span>
                                                <span
                                                    className="badge"
                                                    style={{
                                                        backgroundColor: isCompleted ? "rgba(16, 185, 129, 0.12)" : "var(--accent-subtle)",
                                                        color: isCompleted ? "#10b981" : "var(--accent)",
                                                        border: `1px solid ${isCompleted ? "rgba(16, 185, 129, 0.25)" : "var(--accent-border)"}`,
                                                        borderRadius: "var(--radius)",
                                                        fontSize: "11px"
                                                    }}
                                                >
                                                    {isCompleted ? "Completed" : `${g.progress || 0}%`}
                                                </span>
                                            </div>

                                            <div className="d-flex align-items-center gap-1.5 mb-2">
                                                <span className="badge" style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-secondary)", borderRadius: "var(--radius)", fontSize: "11px" }}>
                                                    <i className="ph ph-user me-1"></i>
                                                    Assigned to: {assignedTo}
                                                </span>
                                            </div>

                                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 text-secondary small pt-1 border-top border-secondary border-opacity-10" style={{ fontSize: "11px" }}>
                                                <div className="d-flex align-items-center gap-1.5">
                                                    <i className="ph ph-calendar" style={{ color: "var(--accent)" }}></i>
                                                    <span>Due: {formatGoalDate(g.due)}</span>
                                                </div>
                                                {g.setByName && (
                                                    <span>Mentor: {g.setByName}</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <EmptyState
                                    icon="ph-flag"
                                    title="No active goals"
                                    description="Goals assigned by mentors will appear here."
                                />
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Recent Notices Preview */}
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="font-display m-0 fs-6" style={{ color: "var(--text-primary)" }}>Recent Broadcast Notices</h5>
                {onViewAllNotices && (
                    <PillButton variant="ghost" className="py-1 px-3 small" onClick={onViewAllNotices}>
                        View all notices <i className="ph ph-arrow-right ms-1"></i>
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
                                <td className="fw-semibold" style={{ color: "var(--text-primary)" }}>{n.id}</td>
                                <td>{n.title}</td>
                                <td><AudienceBadge audience={n.audience} /></td>
                                <td>{n.createdBy}</td>
                                <td className="text-secondary small">{n.date}</td>
                            </tr>
                        ))}
                        {notices.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-4">
                                    <EmptyState
                                        icon="ph-megaphone-simple"
                                        title="No broadcast notices"
                                        description="Company-wide announcements will be listed here when published."
                                    />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
