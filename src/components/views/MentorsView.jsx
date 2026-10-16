import { Avatar, Card, PillButton, EmptyState } from "../../Theme";
import { initialsFromName } from "../../utils/helpers";

export default function MentorsView({
    mentorsData = [],
    interns = [],
    onAssignClick,
    onAddMentorClick,
    onDeleteMentorClick
}) {
    return (
        <div className="text-start">
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                <div className="text-start">
                    <h2 className="font-display h3 m-0" style={{ color: "var(--text-primary)" }}>Mentor Profiles</h2>
                    <div className="text-secondary small mt-1" style={{ maxWidth: "65ch" }}>Overview of active mentor leads and assigned interns</div>
                </div>
                {onAddMentorClick && (
                    <PillButton variant="filled" onClick={onAddMentorClick}>
                        <i className="ph ph-user-plus me-1.5"></i> Add Mentor
                    </PillButton>
                )}
            </div>

            {mentorsData.length === 0 ? (
                <EmptyState
                    icon="ph-identification-badge"
                    title="No mentors registered"
                    description="Create mentor profiles to pair leads with interns in matching departments."
                    actionLabel={onAddMentorClick ? "Add New Mentor" : undefined}
                    onAction={onAddMentorClick}
                />
            ) : (
                <div className="row g-4">
                    {mentorsData.map((m) => {
                        const assigned = interns.filter((i) => (i.mentor || "").toLowerCase().trim() === (m.name || "").toLowerCase().trim());
                        const mentorId = m.id || m._id;
                        return (
                            <div key={mentorId} className="col-12 col-md-4">
                                <Card className="h-100 p-4 text-start">
                                    <div className="d-flex align-items-start justify-content-between mb-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <Avatar
                                                initials={initialsFromName(m.name)}
                                                size={44}
                                            />
                                            <div>
                                                <div className="font-display fw-bold fs-6" style={{ color: "var(--text-primary)" }}>{m.name}</div>
                                                <div className="text-secondary small">{m.role} {m.dept ? `· ${m.dept}` : ""}</div>
                                            </div>
                                        </div>
                                        {onDeleteMentorClick && (
                                            <PillButton
                                                variant="danger"
                                                className="px-2 py-1 small"
                                                title="Remove Mentor"
                                                onClick={() => {
                                                    if (window.confirm(`Are you sure you want to remove mentor "${m.name}"?`)) {
                                                        onDeleteMentorClick(mentorId);
                                                    }
                                                }}
                                            >
                                                <i className="ph ph-trash"></i>
                                            </PillButton>
                                        )}
                                    </div>

                                    <div className="text-secondary small mb-3 d-flex align-items-center gap-2">
                                        <i className="ph ph-envelope text-primary"></i>
                                        <span>{m.email}</span>
                                    </div>

                                    <div className="border-top border-secondary border-opacity-15 pt-3">
                                        <div className="d-flex justify-content-between align-items-center text-secondary small font-monospace mb-2" style={{ fontSize: "11px" }}>
                                            <span>ASSIGNED INTERNS ({assigned.length})</span>
                                            {onAssignClick && (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-link text-primary p-0 border-0 text-decoration-none small"
                                                    onClick={() => onAssignClick(m.name)}
                                                >
                                                    <i className="ph ph-plus-circle me-1"></i>Assign
                                                </button>
                                            )}
                                        </div>
                                        <div className="d-flex flex-wrap gap-1.5">
                                            {assigned.length > 0 ? (
                                                assigned.map((i) => (
                                                    <span
                                                        key={i.id || i._id}
                                                        className="badge px-2 py-1 d-inline-flex align-items-center gap-1"
                                                        style={{
                                                            color: "var(--accent)",
                                                            backgroundColor: "var(--accent-subtle)",
                                                            border: "1px solid var(--accent-border)",
                                                            fontSize: "11px",
                                                            borderRadius: "var(--radius)"
                                                        }}
                                                    >
                                                        <i className="ph ph-user"></i>
                                                        {i.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-secondary small">No interns assigned yet</span>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
