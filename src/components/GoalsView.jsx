import { useState } from "react";
import { PillButton, StatusLabel, Card, EmptyState } from "../Theme";

export default function GoalsView({
    title = "Goals Directory",
    subtitle = "Milestone tracking and deliverables",
    goals = [],
    tasks = [],
    interns = [],
    requests = [],
    canCreate = false,
    onCreateGoal,
    onUpdateStatus,
    onExtendDueDate,
    onRequestExtension,
    role = "mentor"
}) {
    const isIntern = role === "intern";
    const canExtend = Boolean(onExtendDueDate);

    const [form, setForm] = useState({
        intern: interns[0]?.name || "",
        internId: interns[0]?.id || interns[0]?._id || "",
        title: "",
        description: "",
        due: "",
        targetHours: "40"
    });
    const [showForm, setShowForm] = useState(false);

    // Modal state for extending a goal's due date
    const [extendingGoal, setExtendingGoal] = useState(null);
    const [newExtendDate, setNewExtendDate] = useState("");

    const openExtendModal = (g) => {
        setExtendingGoal(g);
        // If there is a pending extension request, default to requested date, else current due
        const pending = getPendingExtension(g);
        setNewExtendDate(pending?.extendedDate || pending?.date || g.due || "");
    };

    const handleConfirmExtend = (e) => {
        e.preventDefault();
        if (!extendingGoal || !newExtendDate) return;

        if (onExtendDueDate) {
            onExtendDueDate(extendingGoal.id || extendingGoal._id, newExtendDate);
        }
        setExtendingGoal(null);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        if (!form.title || !form.due) return;

        const selectedInternObj = interns.find(
            (i) => (i.id || i._id) === form.internId || i.name === form.intern
        ) || interns[0];

        onCreateGoal?.({
            intern: selectedInternObj?.name || form.intern,
            internId: selectedInternObj?.id || selectedInternObj?._id,
            title: form.title.trim(),
            description: form.description.trim(),
            due: form.due.trim(),
            targetHours: Number(form.targetHours) || 40
        });

        setForm({
            intern: interns[0]?.name || "",
            internId: interns[0]?.id || interns[0]?._id || "",
            title: "",
            description: "",
            due: "",
            targetHours: "40"
        });
        setShowForm(false);
    };

    const getGoalTasks = (goalId) => {
        return (tasks || []).filter((t) => {
            const tGoalId = t.goal?._id || t.goal?.id || t.goal;
            return String(tGoalId) === String(goalId);
        });
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
        return g.internName || (typeof g.intern === "string" ? g.intern : "Assigned Intern");
    };

    const formatGoalDue = (dueStr) => {
        if (!dueStr) return "—";
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

    // Find any pending extension request for a given goal
    const getPendingExtension = (g) => {
        const goalId = String(g.id || g._id);
        const internName = resolveInternName(g);

        return (requests || []).find((r) => {
            const isExt = (r.type || "").toLowerCase().includes("extension") || (r.type || "").toLowerCase().includes("goal");
            const isPending = r.status === "Pending";
            const matchId = r.goalId && String(r.goalId) === goalId;
            const matchTitle = r.goalTitle && r.goalTitle === g.title;
            const matchIntern = (r.internName || r.intern) === internName;
            return isExt && isPending && (matchId || (matchTitle && matchIntern));
        });
    };

    return (
        <div className="text-start">
            {/* Header */}
            <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-2">
                <div className="text-start">
                    <h2 className="font-display h3 m-0" style={{ color: "var(--text-primary)" }}>{title}</h2>
                    <div className="text-secondary small mt-1" style={{ maxWidth: "65ch" }}>{subtitle}</div>
                </div>
                {canCreate && (
                    <PillButton variant="filled" onClick={() => setShowForm((v) => !v)}>
                        <i className={`ph ${showForm ? "ph-minus" : "ph-plus"} me-1.5`}></i>
                        {showForm ? "Cancel" : "Set Goal"}
                    </PillButton>
                )}
            </div>

            {/* Mentor Create Goal Form */}
            {canCreate && showForm && (
                <Card className="p-4 mb-4 text-start">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <h5 className="font-display m-0 fs-6" style={{ color: "var(--text-primary)" }}>Set a New Goal for an Intern</h5>
                        <span className="badge" style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent)", borderRadius: "var(--radius)", fontSize: "11px" }}>Mentor Only</span>
                    </div>
                    <form onSubmit={handleCreateSubmit}>
                        <div className="row g-3">
                            <div className="col-12 col-md-4">
                                <label className="form-label text-secondary small fw-medium mb-1">Assigned Intern <span className="text-danger">*</span></label>
                                <select
                                    className="form-select glass-input py-2 px-3 small"
                                    value={form.internId || form.intern}
                                    onChange={(e) => {
                                        const selected = interns.find((i) => (i.id || i._id) === e.target.value);
                                        setForm((f) => ({
                                            ...f,
                                            internId: e.target.value,
                                            intern: selected ? selected.name : e.target.value
                                        }));
                                    }}
                                    required
                                >
                                    {interns.length > 0 ? interns.map((i) => (
                                        <option key={i.id || i._id} value={i.id || i._id}>
                                            {i.name} ({i.dept})
                                        </option>
                                    )) : (
                                        <option value="">No assigned interns</option>
                                    )}
                                </select>
                            </div>
                            <div className="col-12 col-md-5">
                                <label className="form-label text-secondary small fw-medium mb-1">Goal Title <span className="text-danger">*</span></label>
                                <input
                                    className="form-control glass-input py-2 px-3 small"
                                    placeholder="e.g. Implement payment gateway integration"
                                    value={form.title}
                                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="col-12 col-md-3">
                                <label className="form-label text-secondary small fw-medium mb-1">Due Date <span className="text-danger">*</span></label>
                                <input
                                    type="date"
                                    className="form-control glass-input py-2 px-3 small"
                                    value={form.due}
                                    onChange={(e) => setForm((f) => ({ ...f, due: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="col-12">
                                <label className="form-label text-secondary small fw-medium mb-1">Description</label>
                                <input
                                    className="form-control glass-input py-2 px-3 small"
                                    placeholder="Key milestones and deliverables expected"
                                    value={form.description}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="mt-3 text-end">
                            <PillButton variant="filled" type="submit" disabled={!form.title || !form.due}>
                                <i className="ph ph-flag me-1.5"></i> Create Goal
                            </PillButton>
                        </div>
                    </form>
                </Card>
            )}

            {/* INTERN VIEW */}
            {isIntern ? (
                <div>
                    <div className="d-flex flex-column gap-3">
                        {goals.length === 0 ? (
                            <EmptyState
                                icon="ph-flag"
                                title="No goals assigned"
                                description="Goals assigned by your mentor will appear here with linked task milestones."
                            />
                        ) : (
                            goals.map((g) => {
                                const goalId = g.id || g._id;
                                const goalTasks = getGoalTasks(goalId);
                                const isCompleted = g.status === "Completed" || (Number(g.progress) || 0) >= 100;
                                const pendingReq = getPendingExtension(g);

                                return (
                                    <Card key={goalId} className="p-4 text-start">
                                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                                            <div>
                                                <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                                    <h4 className="font-display fs-5 m-0" style={{ color: "var(--text-primary)" }}>{g.title}</h4>
                                                    <StatusLabel status={isCompleted ? "Completed" : "In Progress"} />
                                                    {pendingReq && (
                                                        <span
                                                            className="badge px-2 py-0.5 d-inline-flex align-items-center gap-1"
                                                            style={{
                                                                backgroundColor: "rgba(217, 119, 6, 0.12)",
                                                                color: "#d97706",
                                                                border: "1px solid rgba(217, 119, 6, 0.25)",
                                                                fontSize: "11px",
                                                                borderRadius: "var(--radius)"
                                                            }}
                                                            title={`Reason: ${pendingReq.reason}`}
                                                        >
                                                            <i className="ph ph-clock-countdown"></i>
                                                            Extension requested to {pendingReq.extendedDate || pendingReq.date} (Pending)
                                                        </span>
                                                    )}
                                                </div>
                                                {g.description && (
                                                    <div className="text-secondary small mt-1" style={{ maxWidth: "60ch" }}>{g.description}</div>
                                                )}
                                                <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small mt-2 pt-2 border-top border-secondary border-opacity-15" style={{ fontSize: "11px" }}>
                                                    <span className="badge px-2 py-0.5" style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-secondary)", borderRadius: "var(--radius)" }}>
                                                        <i className="ph ph-user me-1"></i>
                                                        Assigned to: {resolveInternName(g)}
                                                    </span>
                                                    <span>
                                                        <i className="ph ph-calendar me-1" style={{ color: "var(--accent)" }}></i>
                                                        Due: <strong style={{ color: "var(--text-primary)" }}>{formatGoalDue(g.due)}</strong>
                                                    </span>
                                                    <span>
                                                        Mentor: <strong style={{ color: "var(--text-primary)" }}>{g.setByName || (typeof g.setBy === "object" ? g.setBy?.name : g.setBy) || "Mentor"}</strong>
                                                    </span>
                                                    {!isCompleted && !pendingReq && onRequestExtension && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-link btn-sm p-0 text-decoration-none small"
                                                            style={{ color: "var(--accent)", fontSize: "11px" }}
                                                            onClick={() => onRequestExtension(g)}
                                                        >
                                                            <i className="ph ph-clock-countdown me-1"></i>
                                                            Request Date Extension
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-top border-secondary border-opacity-15 pt-3">
                                            <div className="text-secondary small font-monospace mb-2" style={{ fontSize: "11px" }}>
                                                TASKS INSIDE THIS GOAL ({goalTasks.length})
                                            </div>

                                            {goalTasks.length > 0 ? (
                                                <div className="d-flex flex-column gap-2">
                                                    {goalTasks.map((t) => (
                                                        <div
                                                            key={t.id || t._id}
                                                            className="p-2.5 px-3 d-flex align-items-center justify-content-between"
                                                            style={{ background: "var(--bg-surface-elevated)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)" }}
                                                        >
                                                            <div className="d-flex align-items-center gap-2.5">
                                                                <i className="ph ph-check-circle text-secondary"></i>
                                                                <div>
                                                                  <div className="fw-medium small" style={{ color: "var(--text-primary)" }}>{t.title}</div>
                                                                    <div className="text-secondary small" style={{ fontSize: "11px" }}>{t.date}</div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <StatusLabel status={t.status === "Pending" ? "Submitted" : t.status} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-secondary small py-1">
                                                    No tasks logged under this goal yet.
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>
            ) : (
                /* MENTOR & ADMIN TABLE DIRECTORY */
                <div className="ems-table-wrapper">
                    <table className="ems-table">
                        <thead>
                            <tr>
                                <th>Assigned Intern</th>
                                <th>Goal Title</th>
                                <th>Set By</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {goals.map((g) => {
                                const goalId = g.id || g._id;
                                const isComp = g.status === "Completed" || (Number(g.progress) || 0) >= 100;
                                const pendingReq = getPendingExtension(g);

                                return (
                                    <tr key={goalId}>
                                        <td className="fw-semibold" style={{ color: "var(--text-primary)" }}>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="d-flex align-items-center justify-content-center" style={{ width: 26, height: 26, backgroundColor: "var(--accent-subtle)", color: "var(--accent)", borderRadius: "var(--radius)", fontSize: "11px" }}>
                                                    <i className="ph ph-user"></i>
                                                </div>
                                                <span>{resolveInternName(g)}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: "var(--text-primary)" }}>
                                            <div className="fw-medium">{g.title}</div>
                                            {g.description && <div className="text-secondary small" style={{ fontSize: "11px" }}>{g.description}</div>}
                                        </td>
                                        <td className="text-secondary small">{g.setByName || g.setBy?.name || g.setBy || "Mentor"}</td>
                                        <td>
                                            <div className="small fw-medium" style={{ color: "var(--text-primary)" }}>
                                                {formatGoalDue(g.due)}
                                            </div>
                                            {pendingReq && (
                                                <div className="mt-1 d-flex flex-column gap-1">
                                                    <span
                                                        className="badge px-1.5 py-0.5 d-inline-flex align-items-center gap-1"
                                                        style={{
                                                            backgroundColor: "rgba(217, 119, 6, 0.12)",
                                                            color: "#d97706",
                                                            border: "1px solid rgba(217, 119, 6, 0.25)",
                                                            fontSize: "10px",
                                                            borderRadius: "var(--radius)"
                                                        }}
                                                        title={`Reason: ${pendingReq.reason}`}
                                                    >
                                                        <i className="ph ph-clock-countdown"></i>
                                                        Req: {pendingReq.extendedDate || pendingReq.date}
                                                    </span>
                                                    {canExtend && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm py-0 px-0 small text-start border-0 bg-transparent text-primary fw-medium"
                                                            style={{ fontSize: "11px" }}
                                                            onClick={() => onExtendDueDate(goalId, pendingReq.extendedDate || pendingReq.date)}
                                                        >
                                                            <i className="ph ph-check me-0.5"></i> Accept ({pendingReq.extendedDate || pendingReq.date})
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {role === "mentor" && onUpdateStatus ? (
                                                <div className="d-inline-flex align-items-center gap-2">
                                                    <select
                                                        className="form-select form-select-sm glass-input py-1 px-2.5 small"
                                                        value={isComp ? "Completed" : "In Progress"}
                                                        onChange={(e) => onUpdateStatus?.(goalId, e.target.value)}
                                                        title="Update goal status"
                                                    >
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Completed">Completed</option>
                                                    </select>
                                                </div>
                                            ) : (
                                                <StatusLabel status={isComp ? "Completed" : "In Progress"} />
                                            )}
                                        </td>
                                        <td className="text-end">
                                            {canExtend && (
                                                <PillButton
                                                    variant="ghost"
                                                    className="py-1 px-2.5 small"
                                                    onClick={() => openExtendModal(g)}
                                                    title="Extend goal due date"
                                                >
                                                    <i className="ph ph-calendar-plus me-1"></i> Extend Date
                                                </PillButton>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {goals.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-4">
                                        <EmptyState
                                            icon="ph-flag"
                                            title="No goals found"
                                            description={canCreate ? "No goals set yet. Use 'Set Goal' to create an objective milestone for your intern." : "No goal records found in the directory."}
                                            actionLabel={canCreate ? "Set Goal" : undefined}
                                            onAction={canCreate ? () => setShowForm(true) : undefined}
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* EXTEND GOAL DATE MODAL */}
            {extendingGoal && (
                <div
                    className="modal show d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1060 }}
                >
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "480px" }}>
                        <div
                            className="modal-content glass-card p-4 text-start border-0"
                            style={{
                                backgroundColor: "var(--bg-surface)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "var(--radius)"
                            }}
                        >
                            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-secondary border-opacity-25">
                                <div>
                                    <h5 className="font-display m-0 fs-6" style={{ color: "var(--text-primary)" }}>
                                        Extend Goal Deadline
                                    </h5>
                                    <div className="text-secondary small mt-0.5" style={{ fontSize: "11px" }}>
                                        Update the completion deadline for this milestone
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setExtendingGoal(null)}
                                    aria-label="Close"
                                ></button>
                            </div>

                            <form onSubmit={handleConfirmExtend}>
                                <div className="mb-3">
                                    <label className="text-secondary small fw-medium mb-1 d-block">Goal</label>
                                    <div className="fw-semibold" style={{ color: "var(--text-primary)" }}>
                                        {extendingGoal.title}
                                    </div>
                                    <div className="text-secondary small mt-0.5" style={{ fontSize: "11px" }}>
                                        Assigned intern: <strong style={{ color: "var(--text-primary)" }}>{resolveInternName(extendingGoal)}</strong>
                                    </div>
                                </div>

                                <div className="mb-3 p-2.5" style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)" }}>
                                    <div className="d-flex align-items-center justify-content-between small">
                                        <span className="text-secondary">Current Due Date:</span>
                                        <strong style={{ color: "var(--text-primary)" }}>{formatGoalDue(extendingGoal.due)}</strong>
                                    </div>
                                    {(() => {
                                        const p = getPendingExtension(extendingGoal);
                                        if (p) {
                                            return (
                                                <div className="mt-2 pt-2 border-top border-secondary border-opacity-20 text-warning small">
                                                    <i className="ph ph-info me-1"></i>
                                                    Intern requested extension to: <strong>{p.extendedDate || p.date}</strong>
                                                    {p.reason && (
                                                        <div className="text-secondary mt-1 fst-italic" style={{ fontSize: "11px" }}>
                                                            "{p.reason}"
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>

                                <div className="mb-4">
                                    <label className="form-label text-secondary small fw-medium mb-1">
                                        New Extended Due Date <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control glass-input py-2 px-3 small"
                                        value={newExtendDate}
                                        min={new Date().toISOString().split("T")[0]}
                                        onChange={(e) => setNewExtendDate(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="d-flex align-items-center justify-content-end gap-2 pt-2 border-top border-secondary border-opacity-20">
                                    <PillButton
                                        variant="ghost"
                                        type="button"
                                        onClick={() => setExtendingGoal(null)}
                                    >
                                        Cancel
                                    </PillButton>
                                    <PillButton
                                        variant="filled"
                                        type="submit"
                                        disabled={!newExtendDate}
                                    >
                                        <i className="ph ph-check me-1"></i> Save Extended Deadline
                                    </PillButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
