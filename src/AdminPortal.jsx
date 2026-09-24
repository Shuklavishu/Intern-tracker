import { useState, useMemo } from "react";
import PortalLayout from "./components/PortalLayout";
import DashboardOverview from "./components/views/DashboardOverview";
import InternsRosterView from "./components/views/InternsRosterView";
import DepartmentsView from "./components/views/DepartmentsView";
import TasksView from "./components/TasksView";
import EvaluationsView from "./components/EvaluationsView";
import NoticesView from "./components/NoticesView";
import GoalsView from "./components/GoalsView";
import RequestsView from "./components/RequestsView";
import MentorsView from "./components/views/MentorsView";
import InternDetailModal from "./components/InternDetailModal";
import { AddInternModalForm, AddMentorModalForm, AssignMentorModal, EditInternModalForm } from "./components/AdminModals";
import { calculateCohortDataPoints } from "./utils/helpers";
import { API } from "./services/api";

export default function AdminPortal({
    user,
    interns = [],
    setInterns,
    departments = [],
    tasks = [],
    setTasks,
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

    // Business action handlers
    const assignMentor = async (internId, newMentorName) => {
        setInterns((prev) =>
            prev.map((i) => ((i.id === internId || i._id === internId) ? { ...i, mentor: newMentorName } : i))
        );
        try {
            await API.updateIntern(internId, { mentor: newMentorName });
        } catch (err) {
            console.warn("Backend mentor assignment error:", err.message);
        }
    };

    const updateIntern = async (updated) => {
        const currentMonth = new Date().toLocaleString("en-US", { month: "short" });
        const rounded = Number(Number(updated.score).toFixed(1));

        setInterns((prev) =>
            prev.map((i) => {
                if (i.id === updated.id || i._id === updated.id) {
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

        try {
            await API.updateIntern(updated.id || updated._id, updated);
        } catch (err) {
            console.warn("Backend sync skipped or offline:", err.message);
        }
    };

    const deleteIntern = async (id) => {
        if (window.confirm("Are you sure you want to remove this intern?")) {
            setInterns((prev) => prev.filter((i) => i.id !== id && i._id !== id));
            try {
                await API.deleteIntern(id);
            } catch (err) {
                console.warn("Backend delete intern error:", err.message);
            }
        }
    };

    const addIntern = async (newIntern) => {
        try {
            const created = await API.createIntern(newIntern);
            const mapped = { ...created, id: created._id || created.id };
            setInterns((prev) => [mapped, ...prev]);
        } catch (err) {
            console.warn("Backend add intern error:", err.message);
            setInterns((prev) => [newIntern, ...prev]);
        }
    };

    const addMentor = async (newMentor) => {
        try {
            const created = await API.createMentor(newMentor);
            const mapped = { ...created, id: created._id || created.id };
            if (setMentorsData) setMentorsData((prev) => [mapped, ...prev]);
        } catch (err) {
            console.warn("Backend add mentor error:", err.message);
            if (setMentorsData) setMentorsData((prev) => [newMentor, ...prev]);
        }
    };

    const deleteMentor = async (id) => {
        if (setMentorsData) {
            setMentorsData((prev) => prev.filter((m) => m.id !== id && m._id !== id));
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

    const createGoal = async (goalData) => {
        try {
            const created = await API.createGoal(goalData);
            const mapped = { ...created, id: created._id || created.id };
            setGoals?.((prev) => [mapped, ...prev]);
        } catch (err) {
            console.warn("Backend create goal error:", err.message);
        }
    };

    const updateGoalStatus = async (id, status) => {
        setGoals?.((prev) => prev.map((g) => ((g.id === id || g._id === id) ? { ...g, status } : g)));
        try {
            await API.updateGoalStatus(id, status);
        } catch (err) {
            console.warn("Backend goal status update error:", err.message);
        }
    };

    const approveTask = async (id) => {
        setTasks((prev) => prev.map((t) => ((t.id === id || t._id === id) ? { ...t, status: "Approved" } : t)));
        try {
            await API.updateTaskStatus(id, "Approved");
        } catch (err) {
            console.warn("Backend approve task error:", err.message);
        }
    };

    const rejectTask = async (id) => {
        setTasks((prev) => prev.map((t) => ((t.id === id || t._id === id) ? { ...t, status: "Rejected" } : t)));
        try {
            await API.updateTaskStatus(id, "Rejected");
        } catch (err) {
            console.warn("Backend reject task error:", err.message);
        }
    };

    const approveRequest = async (id) => {
        setRequests((prev) => prev.map((r) => ((r.id === id || r._id === id) ? { ...r, status: "Approved" } : r)));
        try {
            await API.updateRequestStatus(id, "Approved");
        } catch (err) {
            console.warn("Backend approve request error:", err.message);
        }
    };

    const rejectRequest = async (id) => {
        setRequests((prev) => prev.map((r) => ((r.id === id || r._id === id) ? { ...r, status: "Rejected" } : r)));
        try {
            await API.updateRequestStatus(id, "Rejected");
        } catch (err) {
            console.warn("Backend reject request error:", err.message);
        }
    };

    const updateScore = async (id, newScore) => {
        const validatedScore = Math.min(10, Math.max(0, parseFloat(newScore) || 0));
        const rounded = Number(validatedScore.toFixed(1));
        const currentMonth = new Date().toLocaleString("en-US", { month: "short" });

        setInterns((prev) =>
            prev.map((i) => {
                if (i.id === id || i._id === id) {
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
                    return { ...i, score: rounded, scoreHistory: history };
                }
                return i;
            })
        );

        try {
            await API.updateIntern(id, { score: rounded });
        } catch (err) {
            console.warn("Backend sync skipped or offline:", err.message);
        }
    };

    const pendingTasksCount = tasks.filter((t) => t?.status === "Pending").length;
    const mentorsCount = mentorsData.length;
    const availableMentors = Array.from(
        new Set([
            ...mentorsData.map((m) => m?.name).filter(Boolean),
            ...interns.map((i) => i?.mentor).filter((m) => m && m !== "Unassigned")
        ])
    );

    const navItems = [
        { id: "dashboard", label: "Admin Dashboard", icon: "bi-speedometer2" },
        { id: "interns", label: "Interns Roster", icon: "bi-people" },
        { id: "departments", label: "Departments", icon: "bi-building" },
        { id: "tasks", label: "All Tasks", icon: "bi-check2-square", badge: pendingTasksCount },
        { id: "evaluations", label: "Evaluations", icon: "bi-star" },
        { id: "notices", label: "Notices & Broadcasts", icon: "bi-megaphone" },
        { id: "goals", label: "Goals Directory", icon: "bi-flag" },
        { id: "requests", label: "All Requests", icon: "bi-file-earmark-text" },
        { id: "mentors", label: "Mentor Profiles", icon: "bi-person-badge" },
    ];

    const avgScore = interns.length > 0 
        ? (interns.reduce((acc, curr) => acc + (parseFloat(curr.score) || 0), 0) / interns.length).toFixed(1)
        : "N/A";

    const adminStats = [
        { label: "Total Active Interns", value: interns.length, trend: interns.length === 0 ? "No interns yet" : `${interns.length} registered`, icon: "bi-people" },
        { label: "Active Mentors", value: mentorsCount, trend: mentorsCount === 0 ? "No mentors yet" : `${mentorsCount} registered`, icon: "bi-person-badge" },
        { label: "Pending Task Reviews", value: pendingTasksCount, trend: pendingTasksCount > 0 ? "Action Needed" : "All Clear", trendUp: pendingTasksCount === 0, icon: "bi-check2-square" },
        { label: "Average System Score", value: avgScore, trend: interns.length > 0 ? "Cohort Average" : "Awaiting Data", icon: "bi-star" },
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
                    onAssignMentor={(intern) => {
                        setAssignTargetIntern(intern);
                        setAssignTargetMentor(null);
                        setShowAssignMentorModal(true);
                    }}
                    onDelete={deleteIntern}
                />
            )}

            {activeTab === "departments" && (
                <DepartmentsView
                    departments={departments}
                    interns={interns}
                    onAddInternClick={() => setShowAddInternModal(true)}
                    onRemoveIntern={deleteIntern}
                />
            )}

            {activeTab === "tasks" && (
                <TasksView
                    title="All System Tasks"
                    subtitle="Review and approve tasks across all interns"
                    tasks={tasks}
                    goals={goals}
                    canApprove={true}
                    onApprove={approveTask}
                    onReject={rejectTask}
                    showInternColumn={true}
                />
            )}

            {activeTab === "evaluations" && (
                <EvaluationsView
                    title="Admin Scorecards & Evaluations"
                    subtitle="Update overall intern scorecards and inspect competency distribution"
                    mode="team"
                    interns={interns}
                    canEditScore={true}
                    onUpdateScore={updateScore}
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
                    title="Goals Directory (Admin)"
                    subtitle="Company-wide intern goals — progress auto-calculated from approved tasks"
                    goals={goals}
                    interns={interns}
                    showInternColumn={true}
                    canCreate={true}
                    onCreateGoal={createGoal}
                    canUpdateStatus={true}
                    onUpdateStatus={updateGoalStatus}
                />
            )}

            {activeTab === "requests" && (
                <RequestsView
                    title="Requests & Leave Applications"
                    subtitle="Review and process intern leave and deadline extension applications"
                    requests={requests}
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
                />
            )}
            {showAddMentorModal && (
                <AddMentorModalForm
                    onClose={() => setShowAddMentorModal(false)}
                    onAdd={addMentor}
                    departments={departments}
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
                />
            )}
            {viewingIntern && (
                <InternDetailModal
                    intern={interns.find((i) => i.id === viewingIntern.id) || viewingIntern}
                    mentors={availableMentors}
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
                />
            )}
        </PortalLayout>
    );
}
