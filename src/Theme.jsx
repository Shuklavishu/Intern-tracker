import { grade } from "./utils/helpers";

// ---------- Clean Editorial Shared Components ----------

export function PillButton({ children, onClick, variant = "filled", type = "button", style, className = "" }) {
    const btnClasses = {
        filled: "btn btn-primary-accent",
        ghost: "btn btn-secondary-flat",
        danger: "btn btn-outline-danger",
    };
    return (
        <button
            type={type}
            onClick={onClick}
            className={`${btnClasses[variant] || "btn btn-primary-accent"} ${className}`}
            style={style}
        >
            {children}
        </button>
    );
}

export function Avatar({ initials, size = 36, bg = "rgba(37, 99, 235, 0.12)", fg = "var(--text-primary)" }) {
    return (
        <div
            className="d-flex align-items-center justify-content-center fw-semibold flex-shrink-0"
            style={{
                width: size,
                height: size,
                backgroundColor: bg,
                color: fg,
                fontSize: size * 0.38,
                borderRadius: "var(--radius)",
                border: "1px solid var(--border-color)",
            }}
        >
            {initials}
        </div>
    );
}

// ---------- Specialized Category Badges & Chips ----------

export function GradeChip({ score }) {
    const g = grade(score);
    const numScore = Number(score) || 0;

    let style;

    if (numScore >= 9.0) {
        style = {
            color: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.28)",
        };
    } else if (numScore >= 8.0) {
        style = {
            color: "#0284c7",
            backgroundColor: "rgba(2, 132, 199, 0.12)",
            border: "1px solid rgba(2, 132, 199, 0.28)",
        };
    } else if (numScore >= 6.5) {
        style = {
            color: "#d97706",
            backgroundColor: "rgba(217, 119, 6, 0.12)",
            border: "1px solid rgba(217, 119, 6, 0.28)",
        };
    } else {
        style = {
            color: "#ef4444",
            backgroundColor: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.28)",
        };
    }

    return (
        <div className="d-inline-flex align-items-center gap-2">
            <span
                className="badge px-2 py-1 fw-bold"
                style={{ ...style, borderRadius: "var(--radius)" }}
            >
                {g}
            </span>
            <span className="fw-medium small" style={{ color: "var(--text-primary)" }}>
                {numScore.toFixed(1)} <span className="text-secondary small">/ 10</span>
            </span>
        </div>
    );
}

export function Tag({ children }) {
    return (
        <span
            className="badge px-2.5 py-1 fw-medium d-inline-flex align-items-center gap-1.5"
            style={{
                color: "var(--accent)",
                backgroundColor: "var(--accent-subtle)",
                border: "1px solid var(--accent-border)",
                fontSize: "var(--text-xs)",
                borderRadius: "var(--radius)",
            }}
        >
            <i className="ph ph-buildings"></i>
            {children}
        </span>
    );
}

export function MentorBadge({ name }) {
    return (
        <span
            className="badge px-2.5 py-1 fw-medium d-inline-flex align-items-center gap-1.5"
            style={{
                color: "var(--text-secondary)",
                backgroundColor: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-color)",
                fontSize: "var(--text-xs)",
                borderRadius: "var(--radius)",
            }}
        >
            <i className="ph ph-identification-badge"></i>
            {name || "Unassigned"}
        </span>
    );
}

export function AudienceBadge({ audience }) {
    return (
        <span
            className="badge px-2.5 py-1 fw-medium d-inline-flex align-items-center gap-1.5"
            style={{
                color: "var(--accent)",
                backgroundColor: "var(--accent-subtle)",
                border: "1px solid var(--accent-border)",
                fontSize: "var(--text-xs)",
                borderRadius: "var(--radius)",
            }}
        >
            <i className="ph ph-megaphone-simple"></i>
            {audience}
        </span>
    );
}

export function RequestTypeBadge({ type }) {
    const t = (type || "").toLowerCase();
    const isWfh = t.includes("wfh") || t.includes("remote") || t.includes("home");
    const isGoalExt = t.includes("goal") || t.includes("extension");

    let icon = "ph-calendar";
    let color = "var(--accent)";
    let bg = "var(--accent-subtle)";
    let border = "var(--accent-border)";

    if (isGoalExt) {
        icon = "ph-clock-countdown";
        color = "#d97706";
        bg = "rgba(217, 119, 6, 0.1)";
        border = "rgba(217, 119, 6, 0.25)";
    } else if (isWfh) {
        icon = "ph-house-line";
        color = "#0284c7";
        bg = "rgba(2, 132, 199, 0.1)";
        border = "rgba(2, 132, 199, 0.25)";
    }

    return (
        <span
            className="badge px-2.5 py-1 fw-medium d-inline-flex align-items-center gap-1.5"
            style={{
                color,
                backgroundColor: bg,
                border: `1px solid ${border}`,
                fontSize: "var(--text-xs)",
                borderRadius: "var(--radius)",
            }}
        >
            <i className={`ph ${icon}`}></i>
            {type}
        </span>
    );
}

