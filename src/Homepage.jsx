import { PillButton, Card, SectionEyebrow, ThemeToggle } from "./Theme";

export default function Homepage({ onGetStarted, isMobile, theme, toggleTheme }) {
    return (
        <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-canvas)", color: "var(--text-primary)" }}>
            {/* Header / Navbar */}
            <header className="container py-4">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2 gap-sm-3 min-w-0">
                        <div
                            className="d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                                width: 28,
                                height: 28,
                                backgroundColor: "var(--accent)",
                                color: "var(--accent-fg)",
                                borderRadius: "var(--radius)",
                                fontSize: "14px",
                                fontWeight: 700
                            }}
                        >
                            <i className="ph ph-squares-four"></i>
                        </div>
                        <span className="font-display fw-bold fs-5 text-truncate" style={{ color: "var(--text-primary)" }}>
                            IMS <span className="fw-normal text-secondary fs-6 ms-1 d-none d-sm-inline">Intern Management System</span>
                        </span>
                    </div>

                    <div className="d-flex align-items-center gap-1.5 gap-sm-2 flex-shrink-0">
                        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                        <PillButton variant="ghost" onClick={onGetStarted} className="px-2.5 py-1.5 small d-none d-sm-inline-block">
                            Sign In
                        </PillButton>
                        <PillButton variant="filled" onClick={onGetStarted} className="px-3 py-1.5 small">
                            Launch Portal
                        </PillButton>
                    </div>
                </div>
            </header>

            {/* Hero Section - Natural Left Alignment, Real Type Scale, < 70ch Line Length */}
            <main className="container flex-grow-1 py-5">
                <div className="row g-5 align-items-start">
                    <div className="col-12 col-lg-5 text-start">
                        <SectionEyebrow>CENTRALIZED INTERN OPERATIONS</SectionEyebrow>

                        <h1 className="font-display my-3" style={{ fontSize: isMobile ? "var(--text-3xl)" : "var(--text-4xl)", lineHeight: 1.15 }}>
                            Track intern performance, all in one record.
                        </h1>

                        <p className="text-secondary mb-4" style={{ maxWidth: "56ch", fontSize: "var(--text-base)" }}>
                            Admins manage the roster and departments, mentors score and approve daily tasks, and interns track goals and requests — unified in a single structured ledger.
                        </p>

                        <div className="d-flex flex-wrap gap-2 mb-4">
                            <PillButton variant="filled" onClick={onGetStarted} className="px-4 py-2">
                                Access Workspace <i className="ph ph-arrow-right ms-1"></i>
                            </PillButton>
                        </div>

                        <div className="d-flex flex-column gap-2 text-secondary small pt-2" style={{ maxWidth: "50ch" }}>
                            <div className="d-flex align-items-center gap-2">
                                <i className="ph ph-check text-primary"></i>
                                <span>Real-time mentor scoring & task approval queues</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <i className="ph ph-check text-primary"></i>
                                <span>Leave & Work From Home (WFH) requests with at-risk alerts</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <i className="ph ph-check text-primary"></i>
                                <span>Department-matched mentor pairing and audit logging</span>
                            </div>
                        </div>
                    </div>

                    {/* Actual Product Screenshot Preview Card instead of abstract illustrations */}
                    <div className="col-12 col-lg-7">
                        <div
                            className="glass-card p-3"
                            style={{
                                borderRadius: "var(--radius)",
                                backgroundColor: "var(--bg-surface)",
                                border: "1px solid var(--border-color)",
                            }}
                        >
                            {/* Window Header Bar */}
                            <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom border-secondary border-opacity-25">
                                <div className="d-flex align-items-center gap-2">
                                    <span style={{ width: 10, height: 10, borderRadius: "2px", backgroundColor: "#ef4444", display: "inline-block" }}></span>
                                    <span style={{ width: 10, height: 10, borderRadius: "2px", backgroundColor: "#f59e0b", display: "inline-block" }}></span>
                                    <span style={{ width: 10, height: 10, borderRadius: "2px", backgroundColor: "#10b981", display: "inline-block" }}></span>
                                    <span className="ms-2 small text-secondary font-monospace" style={{ fontSize: "11px" }}>
                                        ims.internal/admin/roster
                                    </span>
                                </div>
                                <span className="badge px-2 py-0.5 small" style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}>
                                    Live System Preview
                                </span>
                            </div>

                            {/* Dashboard Metrics Bar */}
                            <div className="row g-2 mb-3">
                                {[
                                    { label: "Active Interns", val: "24", icon: "ph-users" },
                                    { label: "Pending Reviews", val: "7", icon: "ph-clock-counter-clockwise" },
                                    { label: "Average Grade", val: "8.6", icon: "ph-chart-line-up" },
                                    { label: "Active Mentors", val: "12", icon: "ph-identification-badge" },
                                ].map((stat) => (
                                    <div key={stat.label} className="col-6 col-md-3">
                                        <div className="p-2" style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)" }}>
                                            <div className="text-secondary small d-flex align-items-center justify-content-between" style={{ fontSize: "11px" }}>
                                                {stat.label}
                                                <i className={`ph ${stat.icon}`}></i>
                                            </div>
                                            <div className="fw-bold font-display mt-1" style={{ fontSize: "var(--text-lg)" }}>
                                                {stat.val}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Realistic Intern Table UI Preview */}
                            <div className="ems-table-wrapper">
                                <table className="ems-table">
                                    <thead>
                                        <tr>
                                            <th>Intern</th>
                                            <th>Department</th>
                                            <th>Assigned Mentor</th>
                                            <th>Score</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <div className="fw-semibold">Aarav Sharma</div>
                                                <div className="text-secondary" style={{ fontSize: "11px" }}>aarav@internal.corp</div>
                                            </td>
                                            <td>
                                                <span className="badge" style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent)" }}>
                                                    Engineering
                                                </span>
                                            </td>
                                            <td>Vikram Sethi</td>
                                            <td><span className="fw-bold text-success">9.2</span> <span className="text-secondary small">/ 10</span></td>
                                            <td>
                                                <span className="badge" style={{ backgroundColor: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
                                                    Active
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className="fw-semibold">Priya Patel</div>
                                                <div className="text-secondary" style={{ fontSize: "11px" }}>priya@internal.corp</div>
                                            </td>
                                            <td>
                                                <span className="badge" style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent)" }}>
                                                    Design
                                                </span>
                                            </td>
                                            <td>Neha Kapoor</td>
                                            <td><span className="fw-bold text-info">8.5</span> <span className="text-secondary small">/ 10</span></td>
                                            <td>
                                                <span className="badge" style={{ backgroundColor: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
                                                    Active
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className="fw-semibold">Rohan Verma</div>
                                                <div className="text-secondary" style={{ fontSize: "11px" }}>rohan@internal.corp</div>
                                            </td>
                                            <td>
                                                <span className="badge" style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent)" }}>
                                                    Marketing
                                                </span>
                                            </td>
                                            <td>Ananya Roy</td>
                                            <td><span className="fw-bold text-warning">7.4</span> <span className="text-secondary small">/ 10</span></td>
                                            <td>
                                                <span className="badge" style={{ backgroundColor: "rgba(217, 119, 6, 0.12)", color: "#d97706" }}>
                                                    On Leave
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section with clean layout & actual system modules (no abstract circle art) */}
                <div className="row g-4 mt-5">
                    {[
                        {
                            title: "Administrative Roster",
                            icon: "ph-shield-check",
                            desc: "Centralized intern registry, department allocations, mentor matching, and company-wide broadcast announcements."
                        },
                        {
                            title: "Mentor Evaluation Workspace",
                            icon: "ph-identification-badge",
                            desc: "Structured task sign-offs, qualitative strengths and improvement notes, milestone goals, and PPO recommendations."
                        },
                        {
                            title: "Intern Progress Portal",
                            icon: "ph-check-square",
                            desc: "Daily task submissions with proof links, leave and remote day applications, performance metrics, and goal trackers."
                        }
                    ].map((feature) => (
                        <div key={feature.title} className="col-12 col-md-4">
                            <Card className="h-100 p-4">
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <i className={`ph ${feature.icon} fs-4`} style={{ color: "var(--accent)" }}></i>
                                    <h3 className="font-display fs-5 mb-0">{feature.title}</h3>
                                </div>
                                <p className="text-secondary small mb-0" style={{ maxWidth: "55ch" }}>
                                    {feature.desc}
                                </p>
                            </Card>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}