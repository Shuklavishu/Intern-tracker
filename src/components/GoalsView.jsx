import { useState } from "react";
import { PillButton, StatusLabel, Card } from "../Theme";

export default function GoalsView({
    title = "Goals Directory",
    subtitle = "Milestone tracking — progress auto-calculated from approved tasks",
    goals = [],
    interns = [],       // list of intern objects (for Mentor/Admin to select who gets the goal)
    showInternColumn = true,
    canCreate = false,  // Mentor/Admin only
    onCreateGoal,
    canUpdateStatus = false,
    onUpdateStatus,
}) {
    const [form, setForm] = useState({ intern: interns[0]?.name || "", title: "", due: "", totalHours: "" });
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.intern || !form.title || !form.due) return;
        onCreateGoal?.({
            intern: form.intern,
            title: form.title,
            due: form.due,
            totalHours: form.totalHours ? Number(form.totalHours) : undefined,
        });
        setForm({ intern: interns[0]?.name || "", title: "", due: "", totalHours: "" });
        setShowForm(false);
    };

    const statusColor = (g) => {
        if (g.progress >= 100 || g.status === "Completed") return "#22c55e";
        if (g.status === "Needs Review") return "#f59e0b";
        return "#e05626";
    };

    return (
        <div>
            <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-2">
                <div>
                    <h2 className="font-display text-skywash m-0">{title}</h2>
                    <div className="text-fog small">{subtitle}</div>
                </div>
                {canCreate && (
                    <PillButton variant="filled" onClick={() => setShowForm((v) => !v)}>
                        <i className={`bi ${showForm ? "bi-dash" : "bi-plus-circle"} me-1`}></i>
                        {showForm ? "Cancel" : "Set Goal"}
                    </PillButton>
                )}
            </div>

            {canCreate && showForm && (
                <Card className="p-4 mb-4">
                    <h5 className="font-display text-skywash mb-3">Set a New Goal for an Intern</h5>
                    <div className="text-fog small mb-3">
                        <i className="bi bi-info-circle me-1 text-info"></i>
                        Progress is automatically calculated from the intern's Approved tasks linked to this goal.
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-12 col-md-4">
                                <label className="form-label text-moon small fw-medium mb-1">Intern</label>
                                <select
                                    className="form-select glass-input py-2 px-3 text-frost"
                                    value={form.intern}
                                    onChange={(e) => setForm((f) => ({ ...f, intern: e.target.value }))}
                                    required
                                >
                                    {interns.length > 0 ? interns.map((i) => (
                                        <option key={i.id || i._id} value={i.name} style={{ background: "#05060f", color: "#c7d3ea" }}>{i.name}</option>
                                    )) : (
                                        <option value="" style={{ background: "#05060f", color: "#c7d3ea" }}>No interns registered</option>
                                    )}
                                </select>
                            </div>
                            <div className="col-12 col-md-5">
                                <label className="form-label text-moon small fw-medium mb-1">Goal Title</label>
                                <input
                                    className="form-control glass-input py-2 px-3"
                                    placeholder="e.g. Ship payments module v1"
                                    value={form.title}
                                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="col-6 col-md-2">
                                <label className="form-label text-moon small fw-medium mb-1">Due Date</label>
                                <input
                                    className="form-control glass-input py-2 px-3"
                                    placeholder="Oct 15"
                                    value={form.due}
                                    onChange={(e) => setForm((f) => ({ ...f, due: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="col-6 col-md-1">
                                <label className="form-label text-moon small fw-medium mb-1">Est. hrs <span className="text-fog">(opt)</span></label>
                                <input
                                    className="form-control glass-input py-2 px-3"
                                    placeholder="40"
                                    type="number"
                                    min="1"
                                    value={form.totalHours}
                                    onChange={(e) => setForm((f) => ({ ...f, totalHours: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="mt-3 text-end">
                            <PillButton variant="filled" type="submit" disabled={!form.intern || !form.title || !form.due}>
                                <i className="bi bi-flag me-1"></i> Create Goal
                            </PillButton>
                        </div>
                    </form>
                </Card>
            )}

            <div className="ems-table-wrapper">
                <table className="ems-table">
                    <thead>
                        <tr>
                            {showInternColumn && <th>Intern</th>}
                            <th>Goal</th>
                            <th>Set By</th>
                            <th>Progress (auto)</th>
                            <th>Due</th>
                            <th>Status</th>
                            {canUpdateStatus && <th className="text-end">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {goals.map((g) => (
                            <tr key={g.id || g._id}>
                                {showInternColumn && <td className="fw-semibold text-frost">{g.intern}</td>}
                                <td className="text-moon">{g.title}</td>
                                <td className="text-fog small">{g.setBy || "—"}</td>
                                <td style={{ minWidth: 160 }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="progress flex-grow-1" style={{ height: 6, background: "rgba(199,211,234,0.08)" }}>
                                            <div
                                                className="progress-bar rounded-pill"
                                                style={{ width: `${g.progress || 0}%`, backgroundColor: statusColor(g) }}
                                            ></div>
                                        </div>
                                        <span className="text-fog extra-small fw-semibold">{g.progress || 0}%</span>
                                    </div>
                                    <div className="text-fog" style={{ fontSize: "0.68em", marginTop: 2, opacity: 0.7 }}>
                                        auto-calculated from approved tasks
                                    </div>
                                </td>
                                <td className="text-fog small">{g.due}</td>
                                <td><StatusLabel status={g.status || "In Progress"} /></td>
                                {canUpdateStatus && (
                                    <td className="text-end">
                                        <select
                                            className="form-select form-select-sm glass-input text-frost"
                                            style={{ maxWidth: 140 }}
                                            value={g.status || "In Progress"}
                                            onChange={(e) => onUpdateStatus?.(g.id || g._id, e.target.value)}
                                        >
                                            <option value="In Progress" style={{ background: "#05060f" }}>In Progress</option>
                                            <option value="Needs Review" style={{ background: "#05060f" }}>Needs Review</option>
                                            <option value="Completed" style={{ background: "#05060f" }}>Completed</option>
                                        </select>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {goals.length === 0 && (
                            <tr>
                                <td colSpan={showInternColumn ? (canUpdateStatus ? 7 : 6) : (canUpdateStatus ? 6 : 5)} className="text-center text-fog py-4">
                                    {canCreate ? "No goals set yet. Use 'Set Goal' to create one." : "No goals assigned yet."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
