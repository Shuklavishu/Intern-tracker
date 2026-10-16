import { useState } from "react";
import { PillButton, TextField, SectionEyebrow, ThemeToggle } from "./Theme";
import { API } from "./services/api";
import { isValidEmail } from "./utils/helpers";

// Unified Login Portal Component (Automatically identifies user role on login)
export default function AuthPage({ onLogin, onBack, theme, toggleTheme }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            setError("Fill in your email and password to continue.");
            return;
        }
        if (!isValidEmail(email.trim())) {
            setError("Please enter a valid email format (e.g. name@gmail.com).");
            return;
        }
        setError("");
        setLoading(true);

        try {
            const res = await API.login(email.trim(), password.trim());
            if (res && res.user) {
                onLogin({ ...res.user, token: res.token });
            } else {
                throw new Error("Invalid response from authentication server.");
            }
        } catch (err) {
            console.warn("Backend login error:", err.message);
            setError(err.message || "Invalid credentials or account not found.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-canvas)", color: "var(--text-primary)" }}>
            <div className="container py-4 d-flex align-items-center justify-content-between">
                {onBack ? (
                    <button
                        onClick={onBack}
                        className="btn btn-link text-decoration-none text-secondary p-0 fw-medium fs-6 d-flex align-items-center gap-1.5"
                    >
                        <i className="ph ph-arrow-left"></i> Back to Home
                    </button>
                ) : <div></div>}
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>

            <div className="container px-3 flex-grow-1 d-flex align-items-center justify-content-center py-4 py-sm-5">
                <div className="w-100 text-start" style={{ maxWidth: 440 }}>
                    <div className="mb-4 text-start">
                        <SectionEyebrow>PORTAL AUTHENTICATION</SectionEyebrow>
                        <h2 className="font-display h3 mb-1" style={{ color: "var(--text-primary)" }}>Sign In to IMS</h2>
                        <div className="text-secondary small font-monospace">AUTOMATIC ROLE-BASED ACCESS</div>
                    </div>

                    <div className="glass-card p-4">
                        {/* Login Form */}
                        <form onSubmit={submit}>
                            <TextField
                                label="Email address"
                                type="email"
                                placeholder="name@gmail.com"
                                pattern="[^\s@]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*(?<!\.(?:com|org|net|edu|gov))\.(?!comcom|netnet|orgorg|educom)(?:com|org|net|edu|gov|in|io|co|me|[A-Za-z]{2,6})"
                                title="Please enter a valid email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <TextField
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            {error && (
                                <div className="p-2 mb-3 small d-flex align-items-center gap-2" style={{ backgroundColor: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "#ef4444", borderRadius: "var(--radius)" }}>
                                    <i className="ph ph-warning fs-5"></i>
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Submit CTA */}
                            <PillButton type="submit" variant="filled" className="w-100 py-2.5 mt-2" disabled={loading}>
                                {loading ? (
                                    <span>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Authenticating...
                                    </span>
                                ) : (
                                    "Sign In"
                                )}
                            </PillButton>
                        </form>

                        <div className="text-secondary small mt-4 pt-3 text-start border-top border-secondary border-opacity-10" style={{ maxWidth: "50ch" }}>
                            Need an account created? Contact your program administrator.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}