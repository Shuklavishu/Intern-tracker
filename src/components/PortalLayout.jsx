import { useState } from "react";
import { PillButton, Avatar, ThemeToggle, RoleBadge } from "../Theme";
import { useViewport, initialsFromName } from "../utils/helpers";

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

    return (
        <div className="min-vh-100 d-flex text-light">
            {/* Left Navigation Sidebar */}
            <aside className={`ems-sidebar flex-shrink-0 d-flex flex-column ${sidebarCollapsed ? "collapsed" : ""}`}>
                <div className="p-3 border-bottom border-secondary border-opacity-10 d-flex align-items-center justify-content-between">
                    <div className="font-display fs-4 text-skywash d-flex align-items-center gap-2 overflow-hidden">
                        <span className="rounded-circle p-1 d-inline-flex flex-shrink-0" style={{ width: 12, height: 12, backgroundColor: "#e05626" }}></span>
                        {!sidebarCollapsed && <span>{title}</span>}
                    </div>
                </div>

                <div className="ems-sidebar-nav p-2 flex-grow-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <div key={item.id} className="nav-item">
                            <a
                                href={`#${item.id}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab(item.id);
                                }}
                                className={`ems-nav-link ${activeTab === item.id ? "active" : ""}`}
                                title={sidebarCollapsed ? item.label : ""}
                            >
                                <i className={`bi ${item.icon} fs-5`}></i>
                                {!sidebarCollapsed && <span>{item.label}</span>}
                                {!sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                                    <span className="badge bg-danger rounded-pill ms-auto small">{item.badge}</span>
                                )}
                            </a>
                        </div>
                    ))}
                </div>

                <div className="p-3 border-top border-secondary border-opacity-10">
                    {!sidebarCollapsed && (
                        <div className="text-fog extra-small font-eyebrow mb-2">ROLE: {roleLabel.toUpperCase()}</div>
                    )}
                    <button
                        type="button"
                        className="btn btn-sm btn-ghost-pill w-100 d-flex align-items-center justify-content-center gap-2"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    >
                        <i className={`bi ${sidebarCollapsed ? "bi-chevron-right" : "bi-chevron-left"}`}></i>
                        {!sidebarCollapsed && <span>Collapse Sidebar</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Container */}
            <div className="flex-grow-1 d-flex flex-column min-w-0">
                {/* Header Navbar */}
                <header className="border-bottom border-secondary border-opacity-10 py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-3 sticky-top" style={{ background: "var(--surface-deep-glass, rgba(5, 6, 15, 0.9))", backdropFilter: "blur(12px)", zIndex: 100 }}>
                    <div className="d-flex align-items-center gap-3">
                        <button
                            type="button"
                            className="btn btn-sm text-moon border-0 p-1 fs-4"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        >
                            <i className="bi bi-list"></i>
                        </button>
                        <span className="font-eyebrow text-fog d-none d-sm-inline">IMS {title} &middot; {user?.name}</span>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                        <div className="d-flex align-items-center gap-2">
                            <Avatar initials={initialsFromName(user?.name || roleLabel)} size={32} />
                            {!isMobile && (
                                <div className="d-flex align-items-center gap-2">
                                    <span className="text-frost small font-display fw-semibold">{user?.name}</span>
                                    <RoleBadge role={roleLabel} />
                                </div>
                            )}
                        </div>
                        <PillButton variant="ghost" onClick={onLogout} className="py-1 px-3 fs-7">
                            Log out
                        </PillButton>
                    </div>
                </header>

                {/* Body Views */}
                <main className="p-3 p-md-4 flex-grow-1 overflow-y-auto w-100">
                    {children}
                </main>
            </div>
        </div>
    );
}
