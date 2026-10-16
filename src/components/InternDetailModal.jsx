import { useState } from "react";
import { Avatar, PillButton, StatCard } from "../Theme";
import { internshipInfo } from "../utils/internshipInfo";

export default function InternDetailModal({
    intern,
    mentors = [],
    existingMentors = [],
    onAssignMentor,
    onClose
}) {
    const [selectedMentor, setSelectedMentor] = useState(intern?.mentor || "Unassigned");
    const [savedMsg, setSavedMsg] = useState("");

    if (!intern) return null;

    const info = intern.internshipInfo || internshipInfo(intern);
    const internDept = (intern?.dept || "").toLowerCase().trim();

    const deptMentors = (existingMentors || []).length > 0
        ? (existingMentors || []).filter((m) => (m.dept || "").toLowerCase().trim() === internDept)
        : mentors.filter((m) => typeof m === "string");

    const handleMentorChange = (e) => {
        const val = e.target.value;
        setSelectedMentor(val);
        if (onAssignMentor) {
            onAssignMentor(intern.id || intern._id, val);
            setSavedMsg(`Assigned to ${val}`);
            setTimeout(() => setSavedMsg(""), 3000);
        }
    };

    return (
        <div className="modal-glass-backdrop">
            <div className="modal-glass-content p-4 text-start" style={{ maxWidth: 620 }}>
                <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-15 pb-3">
                    <div className="d-flex align-items-center gap-3">
                        <Avatar initials={intern.avatar} bg={intern.avatarBg} fg={intern.avatarFg} size={44} />
                        <div>
                            <h4 className="font-display fs-5 m-0" style={{ color: "var(--text-primary)" }}>{intern.name}</h4>
                            <div className="text-secondary small">{intern.dept} &middot; {intern.email}</div>
                        </div>
                    </div>
                    <button type="button" className="btn btn-sm text-secondary fs-5 p-0 border-0" onClick={onClose}>&times;</button>
                </div>

                {savedMsg && (
                    <div className="alert bg-success-subtle text-success border border-success-subtle py-2 px-3 small mb-3 d-flex align-items-center gap-1.5" style={{ borderRadius: "var(--radius)" }}>
                        <i className="ph ph-check-circle fs-5"></i>
                        <span>{savedMsg}</span>
                    </div>
                )}

                <div className="row g-3 mb-3">
                    <div className="col-6"><StatCard label="Overall Score" value={`${intern.score} / 10`} /></div>
                    <div className="col-6"><StatCard label="Department" value={intern.dept || "—"} /></div>
                    <div className="col-6"><StatCard label="Status" value={intern.status} /></div>
                    <div className="col-6"><StatCard label="Contact" value={intern.contact || "—"} /></div>
                </div>

                {/* Internship Dates & Timeline info */}
                <div className="p-3 mb-3" style={{ background: "var(--bg-surface-elevated)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)" }}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="text-secondary small font-monospace" style={{ fontSize: "11px" }}>INTERNSHIP TIMELINE</span>
                        <span className="badge px-2 py-0.5" style={{ background: "var(--accent-subtle)", color: "var(--accent)", borderRadius: "var(--radius)", fontSize: "11px" }}>
                            {info.state}
                        </span>
                    </div>
                    <div className="small fw-semibold" style={{ color: "var(--text-primary)" }}>
                        {intern.startDate && intern.endDate ? `${intern.startDate} to ${intern.endDate} (Inclusive)` : "Dates not set"}
                    </div>
                    <div className="text-secondary small mt-1" style={{ fontSize: "11px" }}>
                        {info.remainingLabel} &middot; Total duration: {info.durationLabel}
                    </div>
                </div>

                {onAssignMentor && (
                    <div className="p-3 mb-4" style={{ background: "var(--bg-surface-elevated)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)" }}>
                        <label className="form-label text-secondary small fw-medium mb-1">
                            Reassign Mentor ({intern.dept} Department)
                        </label>
                        <select
                            className="form-select glass-input py-2 px-3 small"
                            value={selectedMentor}
                            onChange={handleMentorChange}
                        >
                            <option value="Unassigned">Unassigned</option>
                            {deptMentors.map((m) => {
                                const mentorName = typeof m === "object" ? m.name : m;
                                const mentorRole = typeof m === "object" ? (m.role || "Mentor") : "Mentor";
                                return (
                                    <option key={mentorName} value={mentorName}>
                                        {mentorName} ({mentorRole})
                                    </option>
                                );
                            })}
                        </select>
                        {deptMentors.length === 0 && (
                            <div className="text-warning small mt-1" style={{ fontSize: "11px" }}>
                                No mentors found in {intern.dept} department. Intern will remain Unassigned.
                            </div>
                        )}
                    </div>
                )}

                <div className="d-flex justify-content-end">
                    <PillButton variant="filled" onClick={onClose}>Close Profile</PillButton>
                </div>
            </div>
        </div>
    );
}
