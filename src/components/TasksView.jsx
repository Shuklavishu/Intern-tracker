import { useState, useMemo } from "react";
import { PillButton, StatusLabel, Card, EmptyState } from "../Theme";

export default function TasksView({
    title = "Tasks",
    subtitle = "Manage and track work activities",
    tasks = [],
    goals = [],
    canApprove = false,
    onApprove,
    onReject,
    canCreate = false,
    onCreateTask,
    showInternColumn = true,
    role = "intern"
}) {
    const isIntern = role === "intern" || (!canApprove && canCreate);

    const openGoals = useMemo(() => {
        return (goals || []).filter((g) => g && g.status !== "Completed" && (Number(g.progress) || 0) < 100);
    }, [goals]);

    const [taskTitle, setTaskTitle] = useState("");
    const [taskHours, setTaskHours] = useState("");
    const [selectedGoalId, setSelectedGoalId] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [rejectModalTask, setRejectModalTask] = useState(null);
    const [rejectionReasonText, setRejectionReasonText] = useState("");

    const effectiveGoalId = (selectedGoalId && openGoals.some((g) => (g.id || g._id) === selectedGoalId))
        ? selectedGoalId
        : openGoals.length === 1
            ? (openGoals[0].id || openGoals[0]._id)
            : selectedGoalId;

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (!taskTitle.trim() || !taskHours) return;

        const goalToAssign = effectiveGoalId || selectedGoalId;
        if (!goalToAssign) {
            setErrorMsg("Please select an open goal. Every task must belong to a goal.");
            return;
        }

        if (onCreateTask) {
            onCreateTask({
                title: taskTitle.trim(),
                hours: Number(taskHours),
                goalId: goalToAssign,
                goal: goalToAssign,
            });
        }

        setTaskTitle("");
        setTaskHours("");
    };

    return (
        <div className="text-start">
            <div className="mb-4 text-start">
                <h2 className="font-display h3 m-0" style={{ color: "var(--text-primary)" }}>{title}</h2>
                <div className="text-secondary small mt-1" style={{ maxWidth: "65ch" }}>{subtitle}</div>
            </div>

            {canCreate && (
                <Card className="p-4 mb-4 text-start">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <h5 className="font-display m-0 fs-6" style={{ color: "var(--text-primary)" }}>Log a New Task</h5>
                        <span className="badge" style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent)", borderRadius: "var(--radius)", fontSize: "11px" }}>
                            {openGoals.length} Open Goal{openGoals.length > 1 ? "s" : ""}
                        </span>
                    </div>

                    {errorMsg && (
                        <div className="p-2 mb-3 small d-flex align-items-center gap-2" style={{ backgroundColor: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "#ef4444", borderRadius: "var(--radius)" }}>
                            <i className="ph ph-warning-circle fs-5"></i>
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-12 col-md-4">
                                <label className="form-label text-secondary small fw-medium mb-1">
                                    Select Goal <span className="text-danger">*</span>
                                </label>
                                <select
                                    className="form-select glass-input py-2 px-3 small"
                                    value={effectiveGoalId || ""}
                                    onChange={(e) => {
                                        setSelectedGoalId(e.target.value);
                                        setErrorMsg("");
                                    }}
                                    required
                                >
                                    <option value="">— Select an open goal —</option>
                                    {openGoals.map((g) => (
                                        <option key={g.id || g._id} value={g.id || g._id}>
                                            {g.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-12 col-md-5">
                                <label className="form-label text-secondary small fw-medium mb-1">
                                    Task Title / Description <span className="text-danger">*</span>
                                </label>
                                <input
                                    className="form-control glass-input py-2 px-3 small"
                                    placeholder="e.g. Implemented OAuth token refresh flow"
                                    value={taskTitle}
                                    onChange={(e) => setTaskTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="col-12 col-md-3">
                                <label className="form-label text-secondary small fw-medium mb-1">
                                    Hours <span className="text-danger">*</span>
                                </label>
                                <input
                                    className="form-control glass-input py-2 px-3 small"
                                    placeholder="e.g. 4"
                                    type="number"
                                    min="0.5"
                                    step="0.5"
                                    max="24"
                                    value={taskHours}
                                    onChange={(e) => setTaskHours(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-3 text-end">
                            <PillButton variant="filled" type="submit" disabled={!taskTitle.trim() || !taskHours || !selectedGoalId}>
                                <i className="ph ph-paper-plane-tilt me-1.5"></i> Submit Task
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
                            <th>Task Title</th>
                            <th>Goal</th>
                            <th>{showInternColumn ? "Reviewed By" : "Logged"}</th>
                            <th>Hours</th>
                            <th>Date</th>
                            <th>Status</th>
                            {canApprove && <th className="text-end">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((t) => {
                            const linkedGoal = (goals || []).find(
                                (g) => (g.id || g._id) === (t.goal?._id || t.goal?.id || t.goal)
                            );
                            const goalTitle = t.goal?.title || linkedGoal?.title || "—";
                            return (
                                <tr key={t.id || t._id}>
                                    {showInternColumn && (
                                        <td className="fw-semibold" style={{ color: "var(--text-primary)" }}>
                                            {t.internName || (typeof t.intern === "object" ? t.intern?.name : t.intern) || "—"}
                                        </td>
                                    )}
                                    <td style={{ color: "var(--text-primary)" }}>{t.title}</td>
                                    <td className="text-secondary small">
                                        {goalTitle !== "—" ? (
                                            <span
                                                className="badge px-2 py-0.5"
                                                style={{ background: "var(--accent-subtle)", color: "var(--accent)", borderRadius: "var(--radius)", fontSize: "11px" }}
                                            >
                                                {goalTitle}
                                            </span>
                                        ) : (
                                            <span className="text-secondary opacity-50">—</span>
                                        )}
                                    </td>
                                    <td className="text-secondary small">{t.reviewedBy || t.assignedBy || "—"}</td>
                                    <td>{t.hours} hrs</td>
                                    <td className="text-secondary small">{t.date}</td>
                                    <td>
                                        <div className="d-flex flex-column align-items-start">
                                            <StatusLabel
                                                status={isIntern && t.status === "Pending" ? "Submitted" : t.status}
                                            />
                                            {t.status === "Rejected" && (
                                                <div
                                                    className="mt-1 d-inline-flex align-items-center gap-1 text-danger small px-2 py-0.5"
                                                    style={{
                                                        backgroundColor: "rgba(239, 68, 68, 0.12)",
                                                        border: "1px solid rgba(239, 68, 68, 0.25)",
                                                        borderRadius: "var(--radius)",
                                                        maxWidth: 240,
                                                        fontSize: "11px"
                                                    }}
                                                    title={t.rejectionReason || "No specific reason provided"}
                                                >
                                                    <i className="ph ph-info flex-shrink-0"></i>
                                                    <span className="text-truncate">
                                                        <strong>Note:</strong> {t.rejectionReason || "Not approved"}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    {canApprove && (
                                        <td className="text-end">
                                            {t.status === "Pending" ? (
                                                <div className="d-inline-flex gap-2">
                                                    <PillButton
                                                        variant="filled"
                                                        className="py-1 px-2.5 small"
                                                        onClick={() => onApprove && onApprove(t.id || t._id)}
                                                    >
                                                        Approve
                                                    </PillButton>
                                                    <PillButton
                                                        variant="danger"
                                                        className="py-1 px-2.5 small"
                                                        onClick={() => {
                                                            setRejectModalTask(t);
                                                            setRejectionReasonText("");
                                                        }}
                                                    >
                                                        Reject
                                                    </PillButton>
                                                </div>
                                            ) : (
                                                <span className="text-secondary small fst-italic">{t.status}</span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                        {tasks.length === 0 && (
                            <tr>
                                <td colSpan={showInternColumn ? (canApprove ? 8 : 7) : 6} className="p-4">
                                    <EmptyState
                                        icon="ph-check-square"
                                        title="No tasks logged"
                                        description="Tasks logged by interns will show up in this ledger for mentor review and verification."
                                    />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Task Rejection Reason Modal */}
            {rejectModalTask && (
                <div
                    className="modal show d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: "rgba(0,0,0,0.65)", zIndex: 1050 }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content glass-modal text-start">
                            <div className="modal-header border-bottom border-secondary border-opacity-15 pb-3">
                                <div>
                                    <h5 className="modal-title font-display m-0 d-flex align-items-center gap-2" style={{ color: "var(--text-primary)" }}>
                                        <i className="ph ph-warning text-danger"></i>
                                        Reject Task Note
                                    </h5>
                                    <div className="text-secondary small mt-1">
                                        Provide a clear explanation so the intern understands what to correct.
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setRejectModalTask(null)}
                                ></button>
                            </div>

                            <div className="modal-body py-3">
                                <div className="p-3 mb-3" style={{ background: "var(--bg-surface-elevated)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)" }}>
                                    <div className="text-secondary small font-monospace mb-1" style={{ fontSize: "11px" }}>TASK DETAILS</div>
                                    <div className="fw-semibold" style={{ color: "var(--text-primary)" }}>{rejectModalTask.title}</div>
                                    <div className="text-secondary small mt-1">
                                        Intern: <span style={{ color: "var(--text-primary)" }}>{rejectModalTask.internName || rejectModalTask.intern}</span> &middot; Hours: <span>{rejectModalTask.hours} hrs</span>
                                    </div>
                                </div>

                                <label className="form-label text-secondary small fw-medium mb-1">
                                    Rejection Reason Note <span className="text-danger">*</span>
                                </label>
                                <textarea
                                    className="form-control glass-input py-2 px-3 mb-2"
                                    rows="3"
                                    placeholder="Explain why this task was rejected (e.g. Missing unit tests, incorrect hours logged, requirements incomplete)..."
                                    value={rejectionReasonText}
                                    onChange={(e) => setRejectionReasonText(e.target.value)}
                                    autoFocus
                                ></textarea>

                                <div className="d-flex flex-wrap gap-1 mb-2">
                                    {[
                                        "Incomplete requirements",
                                        "Hours exceed scope",
                                        "Missing documentation",
                                        "Needs code review fixes"
                                    ].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            type="button"
                                            className="btn btn-sm btn-secondary-flat py-0 px-2"
                                            style={{ fontSize: "11px" }}
                                            onClick={() => setRejectionReasonText(suggestion)}
                                        >
                                            + {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="modal-footer border-top border-secondary border-opacity-15 pt-3">
                                <PillButton
                                    variant="ghost"
                                    onClick={() => setRejectModalTask(null)}
                                >
                                    Cancel
                                </PillButton>
                                <PillButton
                                    variant="danger"
                                    disabled={!rejectionReasonText.trim()}
                                    onClick={() => {
                                        if (onReject) {
                                            onReject(rejectModalTask.id || rejectModalTask._id, rejectionReasonText.trim());
                                        }
                                        setRejectModalTask(null);
                                    }}
                                >
                                    <i className="ph ph-x-circle me-1"></i> Confirm Rejection
                                </PillButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
