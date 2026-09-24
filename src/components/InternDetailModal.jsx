import { useState } from "react";
import { Avatar, PillButton, StatCard } from "../Theme";

export default function InternDetailModal({
    intern,
    mentors = [],
    onAssignMentor,
    onClose
}) {
    const [selectedMentor, setSelectedMentor] = useState(intern?.mentor || "");
    const [savedMsg, setSavedMsg] = useState("");

    if (!intern) return null;

    const handleMentorChange = (e) => {
        const val = e.target.value;
        setSelectedMentor(val);
        if (onAssignMentor) {
            onAssignMentor(intern.id, val);
            setSavedMsg(`Assigned to ${val}`);
            setTimeout(() => setSavedMsg(""), 3000);
        }
    };

    return (
        <div className="modal-glass-backdrop">
            <div className="modal-glass-content p-4" style={{ maxWidth: 620 }}>
                <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-10 pb-3">
                    <div className="d-flex align-items-center gap-3">
                        <Avatar initials={intern.avatar} bg={intern.avatarBg} fg={intern.avatarFg} size={48} />
                        <div>
                            <h4 className="font-display text-skywash m-0">{intern.name}</h4>
                            <div className="text-fog small">{intern.dept} &middot; {intern.email}</div>
                        </div>
                    </div>
                    <button type="button" className="btn btn-sm text-fog fs-5 p-0 border-0" onClick={onClose}>&times;</button>
                </div>

                {savedMsg && (
                    <div className="alert bg-success-subtle text-success border border-success-subtle py-2 px-3 rounded small mb-3">
                        <i className="bi bi-check-circle-fill me-2"></i>{savedMsg}
                    </div>
                )}

                <div className="row g-3 mb-4">
                    <div className="col-6"><StatCard label="Overall Score" value={`${intern.score} / 10`} /></div>
                    <div className="col-6"><StatCard label="Department" value={intern.dept || "—"} /></div>
                    <div className="col-6"><StatCard label="Status" value={intern.status} /></div>
                    <div className="col-6"><StatCard label="Contact" value={intern.contact || "—"} /></div>
                </div>

                {onAssignMentor && mentors.length > 0 && (
                    <div className="p-3 rounded mb-4" style={{ background: "rgba(199, 211, 234, 0.04)", border: "1px solid rgba(186, 215, 247, 0.1)" }}>
                        <label className="form-label text-moon small fw-medium mb-1">Reassign Mentor</label>
                        <select
                            className="form-select glass-input py-2 px-3 text-frost"
                            value={selectedMentor}
                            onChange={handleMentorChange}
                        >
                            {mentors.map((m) => (
                                <option key={m} value={m} style={{ background: "#05060f", color: "#c7d3ea" }}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="d-flex justify-content-end">
                    <PillButton variant="filled" onClick={onClose}>Close Profile</PillButton>
                </div>
            </div>
        </div>
    );
}
