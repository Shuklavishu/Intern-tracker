import { useState } from "react";
import { PillButton, StatusLabel, RequestTypeBadge, Card, EmptyState } from "../Theme";

export default function RequestsView({
    title = "Requests & Applications",
    subtitle = "Time-off leave, Work From Home (WFH), and Goal Date Extension applications",
    requests = [],
    goals = [],
    canReview = false,
    onApprove,
    onReject,
    canSubmit = false,
    onSubmitRequest,
    showInternColumn = true
}) {
    const todayStr = new Date().toISOString().split("T")[0];
    const [reqType, setReqType] = useState("Time-off / Leave");
    const [reqReason, setReqReason] = useState("");
    const [startDate, setStartDate] = useState(todayStr);
    const [endDate, setEndDate] = useState(todayStr);

    // Goal Extension specific state
    const [selectedGoalId, setSelectedGoalId] = useState("");
    const [extendedDate, setExtendedDate] = useState("");

    const activeGoal = goals.find((g) => String(g.id || g._id) === String(selectedGoalId)) || goals[0];
    const effectiveExtendedDate = extendedDate || (activeGoal?.due || todayStr);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!reqReason.trim()) return;

        if (reqType === "Goal Date Extension") {
            if (!activeGoal) {
                alert("Please select a goal to extend.");
                return;
            }
            const finalDate = extendedDate || effectiveExtendedDate;
            if (!finalDate) {
                alert("Please specify a new extended due date.");
                return;
            }

            if (onSubmitRequest) {
                onSubmitRequest({
                    type: "Goal Date Extension",
                    goalId: activeGoal.id || activeGoal._id,
                    goalTitle: activeGoal.title,
                    currentDueDate: activeGoal.due || "",
                    extendedDate: finalDate,
                    startDate: activeGoal.due || todayStr,
                    endDate: finalDate,
                    date: finalDate,
                    targetDate: finalDate,
                    reason: reqReason.trim(),
                });
            }
            setReqReason("");
            return;
        }

        if (startDate > endDate) {
            alert("Start date cannot be after end date.");
            return;
        }

        if (onSubmitRequest) {
            onSubmitRequest({
                type: reqType,
                reason: reqReason.trim(),
                startDate,
                endDate,
                date: startDate === endDate ? startDate : `${startDate} to ${endDate}`,
                targetDate: endDate,
            });
        }
        setReqReason("");
    };

    const isGoalExt = reqType === "Goal Date Extension";

    return (
        <div className="text-start">
            <div className="mb-4 text-start">
                <h2 className="font-display h3 m-0" style={{ color: "var(--text-primary)" }}>{title}</h2>
                <div className="text-secondary small mt-1" style={{ maxWidth: "65ch" }}>{subtitle}</div>
            </div>

            {canSubmit && (
                <Card className="p-4 mb-4 text-start">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <h5 className="font-display m-0 fs-6" style={{ color: "var(--text-primary)" }}>
                            Submit a New Request
                        </h5>
                        <span className="badge" style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent)", fontSize: "11px" }}>
                            Intern Desk
                        </span>
                    </div>

                    <form onSubmit={handleFormSubmit}>
                        <div className="row g-3">
                            <div className="col-12 col-md-3">
                                <label className="form-label text-secondary small fw-medium mb-1">Request Type</label>
                                <select
                                    className="form-select glass-input py-2 px-3 small"
                                    value={reqType}
                                    onChange={(e) => {
                                        setReqType(e.target.value);
                                        if (e.target.value === "Goal Date Extension" && goals.length > 0) {
                                            setSelectedGoalId(goals[0].id || goals[0]._id);
                                            setExtendedDate(goals[0].due || todayStr);
                                        }
                                    }}
                                >
                                    <option value="Time-off / Leave">Time-off / Leave</option>
                                    <option value="Work From Home (WFH) / Remote Day">Work From Home (WFH) / Remote Day</option>
                                    <option value="Goal Date Extension">Goal Date Extension</option>
                                </select>
                            </div>

                            {isGoalExt ? (
                                <>
                                    <div className="col-12 col-md-3">
                                        <label className="form-label text-secondary small fw-medium mb-1">Select Goal <span className="text-danger">*</span></label>
                                        <select
                                            className="form-select glass-input py-2 px-3 small"
                                            value={selectedGoalId}
                                            onChange={(e) => {
                                                setSelectedGoalId(e.target.value);
                                                const match = goals.find((g) => String(g.id || g._id) === String(e.target.value));
                                                if (match?.due) {
                                                    setExtendedDate(match.due);
                                                }
                                            }}
                                            required
                                        >
                                            {goals.length > 0 ? (
                                                goals.map((g) => (
                                                    <option key={g.id || g._id} value={g.id || g._id}>
                                                        {g.title} (Due: {g.due})
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="">No assigned goals found</option>
                                            )}
                                        </select>
                                    </div>

                                    <div className="col-12 col-md-3">
                                        <label className="form-label text-secondary small fw-medium mb-1">New Extended Due Date <span className="text-danger">*</span></label>
                                        <input
                                            className="form-control glass-input py-2 px-3 small"
                                            type="date"
                                            value={extendedDate}
                                            min={activeGoal?.due || todayStr}
                                            onChange={(e) => setExtendedDate(e.target.value)}
                                            required
                                        />
                                        {activeGoal?.due && (
                                            <div className="text-secondary small mt-1" style={{ fontSize: "11px" }}>
                                                Current Due: <strong style={{ color: "var(--text-primary)" }}>{activeGoal.due}</strong>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="col-12 col-md-3">
                                        <label className="form-label text-secondary small fw-medium mb-1">Start Date</label>
                                        <input
                                            className="form-control glass-input py-2 px-3 small"
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-12 col-md-3">
                                        <label className="form-label text-secondary small fw-medium mb-1">End Date</label>
                                        <input
                                            className="form-control glass-input py-2 px-3 small"
                                            type="date"
                                            value={endDate}
                                            min={startDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <div className="col-12 col-md-3">
                                <label className="form-label text-secondary small fw-medium mb-1">
                                    {isGoalExt ? "Reason for Extension" : "Reason / Notes"} <span className="text-danger">*</span>
                                </label>
                                <input
                                    className="form-control glass-input py-2 px-3 small"
                                    placeholder={isGoalExt ? "Explain why more time is needed" : "Explain your request"}
                                    value={reqReason}
                                    onChange={(e) => setReqReason(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-3 text-end">
                            <PillButton
                                variant="filled"
                                type="submit"
                                disabled={
                                    !reqReason.trim() ||
                                    (isGoalExt ? (!activeGoal || !extendedDate) : (!startDate || !endDate))
                                }
                            >
                                <i className="ph ph-paper-plane-tilt me-1.5"></i>
                                {isGoalExt ? "Request Date Extension" : "Submit Request"}
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
                            <th>Type</th>
                            <th>Details & Reason</th>
                            <th>Current / Start Date</th>
                            <th>Requested / End Date</th>
                            <th>Status</th>
                            {canReview && <th className="text-end">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((r) => {
                            const isGoalRequest = (r.type || "").toLowerCase().includes("extension") || (r.type || "").toLowerCase().includes("goal");
                            const start = isGoalRequest
                                ? (r.currentDueDate || r.startDate || "Current Due")
                                : (r.startDate || (r.date && !r.date.includes("to") ? r.date : r.date?.split(" to ")[0]) || "N/A");

                            const end = isGoalRequest
                                ? (r.extendedDate || r.endDate || r.targetDate || r.date || "N/A")
                                : (r.endDate || (r.date && r.date.includes("to") ? r.date?.split(" to ")[1] : r.targetDate || start) || "N/A");

                            return (
                                <tr key={r.id || r._id}>
                                    {showInternColumn && <td className="fw-semibold" style={{ color: "var(--text-primary)" }}>{r.internName || r.intern}</td>}
                                    <td><RequestTypeBadge type={r.type || "Leave"} /></td>
                                    <td>
                                        {isGoalRequest ? (
                                            <div>
                                                <div className="fw-semibold" style={{ color: "var(--text-primary)" }}>
                                                    <i className="ph ph-flag me-1 text-primary"></i>
                                                    {r.goalTitle || "Assigned Goal"}
                                                </div>
                                                <div className="text-secondary small mt-0.5">{r.reason}</div>
                                            </div>
                                        ) : (
                                            <div className="text-secondary small">{r.reason}</div>
                                        )}
                                    </td>
                                    <td className="small fw-medium" style={{ color: "var(--text-primary)" }}>{start}</td>
                                    <td className="small fw-medium" style={{ color: isGoalRequest ? "#d97706" : "var(--text-primary)" }}>
                                        {end}
                                    </td>
                                    <td><StatusLabel status={r.status} /></td>
                                    {canReview && (
                                        <td className="text-end">
                                            {r.status === "Pending" ? (
                                                <div className="d-inline-flex gap-2">
                                                    <PillButton
                                                        variant="filled"
                                                        className="py-1 px-2.5 small"
                                                        onClick={() => onApprove && onApprove(r.id || r._id)}
                                                    >
                                                        Approve
                                                    </PillButton>
                                                    <PillButton
                                                        variant="danger"
                                                        className="py-1 px-2.5 small"
                                                        onClick={() => onReject && onReject(r.id || r._id)}
                                                    >
                                                        Deny
                                                    </PillButton>
                                                </div>
                                            ) : (
                                                <span className="text-secondary small fst-italic">{r.status}</span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                        {requests.length === 0 && (
                            <tr>
                                <td colSpan={showInternColumn ? (canReview ? 7 : 6) : (canReview ? 6 : 5)} className="p-4">
                                    <EmptyState
                                        icon="ph-file-text"
                                        title="No requests submitted"
                                        description="Leave, Work From Home (WFH), and Goal Date Extension applications will be listed here."
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
