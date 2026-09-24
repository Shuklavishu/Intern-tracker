import { useState } from "react";
import { PillButton, TextField } from "../Theme";

export default function NoticeModal({
    isOpen = true,
    onClose,
    onIssue,
    user,
    departments = [],
    allowAllDepartments = true
}) {
    const defaultAudience = allowAllDepartments ? "All Departments" : (departments[0]?.name || "All Departments");
    const [title, setTitle] = useState("");
    const [audience, setAudience] = useState(defaultAudience);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        if (onIssue) {
            onIssue({
                id: `N-${Math.floor(100 + Math.random() * 900)}`,
                title: title.trim(),
                audience,
                createdBy: user?.name || "Admin",
                date: "Today",
            });
        }
        onClose();
    };

    return (
        <div className="modal-glass-backdrop">
            <div className="modal-glass-content p-4">
                <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-10 pb-3">
                    <h4 className="font-display text-skywash m-0">Issue Notice / Broadcast</h4>
                    <button type="button" className="btn btn-sm text-fog fs-5 p-0 border-0" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <TextField
                            label="Notice Title"
                            placeholder="e.g. Q3 Sprint All-Hands Meeting"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label text-moon small fw-medium mb-1">Target Audience</label>
                        <select
                            className="form-select glass-input py-2 px-3 text-frost"
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                        >
                            {allowAllDepartments && (
                                <option value="All Departments" style={{ background: "#05060f", color: "#c7d3ea" }}>
                                    All Departments
                                </option>
                            )}
                            {departments.map((d) => (
                                <option key={d.id} value={d.name} style={{ background: "#05060f", color: "#c7d3ea" }}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <PillButton variant="ghost" type="button" onClick={onClose}>Cancel</PillButton>
                        <PillButton variant="filled" type="submit">Broadcast</PillButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
