import { useState, useEffect, useRef } from "react";
import { PillButton, Avatar, ThemeToggle, RoleBadge } from "../Theme";
import { useViewport, initialsFromName } from "../utils/helpers";
import { API } from "../services/api";

function formatRelativeTime(dateStr) {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 45) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function PortalLayout({
    title = "Portal",
    roleLabel = "USER",
    user,
    navItems = [],
    activeTab,
    setActiveTab,
    onLogout,
    theme,
    toggleTheme,
    children
}) {
    const { isMobile } = useViewport();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [showNotifMenu, setShowNotifMenu] = useState(false);
    const [activeBanner, setActiveBanner] = useState(null);
    const notifMenuRef = useRef(null);
    const knownNotifIdsRef = useRef(new Set());
    const isFirstLoadRef = useRef(true);

    const unreadCount = notifications.filter((n) => !n.read).length;

    // Fetch notifications function
    const fetchNotifications = async () => {
        try {
            const list = await API.getNotifications();
            if (Array.isArray(list)) {
                if (!isFirstLoadRef.current) {
                    const brandNew = list.find(
                        (n) => !n.read && !knownNotifIdsRef.current.has(n._id || n.id)
                    );
                    if (brandNew) {
                        setActiveBanner(brandNew);
                        setTimeout(() => setActiveBanner(null), 6000);
                    }
                }
                list.forEach((n) => knownNotifIdsRef.current.add(n._id || n.id));
                isFirstLoadRef.current = false;
                setNotifications(list);
            }
        } catch {
            // Silently skip if network offline
        }
    };

    useEffect(() => {
        fetchNotifications();
        const timer = setInterval(fetchNotifications, 10000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
                setShowNotifMenu(false);
            }
        };
        if (showNotifMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showNotifMenu]);

    const handleMarkAllRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        try {
            await API.markAllNotificationsRead();
        } catch (err) {
            console.warn("Failed to mark all notifications read:", err.message);
        }
    };

    const handleNotificationClick = async (item) => {
        if (!item.read) {
            setNotifications((prev) =>
                prev.map((n) => ((n._id === item._id || n.id === item.id) ? { ...n, read: true } : n))
            );
            try {
                await API.markNotificationRead(item._id || item.id);
            } catch (err) {
                console.warn("Failed to mark notification read:", err.message);
            }
        }
        if (item.linkTab && setActiveTab) {
            setActiveTab(item.linkTab);
        }
        setShowNotifMenu(false);
    };

    const getIconForType = (type) => {
        switch (type) {
            case "task_approved":
                return { icon: "ph-check-circle", color: "#10b981", bg: "rgba(16, 185, 129, 0.12)" };
            case "task_rejected":
                return { icon: "ph-x-circle", color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)" };
            case "task_created":
                return { icon: "ph-file-plus", color: "var(--accent)", bg: "var(--accent-subtle)" };
            case "leave_requested":
                return { icon: "ph-calendar-blank", color: "#d97706", bg: "rgba(217, 119, 6, 0.12)" };
            case "leave_approved":
                return { icon: "ph-calendar-check", color: "#10b981", bg: "rgba(16, 185, 129, 0.12)" };
            case "leave_denied":
                return { icon: "ph-calendar-x", color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)" };
            case "goal_created":
                return { icon: "ph-target", color: "var(--accent)", bg: "var(--accent-subtle)" };
            default:
                return { icon: "ph-bell", color: "var(--accent)", bg: "var(--accent-subtle)" };
        }
    };

    return (
        <div className="min-vh-100 d-flex position-relative" style={{ backgroundColor: "var(--bg-canvas)", color: "var(--text-primary)" }}>
            {/* Live Activity Alert Toast Banner */}
            {activeBanner && (
                <div
                    className="position-fixed p-3"
                    style={{ zIndex: 2000, maxWidth: 420, width: "calc(100vw - 24px)", top: 12, right: 12 }}
                >
                    <div
                        className="glass-card p-3 border d-flex align-items-start gap-3"
                        style={{
                            background: "var(--bg-surface-elevated)",
                            borderColor: "var(--accent-border)",
                            borderRadius: "var(--radius)"
                        }}
                    >
                        {(() => {
                            const iconConfig = getIconForType(activeBanner.type);
                            return (
                                <div
                                    className="p-2 flex-shrink-0 d-flex align-items-center justify-content-center"
                                    style={{ width: 34, height: 34, background: iconConfig.bg, color: iconConfig.color, borderRadius: "var(--radius)" }}
                                >
                                    <i className={`ph ${iconConfig.icon} fs-5`}></i>
                                </div>
                            );
                        })()}
                        <div
                            className="flex-grow-1 cursor-pointer text-start"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                                if (activeBanner.linkTab && setActiveTab) setActiveTab(activeBanner.linkTab);
                                setActiveBanner(null);
                            }}
                        >
                            <div className="d-flex align-items-center justify-content-between mb-1">
                                <span className="small font-monospace text-secondary" style={{ fontSize: "11px" }}>ACTIVITY ALERT</span>
                                <span className="text-secondary small" style={{ fontSize: "11px" }}>Just now</span>
                            </div>
                            <div className="fw-semibold small mb-1" style={{ color: "var(--text-primary)" }}>{activeBanner.title}</div>
                            <div className="text-secondary small lh-sm">{activeBanner.message}</div>
                        </div>
                        <button
                            type="button"
                            className="btn btn-sm btn-link text-secondary p-0"
                            onClick={() => setActiveBanner(null)}
                        >
                            <i className="ph ph-x fs-6"></i>
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile Drawer Backdrop */}
            {mobileMenuOpen && (
                <div
                    className="ems-sidebar-backdrop"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Left Navigation Sidebar (Desktop sticky & Mobile offcanvas drawer) */}
            <aside className={`ems-sidebar flex-shrink-0 d-flex flex-column ${sidebarCollapsed ? "collapsed" : ""} ${mobileMenuOpen ? "mobile-open" : ""}`}>
                <div className="p-3 border-bottom border-secondary border-opacity-15 d-flex align-items-center justify-content-between">
                    <div className="font-display fs-5 fw-bold d-flex align-items-center gap-2 overflow-hidden" style={{ color: "var(--text-primary)" }}>
                        <div
                            className="d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                                width: 24,
                                height: 24,
                                backgroundColor: "var(--accent)",
                                color: "var(--accent-fg)",
                                borderRadius: "var(--radius)",
                                fontSize: "12px",
                                fontWeight: 700
                            }}
                        >
                            <i className="ph ph-squares-four"></i>
                        </div>
                        {(!sidebarCollapsed || isMobile) && <span>{title}</span>}
                    </div>
                    {isMobile && (
                        <button
                            type="button"
                            className="btn btn-sm btn-secondary-flat p-1 d-flex align-items-center justify-content-center d-md-none"
                            style={{ width: 28, height: 28 }}
                            onClick={() => setMobileMenuOpen(false)}
                            title="Close Navigation"
                            aria-label="Close Navigation"
                        >
                            <i className="ph ph-x fs-6"></i>
                        </button>
                    )}
                </div>

                <div className="ems-sidebar-nav p-2 flex-grow-1 overflow-y-auto">
                    {navItems.map((item) => {
                        // Map old Bootstrap icon class strings if passed
                        const phIcon = item.icon.startsWith("ph-")
                            ? item.icon
                            : item.icon
                                .replace("bi-grid-fill", "ph-squares-four")
                                .replace("bi-people-fill", "ph-users")
                                .replace("bi-person-gear", "ph-user-gear")
                                .replace("bi-check2-square", "ph-check-square")
                                .replace("bi-calendar2-range", "ph-calendar")
                                .replace("bi-clipboard-data", "ph-chart-bar")
                                .replace("bi-bullseye", "ph-target")
                                .replace("bi-megaphone", "ph-megaphone-simple")
                                .replace("bi-person-badge", "ph-identification-badge")
                                .replace("bi-journal-check", "ph-file-text")
                                .replace("bi-speedometer2", "ph-gauge")
                                .replace("bi-", "ph-");

                        return (
                            <div key={item.id} className="nav-item">
                                <a
                                    href={`#${item.id}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveTab(item.id);
                                        if (isMobile) setMobileMenuOpen(false);
                                    }}
                                    className={`ems-nav-link ${activeTab === item.id ? "active" : ""}`}
                                    title={sidebarCollapsed ? item.label : ""}
                                >
                                    <i className={`ph ${phIcon} fs-5`}></i>
                                    {(!sidebarCollapsed || isMobile) && <span>{item.label}</span>}
                                    {(!sidebarCollapsed || isMobile) && item.badge !== undefined && item.badge > 0 && (
                                        <span className="badge ms-auto small" style={{ backgroundColor: "var(--accent)", color: "var(--accent-fg)" }}>
                                            {item.badge}
                                        </span>
                                    )}
                                </a>
                            </div>
                        );
                    })}
                </div>

                <div className="p-3 border-top border-secondary border-opacity-15 d-none d-md-block">
                    {!sidebarCollapsed && (
                        <div className="text-secondary small font-monospace mb-2" style={{ fontSize: "11px" }}>ROLE: {roleLabel.toUpperCase()}</div>
                    )}
                    <button
                        type="button"
                        className="btn btn-sm btn-secondary-flat w-100 d-flex align-items-center justify-content-center gap-2"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    >
                        <i className={`ph ${sidebarCollapsed ? "ph-caret-right" : "ph-caret-left"}`}></i>
                        {!sidebarCollapsed && <span>Collapse Sidebar</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Container */}
            <div className="flex-grow-1 d-flex flex-column min-w-0">
                {/* Header Navbar */}
                <header
                    className="border-bottom border-secondary border-opacity-15 py-2 px-3 px-md-4 d-flex align-items-center justify-content-between flex-wrap gap-2 sticky-top"
                    style={{ background: "var(--bg-surface)", zIndex: 100 }}
                >
                    <div className="d-flex align-items-center gap-2 gap-sm-3 min-w-0">
                        <button
                            type="button"
                            className="btn btn-sm btn-secondary-flat p-1 d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: 34, height: 34 }}
                            onClick={() => {
                                if (isMobile) {
                                    setMobileMenuOpen(!mobileMenuOpen);
                                } else {
                                    setSidebarCollapsed(!sidebarCollapsed);
                                }
                            }}
                            title="Toggle Navigation Menu"
                            aria-label="Toggle Navigation Menu"
                        >
                            <i className="ph ph-list fs-5"></i>
                        </button>
                        <span className="text-secondary small text-truncate" style={{ maxWidth: isMobile ? "140px" : "60ch" }}>
                            IMS {title} <span className="d-none d-sm-inline">&middot; <strong style={{ color: "var(--text-primary)" }}>{user?.name}</strong></span>
                        </span>
                    </div>

                    <div className="d-flex align-items-center gap-1.5 gap-sm-2 flex-shrink-0">
                        {/* Notifications Bell Dropdown */}
                        <div className="position-relative" ref={notifMenuRef}>
                            <button
                                type="button"
                                className="btn btn-secondary-flat p-0 position-relative d-flex align-items-center justify-content-center"
                                style={{ width: 34, height: 34, borderRadius: "var(--radius)" }}
                                onClick={() => setShowNotifMenu(!showNotifMenu)}
                                title="Notifications & Activity Alerts"
                            >
                                <i className="ph ph-bell fs-5 text-secondary"></i>
                                {unreadCount > 0 && (
                                    <span
                                        className="position-absolute d-inline-flex align-items-center justify-content-center fw-bold"
                                        style={{
                                            top: "-2px",
                                            right: "-2px",
                                            minWidth: "18px",
                                            height: "18px",
                                            padding: "0 4px",
                                            fontSize: "10.5px",
                                            fontWeight: 700,
                                            lineHeight: 1,
                                            backgroundColor: "var(--accent)",
                                            color: "#ffffff",
                                            borderRadius: "9999px",
                                            border: "2px solid var(--bg-surface)",
                                            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                            pointerEvents: "none",
                                            zIndex: 2
                                        }}
                                    >
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Popover Dropdown Menu */}
                            {showNotifMenu && (
                                <div
                                    className="glass-card position-absolute end-0 mt-2 border text-start"
                                    style={{
                                        width: 360,
                                        maxWidth: "calc(100vw - 24px)",
                                        background: "var(--bg-surface)",
                                        borderColor: "var(--border-color)",
                                        borderRadius: "var(--radius)",
                                        zIndex: 1050
                                    }}
                                >
                                    <div className="p-3 border-bottom border-secondary border-opacity-15 d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="fw-bold font-display" style={{ color: "var(--text-primary)" }}>Notifications</span>
                                            {unreadCount > 0 && (
                                                <span className="badge" style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent)", fontSize: "11px" }}>
                                                    {unreadCount} new
                                                </span>
                                            )}
                                        </div>
                                        {unreadCount > 0 && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-link text-secondary p-0 text-decoration-none small"
                                                onClick={handleMarkAllRead}
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>

                                    <div className="overflow-auto" style={{ maxHeight: 380 }}>
                                        {notifications.length === 0 ? (
                                            <div className="p-4 text-start text-secondary">
                                                <i className="ph ph-bell-slash fs-3 mb-2 d-block opacity-50"></i>
                                                <div className="fw-semibold small" style={{ color: "var(--text-primary)" }}>No notifications yet</div>
                                                <div className="small mt-1" style={{ maxWidth: "45ch" }}>You're completely caught up with all activity alerts.</div>
                                            </div>
                                        ) : (
                                            <div className="d-flex flex-column">
                                                {notifications.map((item) => {
                                                    const iconConfig = getIconForType(item.type);
                                                    return (
                                                        <div
                                                            key={item._id || item.id}
                                                            onClick={() => handleNotificationClick(item)}
                                                            className={`p-3 border-bottom border-secondary border-opacity-10 cursor-pointer text-start d-flex gap-3 align-items-start ${
                                                                !item.read ? "bg-secondary bg-opacity-10" : ""
                                                            }`}
                                                            style={{ cursor: "pointer" }}
                                                        >
                                                            <div
                                                                className="p-1.5 flex-shrink-0 d-flex align-items-center justify-content-center"
                                                                style={{ width: 30, height: 30, background: iconConfig.bg, color: iconConfig.color, borderRadius: "var(--radius)" }}
                                                            >
                                                                <i className={`ph ${iconConfig.icon} small`}></i>
                                                            </div>
                                                            <div className="flex-grow-1 overflow-hidden">
                                                                <div className="d-flex align-items-center justify-content-between mb-1">
                                                                    <span className="fw-semibold small text-truncate pe-2" style={{ color: "var(--text-primary)" }}>
                                                                        {item.title}
                                                                    </span>
                                                                    <span className="text-secondary small flex-shrink-0" style={{ fontSize: "11px" }}>
                                                                        {formatRelativeTime(item.createdAt)}
                                                                    </span>
                                                                </div>
                                                                <div className="text-secondary small lh-sm" style={{ maxWidth: "45ch" }}>
                                                                    {item.message}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-2 border-top border-secondary border-opacity-15 text-start">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-secondary-flat w-100 py-1 small"
                                            onClick={() => setShowNotifMenu(false)}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                        <div className="d-flex align-items-center gap-2 ms-1">
                            <Avatar initials={initialsFromName(user?.name || roleLabel)} size={32} />
                            {!isMobile && (
                                <div className="d-flex align-items-center gap-2">
                                    <span className="small font-display fw-semibold" style={{ color: "var(--text-primary)" }}>{user?.name}</span>
                                    <RoleBadge role={roleLabel} />
                                </div>
                            )}
                        </div>
                        <PillButton variant="ghost" onClick={onLogout} className="py-1 px-2.5 small ms-1" title="Log out">
                            <i className="ph ph-sign-out fs-6 d-inline d-sm-none"></i>
                            <span className="d-none d-sm-inline">Log out</span>
                        </PillButton>
                    </div>
                </header>

                {/* Body Views */}
                <main className="p-3 p-md-4 flex-grow-1 overflow-y-auto w-100 text-start">
                    {children}
                </main>
            </div>
        </div>
    );
}

