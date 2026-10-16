import { useState } from "react";
import { PillButton, AudienceBadge, EmptyState } from "../Theme";
import NoticeModal from "./NoticeModal";

export default function NoticesView({
    title = "Notices & Broadcasts",
    subtitle = "Company-wide updates and department announcements",
    notices = [],
    canBroadcast = false,
    onIssueNotice,
    user,
    departments = [],
    allowAllDepartments = true
}) {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="text-start">
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                <div className="text-start">
                    <h2 className="font-display h3 m-0" style={{ color: "var(--text-primary)" }}>{title}</h2>
                    <div className="text-secondary small mt-1" style={{ maxWidth: "65ch" }}>{subtitle}</div>
                </div>
                {canBroadcast && (
                    <PillButton variant="filled" onClick={() => setShowModal(true)}>
                        <i className="ph ph-megaphone-simple me-1.5"></i> Issue Notice
                    </PillButton>
                )}
            </div>

            <div className="ems-table-wrapper">
                <table className="ems-table">
                    <thead>
                        <tr>
                            <th>Notice ID</th>
                            <th>Title</th>
                            <th>Audience</th>
                            <th>Created By</th>
                            <th>Date Broadcast</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notices.map((n) => (
                            <tr key={n.id}>
                                <td className="fw-semibold" style={{ color: "var(--text-primary)" }}>{n.id}</td>
                                <td style={{ color: "var(--text-primary)" }}>{n.title}</td>
                                <td><AudienceBadge audience={n.audience} /></td>
                                <td style={{ color: "var(--text-primary)" }}>{n.createdBy}</td>
                                <td className="text-secondary small">{n.date}</td>
                            </tr>
                        ))}
                        {notices.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-4">
                                    <EmptyState
                                        icon="ph-megaphone-simple"
                                        title="No broadcast notices"
                                        description="Company-wide announcements and team updates will be listed here when published."
                                        actionLabel={canBroadcast ? "Issue Notice" : undefined}
                                        onAction={canBroadcast ? () => setShowModal(true) : undefined}
                                    />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <NoticeModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onIssue={onIssueNotice}
                    user={user}
                    departments={departments}
                    allowAllDepartments={allowAllDepartments}
                />
            )}
        </div>
    );
}
