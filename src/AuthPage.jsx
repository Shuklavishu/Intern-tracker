import { useState } from "react";
import { PillButton, TextField, SectionEyebrow, ThemeToggle } from "./Theme";
import { API } from "./services/api";

const ADMIN_CREDENTIALS = { email: "admin@gmail.com", password: "admin123" };

// Pure Login Portal Component (Connects to /api/auth/login)
export default function AuthPage({ onLogin, onBack, theme, toggleTheme }) {
    const [role, setRole] = useState("admin");
    const [email, setEmail] = useState(ADMIN_CREDENTIALS.email);
    const [password, setPassword] = useState(ADMIN_CREDENTIALS.password);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const roles = [
        { id: "admin", label: "Admin" },
        { id: "mentor", label: "Mentor" },
        { id: "intern", label: "Intern" },
    ];

    const selectRole = (newRole) => {
        setRole(newRole);
        setError("");
        if (newRole === "admin") {
            setEmail(ADMIN_CREDENTIALS.email);
            setPassword(ADMIN_CREDENTIALS.password);
        } else {
            // No hardcoded credentials for mentor or intern: they are registered by the admin
            setEmail("");
            setPassword("");
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            setError("Fill in your email and password to continue.");
            return;
        }
        setError("");
        setLoading(true);

        try {
            const res = await API.login(email.trim(), password.trim());
            if (res && res.user) {
                // Verify user matches selected role
                if (res.user.role !== role) {
                    setError(`This account is registered as '${res.user.role}', but you selected '${role}'. Please switch to the '${res.user.role}' tab.`);
                    setLoading(false);
                    return;
                }
                onLogin({ ...res.user, token: res.token });
            } else {
                onLogin({ role, email: email.trim(), name: "User" });
            }
        } catch (err) {
            console.warn("Backend login error:", err.message);
            setError(err.message || "Invalid credentials or account not found.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex flex-column text-light">
            <div className="container py-4 d-flex align-items-center justify-content-between">
                {onBack ? (
                    <button
                        onClick={onBack}
                        className="btn btn-link text-decoration-none text-moon p-0 fw-medium fs-6"
                    >
                        <i className="bi bi-arrow-left me-2"></i> Back to home
                    </button>
                ) : <div></div>}
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>

            <div className="container flex-grow-1 d-flex align-items-center justify-content-center py-5">
                <div className="w-100" style={{ maxWidth: 440 }}>
                    <div className="text-center mb-4">
                        <SectionEyebrow>PORTAL AUTHENTICATION</SectionEyebrow>
                        <h2 className="font-display text-skywash display-6 mb-1">IMS Portal Sign In</h2>
                        <div className="text-fog small font-eyebrow">INTERN MANAGEMENT SYSTEM</div>
                    </div>

                    <div className="glass-modal p-4 p-md-5">
                        {/* Role Selector */}
                        <div className="mb-4">
                            <label className="form-label text-fog small fw-medium mb-2">I am signing in as</label>
                            <div className="d-flex gap-2 flex-wrap">
                                {roles.map((r) => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => selectRole(r.id)}
                                        className={`btn btn-sm rounded-pill px-3 ${
                                            role === r.id ? "btn-violet" : "btn-ghost-pill"
                                        }`}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {role !== "admin" && (
                            <div className="alert alert-info py-2 px-3 small rounded-3 mb-3 bg-info-subtle text-info border-info-subtle">
                                <i className="bi bi-info-circle me-1"></i>
                                {role === "mentor" ? "Mentor" : "Intern"} accounts are registered by the Admin. Sign in with your assigned credentials.
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={submit}>
                            <TextField
                                label="Email address"
                                type="email"
                                placeholder={role === "admin" ? "admin@gmail.com" : `${role}@company.com`}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <TextField
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            {error && (
                                <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 bg-danger-subtle text-danger border-danger-subtle" role="alert">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    {error}
                                </div>
                            )}

                            {/* Submit CTA */}
                            <PillButton type="submit" variant="filled" className="w-100 py-3 mt-2 fs-6" disabled={loading}>
                                {loading ? (
                                    <span>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Authenticating...
                                    </span>
                                ) : (
                                    `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`
                                )}
                            </PillButton>
                        </form>

                        <div className="text-center text-fog extra-small mt-4 pt-3 border-top border-secondary border-opacity-10">
                            <i className="bi bi-shield-check me-1 text-info"></i>
                            Only Admin registers new Intern and Mentor accounts.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}