export function RoleBadge({ role }) {
    const r = (role || "").toLowerCase();
    let color = "var(--accent)";
    let bg = "var(--accent-subtle)";
    let border = "var(--accent-border)";

    if (r.includes("admin")) {
        color = "#d97706";
        bg = "rgba(217, 119, 6, 0.1)";
        border = "rgba(217, 119, 6, 0.25)";
    } else if (r.includes("mentor")) {
        color = "#0284c7";
        bg = "rgba(2, 132, 199, 0.1)";
        border = "rgba(2, 132, 199, 0.25)";
    }

    return (
        <span
            className="badge px-2.5 py-1 fw-medium text-uppercase"
            style={{
                color,
                backgroundColor: bg,
                border: `1px solid ${border}`,
                fontSize: "var(--text-xs)",
                letterSpacing: "0.05em",
                borderRadius: "var(--radius)",
            }}
        >
            {role}
        </span>
    );
}

export function StatusLabel({ status }) {
    const s = (status || "").toLowerCase();

    let style = {
        color: "var(--text-secondary)",
        bg: "var(--bg-surface-elevated)",
        border: "var(--border-color)",
    };

    if (s === "active" || s === "present" || s === "approved") {
        style = { color: "#10b981", bg: "rgba(16, 185, 129, 0.1)", border: "rgba(16, 185, 129, 0.25)" };
    } else if (s === "on leave" || s === "late" || s === "pending" || s === "needs review") {
        style = { color: "#d97706", bg: "rgba(217, 119, 6, 0.1)", border: "rgba(217, 119, 6, 0.25)" };
    } else if (s === "completed" || s === "in progress" || s === "submitted") {
        style = { color: "var(--accent)", bg: "var(--accent-subtle)", border: "var(--accent-border)" };
    } else if (s === "terminated" || s === "absent" || s === "at risk" || s === "rejected" || s === "denied") {
        style = { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", border: "rgba(239, 68, 68, 0.25)" };
    }

    return (
        <span
            className="badge px-2.5 py-1 fw-medium d-inline-flex align-items-center gap-1.5"
            style={{
                color: style.color,
                backgroundColor: style.bg,
                border: `1px solid ${style.border}`,
                fontSize: "var(--text-xs)",
                borderRadius: "var(--radius)",
            }}
        >
            <span
                className="d-inline-block"
                style={{
                    width: 6,
                    height: 6,
                    backgroundColor: style.color,
                    borderRadius: "2px",
                }}
            ></span>
            {status}
        </span>
    );
}

export function AtRiskBadge() {
    return (
        <span
            className="badge px-2 py-1 fw-medium d-inline-flex align-items-center gap-1"
            style={{
                color: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                fontSize: "var(--text-xs)",
                borderRadius: "var(--radius)",
            }}
            title="At Risk: Performance Score < 6.0"
        >
            <i className="ph ph-warning"></i> At Risk
        </span>
    );
}

export function Card({ children, style, accent = false, className = "" }) {
    return (
        <div
            className={`glass-card p-4 ${accent ? "border-primary" : ""} ${className}`}
            style={{ ...style, borderRadius: "var(--radius)" }}
        >
            {children}
        </div>
    );
}

// Clean typographic eyebrow with no divider lines
export function SectionEyebrow({ children }) {
    return (
        <div className="mb-2">
            <span className="font-eyebrow">{children}</span>
        </div>
    );
}

// Left-aligned section heading, no gradient text, constrained line length
export function SectionHeading({ tag, title, sub, isMobile }) {
    return (
        <div className={`text-start ${isMobile ? "mb-3" : "mb-4"}`}>
            {tag && <SectionEyebrow>{tag}</SectionEyebrow>}
            <h1 className={`font-display ${isMobile ? "h2" : "h1"} mb-2`}>
                {title}
            </h1>
            {sub && (
                <p className="text-secondary mb-0" style={{ maxWidth: "65ch", fontSize: "var(--text-base)" }}>
                    {sub}
                </p>
            )}
        </div>
    );
}

export function StatCard({ label, value }) {
    return (
        <div className="glass-card p-3 h-100 text-start" style={{ borderRadius: "var(--radius)" }}>
            <div className="text-secondary small mb-1">{label}</div>
            <div className="fs-3 fw-bold font-display" style={{ color: "var(--text-primary)" }}>{value}</div>
        </div>
    );
}

export function TextField({ label, ...props }) {
    return (
        <div className="mb-3 text-start">
            {label && <label className="form-label text-secondary small fw-medium mb-1">{label}</label>}
            <input className="form-control glass-input py-2 px-3" {...props} />
        </div>
    );
}

export function ThemeToggle({ theme, toggleTheme, className = "" }) {
    const isDark = theme === "dark";
    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`btn btn-secondary-flat d-inline-flex align-items-center justify-content-center ${className}`}
            style={{
                width: 36,
                height: 36,
                padding: 0,
                cursor: "pointer",
                borderRadius: "var(--radius)",
            }}
            title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
            aria-label={`Switch to ${isDark ? "Light" : "Dark"} mode`}
        >
            <i className={`ph ${isDark ? "ph-sun" : "ph-moon"} fs-5`}></i>
        </button>
    );
}

// Reusable editorial EmptyState component
export function EmptyState({ icon = "ph-folder-open", title = "No records found", description = "There are no entries to display in this view yet.", actionLabel, onAction }) {
    return (
        <div className="empty-state-card text-start my-3">
            <div className="empty-state-icon">
                <i className={`ph ${icon}`}></i>
            </div>
            <div className="empty-state-title">{title}</div>
            <p className="empty-state-desc">{description}</p>
            {actionLabel && onAction && (
                <button type="button" onClick={onAction} className="btn btn-primary-accent btn-sm">
                    {actionLabel}
                </button>
            )}
        </div>
    );
}