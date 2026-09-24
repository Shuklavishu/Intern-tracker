import { useState, useMemo } from "react";
import PortalLayout from "./components/PortalLayout";
import DashboardOverview from "./components/views/DashboardOverview";
import InternsRosterView from "./components/views/InternsRosterView";
import TasksView from "./components/TasksView";
import EvaluationsView from "./components/EvaluationsView";
import NoticesView from "./components/NoticesView";
import GoalsView from "./components/GoalsView";
import RequestsView from "./components/RequestsView";
import InternDetailModal from "./components/InternDetailModal";
import { calculateCohortDataPoints } from "./utils/helpers";
import { API } from "./services/api";

export default function MentorPortal({
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
    onLogout,
    theme,
    toggleTheme
}) {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [viewingIntern, setViewingIntern] = useState(null);

    // Scoped data for this mentor
    const myInterns = interns.filter((i) => i.mentor === user?.name);
    const myInternNames = myInterns.map((i) => i.name);
    const myTasks = tasks.filter((t) => myInternNames.includes(t.intern));
    const myPendingTasks = myTasks.filter((t) => t.status === "Pending");
    const myActiveGoals = goals.filter((g) => myInternNames.includes(g.intern));
    const myRequests = requests.filter((r) => myInternNames.includes(r.intern));

    // Action handlers
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

    const navItems = [
        { id: "dashboard", label: "Mentor Workspace", icon: "bi-speedometer2" },
        { id: "interns", label: "My Assigned Interns", icon: "bi-people" },
        { id: "tasks", label: "Approve Tasks", icon: "bi-check2-square", badge: myPendingTasks.length },
        { id: "evaluations", label: "Score & Evaluations", icon: "bi-star" },
        { id: "notices", label: "Notices & Broadcasts", icon: "bi-megaphone" },
        { id: "goals", label: "Goals Directory", icon: "bi-flag" },
        { id: "requests", label: "Requests", icon: "bi-file-earmark-text" },
    ];

    const mentorStats = [
        { label: "My Interns", value: myInterns.length, trend: "Assigned Cohort", icon: "bi-people" },
        { label: "Pending Task Approvals", value: myPendingTasks.length, trend: "Action Needed", trendUp: false, icon: "bi-check2-square" },
        { label: "Active Goals", value: myActiveGoals.length, trend: "Tracking", icon: "bi-flag" },
        { label: "Approved Tasks", value: myTasks.filter((t) => t.status === "Approved").length, trend: "Reviewed", icon: "bi-check-all" },
    ];

    const mentorCohortPoints = useMemo(() => calculateCohortDataPoints(myInterns), [myInterns]);

    return (
        <PortalLayout
            title="Mentor Portal"
            roleLabel={`Mentor (${user?.name})`}
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
                    title="Mentor Workspace Overview"
                    subtitle={`Statistics scoped strictly to your assigned interns (${user?.name})`}
                    role="mentor"
                    stats={mentorStats}
                    notices={notices}
                    onViewAllNotices={() => setActiveTab("notices")}
                    chartTitle={`Performance & Score Dynamics (${user?.name}'s Interns)`}
                    chartSubtitle="Real-time performance analytics for your assigned cohort"
                    chartDataPoints={mentorCohortPoints}
                />
            )}

            {activeTab === "interns" && (
                <InternsRosterView
                    title="My Assigned Interns"
                    subtitle={`Direct roster of interns under mentor supervision (${user?.name})`}
                    interns={myInterns}
                    departments={departments}
                    canAdd={false}
                    showMentorFilter={false}
                    showDeptFilter={true}
                    onView={(intern) => setViewingIntern(intern)}
                />
            )}

            {activeTab === "tasks" && (
                <TasksView
                    title="Approve Intern Tasks"
                    subtitle={`Review and approve daily tasks logged by your interns (${user?.name})`}
                    tasks={myTasks}
                    goals={myActiveGoals}
                    canApprove={true}
                    onApprove={approveTask}
                    onReject={rejectTask}
                    showInternColumn={true}
                />
            )}

            {activeTab === "evaluations" && (
                <EvaluationsView
                    title="Score & Evaluations"
                    subtitle="Performance evaluations for your assigned interns"
                    mode="team"
                    interns={myInterns}
                    canEditScore={true}
                    onUpdateScore={updateScore}
                />
            )}

            {activeTab === "notices" && (
                <NoticesView
                    title="Department Notices & Broadcasts"
                    subtitle="Publish and review announcements for your department"
                    notices={notices}
                    canBroadcast={true}
                    onIssueNotice={issueNotice}
                    user={user}
                    departments={departments}
                    allowAllDepartments={false}
                />
            )}

            {activeTab === "goals" && (
                <GoalsView
                    title="Intern Goals Directory"
                    subtitle="Set and track milestone goals for your assigned interns"
                    goals={myActiveGoals}
                    interns={myInterns}
                    showInternColumn={true}
                    canCreate={true}
                    onCreateGoal={createGoal}
                    canUpdateStatus={true}
                    onUpdateStatus={updateGoalStatus}
                />
            )}

            {activeTab === "requests" && (
                <RequestsView
                    title="Intern Requests Desk"
                    subtitle="Review leave applications and extension requests from your interns"
                    requests={myRequests}
                    canReview={true}
                    onApprove={approveRequest}
                    onReject={rejectRequest}
                    showInternColumn={true}
                />
            )}

            {viewingIntern && (
                <InternDetailModal
                    intern={viewingIntern}
                    onClose={() => setViewingIntern(null)}
                />
            )}
        </PortalLayout>
    );
}
