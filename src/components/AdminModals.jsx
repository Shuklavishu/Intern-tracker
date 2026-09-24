import { useState } from "react";
import { PillButton, TextField } from "../Theme";
import { AVATAR_COLORS, initialsFromName } from "../utils/helpers";

export function AddInternModalForm({ onClose, onAdd, departments, mentors }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [dept, setDept] = useState(departments[0]?.name || "Engineering");
    const [mentor, setMentor] = useState(mentors[0] || "Unassigned");
    const [password, setPassword] = useState("password123");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) return;
        const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
        onAdd({
            id: Date.now(),
            name: name.trim(),
            email: email.trim(),
            password: password.trim() || "password123",
            dept,
            mentor: mentor || "Unassigned",
            contact: "+1 (555) 000-0000",
            start: "Today",
            status: "Active",
            score: 8.0,
            avatar: initialsFromName(name.trim()),
            avatarBg: color.bg,
            avatarFg: color.fg,
        });
        onClose();
    };

    return (
        <div className="modal-glass-backdrop">
            <div className="modal-glass-content p-4" style={{ maxWidth: 520 }}>
                <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-10 pb-3">
                    <h4 className="font-display text-skywash m-0">Onboard New Intern</h4>
                    <button type="button" className="btn btn-sm text-fog fs-5 p-0 border-0" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <TextField label="Full Name" placeholder="Jordan Patel" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <TextField label="Email Address" type="email" placeholder="jordan@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="row g-3 mb-3">
                        <div className="col-6">
                            <label className="form-label text-moon small fw-medium mb-1">Department</label>
                            <select className="form-select glass-input py-2 px-3 text-frost" value={dept} onChange={(e) => setDept(e.target.value)}>
                                {departments.map((d) => (
                                    <option key={d.id} value={d.name} style={{ background: "#05060f", color: "#c7d3ea" }}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-6">
                            <label className="form-label text-moon small fw-medium mb-1">Assigned Mentor</label>
                            <select className="form-select glass-input py-2 px-3 text-frost" value={mentor} onChange={(e) => setMentor(e.target.value)}>
                                {mentors.length > 0 ? (
                                    mentors.map((m) => (
                                        <option key={m} value={m} style={{ background: "#05060f", color: "#c7d3ea" }}>{m}</option>
                                    ))
                                ) : (
                                    <option value="Unassigned" style={{ background: "#05060f", color: "#c7d3ea" }}>Unassigned</option>
                                )}
                            </select>
                        </div>
                    </div>
                    <div className="mb-4">
                        <TextField label="Initial Password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <div className="text-fog extra-small mt-1">Credentials the intern will use to sign in to their portal.</div>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <PillButton variant="ghost" type="button" onClick={onClose}>Cancel</PillButton>
                        <PillButton variant="filled" type="submit">Save Intern</PillButton>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function AddMentorModalForm({ onClose, onAdd, departments }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [dept, setDept] = useState(departments[0]?.name || "Engineering");
    const [role, setRole] = useState("Staff Engineer");
    const [password, setPassword] = useState("password123");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) return;
        onAdd({
            id: Date.now(),
            name: name.trim(),
            email: email.trim(),
            dept,
            role: role.trim(),
            password
        });
        onClose();
    };

    return (
        <div className="modal-glass-backdrop">
            <div className="modal-glass-content p-4" style={{ maxWidth: 520 }}>
                <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-10 pb-3">
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-person-badge-fill text-skywash fs-4"></i>
                        <h4 className="font-display text-skywash m-0">Register New Mentor</h4>
                    </div>
                    <button type="button" className="btn btn-sm text-fog fs-5 p-0 border-0" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <TextField label="Full Name" placeholder="Rohan Verma" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <TextField label="Work Email Address" type="email" placeholder="rohan@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="row g-3 mb-3">
                        <div className="col-6">
                            <label className="form-label text-moon small fw-medium mb-1">Department</label>
                            <select className="form-select glass-input py-2 px-3 text-frost" value={dept} onChange={(e) => setDept(e.target.value)}>
                                {departments.map((d) => (
                                    <option key={d.id} value={d.name} style={{ background: "#05060f", color: "#c7d3ea" }}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-6">
                            <TextField label="Job Title / Role" placeholder="Senior Staff Engineer" value={role} onChange={(e) => setRole(e.target.value)} required />
                        </div>
                    </div>
                    <div className="mb-4">
                        <TextField label="Initial Password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <div className="text-fog extra-small mt-1">Provisioned for the mentor's login account.</div>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <PillButton variant="ghost" type="button" onClick={onClose}>Cancel</PillButton>
                        <PillButton variant="filled" type="submit">
                            <i className="bi bi-person-plus me-1"></i> Register Mentor
                        </PillButton>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function AssignMentorModal({ onClose, onAssign, interns, mentors, defaultIntern = null, defaultMentor = null }) {
    const initialInternId = defaultIntern ? defaultIntern.id : (interns[0]?.id || "");
    const [selectedInternId, setSelectedInternId] = useState(initialInternId);

    const targetInternObj = interns.find((i) => i.id === Number(selectedInternId));
    const initialMentor = defaultMentor || targetInternObj?.mentor || mentors[0] || "";
    const [selectedMentor, setSelectedMentor] = useState(initialMentor);
    const [assignedSuccess, setAssignedSuccess] = useState(false);

    const handleInternChange = (e) => {
        const id = Number(e.target.value);
        setSelectedInternId(id);
        const match = interns.find((i) => i.id === id);
        if (match && match.mentor) {
            setSelectedMentor(match.mentor);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedInternId || !selectedMentor) return;
        onAssign(Number(selectedInternId), selectedMentor);
        setAssignedSuccess(true);
        setTimeout(() => {
            onClose();
        }, 800);
    };

    return (
        <div className="modal-glass-backdrop">
            <div className="modal-glass-content p-4" style={{ maxWidth: 540 }}>
                <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-10 pb-3">
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-person-gear fs-4 text-info"></i>
                        <h4 className="font-display text-skywash m-0">Assign Mentor to Intern</h4>
                    </div>
                    <button type="button" className="btn btn-sm text-fog fs-5 p-0 border-0" onClick={onClose}>&times;</button>
                </div>

                {assignedSuccess && (
                    <div className="alert bg-success-subtle text-success border border-success-subtle p-3 rounded mb-3">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        Mentor successfully assigned!
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label text-moon small fw-medium mb-1">Select Intern</label>
                        <select
                            className="form-select glass-input py-2 px-3 text-frost"
                            value={selectedInternId}
                            onChange={handleInternChange}
                        >
                            {interns.map((i) => (
                                <option key={i.id} value={i.id} style={{ background: "#05060f", color: "#c7d3ea" }}>
                                    {i.name} ({i.dept}) — Current: {i.mentor || "Unassigned"}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="form-label text-moon small fw-medium mb-1">Assign to Mentor</label>
                        <select
                            className="form-select glass-input py-2 px-3 text-frost"
                            value={selectedMentor}
                            onChange={(e) => setSelectedMentor(e.target.value)}
                        >
                            {mentors.map((m) => (
                                <option key={m} value={m} style={{ background: "#05060f", color: "#c7d3ea" }}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>

                    {targetInternObj && (
                        <div className="card-glass-subtle p-3 mb-4 rounded border border-secondary border-opacity-10">
                            <div className="text-fog extra-small font-eyebrow mb-2">ASSIGNMENT SUMMARY</div>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <div className="text-frost fw-semibold fs-6">{targetInternObj.name}</div>
                                    <div className="text-fog small">{targetInternObj.dept} &middot; {targetInternObj.email}</div>
                                </div>
                                <div className="text-end">
                                    <div className="text-fog extra-small">New Mentor</div>
                                    <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fs-7">
                                        {selectedMentor}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="d-flex justify-content-end gap-2">
                        <PillButton variant="ghost" type="button" onClick={onClose}>Cancel</PillButton>
                        <PillButton variant="filled" type="submit">
                            <i className="bi bi-check2-circle me-1"></i> Save Assignment
                        </PillButton>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function EditInternModalForm({ intern, onClose, onSave, departments, mentors }) {
    const [name, setName] = useState(intern.name || "");
    const [email, setEmail] = useState(intern.email || "");
    const [dept, setDept] = useState(intern.dept || departments[0]?.name || "Engineering");
    const [mentor, setMentor] = useState(intern.mentor || mentors[0] || "Unassigned");
    const [status, setStatus] = useState(intern.status || "Active");
    const [score, setScore] = useState(intern.score ?? 8.0);
    const [contact, setContact] = useState(intern.contact || "+1 (555) 000-0000");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) return;
        onSave({
            ...intern,
            name: name.trim(),
            email: email.trim(),
            dept,
            mentor,
            status,
            score: Number(score),
            contact: contact.trim(),
            avatar: initialsFromName(name.trim())
        });
        onClose();
    };

    return (
        <div className="modal-glass-backdrop">
            <div className="modal-glass-content p-4" style={{ maxWidth: 580 }}>
                <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-10 pb-3">
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-pencil-square text-skywash fs-4"></i>
                        <h4 className="font-display text-skywash m-0">Edit Intern Profile</h4>
                    </div>
                    <button type="button" className="btn btn-sm text-fog fs-5 p-0 border-0" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="row g-3 mb-3">
                        <div className="col-12 col-sm-6">
                            <TextField label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="col-12 col-sm-6">
                            <TextField label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                    </div>
                    <div className="row g-3 mb-3">
                        <div className="col-12 col-sm-6">
                            <label className="form-label text-moon small fw-medium mb-1">Department</label>
                            <select className="form-select glass-input py-2 px-3 text-frost" value={dept} onChange={(e) => setDept(e.target.value)}>
                                {departments.map((d) => (
                                    <option key={d.id} value={d.name} style={{ background: "#05060f", color: "#c7d3ea" }}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-12 col-sm-6">
                            <label className="form-label text-moon small fw-medium mb-1">Assigned Mentor</label>
                            <select className="form-select glass-input py-2 px-3 text-frost" value={mentor} onChange={(e) => setMentor(e.target.value)}>
                                {mentors.map((m) => (
                                    <option key={m} value={m} style={{ background: "#05060f", color: "#c7d3ea" }}>{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="row g-3 mb-3">
                        <div className="col-12 col-sm-6">
                            <label className="form-label text-moon small fw-medium mb-1">Status</label>
                            <select className="form-select glass-input py-2 px-3 text-frost" value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="Active" style={{ background: "#05060f", color: "#c7d3ea" }}>Active</option>
                                <option value="At risk" style={{ background: "#05060f", color: "#c7d3ea" }}>At risk</option>
                            </select>
                        </div>
                        <div className="col-12 col-sm-6">
                            <TextField label="Score (0-10)" type="number" step="0.1" min="0" max="10" value={score} onChange={(e) => setScore(e.target.value)} required />
                        </div>
                    </div>
                    <div className="mb-4">
                        <TextField label="Contact Number" value={contact} onChange={(e) => setContact(e.target.value)} />
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <PillButton variant="ghost" type="button" onClick={onClose}>Cancel</PillButton>
                        <PillButton variant="filled" type="submit">
                            <i className="bi bi-check2-circle me-1"></i> Save Changes
                        </PillButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
