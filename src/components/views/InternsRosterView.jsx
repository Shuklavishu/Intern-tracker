import { useState, useMemo } from "react";
import { Avatar, GradeChip, Tag, StatusLabel, AtRiskBadge, MentorBadge, Card, PillButton, EmptyState } from "../../Theme";
import { internshipInfo } from "../../utils/internshipInfo";

export default function InternsRosterView({
    title = "Interns Roster",
    subtitle = "Complete register of interns",
    interns = [],
    departments = [],
    mentors = [],
    canAdd = false,
    onAddClick,
    onView,
    onEdit,
    onAssignMentor,
    onDelete,
    showMentorFilter = true,
    showDeptFilter = true,
    role = "admin",
    onUpdateStatus
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [deptFilter, setDeptFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("Active");
    const [mentorFilter, setMentorFilter] = useState("All");

    const isAtRisk = (intern) => {
        const s = intern.status || "Active";
        const score = Number(intern.score) || 0;
        return s === "Active" && (score < 6);
    };

    const filteredInterns = useMemo(() => interns.filter((i) => {
        if (!i) return false;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
            !q ||
            (i.name || "").toLowerCase().includes(q) ||
            (i.email || "").toLowerCase().includes(q) ||
            (i.dept || "").toLowerCase().includes(q) ||
            (i.mentor || "").toLowerCase().includes(q);

        const matchesDept = deptFilter === "All" || i.dept === deptFilter;
        const matchesStatus =
            statusFilter === "All" || (i.status || "Active") === statusFilter;
        const matchesMentor =
            mentorFilter === "All" ||
            (mentorFilter === "Unassigned" ? !i.mentor || i.mentor === "Unassigned" : i.mentor === mentorFilter);

        return matchesSearch && matchesDept && matchesStatus && matchesMentor;
    }), [interns, searchQuery, deptFilter, statusFilter, mentorFilter]);

    return (
        <div className="text-start">
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                <div className="text-start">
                    <h2 className="font-display h3 m-0" style={{ color: "var(--text-primary)" }}>{title}</h2>
                    <div className="text-secondary small mt-1" style={{ maxWidth: "65ch" }}>{subtitle}</div>
                </div>
                {canAdd && (
                    <PillButton variant="filled" onClick={onAddClick}>
                        <i className="ph ph-user-plus me-1.5"></i> Add Intern
                    </PillButton>
                )}
            </div>

            <Card className="mb-4 p-3">
                <div className="row g-2">
                    <div className={`col-12 ${showDeptFilter && showMentorFilter ? "col-md-4" : "col-md-6"}`}>
                        <div className="position-relative">
                            <input
                                type="text"
                                className="form-control glass-input search-input-field py-2 pe-4"
                                placeholder="Search by name, email, department..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <i className="ph ph-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="btn btn-sm text-secondary position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 fs-5"
                                    onClick={() => setSearchQuery("")}
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                    </div>

                    {showDeptFilter && (
                        <div className="col-6 col-md-3">
                            <select
                                className="form-select glass-input py-2 px-3 small"
                                value={deptFilter}
                                onChange={(e) => setDeptFilter(e.target.value)}
                            >
                                <option value="All">All Departments</option>
                                {departments.map((d) => (
                                    <option key={d.id} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="col-6 col-md-2">
                        <select
                            className="form-select glass-input py-2 px-3 small"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="On Leave">On Leave</option>
                            <option value="Completed">Completed</option>
                            <option value="Terminated">Terminated</option>
                        </select>
                    </div>

                    {showMentorFilter && (
                        <div className="col-12 col-md-3">
                            <select
                                className="form-select glass-input py-2 px-3 small"
                                value={mentorFilter}
                                onChange={(e) => setMentorFilter(e.target.value)}
                            >
                                <option value="All">All Mentors</option>
                                <option value="Unassigned">Unassigned</option>
                                {mentors.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </Card>

            <div className="ems-table-wrapper">
                <table className="ems-table">
                    <thead>
                        <tr>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Mentor</th>
                            <th>Dates & Duration</th>
                            <th>Score</th>
                            <th>Status</th>
                            <th className="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInterns.map((i) => {
                            const isProtected = ["Completed", "Terminated"].includes(i.status);
                            const info = i.internshipInfo || internshipInfo(i);
                            return (
                                <tr key={i.id || i._id}>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <Avatar initials={i.avatar} bg={i.avatarBg} fg={i.avatarFg} size={30} />
                                            <div>
                                                <span className="fw-semibold d-block" style={{ color: "var(--text-primary)" }}>{i.name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-secondary small">{i.email}</td>
                                    <td><Tag>{i.dept}</Tag></td>
                                    <td><MentorBadge name={i.mentor} /></td>
                                    <td>
                                        {i.startDate && i.endDate ? (
                                            <div>
                                                <div className="small fw-semibold" style={{ color: "var(--text-primary)" }}>
                                                    {i.startDate} &rarr; {i.endDate}
                                                </div>
                                                <div className="d-flex align-items-center gap-1.5 mt-1 flex-wrap">
                                                    <span
                                                        className="badge px-1.5 py-0.5"
                                                        style={{
                                                            backgroundColor: info.state === "Ongoing" ? "var(--accent-subtle)" : "var(--bg-subtle)",
                                                            color: info.state === "Ongoing" ? "var(--accent)" : "var(--text-secondary)",
                                                            fontSize: "11px",
                                                            borderRadius: "var(--radius)"
                                                        }}
                                                    >
                                                        {info.state}
                                                    </span>
                                                    <span className="text-secondary small" style={{ fontSize: "11px" }}>
                                                        {info.remainingLabel} &middot; ({info.durationLabel})
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-secondary small">Dates not set</span>
                                        )}
                                    </td>
                                    <td><GradeChip score={i.score} /></td>
                                    <td>
                                        <div className="d-flex flex-column gap-1 align-items-start">
                                            {(role === "admin" || role === "mentor") && onUpdateStatus ? (
                                                <select
                                                    className="form-select form-select-sm glass-input py-1 px-2"
                                                    style={{
                                                        fontSize: "0.78rem",
                                                        minWidth: "125px",
                                                    }}
                                                    value={i.status || "Active"}
                                                    onChange={(e) => onUpdateStatus(i.id || i._id, e.target.value)}
                                                >
                                                    <option value="Active">Active</option>
                                                    <option value="On Leave">On Leave</option>
                                                    <option value="Completed">Completed</option>
                                                    {role === "admin" && (
                                                        <option value="Terminated">Terminated</option>
                                                    )}
                                                </select>
                                            ) : (
                                                <StatusLabel status={i.status || "Active"} />
                                            )}
                                            {isAtRisk(i) && <AtRiskBadge />}
                                        </div>
                                    </td>
                                    <td className="text-end">
                                        <div className="d-inline-flex gap-1 flex-wrap justify-content-end">
                                            {onView && (
                                                <PillButton variant="ghost" className="px-2 py-1 small" title="View Profile" onClick={() => onView(i)}>
                                                    <i className="ph ph-eye me-1"></i>View
                                                </PillButton>
                                            )}

                                            {onEdit && (
                                                <PillButton variant="ghost" className="px-2 py-1 small" title="Edit Intern" onClick={() => onEdit(i)}>
                                                    <i className="ph ph-pencil-simple me-1"></i>Edit
                                                </PillButton>
                                            )}
                                            {onAssignMentor && (
                                                <PillButton variant="ghost" className="px-2 py-1 small" title="Assign Mentor" onClick={() => onAssignMentor(i)}>
                                                    <i className="ph ph-user-check me-1"></i>Assign
                                                </PillButton>
                                            )}
                                            {onDelete && (
                                                <PillButton
                                                    variant="danger"
                                                    className="px-2 py-1 small"
                                                    title={isProtected ? "Interns with status Completed or Terminated cannot be deleted." : "Delete Intern"}
                                                    disabled={isProtected}
                                                    onClick={() => !isProtected && onDelete(i.id || i._id)}
                                                >
                                                    <i className="ph ph-trash"></i>
                                                </PillButton>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredInterns.length === 0 && (
                            <tr>
                                <td colSpan="8" className="p-4">
                                    <EmptyState
                                        icon="ph-users"
                                        title="No interns found"
                                        description="No interns match your current search query or filter settings."
                                        actionLabel={canAdd ? "Add New Intern" : undefined}
                                        onAction={canAdd ? onAddClick : undefined}
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
