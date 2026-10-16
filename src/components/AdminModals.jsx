import { useState } from "react";
import { PillButton, TextField } from "../Theme";
import { AVATAR_COLORS, initialsFromName, isValidEmail, isValidName } from "../utils/helpers";

export function AddInternModalForm({ onClose, onAdd, departments, existingInterns = [], existingMentors = [] }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("password123");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [dept, setDept] = useState(departments[0]?.name || "Engineering");

    // Mentors belonging to currently chosen department
    const availableDeptMentors = (existingMentors || []).filter(
        (m) => (m.dept || "").toLowerCase().trim() === (dept || "").toLowerCase().trim()
    );
    const [mentor, setMentor] = useState(availableDeptMentors[0]?.name || "Unassigned");
    const countryCode = "+91";
    const [contact, setContact] = useState("8888888888");
    const [error, setError] = useState("");

    const handleDeptChange = (newDept) => {
        setDept(newDept);
        setError("");
        const newDeptMentors = (existingMentors || []).filter(
            (m) => (m.dept || "").toLowerCase().trim() === newDept.toLowerCase().trim()
        );
        setMentor(newDeptMentors[0]?.name || "Unassigned");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) return;
        if (!isValidName(name.trim())) {
            setError("Please enter a valid full name (2-50 letters, spaces, dots, or hyphens only).");
            return;
        }
        if (!isValidEmail(email.trim())) {
            setError("Please enter a valid email address (e.g. name@gmail.com).");
            return;
        }

        const normalizedEmail = email.toLowerCase().trim();
        if (existingInterns.some((i) => (i.email || "").toLowerCase().trim() === normalizedEmail)) {
            setError("This email address is already in use by another intern. Email must be unique for everyone.");
            return;
        }
        if (existingMentors.some((m) => (m.email || "").toLowerCase().trim() === normalizedEmail)) {
            setError("This email address is already in use by a mentor. Email must be unique for everyone.");
            return;
        }

        // Validate mentor belongs to the same department
        if (mentor && mentor !== "Unassigned") {
            const mentorMatch = (existingMentors || []).find((m) => m.name === mentor);
            if (mentorMatch && (mentorMatch.dept || "").toLowerCase().trim() !== (dept || "").toLowerCase().trim()) {
                setError(`Intern can only be assigned to a mentor from the same department (${mentorMatch.dept} vs ${dept}).`);
                return;
            }
        }

        if (!startDate || !endDate) {
            setError("Both internship start date and end date are required.");
            return;
        }
        if (endDate < startDate) {
            setError("End date cannot be before start date.");
            return;
        }
        if (!password || password.length < 6) {
            setError("Temporary password must be at least 6 characters.");
            return;
        }
        if (contact && contact.trim().length !== 10) {
            setError("Contact number must be exactly 10 digits.");
            return;
        }
        setError("");
        const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
        try {
            await onAdd({
                id: Date.now(),
                name: name.trim(),
                email: email.trim(),
                password: password.trim(),
                startDate: startDate.trim(),
                endDate: endDate.trim(),
                dept,
                mentor: mentor || "Unassigned",
                contact: contact.trim() ? `${countryCode} ${contact.trim()}` : "",
                status: "Active",
                score: 8.0,
                avatar: initialsFromName(name.trim()),
                avatarBg: color.bg,
                avatarFg: color.fg,
            });
            onClose();
        } catch (err) {
            setError(err.message || "Failed to onboard intern.");
        }
    };

    return (
        <div className="modal-glass-backdrop">
            <div className="modal-glass-content p-4" style={{ maxWidth: 540 }}>
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom border-secondary border-opacity-15 pb-3">
                    <h4 className="font-display fs-5 m-0" style={{ color: "var(--text-primary)" }}>Onboard New Intern</h4>
                    <button type="button" className="btn btn-sm text-secondary fs-5 p-0 border-0" onClick={onClose}>&times;</button>
                </div>
                {error && (
                    <div className="p-2 mb-3 small d-flex align-items-center gap-2" style={{ backgroundColor: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "#ef4444", borderRadius: "var(--radius)" }}>
                        <i className="ph ph-warning fs-5"></i>
                        <span>{error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="row g-3 mb-3">
                        <div className="col-12 col-sm-6">
                            <TextField
                                label="Full Name *"
                                placeholder="Amit Patel"
                                pattern="[a-zA-Z\s.'-]{2,50}"
                                title="Please enter a valid name (2-50 letters, spaces, dots, or hyphens)"
                                value={name}
                                onChange={(e) => { setName(e.target.value); setError(""); }}
                                required
                            />
                        </div>
                        <div className="col-12 col-sm-6">
                            <TextField
                                label="Email Address *"
                                type="email"
                                pattern="[^\s@]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*(?<!\.(?:com|org|net|edu|gov))\.(?!comcom|netnet|orgorg|educom)(?:com|org|net|edu|gov|in|io|co|me|[A-Za-z]{2,6})"
                                title="Please enter a valid email address (e.g. name@gmail.com)"
                                placeholder="jordan@gmail.com"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                required
                            />
                        </div>
                    </div>

                    {/* Internship Dates (Required) */}
                    <div className="row g-3 mb-3">
                        <div className="col-12 col-sm-6">
                            <label className="form-label text-moon small fw-medium mb-1">
                                Start Date <span className="text-danger">*</span>
                            </label>
                            <input
                                type="date"
                                className="form-control glass-input py-2 px-3 text-frost"
                                value={startDate}
                                onChange={(e) => { setStartDate(e.target.value); setError(""); }}
                                required
                            />
                        </div>
                        <div className="col-12 col-sm-6">
                            <label className="form-label text-moon small fw-medium mb-1">
                                End Date <span className="text-danger">*</span>
                            </label>
                            <input
                                type="date"
                                className="form-control glass-input py-2 px-3 text-frost"
                                min={startDate || undefined}
                                value={endDate}
                                onChange={(e) => { setEndDate(e.target.value); setError(""); }}
                                required
                            />
                        </div>
                    </div>

                    <div className="row g-3 mb-3">
                        <div className="col-6">
                            <label className="form-label text-moon small fw-medium mb-1">
                                Department <span className="text-danger">*</span>
                            </label>
                            <select
                                className="form-select glass-input py-2 px-3 text-frost"
                                value={dept}
                                onChange={(e) => handleDeptChange(e.target.value)}
                                required
                            >
                                {departments.map((d) => (
                                    <option key={d.id} value={d.name} style={{ background: "#05060f", color: "#c7d3ea" }}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-6">
                            <label className="form-label text-moon small fw-medium mb-1">
                                Assigned Mentor ({dept})
                            </label>
                            <select
                                className="form-select glass-input py-2 px-3 text-frost"
                                value={mentor}
                                onChange={(e) => { setMentor(e.target.value); setError(""); }}
                            >
                                <option value="Unassigned" style={{ background: "#05060f", color: "#c7d3ea" }}>Unassigned</option>
                                {availableDeptMentors.map((m) => (
                                    <option key={m.id || m._id || m.name} value={m.name} style={{ background: "#05060f", color: "#c7d3ea" }}>
                                        {m.name} ({m.dept})
                                    </option>
                                ))}
                            </select>
                            {availableDeptMentors.length === 0 && (
                                <div className="text-warning extra-small mt-1">
                                    No mentors in {dept}. Intern will be Unassigned.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="row g-3 mb-3">
                        <div className="col-12 col-sm-6">
                            <label className="form-label text-moon small fw-medium mb-1">Contact Number</label>
                            <div className="input-group">
                                <span className="input-group-text glass-input text-moon px-2" style={{ borderColor: "rgba(255, 255, 255, 0.15)" }}>
                                    {countryCode}
                                </span>
                                <input
                                    type="text"
                                    className="form-control glass-input py-2 px-3 text-frost"
                                    placeholder="8888888888"
                                    maxLength={10}
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                />
                            </div>
                        </div>
                        <div className="col-12 col-sm-6">
                            <TextField
                                label="Temporary Password *"
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>


                    <div className="d-flex justify-content-end gap-2">
                        <PillButton variant="ghost" type="button" onClick={onClose}>Cancel</PillButton>
                        <PillButton variant="filled" type="submit">Save & Onboard Intern</PillButton>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function EditInternDatesModal({ intern, onClose, onSaveDates }) {
    const [startDate, setStartDate] = useState(intern?.startDate || "");
    const [endDate, setEndDate] = useState(intern?.endDate || "");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!startDate || !endDate) {
            setError("Both start date and end date are required.");
            return;
        }
        if (endDate < startDate) {
            setError("End date cannot be before start date.");
            return;
        }
        setError("");
        setLoading(true);
        try {
            await onSaveDates(intern.id || intern._id, { startDate, endDate });
            onClose();
        } catch (err) {
            setError(err.message || "Failed to update dates");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-glass-backdrop">
            <div className="modal-glass-content p-4" style={{ maxWidth: 480 }}>
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom border-secondary border-opacity-15 pb-3">
                    <div>
                        <h4 className="font-display fs-5 m-0" style={{ color: "var(--text-primary)" }}>Edit Internship Dates</h4>
                        <div className="text-secondary small mt-0.5">Extend or shorten internship duration for {intern?.name}</div>
                    </div>
                    <button type="button" className="btn btn-sm text-secondary fs-5 p-0 border-0" onClick={onClose}>&times;</button>
                </div>
                {error && (
                    <div className="p-2 mb-3 small d-flex align-items-center gap-2" style={{ backgroundColor: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "#ef4444", borderRadius: "var(--radius)" }}>
                        <i className="ph ph-warning fs-5"></i>
                        <span>{error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label text-moon small fw-medium mb-1">
                            Start Date <span className="text-danger">*</span>
                        </label>
                        <input
                            type="date"
                            className="form-control glass-input py-2 px-3 text-frost"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setError(""); }}
                            required
                        />

                    </div>
                    <div className="mb-4">
                        <label className="form-label text-moon small fw-medium mb-1">
                            End Date (Inclusive) <span className="text-danger">*</span>
                        </label>
                        <input
                            type="date"
                            className="form-control glass-input py-2 px-3 text-frost"
                            min={startDate || undefined}
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setError(""); }}
                            required
                        />

                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <PillButton variant="ghost" type="button" onClick={onClose}>Cancel</PillButton>
                        <PillButton variant="filled" type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Save Dates"}
                        </PillButton>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function AddMentorModalForm({ onClose, onAdd, departments, existingInterns = [], existingMentors = [] }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [dept, setDept] = useState(departments[0]?.name || "Engineering");
    const [role, setRole] = useState("Staff Engineer");
    const [password, setPassword] = useState("password123");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Full name is required.");
            return;
        }
        if (!isValidName(name.trim())) {
            setError("Please enter a valid full name (2-50 letters, spaces, or hyphens only).");
            return;
        }
        if (!email.trim()) {
            setError("Work email address is required.");
            return;
        }
        if (!isValidEmail(email.trim())) {
            setError("Please enter a valid work email address (e.g. name@gmail.com).");
            return;
        }
        if (!dept.trim()) {
            setError("Department is required.");
            return;
        }
        if (!role.trim()) {
            setError("Job title / role is required.");
            return;
        }
        if (!password || password.trim().length < 6) {
            setError("Initial password is required (minimum 6 characters).");
            return;
        }

        const normalizedEmail = email.toLowerCase().trim();
        if (existingMentors.some((m) => (m.email || "").toLowerCase().trim() === normalizedEmail)) {
            setError("This email address is already in use by another mentor. Email must be unique for everyone.");
            return;
        }
        if (existingInterns.some((i) => (i.email || "").toLowerCase().trim() === normalizedEmail)) {
            setError("This email address is already in use by an intern. Email must be unique for everyone.");
            return;
        }

        setError("");
        try {
            await onAdd({
                id: Date.now(),
                name: name.trim(),
                email: email.trim(),
                dept: dept.trim(),
                role: role.trim(),
                password: password.trim()
            });
            onClose();
        } catch (err) {
            setError(err.message || "Failed to register mentor.");
        }
    };

    return (
        <div className="modal-glass-backdrop">
            <div className="modal-glass-content p-4" style={{ maxWidth: 520 }}>
                <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-15 pb-3">
                    <div className="d-flex align-items-center gap-2">
                        <i className="ph ph-identification-badge fs-4 text-primary"></i>
                        <h4 className="font-display fs-5 m-0" style={{ color: "var(--text-primary)" }}>Register New Mentor</h4>
                    </div>
                    <button type="button" className="btn btn-sm text-secondary fs-5 p-0 border-0" onClick={onClose}>&times;</button>
                </div>
                {error && (
                    <div className="p-2 mb-3 small d-flex align-items-center gap-2" style={{ backgroundColor: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "#ef4444", borderRadius: "var(--radius)" }}>
                        <i className="ph ph-warning fs-5"></i>
                        <span>{error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <TextField
                            label="Full Name *"
                            placeholder="Rohan Verma"
                            pattern="[a-zA-Z\s.'-]{2,50}"
                            title="Please enter a valid name (2-50 letters, spaces, dots, or hyphens)"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setError(""); }}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <TextField
                            label="Work Email Address *"
                            type="email"
                            pattern="[^\s@]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*(?<!\.(?:com|org|net|edu|gov))\.(?!comcom|netnet|orgorg|educom)(?:com|org|net|edu|gov|in|io|co|me|[A-Za-z]{2,6})"
                            title="Please enter a valid email address (e.g. name@gmail.com)"
                            placeholder="rohan@gmail.com"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(""); }}
                            required
                        />
                    </div>
                    <div className="row g-3 mb-3">
                        <div className="col-6">
                            <label className="form-label text-moon small fw-medium mb-1">
                                Department <span className="text-danger">*</span>
                            </label>
                            <select
                                className="form-select glass-input py-2 px-3 text-frost"
                                value={dept}
                                onChange={(e) => { setDept(e.target.value); setError(""); }}
                                required
                            >
                                {departments.map((d) => (
                                    <option key={d.id} value={d.name} style={{ background: "#05060f", color: "#c7d3ea" }}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-6">
                            <TextField
                                label="Job Title / Role *"
                                placeholder="Senior Staff Engineer"
                                value={role}
                                onChange={(e) => { setRole(e.target.value); setError(""); }}
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <TextField
                            label="Initial Password *"
                            type="text"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(""); }}
                            required
                        />
                        <div className="text-fog extra-small mt-1">Provisioned for the mentor's login account (min 6 characters).</div>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <PillButton variant="ghost" type="button" onClick={onClose}>Cancel</PillButton>
                        <PillButton variant="filled" type="submit">
                            <i className="ph ph-user-plus me-1.5"></i> Register Mentor
                        </PillButton>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function AssignMentorModal({ onClose, onAssign, interns, defaultIntern = null, defaultMentor = null, existingMentors = [] }) {
    const initialInternId = defaultIntern ? (defaultIntern.id || defaultIntern._id) : (interns[0]?.id || interns[0]?._id || "");
    const [selectedInternId, setSelectedInternId] = useState(String(initialInternId || ""));

    const targetInternObj = interns.find((i) => String(i.id || i._id) === String(selectedInternId));
    const targetDept = (targetInternObj?.dept || "").toLowerCase().trim();

    // Mentors strictly belonging to the intern's department
    const deptMentors = (existingMentors || []).filter(
        (m) => (m.dept || "").toLowerCase().trim() === targetDept
    );

    const initialMentorMatches = deptMentors.some((m) => m.name === (defaultMentor || targetInternObj?.mentor));
    const [selectedMentor, setSelectedMentor] = useState(
        initialMentorMatches ? (defaultMentor || targetInternObj?.mentor) : (deptMentors[0]?.name || "Unassigned")
    );
    const [assignedSuccess, setAssignedSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleInternChange = (e) => {
        const id = e.target.value;
        setSelectedInternId(id);
        setError("");
        const match = interns.find((i) => String(i.id || i._id) === String(id));
        const newDept = (match?.dept || "").toLowerCase().trim();
        const newDeptMentors = (existingMentors || []).filter(
            (m) => (m.dept || "").toLowerCase().trim() === newDept
        );
        const matchesCurrent = newDeptMentors.some((m) => m.name === match?.mentor);
        setSelectedMentor(matchesCurrent ? match.mentor : (newDeptMentors[0]?.name || "Unassigned"));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedInternId || !selectedMentor) return;

        if (selectedMentor !== "Unassigned") {
            const matchMentor = (existingMentors || []).find((m) => m.name === selectedMentor);
            if (matchMentor && (matchMentor.dept || "").toLowerCase().trim() !== targetDept) {
                setError(`Intern can only be assigned to a mentor from the same department (${matchMentor.dept} vs ${targetInternObj?.dept}).`);
                return;
            }
        }

        onAssign(selectedInternId, selectedMentor);
        setAssignedSuccess(true);
        setTimeout(() => {
            onClose();
        }, 800);
    };

    return (
        <div className="modal-glass-backdrop">
            <div className="modal-glass-content p-4" style={{ maxWidth: 540 }}>
                <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-15 pb-3">
                    <div className="d-flex align-items-center gap-2">
                        <i className="ph ph-user-gear fs-4 text-primary"></i>
                        <h4 className="font-display fs-5 m-0" style={{ color: "var(--text-primary)" }}>Assign Mentor to Intern</h4>
                    </div>
                    <button type="button" className="btn btn-sm text-secondary fs-5 p-0 border-0" onClick={onClose}>&times;</button>
                </div>

                {error && (
                    <div className="p-2 mb-3 small d-flex align-items-center gap-2" style={{ backgroundColor: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "#ef4444", borderRadius: "var(--radius)" }}>
                        <i className="ph ph-warning fs-5"></i>
                        <span>{error}</span>
                    </div>
                )}

                {assignedSuccess && (
                    <div className="p-2.5 mb-3 small d-flex align-items-center gap-2 text-success" style={{ backgroundColor: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: "var(--radius)" }}>
                        <i className="ph ph-check-circle fs-5"></i>
                        <span>Mentor successfully assigned!</span>
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
                            {interns.map((i) => {
                                const internKey = i.id || i._id;
                                return (
                                    <option key={internKey} value={internKey} style={{ background: "#05060f", color: "#c7d3ea" }}>
                                        {i.name} ({i.dept}) — Current: {i.mentor || "Unassigned"}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="form-label text-moon small fw-medium mb-1">
                            Assign to Mentor ({targetInternObj?.dept || "Department"} Department)
                        </label>
                        <select
                            className="form-select glass-input py-2 px-3 text-frost"
                            value={selectedMentor}
                            onChange={(e) => { setSelectedMentor(e.target.value); setError(""); }}
                        >
                            <option value="Unassigned" style={{ background: "#05060f", color: "#c7d3ea" }}>
                                Unassigned
                            </option>
                            {deptMentors.map((m) => (
                                <option key={m.id || m._id || m.name} value={m.name} style={{ background: "#05060f", color: "#c7d3ea" }}>
                                    {m.name} ({m.dept} — {m.role || "Mentor"})
                                </option>
                            ))}
                        </select>
                        {deptMentors.length === 0 && (
                            <div className="text-warning extra-small mt-1">
                                No mentors are currently registered in {targetInternObj?.dept || "this department"}. Intern can only be Unassigned.
                            </div>
                        )}
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
                            <i className="ph ph-check-circle me-1.5"></i> Save Assignment
                        </PillButton>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function EditInternModalForm({ intern, onClose, onSave, departments, existingInterns = [], existingMentors = [] }) {
    const extract10Digits = (val) => {
        if (!val) return "8888888888";
        const digits = String(val).replace(/\D/g, "");
        if (digits.length > 10 && digits.startsWith("91")) {
            return digits.slice(2, 12);
        }
        return digits.slice(-10) || "8888888888";
    };

    const [name, setName] = useState(intern.name || "");
    const [email, setEmail] = useState(intern.email || "");
    const [startDate, setStartDate] = useState(intern.startDate || "");
    const [endDate, setEndDate] = useState(intern.endDate || "");
    const [dept, setDept] = useState(intern.dept || departments[0]?.name || "Engineering");

    // Filter mentors strictly by currently chosen department
    const availableDeptMentors = (existingMentors || []).filter(
        (m) => (m.dept || "").toLowerCase().trim() === (dept || "").toLowerCase().trim()
    );
    const initialMentorMatches = availableDeptMentors.some((m) => m.name === (intern.mentor || ""));
    const [mentor, setMentor] = useState(initialMentorMatches ? intern.mentor : (availableDeptMentors[0]?.name || "Unassigned"));
    const [status, setStatus] = useState(intern.status || "Active");
    const [score, setScore] = useState(intern.score ?? 8.0);
    const countryCode = "+91";
    const [contact, setContact] = useState(() => extract10Digits(intern.contact));
    const [error, setError] = useState("");

    const handleDeptChange = (newDept) => {
        setDept(newDept);
        setError("");
        const newDeptMentors = (existingMentors || []).filter(
            (m) => (m.dept || "").toLowerCase().trim() === newDept.toLowerCase().trim()
        );
        if (!newDeptMentors.some((m) => m.name === mentor)) {
            setMentor(newDeptMentors[0]?.name || "Unassigned");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) return;
        if (!isValidEmail(email.trim())) {
            setError("Please enter a valid email address (e.g. name@gmail.com).");
            return;
        }

        const normalizedEmail = email.toLowerCase().trim();
        if (existingInterns.some((i) => String(i.id || i._id) !== String(intern.id || intern._id) && (i.email || "").toLowerCase().trim() === normalizedEmail)) {
            setError("This email address is already in use by another intern. Email must be unique for everyone.");
            return;
        }
        if (existingMentors.some((m) => (m.email || "").toLowerCase().trim() === normalizedEmail)) {
            setError("This email address is already in use by a mentor. Email must be unique for everyone.");
            return;
        }

        // Validate mentor belongs to the same department
        if (mentor && mentor !== "Unassigned") {
            const mentorMatch = (existingMentors || []).find((m) => m.name === mentor);
            if (mentorMatch && (mentorMatch.dept || "").toLowerCase().trim() !== (dept || "").toLowerCase().trim()) {
                setError(`Intern can only be assigned to a mentor from the same department (${mentorMatch.dept} vs ${dept}).`);
                return;
            }
        }

        if (startDate && endDate && endDate < startDate) {
            setError("End date cannot be before start date.");
            return;
        }
        if (contact.trim() && contact.trim().length !== 10) {
            setError("Please enter exactly 10 digits for the contact number.");
            return;
        }
        setError("");
        try {
            await onSave({
                ...intern,
                name: name.trim(),
                email: email.trim(),
                startDate: startDate || intern.startDate,
                endDate: endDate || intern.endDate,
                dept,
                mentor,
                status,
                score: Number(score),
                contact: contact.trim() ? `${countryCode} ${contact.trim()}` : "",
                avatar: initialsFromName(name.trim())
            });
            onClose();
        } catch (err) {
            setError(err.message || "Failed to update intern profile.");
        }
    };

    return (
        <div className="modal-glass-backdrop">
            <div className="modal-glass-content p-4" style={{ maxWidth: 580 }}>
                <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-15 pb-3">
                    <div className="d-flex align-items-center gap-2">
                        <i className="ph ph-pencil-simple text-primary fs-4"></i>
                        <h4 className="font-display fs-5 m-0" style={{ color: "var(--text-primary)" }}>Edit Intern Profile</h4>
                    </div>
                    <button type="button" className="btn btn-sm text-secondary fs-5 p-0 border-0" onClick={onClose}>&times;</button>
                </div>
                {error && (
                    <div className="p-2 mb-3 small d-flex align-items-center gap-2" style={{ backgroundColor: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "#ef4444", borderRadius: "var(--radius)" }}>
                        <i className="ph ph-warning fs-5"></i>
                        <span>{error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="row g-3 mb-3">
                        <div className="col-12 col-sm-6">
                            <TextField label="Full Name *" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="col-12 col-sm-6">
                            <TextField
                                label="Email Address *"
                                type="email"
                                pattern="[^\s@]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*(?<!\.(?:com|org|net|edu|gov))\.(?!comcom|netnet|orgorg|educom)(?:com|org|net|edu|gov|in|io|co|me|[A-Za-z]{2,6})"
                                title="Please enter a valid email address (e.g. name@gmail.com)"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                required
                            />
                        </div>
                    </div>

                    <div className="row g-3 mb-3">
                        <div className="col-12 col-sm-6">
                            <label className="form-label text-moon small fw-medium mb-1">Internship Start Date</label>
                            <input
                                type="date"
                                className="form-control glass-input py-2 px-3 text-frost"
                                value={startDate}
                                onChange={(e) => { setStartDate(e.target.value); setError(""); }}
                            />
                        </div>
                        <div className="col-12 col-sm-6">
                            <label className="form-label text-moon small fw-medium mb-1">Internship End Date</label>
                            <input
                                type="date"
                                className="form-control glass-input py-2 px-3 text-frost"
                                min={startDate || undefined}
                                value={endDate}
                                onChange={(e) => { setEndDate(e.target.value); setError(""); }}
                            />
                        </div>
                    </div>
                    <div className="row g-3 mb-3">
                        <div className="col-12 col-sm-6">
                            <label className="form-label text-moon small fw-medium mb-1">
                                Department <span className="text-danger">*</span>
                            </label>
                            <select
                                className="form-select glass-input py-2 px-3 text-frost"
                                value={dept}
                                onChange={(e) => handleDeptChange(e.target.value)}
                                required
                            >
                                {departments.map((d) => (
                                    <option key={d.id} value={d.name} style={{ background: "#05060f", color: "#c7d3ea" }}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-12 col-sm-6">
                            <label className="form-label text-moon small fw-medium mb-1">
                                Assigned Mentor ({dept})
                            </label>
                            <select
                                className="form-select glass-input py-2 px-3 text-frost"
                                value={mentor}
                                onChange={(e) => { setMentor(e.target.value); setError(""); }}
                            >
                                <option value="Unassigned" style={{ background: "#05060f", color: "#c7d3ea" }}>Unassigned</option>
                                {availableDeptMentors.map((m) => (
                                    <option key={m.id || m._id || m.name} value={m.name} style={{ background: "#05060f", color: "#c7d3ea" }}>
                                        {m.name} ({m.dept})
                                    </option>
                                ))}
                            </select>
                            {availableDeptMentors.length === 0 && (
                                <div className="text-warning extra-small mt-1">
                                    No mentors in {dept}. Intern will be Unassigned.
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="row g-3 mb-3">
                        <div className="col-12 col-sm-6">
                            <label className="form-label text-moon small fw-medium mb-1">Status</label>
                            <select className="form-select glass-input py-2 px-3 text-frost" value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="Active" style={{ background: "#05060f", color: "#34d399" }}>Active</option>
                                <option value="On Leave" style={{ background: "#05060f", color: "#f59e0b" }}>On Leave</option>
                                <option value="Completed" style={{ background: "#05060f", color: "#94a3b8" }}>Completed</option>
                                <option value="Terminated" style={{ background: "#05060f", color: "#f87171" }}>Terminated</option>
                            </select>
                        </div>
                        <div className="col-12 col-sm-6">
                            <TextField label="Score (0-10)" type="number" step="0.1" min="0" max="10" value={score} onChange={(e) => setScore(e.target.value)} required />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="form-label text-moon small fw-medium mb-1">Contact Number</label>
                        <div className="input-group">
                            <span
                                className="input-group-text glass-input text-moon fw-semibold px-3"
                                style={{
                                    backgroundColor: "rgba(10, 15, 30, 0.8)",
                                    borderColor: "rgba(255, 255, 255, 0.15)",
                                    color: "#93c5fd"
                                }}
                            >
                                {countryCode}
                            </span>
                            <input
                                type="tel"
                                className="form-control glass-input text-frost py-2 px-3"
                                placeholder="8888888888"
                                value={contact}
                                maxLength={10}
                                onChange={(e) => {
                                    const only10Digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                                    setContact(only10Digits);
                                    setError("");
                                }}
                            />
                        </div>

                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <PillButton variant="ghost" type="button" onClick={onClose}>Cancel</PillButton>
                        <PillButton variant="filled" type="submit">
                            <i className="ph ph-check-circle me-1.5"></i> Save Changes
                        </PillButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
