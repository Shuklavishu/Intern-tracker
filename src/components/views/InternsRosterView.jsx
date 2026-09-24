import { useState } from "react";
import { Avatar, GradeChip, Tag, StatusLabel, MentorBadge, Card, PillButton } from "../../Theme";

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
    showDeptFilter = true
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [deptFilter, setDeptFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [mentorFilter, setMentorFilter] = useState("All");

    const filteredInterns = interns.filter((i) => {
        if (!i) return false;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
            !q ||
            (i.name || "").toLowerCase().includes(q) ||
            (i.email || "").toLowerCase().includes(q) ||
            (i.dept || "").toLowerCase().includes(q) ||
            (i.mentor || "").toLowerCase().includes(q);

        const matchesDept = deptFilter === "All" || i.dept === deptFilter;
        const matchesStatus = statusFilter === "All" || i.status === statusFilter;
        const matchesMentor =
            mentorFilter === "All" ||
            (mentorFilter === "Unassigned" ? !i.mentor || i.mentor === "Unassigned" : i.mentor === mentorFilter);

        return matchesSearch && matchesDept && matchesStatus && matchesMentor;
    });

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                <div>
                    <h2 className="font-display text-skywash m-0">{title}</h2>
                    <div className="text-fog small">{subtitle}</div>
                </div>
                {canAdd && (
                    <PillButton variant="filled" onClick={onAddClick}>
                        <i className="bi bi-person-plus me-1"></i> Add Intern
                    </PillButton>
                )}
            </div>

            <Card className="mb-4 p-3">
                <div className="row g-3">
                    <div className={`col-12 ${showDeptFilter && showMentorFilter ? "col-md-4" : "col-md-6"}`}>
                        <div className="position-relative">
                            <input
                                type="text"
                                className="form-control glass-input py-2 ps-5 pe-4 text-frost"
                                placeholder="Search by name, email, department..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-fog"></i>
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="btn btn-sm text-fog position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 fs-5"
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
                                className="form-select glass-input py-2 px-3 text-frost small"
                                value={deptFilter}
                                onChange={(e) => setDeptFilter(e.target.value)}
                            >
                                <option value="All" style={{ background: "#05060f", color: "#c7d3ea" }}>All Departments</option>
                                {departments.map((d) => (
                                    <option key={d.id} value={d.name} style={{ background: "#05060f", color: "#c7d3ea" }}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="col-6 col-md-2">
                        <select
                            className="form-select glass-input py-2 px-3 text-frost small"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All" style={{ background: "#05060f", color: "#c7d3ea" }}>All Statuses</option>
                            <option value="Active" style={{ background: "#05060f", color: "#c7d3ea" }}>Active</option>
                            <option value="At risk" style={{ background: "#05060f", color: "#c7d3ea" }}>At risk</option>
                        </select>
                    </div>

                    {showMentorFilter && (
                        <div className="col-12 col-md-3">
                            <select
                                className="form-select glass-input py-2 px-3 text-frost small"
                                value={mentorFilter}
                                onChange={(e) => setMentorFilter(e.target.value)}
                            >
                                <option value="All" style={{ background: "#05060f", color: "#c7d3ea" }}>All Mentors</option>
                                <option value="Unassigned" style={{ background: "#05060f", color: "#c7d3ea" }}>Unassigned</option>
                                {mentors.map((m) => (
                                    <option key={m} value={m} style={{ background: "#05060f", color: "#c7d3ea" }}>{m}</option>
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
                            <th>Contact</th>
                            <th>Score</th>
                            <th>Status</th>
                            <th className="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInterns.map((i) => (
                            <tr key={i.id}>
                                <td>
                                    <div className="d-flex align-items-center gap-2">
                                        <Avatar initials={i.avatar} bg={i.avatarBg} fg={i.avatarFg} size={30} />
                                        <span className="fw-semibold text-frost">{i.name}</span>
                                    </div>
                                </td>
                                <td className="text-fog small">{i.email}</td>
                                <td><Tag>{i.dept}</Tag></td>
                                <td><MentorBadge name={i.mentor} /></td>
                                <td className="text-fog small">{i.contact || "N/A"}</td>
                                <td><GradeChip score={i.score} /></td>
                                <td><StatusLabel status={i.status} /></td>
                                <td className="text-end">
                                    <div className="d-inline-flex gap-1 flex-wrap justify-content-end">
                                        {onView && (
                                            <PillButton variant="ghost" className="px-2 py-1 fs-7" title="View Profile" onClick={() => onView(i)}>
                                                <i className="bi bi-eye me-1"></i>View
                                            </PillButton>
                                        )}
                                        {onEdit && (
                                            <PillButton variant="ghost" className="px-2 py-1 fs-7 text-warning border border-warning border-opacity-25" title="Edit Intern" onClick={() => onEdit(i)}>
                                                <i className="bi bi-pencil me-1"></i>Edit
                                            </PillButton>
                                        )}
                                        {onAssignMentor && (
                                            <PillButton variant="ghost" className="px-2 py-1 fs-7 text-info border border-info border-opacity-25" title="Assign Mentor" onClick={() => onAssignMentor(i)}>
                                                <i className="bi bi-person-check me-1"></i>Assign
                                            </PillButton>
                                        )}
                                        {onDelete && (
                                            <PillButton variant="danger" className="px-2 py-1 fs-7" title="Delete Intern" onClick={() => onDelete(i.id)}>
                                                <i className="bi bi-trash"></i>
                                            </PillButton>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredInterns.length === 0 && (
                            <tr>
                                <td colSpan="8" className="text-center text-fog py-5">
                                    <i className="bi bi-people fs-2 mb-2 d-block opacity-50"></i>
                                    No interns found matching the selected search/filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
