import { useState } from "react";
import { PillButton, AudienceBadge } from "../Theme";
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
        <div>
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                <div>
                    <h2 className="font-display text-skywash m-0">{title}</h2>
                    <div className="text-fog small">{subtitle}</div>
                </div>
                {canBroadcast && (
                    <PillButton variant="filled" onClick={() => setShowModal(true)}>
                        <i className="bi bi-megaphone me-2"></i> Issue Notice
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
                                <td className="fw-bold text-frost">{n.id}</td>
                                <td className="text-moon fw-medium">{n.title}</td>
                                <td><AudienceBadge audience={n.audience} /></td>
                                <td className="text-frost">{n.createdBy}</td>
                                <td className="text-fog small">{n.date}</td>
                            </tr>
                        ))}
                        {notices.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center text-fog py-4">No notices broadcasted yet.</td>
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
