import { useState } from "react";
import { PillButton, StatusLabel, Card } from "../Theme";

export default function TasksView({
    title = "Tasks",
    subtitle = "Manage and track work activities",
    tasks = [],
    goals = [],        // optional: intern's goals for linking a task to a goal
    canApprove = false,
    onApprove,
    onReject,
    canCreate = false,
    onCreateTask,
    showInternColumn = true
}) {
    const [taskTitle, setTaskTitle] = useState("");
    const [taskHours, setTaskHours] = useState("");
    const [linkedGoalId, setLinkedGoalId] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!taskTitle.trim() || !taskHours) return;
        if (onCreateTask) {
            onCreateTask({
                title: taskTitle.trim(),
                hours: Number(taskHours),
                ...(linkedGoalId ? { goalId: linkedGoalId } : {}),
            });
        }
        setTaskTitle("");
        setTaskHours("");
        setLinkedGoalId("");
    };

    return (
        <div>
            <div className="mb-4">
                <h2 className="font-display text-skywash m-0">{title}</h2>
                <div className="text-fog small">{subtitle}</div>
            </div>

            {canCreate && (
                <Card className="p-4 mb-4">
                    <h5 className="font-display text-skywash mb-3">Log a New Task</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-12 col-md-7">
                                <label className="form-label text-moon small fw-medium mb-1">Task Title / Description</label>
                                <input
                                    className="form-control glass-input py-2 px-3"
                                    placeholder="e.g. Optimized database query performance"
                                    value={taskTitle}
                                    onChange={(e) => setTaskTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="col-6 col-md-2">
                                <label className="form-label text-moon small fw-medium mb-1">Hours</label>
                                <input
                                    className="form-control glass-input py-2 px-3"
                                    placeholder="e.g. 5"
                                    type="number"
                                    min="1"
                                    max="24"
                                    value={taskHours}
                                    onChange={(e) => setTaskHours(e.target.value.replace(/[^0-9]/g, ""))}
                                    required
                                />
                            </div>
                            {goals.length > 0 && (
                                <div className="col-6 col-md-3">
                                    <label className="form-label text-moon small fw-medium mb-1">Link to Goal <span className="text-fog">(optional)</span></label>
                                    <select
                                        className="form-select glass-input py-2 px-3 text-frost"
                                        value={linkedGoalId}
                                        onChange={(e) => setLinkedGoalId(e.target.value)}
                                    >
                                        <option value="" style={{ background: "#05060f", color: "#c7d3ea" }}>— none —</option>
                                        {goals.map((g) => (
                                            <option key={g.id || g._id} value={g.id || g._id} style={{ background: "#05060f", color: "#c7d3ea" }}>
                                                {g.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="mt-3 text-end">
                            <PillButton variant="filled" type="submit" disabled={!taskTitle.trim() || !taskHours}>
                                <i className="bi bi-plus-circle me-1"></i> Log Task (Submits as Pending)
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
                            const linkedGoal = goals.find((g) => (g.id || g._id) === (t.goal?._id || t.goal));
                            return (
                                <tr key={t.id || t._id}>
                                    {showInternColumn && <td className="fw-semibold text-frost">{t.intern}</td>}
                                    <td className="text-moon">{t.title}</td>
                                    <td className="text-fog small">
                                        {linkedGoal
                                            ? <span className="badge rounded-pill" style={{ background: "rgba(101,58,183,0.18)", color: "#a78bfa", fontSize: "0.75em" }}>{linkedGoal.title}</span>
                                            : <span className="text-fog" style={{ opacity: 0.4 }}>—</span>
                                        }
                                    </td>
                                    <td className="text-fog small">{t.reviewedBy || t.assignedBy || "—"}</td>
                                    <td>{t.hours} hrs</td>
                                    <td className="text-fog small">{t.date}</td>
                                    <td><StatusLabel status={t.status} /></td>
                                    {canApprove && (
                                        <td className="text-end">
                                            {t.status === "Pending" ? (
                                                <div className="d-inline-flex gap-2">
                                                    <PillButton
                                                        variant="filled"
                                                        className="py-1 px-3 fs-7"
                                                        onClick={() => onApprove && onApprove(t.id || t._id)}
                                                    >
                                                        Approve
                                                    </PillButton>
                                                    <PillButton
                                                        variant="danger"
                                                        className="py-1 px-3 fs-7"
                                                        onClick={() => onReject && onReject(t.id || t._id)}
                                                    >
                                                        Reject
                                                    </PillButton>
                                                </div>
                                            ) : (
                                                <span className="text-fog small fst-italic">{t.status}</span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                        {tasks.length === 0 && (
                            <tr>
                                <td colSpan={showInternColumn ? (canApprove ? 8 : 7) : 6} className="text-center text-fog py-4">
                                    No tasks logged yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
