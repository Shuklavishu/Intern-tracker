import { useState, useMemo } from "react";
import PortalLayout from "./components/PortalLayout";
import DashboardOverview from "./components/views/DashboardOverview";
import InternsRosterView from "./components/views/InternsRosterView";
import TasksView from "./components/TasksView";
import EvaluationsView from "./components/EvaluationsView";
import NoticesView from "./components/NoticesView";
import GoalsView from "./components/GoalsView";
import RequestsView from "./components/RequestsView";
import MentorsView from "./components/views/MentorsView";
import InternDetailModal from "./components/InternDetailModal";
import { AddInternModalForm, AddMentorModalForm, AssignMentorModal, EditInternModalForm, EditInternDatesModal } from "./components/AdminModals";
import { calculateCohortDataPoints } from "./utils/helpers";
import { API } from "./services/api";

export default function AdminPortal({
    user,
    interns = [],
    setInterns,
    departments = [],
    tasks = [],
    goals = [],
    setGoals,
    notices = [],
    setNotices,
    requests = [],
    setRequests,
    mentorsData = [],
    setMentorsData,
    onLogout,
    theme,
    toggleTheme
}) {
    const [activeTab, setActiveTab] = useState("dashboard");

    // Modal dialog state
    const [showAddInternModal, setShowAddInternModal] = useState(false);
    const [showAddMentorModal, setShowAddMentorModal] = useState(false);
    const [showAssignMentorModal, setShowAssignMentorModal] = useState(false);
    const [assignTargetIntern, setAssignTargetIntern] = useState(null);
    const [assignTargetMentor, setAssignTargetMentor] = useState(null);
    const [viewingIntern, setViewingIntern] = useState(null);
    const [editingIntern, setEditingIntern] = useState(null);
    const [showEditDatesModal, setShowEditDatesModal] = useState(false);
    const [editDatesTargetIntern, setEditDatesTargetIntern] = useState(null);

    // Business action handlers
    const assignMentor = async (internId, newMentorName) => {
        const internObj = interns.find((i) => String(i.id || i._id) === String(internId));
        if (internObj && newMentorName && newMentorName !== "Unassigned") {
            const mentorObj = mentorsData.find((m) => (m.name || "").trim() === newMentorName.trim());
            if (mentorObj && mentorObj.dept && internObj.dept && mentorObj.dept.toLowerCase().trim() !== internObj.dept.toLowerCase().trim()) {
                alert(`Intern can only be assigned to a mentor from the same department (${mentorObj.dept} vs ${internObj.dept}).`);
                return;
            }
        }
        setInterns((prev) =>
            prev.map((i) => (String(i.id || i._id) === String(internId) ? { ...i, mentor: newMentorName } : i))
        );
        try {
            await API.updateIntern(internId, { mentor: newMentorName });
        } catch (err) {
            console.warn("Backend mentor assignment error:", err.message);
            alert(err.message || "Failed to assign mentor");
        }
    };

    const updateIntern = async (updated) => {
        const currentMonth = new Date().toLocaleString("en-US", { month: "short" });
        const rounded = Number(Number(updated.score).toFixed(1));
        const targetId = updated.id || updated._id;

        try {
            await API.updateIntern(targetId, updated);
            setInterns((prev) =>
                prev.map((i) => {
                    if (String(i.id || i._id) === String(targetId)) {
                        const history = Array.isArray(i.scoreHistory) ? [...i.scoreHistory] : [];
                        const idx = history.findIndex((h) => h.label === currentMonth);
                        if (idx >= 0) {
                            history[idx] = { ...history[idx], score: rounded };
                        } else {
                            history.push({
                                label: currentMonth,
                                score: rounded,
                                benchmark: 7.8,
                                tasks: 20
                            });
                        }
                        return { ...i, ...updated, score: rounded, scoreHistory: history };
                    }
                    return i;
                })
            );
        } catch (err) {
            console.warn("Backend update intern error:", err.message);
            throw err;
        }
    };

    const deleteIntern = async (id) => {
        const internToDelete = interns.find((i) => String(i.id || i._id) === String(id));
        if (internToDelete && ["Completed", "Terminated"].includes(internToDelete.status)) {
            alert(`Interns with status "${internToDelete.status}" cannot be deleted. Use status to retire them.`);
            return;
        }
        if (window.confirm("Are you sure you want to remove this intern?")) {
            const previousInterns = [...interns];
            setInterns((prev) => prev.filter((i) => String(i.id || i._id) !== String(id)));
            try {
                await API.deleteIntern(id);
            } catch (err) {
                alert(err.message || "Failed to delete intern");
                setInterns(previousInterns);
            }
        }
    };

    const updateInternStatus = async (id, status) => {
        const previousInterns = [...interns];
        setInterns((prev) => prev.map((i) => ((i.id === id || i._id === id) ? { ...i, status } : i)));
        try {
            await API.updateInternStatus(id, status);
        } catch (err) {
            alert(err.message || "Failed to update intern status");
            setInterns(previousInterns);
        }
    };

    const addIntern = async (newIntern) => {
        try {
            const created = await API.createIntern(newIntern);
            const mapped = { ...created, id: created._id || created.id };
            setInterns((prev) => [mapped, ...prev]);
        } catch (err) {
            console.warn("Backend add intern error:", err.message);
            alert(err.message || "Failed to onboard intern");
        }
    };

    const updateInternDates = async (internId, { startDate, endDate }) => {
        try {
            const res = await API.updateInternDates(internId, { startDate, endDate });
            setInterns((prev) =>
                prev.map((i) =>
                    String(i.id || i._id) === String(internId)
                        ? { ...i, startDate, endDate, internshipInfo: res?.internshipInfo }
                        : i
                )
            );
        } catch (err) {
            alert(err.message || "Failed to update internship dates");
            throw err;
        }
    };

    const addMentor = async (newMentor) => {
        try {
            const res = await API.registerStaff({
                name: newMentor.name,
                email: newMentor.email,
                password: newMentor.password || "password123",
                role: "mentor",
                dept: newMentor.dept,
                jobTitle: newMentor.role
            });
            const mentorObj = res.mentor || {
                id: res.user?.id,
                name: newMentor.name,
                email: newMentor.email,
                dept: newMentor.dept,
                role: newMentor.role
            };
            const mapped = { ...mentorObj, id: mentorObj._id || mentorObj.id };
            if (setMentorsData) setMentorsData((prev) => [mapped, ...prev]);
        } catch (err) {
            console.warn("Backend add mentor error:", err.message);
            alert(err.message || "Failed to register mentor");
        }
    };

    const deleteMentor = async (id) => {
        if (setMentorsData) {
            setMentorsData((prev) => prev.filter((m) => String(m.id || m._id) !== String(id)));
        }
        try {
            await API.deleteMentor(id);
        } catch (err) {
            console.warn("Backend delete mentor error:", err.message);
        }
    };

    const issueNotice = async (newNotice) => {
        try {
            const created = await API.createNotice(newNotice);
            const mapped = { ...created, id: created._id || created.id };
            setNotices((prev) => [mapped, ...prev]);
        } catch (err) {
            console.warn("Backend notice broadcast error:", err.message);
            setNotices((prev) => [newNotice, ...prev]);
        }
    };

    const approveRequest = async (id) => {
        const targetReq = requests.find((r) => String(r.id || r._id) === String(id));
        setRequests((prev) => prev.map((r) => ((r.id === id || r._id === id) ? { ...r, status: "Approved" } : r)));

        if (targetReq && (targetReq.type === "Goal Date Extension" || targetReq.type?.toLowerCase().includes("extension"))) {
            const newDate = targetReq.extendedDate || targetReq.endDate || targetReq.date;
            setGoals((prev) => prev.map((g) => {
                if (String(g.id || g._id) === String(targetReq.goalId) || (targetReq.goalTitle && g.title === targetReq.goalTitle)) {
                    return { ...g, due: newDate };
                }
                return g;
            }));
            if (targetReq.goalId) {
                try {
                    await API.extendGoalDueDate(targetReq.goalId, newDate);
                } catch (gErr) {
                    console.warn("Backend extend goal on approve error:", gErr.message);
                }
            }
        }

        try {
            await API.approveLeave(id);
        } catch {
            try {
                await API.updateRequestStatus(id, "Approved");
            } catch (fallbackErr) {
                console.warn("Backend approve request error:", fallbackErr.message);
            }
        }
    };

    const handleExtendGoalDueDate = async (goalId, newDueDate) => {
        setGoals((prev) => prev.map((g) => (String(g.id || g._id) === String(goalId) ? { ...g, due: newDueDate } : g)));
        setRequests((prev) => prev.map((r) => {
            const isMatch = (r.goalId && String(r.goalId) === String(goalId)) || (r.goalTitle && goals.find((g) => String(g.id || g._id) === String(goalId))?.title === r.goalTitle);
            if (isMatch && r.status === "Pending") {
                return { ...r, status: "Approved" };
            }
            return r;
        }));
        try {
            await API.extendGoalDueDate(goalId, newDueDate);
        } catch (err) {
            console.warn("Backend extend goal error:", err.message);
            alert(err.message || "Failed to extend goal deadline");
        }
    };

    const rejectRequest = async (id) => {
        setRequests((prev) => prev.map((r) => ((r.id === id || r._id === id) ? { ...r, status: "Denied" } : r)));
        try {
            await API.denyLeave(id);
        } catch {
            try {
                await API.updateRequestStatus(id, "Rejected");
            } catch (fallbackErr) {
                console.warn("Backend reject request error:", fallbackErr.message);
            }
        }
    };

    const pendingTasksCount = useMemo(() => tasks.filter((t) => t?.status === "Pending").length, [tasks]);
    const mentorsCount = mentorsData.length;
    const availableMentors = useMemo(() => Array.from(
        new Set([
            ...mentorsData.map((m) => m?.name).filter(Boolean),
            ...interns.map((i) => i?.mentor).filter((m) => m && m !== "Unassigned")
        ])
    ), [mentorsData, interns]);

    const navItems = [
        { id: "dashboard", label: "Admin Dashboard", icon: "ph-gauge" },
        { id: "interns", label: "Interns Roster", icon: "ph-users" },
        { id: "tasks", label: "All Tasks", icon: "ph-check-square", badge: pendingTasksCount },
        { id: "evaluations", label: "Evaluations", icon: "ph-star" },
        { id: "notices", label: "Notices & Broadcasts", icon: "ph-megaphone-simple" },
        { id: "goals", label: "Goals Directory", icon: "ph-flag" },
        { id: "requests", label: "All Requests", icon: "ph-file-text" },
        { id: "mentors", label: "Mentor Profiles", icon: "ph-identification-badge" },
    ];

    const avgScore = interns.length > 0 
        ? (interns.reduce((acc, curr) => acc + (parseFloat(curr.score) || 0), 0) / interns.length).toFixed(1)
        : "N/A";

    const adminStats = [
        { label: "Total Active Interns", value: interns.length, trend: interns.length === 0 ? "No interns yet" : `${interns.length} registered`, icon: "ph-users" },
        { label: "Active Mentors", value: mentorsCount, trend: mentorsCount === 0 ? "No mentors yet" : `${mentorsCount} registered`, icon: "ph-identification-badge" },
        { label: "Pending Task Reviews", value: pendingTasksCount, trend: pendingTasksCount > 0 ? "Action Needed" : "All Clear", trendUp: pendingTasksCount === 0, icon: "ph-check-square" },
        { label: "Average System Score", value: avgScore, trend: interns.length > 0 ? "Cohort Average" : "Awaiting Data", icon: "ph-star" },
    ];

    const cohortPoints = useMemo(() => calculateCohortDataPoints(interns), [interns]);

    return (
        <PortalLayout
            title="Admin Console"
            roleLabel="Admin"
            user={user}
            navItems={navItems}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={onLogout}
            theme={theme}
            toggleTheme={toggleTheme}
        >
            {activeTab === "dashboard" && (
                <DashboardOverview
                    title="Admin Overview"
                    subtitle="Company-wide statistics and system status"
                    role="admin"
                    stats={adminStats}
                    notices={notices}
                    onViewAllNotices={() => setActiveTab("notices")}
                    chartTitle="Cohort Score Trajectory & Performance"
                    chartSubtitle="Real-time evaluation curves across all active interns"
                    chartDataPoints={cohortPoints}
                    tasks={tasks}
                    goals={goals}
                    interns={interns}
                />
            )}

            {activeTab === "interns" && (
                <InternsRosterView
                    title="Interns Roster"
                    subtitle="Complete register of active and graduated interns"
                    interns={interns}
                    departments={departments}
                    mentors={availableMentors}
                    canAdd={true}
                    onAddClick={() => setShowAddInternModal(true)}
                    onView={(intern) => setViewingIntern(intern)}
                    onEdit={(intern) => setEditingIntern(intern)}
                    onEditDates={(intern) => {
                        setEditDatesTargetIntern(intern);
                        setShowEditDatesModal(true);
                    }}
                    onAssignMentor={(intern) => {
                        setAssignTargetIntern(intern);
                        setAssignTargetMentor(null);
                        setShowAssignMentorModal(true);
                    }}
                    onDelete={deleteIntern}
                    role="admin"
                    onUpdateStatus={updateInternStatus}
                />
            )}

            {activeTab === "tasks" && (
                <TasksView
                    title="All System Tasks"
                    subtitle="Monitor tasks logged across all interns (Review & Approvals handled strictly by assigned mentors)"
                    tasks={tasks}
                    goals={goals}
                    canApprove={false}
                    showInternColumn={true}
                    role="admin"
                />
            )}

            {activeTab === "evaluations" && (
                <EvaluationsView
                    title="Intern Scorecards & Evaluations"
                    subtitle="Monitor intern scorecards and competency distribution (Evaluated exclusively by assigned mentors)"
                    mode="team"
                    interns={interns}
                    canEditScore={false}
                />
            )}

            {activeTab === "notices" && (
                <NoticesView
                    title="Notices & Broadcasts"
                    subtitle="Company-wide broadcasts and administrative announcements"
                    notices={notices}
                    canBroadcast={true}
                    onIssueNotice={issueNotice}
                    user={user}
                    departments={departments}
                    allowAllDepartments={true}
                />
            )}

            {activeTab === "goals" && (
                <GoalsView
                    title="Goals Directory"
                    subtitle="Company-wide intern goals and milestone deadlines"
                    goals={goals}
                    tasks={tasks}
                    interns={interns}
                    requests={requests}
                    showInternColumn={true}
                    canCreate={false}
                    onExtendDueDate={handleExtendGoalDueDate}
                    role="admin"
                />
            )}

            {activeTab === "requests" && (
                <RequestsView
                    title="Requests & Applications"
                    subtitle="Review and process intern leave, Work From Home (WFH), and goal extension applications"
                    requests={requests}
                    goals={goals}
                    canReview={true}
                    onApprove={approveRequest}
                    onReject={rejectRequest}
                    showInternColumn={true}
                />
            )}

            {activeTab === "mentors" && (
                <MentorsView
                    mentorsData={mentorsData}
                    interns={interns}
                    onAddMentorClick={() => setShowAddMentorModal(true)}
                    onDeleteMentorClick={deleteMentor}
                    onAssignClick={(mentorName) => {
                        setAssignTargetMentor(mentorName);
                        setAssignTargetIntern(null);
                        setShowAssignMentorModal(true);
                    }}
                />
            )}

            {/* Modals */}
            {showAddInternModal && (
                <AddInternModalForm
                    onClose={() => setShowAddInternModal(false)}
                    onAdd={addIntern}
                    departments={departments}
                    mentors={availableMentors}
                    existingInterns={interns}
                    existingMentors={mentorsData}
                />
            )}
            {showAddMentorModal && (
                <AddMentorModalForm
                    onClose={() => setShowAddMentorModal(false)}
                    onAdd={addMentor}
                    departments={departments}
                    existingInterns={interns}
                    existingMentors={mentorsData}
                />
            )}
            {showAssignMentorModal && (
                <AssignMentorModal
                    onClose={() => setShowAssignMentorModal(false)}
                    onAssign={assignMentor}
                    interns={interns}
                    mentors={availableMentors}
                    defaultIntern={assignTargetIntern}
                    defaultMentor={assignTargetMentor}
                    existingMentors={mentorsData}
                />
            )}
            {viewingIntern && (
                <InternDetailModal
                    intern={interns.find((i) => i.id === viewingIntern.id) || viewingIntern}
                    mentors={availableMentors}
                    existingMentors={mentorsData}
                    onAssignMentor={assignMentor}
                    onClose={() => setViewingIntern(null)}
                />
            )}
            {editingIntern && (
                <EditInternModalForm
                    intern={editingIntern}
                    onClose={() => setEditingIntern(null)}
                    onSave={updateIntern}
                    departments={departments}
                    mentors={availableMentors}
                    existingInterns={interns}
                    existingMentors={mentorsData}
                />
            )}
            {showEditDatesModal && editDatesTargetIntern && (
                <EditInternDatesModal
                    intern={editDatesTargetIntern}
                    onClose={() => {
                        setShowEditDatesModal(false);
                        setEditDatesTargetIntern(null);
                    }}
                    onSaveDates={updateInternDates}
                />
            )}
        </PortalLayout>
    );
}
