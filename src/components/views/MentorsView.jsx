import { Avatar, Card, PillButton } from "../../Theme";
import { initialsFromName } from "../../utils/helpers";

export default function MentorsView({
    mentorsData = [],
    interns = [],
    onAssignClick,
    onAddMentorClick,
    onDeleteMentorClick
}) {
    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                <div>
                    <h2 className="font-display text-skywash m-0">Mentor Profiles</h2>
                    <div className="text-fog small">Overview of active mentor leads and assigned interns</div>
                </div>
                {onAddMentorClick && (
                    <PillButton variant="filled" onClick={onAddMentorClick}>
                        <i className="bi bi-person-plus me-1"></i> Add Mentor
                    </PillButton>
                )}
            </div>

            <div className="row g-4">
                {mentorsData.map((m) => {
                    const assigned = interns.filter((i) => i.mentor === m.name);
                    const mentorId = m.id || m._id;
                    return (
                        <div key={mentorId} className="col-12 col-md-4">
                            <Card className="h-100 p-4 position-relative">
                                <div className="d-flex align-items-start justify-content-between mb-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <Avatar
                                            initials={initialsFromName(m.name)}
                                            bg="rgba(224, 86, 38, 0.25)"
                                            fg="#d8ecf8"
                                            size={48}
                                        />
                                        <div>
                                            <div className="font-display text-frost fw-bold fs-5">{m.name}</div>
                                            <div className="text-fog small">{m.role}</div>
                                        </div>
                                    </div>
                                    {onDeleteMentorClick && (
                                        <PillButton
                                            variant="danger"
                                            className="px-2 py-1 fs-7"
                                            title="Remove Mentor"
                                            onClick={() => {
                                                if (window.confirm(`Are you sure you want to remove mentor "${m.name}"?`)) {
                                                    onDeleteMentorClick(mentorId);
                                                }
                                            }}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </PillButton>
                                    )}
                                </div>

                                <div className="text-moon small mb-3">
                                    <i className="bi bi-envelope me-2 text-info"></i>{m.email}
                                </div>

                                <div className="border-top border-secondary border-opacity-10 pt-3">
                                    <div className="d-flex justify-content-between align-items-center text-fog small font-eyebrow mb-2">
                                        <span>ASSIGNED INTERNS ({assigned.length})</span>
                                        {onAssignClick && (
                                            <button
                                                type="button"
                                                className="btn btn-sm text-info p-0 fs-7 border-0 bg-transparent"
                                                onClick={() => onAssignClick(m.name)}
                                            >
                                                <i className="bi bi-plus-circle me-1"></i>Assign
                                            </button>
                                        )}
                                    </div>
                                    <div className="d-flex flex-wrap gap-2">
                                        {assigned.length > 0 ? (
                                            assigned.map((i) => (
                                                <span
                                                    key={i.id || i._id}
                                                    className="badge rounded-pill px-2.5 py-1 extra-small fw-medium d-inline-flex align-items-center gap-1"
                                                    style={{
                                                        color: "#38bdf8",
                                                        backgroundColor: "rgba(56, 189, 248, 0.14)",
                                                        border: "1px solid rgba(56, 189, 248, 0.3)"
                                                    }}
                                                >
                                                    <i className="bi bi-person opacity-75"></i>
                                                    {i.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-fog extra-small italic">No interns assigned yet</span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
