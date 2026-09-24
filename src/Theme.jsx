import { grade } from "./utils/helpers";

// ---------- AuthKit Shared Components ----------

export function PillButton({ children, onClick, variant = "filled", type = "button", style, className = "" }) {
    const btnClasses = {
        filled: "btn btn-violet rounded-pill px-4 py-2 fw-medium",
        ghost: "btn btn-ghost-pill rounded-pill px-4 py-2 fw-medium",
        danger: "btn btn-outline-danger rounded-pill px-4 py-2 border-opacity-50",
    };
    return (
        <button
            type={type}
            onClick={onClick}
            className={`${btnClasses[variant] || "btn btn-violet rounded-pill px-4 py-2 fw-medium"} ${className}`}
            style={style}
        >
            {children}
        </button>
    );
}

export function Avatar({ initials, size = 40, bg = "rgba(224, 86, 38, 0.25)", fg = "#d8ecf8" }) {
    return (
        <div
            className="rounded-circle d-flex align-items-center justify-content-center fw-semibold flex-shrink-0"
            style={{
                width: size,
                height: size,
                backgroundColor: bg,
                color: fg,
                fontSize: size * 0.38,
                border: "1px solid rgba(186, 215, 247, 0.2)",
                boxShadow: "0 0 12px rgba(224, 86, 38, 0.2)"
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

    let style = {
        color: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.16)",
        border: "1px solid rgba(16, 185, 129, 0.35)",
        boxShadow: "0 0 8px rgba(16, 185, 129, 0.2)"
    };

    if (numScore >= 9.0) {
        // Emerald Glow
        style = {
            color: "#34d399",
            backgroundColor: "rgba(16, 185, 129, 0.18)",
            border: "1px solid rgba(52, 211, 153, 0.4)",
            boxShadow: "0 0 10px rgba(52, 211, 153, 0.25)"
        };
    } else if (numScore >= 8.0) {
        // Neon Cyan / Blue
        style = {
            color: "#38bdf8",
            backgroundColor: "rgba(56, 189, 248, 0.16)",
            border: "1px solid rgba(56, 189, 248, 0.35)",
            boxShadow: "0 0 8px rgba(56, 189, 248, 0.2)"
        };
    } else if (numScore >= 6.5) {
        // Amber Gold
        style = {
            color: "#fbbf24",
            backgroundColor: "rgba(245, 158, 11, 0.16)",
            border: "1px solid rgba(245, 158, 11, 0.35)",
            boxShadow: "0 0 8px rgba(245, 158, 11, 0.2)"
        };
    } else {
        // Rose Crimson
        style = {
            color: "#f87171",
            backgroundColor: "rgba(239, 68, 68, 0.16)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            boxShadow: "0 0 8px rgba(239, 68, 68, 0.2)"
        };
    }

    return (
        <div className="d-inline-flex align-items-center gap-2">
            <span
                className="badge rounded-2 px-2.5 py-1 fs-6 fw-bold transition-all"
                style={style}
            >
                {g}
            </span>
            <span className="text-frost fw-semibold small">{numScore.toFixed(1)} <span className="text-fog extra-small font-normal">/ 10</span></span>
        </div>
    );
}

export function Tag({ children }) {
    return (
        <span
            className="badge rounded-pill px-3 py-1.5 fw-medium d-inline-flex align-items-center gap-1"
            style={{
                color: "#60a5fa", // Sapphire Blue
                backgroundColor: "rgba(96, 165, 250, 0.14)",
                border: "1px solid rgba(96, 165, 250, 0.3)",
                fontSize: "0.78rem"
            }}
        >
            <i className="bi bi-building me-1 opacity-75"></i>
            {children}
        </span>
    );
}

export function MentorBadge({ name }) {
    return (
        <span
            className="badge rounded-pill px-3 py-1.5 fw-medium d-inline-flex align-items-center gap-1"
            style={{
                color: "#c084fc", // Amethyst Purple
                backgroundColor: "rgba(192, 132, 252, 0.14)",
                border: "1px solid rgba(192, 132, 252, 0.3)",
                fontSize: "0.78rem"
            }}
        >
            <i className="bi bi-person-badge me-1 opacity-75"></i>
            {name || "Unassigned"}
        </span>
    );
}

export function AudienceBadge({ audience }) {
    return (
        <span
            className="badge rounded-pill px-3 py-1.5 fw-medium d-inline-flex align-items-center gap-1"
            style={{
                color: "#e879f9", // Fuchsia Pink
                backgroundColor: "rgba(232, 121, 249, 0.14)",
                border: "1px solid rgba(232, 121, 249, 0.3)",
                fontSize: "0.78rem"
            }}
        >
            <i className="bi bi-megaphone me-1 opacity-75"></i>
            {audience}
        </span>
    );
}

export function RequestTypeBadge({ type }) {
    return (
        <span
            className="badge rounded-pill px-3 py-1.5 fw-medium d-inline-flex align-items-center gap-1"
            style={{
                color: "#22d3ee", // Cyan Aquamarine
                backgroundColor: "rgba(34, 211, 238, 0.14)",
                border: "1px solid rgba(34, 211, 238, 0.3)",
                fontSize: "0.78rem"
            }}
        >
            <i className="bi bi-file-earmark-text me-1 opacity-75"></i>
            {type}
        </span>
    );
}

export function RoleBadge({ role }) {
    const r = (role || "").toLowerCase();
    let style = { color: "#38bdf8", bg: "rgba(56, 189, 248, 0.14)", border: "rgba(56, 189, 248, 0.3)" };
    if (r.includes("admin")) {
        style = { color: "#f97316", bg: "rgba(249, 115, 22, 0.14)", border: "rgba(249, 115, 22, 0.3)" };
    } else if (r.includes("mentor")) {
        style = { color: "#c084fc", bg: "rgba(192, 132, 252, 0.14)", border: "rgba(192, 132, 252, 0.3)" };
    }

    return (
        <span
            className="badge rounded-pill px-3 py-1.5 fw-semibold uppercase"
            style={{
                color: style.color,
                backgroundColor: style.bg,
                border: `1px solid ${style.border}`,
                fontSize: "0.75rem",
                letterSpacing: "0.5px"
            }}
        >
            {role}
        </span>
    );
}

export function StatusLabel({ status }) {
    const s = (status || "").toLowerCase();

    let style = {
        color: "#9da7ba",
        bg: "rgba(157, 167, 186, 0.12)",
        border: "rgba(157, 167, 186, 0.25)"
    };

    if (s === "active") {
        style = { color: "#34d399", bg: "rgba(16, 185, 129, 0.14)", border: "rgba(52, 211, 153, 0.35)" };
    } else if (s === "at risk") {
        style = { color: "#fb7185", bg: "rgba(244, 63, 94, 0.16)", border: "rgba(251, 113, 133, 0.35)" };
    } else if (s === "present") {
        style = { color: "#2dd4bf", bg: "rgba(20, 184, 166, 0.14)", border: "rgba(45, 212, 191, 0.35)" };
    } else if (s === "absent") {
        style = { color: "#f87171", bg: "rgba(239, 68, 68, 0.16)", border: "rgba(248, 113, 113, 0.35)" };
    } else if (s === "late") {
        style = { color: "#fb923c", bg: "rgba(249, 115, 22, 0.14)", border: "rgba(251, 146, 60, 0.35)" };
    } else if (s === "pending") {
        style = { color: "#fde047", bg: "rgba(234, 179, 8, 0.14)", border: "rgba(253, 224, 71, 0.35)" };
    } else if (s === "approved" || s === "completed") {
        style = { color: "#4ade80", bg: "rgba(34, 197, 94, 0.14)", border: "rgba(74, 222, 128, 0.35)" };
    } else if (s === "rejected") {
        style = { color: "#fda4af", bg: "rgba(225, 29, 72, 0.16)", border: "rgba(253, 164, 175, 0.35)" };
    } else if (s === "in progress") {
        style = { color: "#38bdf8", bg: "rgba(56, 189, 248, 0.14)", border: "rgba(56, 189, 248, 0.35)" };
    } else if (s === "needs review") {
        style = { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.14)", border: "rgba(245, 158, 11, 0.35)" };
    }

    return (
        <span
            className="badge rounded-2 px-3 py-1.5 fw-medium d-inline-flex align-items-center gap-1.5"
            style={{
                color: style.color,
                backgroundColor: style.bg,
                border: `1px solid ${style.border}`,
                fontSize: "0.78rem"
            }}
        >
            <span className="d-inline-block rounded-circle" style={{ width: 6, height: 6, backgroundColor: style.color }}></span>
            {status}
        </span>
    );
}

export function Card({ children, style, accent = false, className = "" }) {
    return (
        <div className={`glass-card p-4 ${accent ? "border-warning" : ""} ${className}`} style={style}>
            {children}
        </div>
    );
}



export function SectionEyebrow({ children }) {
    return (
        <div className="eyebrow-divider mb-3">
            <div className="eyebrow-line"></div>
            <span className="font-eyebrow">{children}</span>
            <div className="eyebrow-line"></div>
        </div>
    );
}

export function SectionHeading({ tag, title, sub, isMobile }) {
    return (
        <div className={`text-center ${isMobile ? "mb-4" : "mb-5"}`}>
            {tag && <SectionEyebrow>{tag}</SectionEyebrow>}
            <h1 className={`font-display ${isMobile ? "display-6" : "display-4"} text-skywash my-2`}>
                {title}
            </h1>
            {sub && <p className="text-moon lead fs-6 mx-auto mb-0" style={{ maxWidth: 600 }}>{sub}</p>}
        </div>
    );
}

export function StatCard({ label, value }) {
    return (
        <div className="glass-card p-3 h-100 text-start">
            <div className="text-fog small mb-1">{label}</div>
            <div className="fs-3 fw-bold text-skywash">{value}</div>
        </div>
    );
}

export function TextField({ label, ...props }) {
    return (
        <div className="mb-3 text-start">
            {label && <label className="form-label text-moon small fw-medium mb-1">{label}</label>}
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
            className={`btn btn-ghost-pill d-inline-flex align-items-center justify-content-center rounded-circle shadow-sm transition-all ${className}`}
            style={{
                width: 38,
                height: 38,
                padding: 0,
                cursor: "pointer",
                userSelect: "none"
            }}
            title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
            aria-label={`Switch to ${isDark ? "Light" : "Dark"} mode`}
        >
            <i className={`bi ${isDark ? "bi-sun-fill text-warning" : "bi-moon-stars-fill text-info"} fs-5`}></i>
        </button>
    );
}