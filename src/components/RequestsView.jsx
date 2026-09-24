import { useState } from "react";
import { PillButton, StatusLabel, RequestTypeBadge, Card } from "../Theme";

export default function RequestsView({
    title = "Requests & Applications",
    subtitle = "Time-off leave and task deadline extension requests",
    requests = [],
    canReview = false,
    onApprove,
    onReject,
    canSubmit = false,
    onSubmitRequest,
    showInternColumn = true
}) {
    const [reqType, setReqType] = useState("Time-off / Leave");
    const [reqReason, setReqReason] = useState("");
    const [reqDate, setReqDate] = useState("");

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!reqReason.trim()) return;
        if (onSubmitRequest) {
            onSubmitRequest({
                type: reqType,
                reason: reqReason.trim(),
                date: reqDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            });
        }
        setReqReason("");
        setReqDate("");
    };

    return (
        <div>
            <div className="mb-4">
                <h2 className="font-display text-skywash m-0">{title}</h2>
                <div className="text-fog small">{subtitle}</div>
            </div>

            {canSubmit && (
                <Card className="p-4 mb-4">
                    <h5 className="font-display text-skywash mb-3">Submit a New Request</h5>
                    <form onSubmit={handleFormSubmit}>
                        <div className="row g-3">
                            <div className="col-12 col-md-4">
                                <label className="form-label text-moon small fw-medium mb-1">Request Type</label>
                                <select
                                    className="form-select glass-input py-2 px-3 text-frost"
                                    value={reqType}
                                    onChange={(e) => setReqType(e.target.value)}
                                >
                                    <option value="Time-off / Leave" style={{ background: "#05060f", color: "#c7d3ea" }}>Time-off / Leave</option>
                                    <option value="Task Extension" style={{ background: "#05060f", color: "#c7d3ea" }}>Task Extension</option>
                                </select>
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label text-moon small fw-medium mb-1">Target Date</label>
                                <input
                                    className="form-control glass-input py-2 px-3"
                                    type="date"
                                    value={reqDate}
                                    onChange={(e) => setReqDate(e.target.value)}
                                />
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label text-moon small fw-medium mb-1">Reason / Notes</label>
                                <input
                                    className="form-control glass-input py-2 px-3"
                                    placeholder="Explain your request"
                                    value={reqReason}
                                    onChange={(e) => setReqReason(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="mt-3 text-end">
                            <PillButton variant="filled" type="submit" disabled={!reqReason.trim()}>
                                <i className="bi bi-send me-1"></i> Submit Request
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
                            <th>Reason</th>
                            <th>Target Date</th>
                            <th>Status</th>
                            {canReview && <th className="text-end">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((r) => (
                            <tr key={r.id}>
                                {showInternColumn && <td className="fw-semibold text-frost">{r.intern}</td>}
                                <td><RequestTypeBadge type={r.type} /></td>
                                <td className="text-fog small">{r.reason}</td>
                                <td className="text-fog small">{r.date}</td>
                                <td><StatusLabel status={r.status} /></td>
                                {canReview && (
                                    <td className="text-end">
                                        {r.status === "Pending" ? (
                                            <div className="d-inline-flex gap-2">
                                                <PillButton
                                                    variant="filled"
                                                    className="py-1 px-3 fs-7"
                                                    onClick={() => onApprove && onApprove(r.id || r._id)}
                                                >
                                                    Approve
                                                </PillButton>
                                                <PillButton
                                                    variant="danger"
                                                    className="py-1 px-3 fs-7"
                                                    onClick={() => onReject && onReject(r.id || r._id)}
                                                >
                                                    Reject
                                                </PillButton>
                                            </div>
                                        ) : (
                                            <span className="text-fog small fst-italic">Reviewed</span>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                        {requests.length === 0 && (
                            <tr>
                                <td colSpan={showInternColumn ? (canReview ? 6 : 5) : (canReview ? 5 : 4)} className="text-center text-fog py-4">
                                    No requests submitted.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
