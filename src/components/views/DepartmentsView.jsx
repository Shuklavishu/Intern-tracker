import { useState } from "react";
import { Avatar, GradeChip, StatusLabel, Card, PillButton } from "../../Theme";

export default function DepartmentsView({
    departments = [],
    interns = [],
    onAddInternClick,
    onRemoveIntern
}) {
    const [selectedDept, setSelectedDept] = useState(departments[0]?.name || "Engineering");

    const currentDeptObj = departments.find((d) => d.name === selectedDept) || departments[0];
    const deptInterns = interns.filter((i) => i.dept === selectedDept);

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                <div>
                    <h2 className="font-display text-skywash m-0">Departments Directory</h2>
                    <div className="text-fog small">Department details, organizational leads, and assigned interns</div>
                </div>
                {onAddInternClick && (
                    <PillButton variant="filled" onClick={onAddInternClick}>
                        <i className="bi bi-person-plus me-1"></i> Add Intern
                    </PillButton>
                )}
            </div>

            <Card className="mb-4 p-4">
                <div className="row g-3 align-items-center">
                    <div className="col-12 col-md-4">
                        <label className="form-label text-moon small fw-semibold mb-1">Select Department</label>
                        <select
                            className="form-select glass-input py-2 px-3 text-frost fw-medium"
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                        >
                            {departments.map((d) => (
                                <option key={d.id} value={d.name} style={{ background: "#05060f", color: "#c7d3ea" }}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-12 col-md-5">
                        <div className="text-fog extra-small font-eyebrow">DEPARTMENT FOCUS</div>
                        <div className="text-frost small mt-1">{currentDeptObj?.description || "—"}</div>
                    </div>
                    <div className="col-12 col-md-3 text-md-end">
                        <div className="text-fog extra-small font-eyebrow">ACTIVE INTERNS</div>
                        <div className="fs-3 fw-bold text-skywash">{deptInterns.length}</div>
                    </div>
                </div>
            </Card>

            <div className="ems-table-wrapper">
                <table className="ems-table">
                    <thead>
                        <tr>
                            <th>Intern Name</th>
                            <th>Email</th>
                            <th>Mentor</th>
                            <th>Score</th>
                            <th>Status</th>
                            {onRemoveIntern && <th className="text-end">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {deptInterns.map((i) => (
                            <tr key={i.id}>
                                <td>
                                    <div className="d-flex align-items-center gap-2">
                                        <Avatar initials={i.avatar} bg={i.avatarBg} fg={i.avatarFg} size={30} />
                                        <span className="fw-semibold text-frost">{i.name}</span>
                                    </div>
                                </td>
                                <td className="text-fog small">{i.email}</td>
                                <td className="text-moon fw-medium">{i.mentor}</td>
                                <td><GradeChip score={i.score} /></td>
                                <td><StatusLabel status={i.status} /></td>
                                {onRemoveIntern && (
                                    <td className="text-end">
                                        <PillButton variant="danger" className="py-1 px-3 fs-7" onClick={() => onRemoveIntern(i.id)}>
                                            Remove
                                        </PillButton>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {deptInterns.length === 0 && (
                            <tr>
                                <td colSpan={onRemoveIntern ? 6 : 5} className="text-center text-fog py-4">
                                    No interns currently assigned to this department.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
