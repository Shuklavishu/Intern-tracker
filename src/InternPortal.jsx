import { useState } from "react";
import PortalLayout from "./components/PortalLayout";
import DashboardOverview from "./components/views/DashboardOverview";
import TasksView from "./components/TasksView";
import NoticesView from "./components/NoticesView";
import RequestsView from "./components/RequestsView";
import GoalsView from "./components/GoalsView";
import EvaluationsView from "./components/EvaluationsView";
import { API } from "./services/api";

export default function InternPortal({
    user,
    interns = [],
    tasks = [],
    setTasks,
    goals = [],
    notices = [],
    requests = [],
    setRequests,
    onLogout,
    theme,
    toggleTheme
}) {
    const [activeTab, setActiveTab] = useState("dashboard");

    const userName = user?.name || "";
    const meObj = interns.find((i) => (user?.email && i.email?.toLowerCase() === user?.email?.toLowerCase()) || i.name === userName) || {
        name: userName,
        score: 8.7,
        dept: "Engineering",
        mentor: "Rohan Verma",
        scoreHistory: null
    };

    // Scoped intern data
    const myTasks = tasks.filter((t) => t.intern === userName);
    const myGoals = goals.filter((g) => g.intern === userName);
    const myRequests = requests.filter((r) => r.intern === userName);

    const logTask = async ({ title, hours, goalId }) => {
        // Backend derives intern from JWT — only send task content
        const payload = {
            title,
            hours: Number(hours) || 4,
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            ...(goalId ? { goal: goalId } : {}),
        };
        try {
            const created = await API.createTask(payload);
            const mapped = { ...created, id: created._id || created.id };
            setTasks((prev) => [mapped, ...prev]);
        } catch (err) {
            console.warn("Backend log task error:", err.message);
            // Optimistic local fallback
            setTasks((prev) => [{ ...payload, intern: userName, assignedBy: "Self", status: "Pending", id: Date.now() }, ...prev]);
        }
    };

    const requestLeave = async (req) => {
        const payload = {
            intern: userName,
            type: req.type || "Time-off / Leave",
            reason: req.reason,
            status: "Pending",
            date: new Date().toISOString().split("T")[0]
        };
        try {
            const created = await API.createRequest(payload);
            const mapped = { ...created, id: created._id || created.id };
            setRequests((prev) => [mapped, ...prev]);
        } catch (err) {
            console.warn("Backend request error:", err.message);
            setRequests((prev) => [{ ...payload, id: Date.now() }, ...prev]);
        }
    };

    // Interns cannot update goal progress — it is auto-calculated server-side from approved tasks.

    const pendingRequestsCount = myRequests.filter((r) => r.status === "Pending").length;

    const navItems = [
        { id: "dashboard", label: "My Portal", icon: "bi-speedometer2" },
        { id: "tasks", label: "Log Tasks", icon: "bi-check2-square" },
        { id: "evaluations", label: "My Scorecard", icon: "bi-star" },
        { id: "notices", label: "Notices", icon: "bi-megaphone" },
        { id: "goals", label: "Goals", icon: "bi-flag" },
        { id: "requests", label: "Leave Requests", icon: "bi-file-earmark-text", badge: pendingRequestsCount },
    ];

    const internStats = [
        { label: "Approved Tasks", value: myTasks.filter((t) => t.status === "Approved").length, trend: "Validated by Mentor", icon: "bi-check2-all" },
        { label: "Logged Tasks", value: myTasks.length, trend: `${myTasks.filter((t) => t.status === "Approved").length} approved`, icon: "bi-check2-square" },
        { label: "Goals Progress", value: myGoals.length ? `${Math.round(myGoals.reduce((acc, g) => acc + (g.progress || 0), 0) / myGoals.length)}%` : "0%", trend: `${myGoals.length} assigned`, icon: "bi-flag" },
        { label: "Evaluation Score", value: `${meObj.score} / 10`, trend: "Latest rating", icon: "bi-star" },
    ];

    return (
        <PortalLayout
            title="Intern Console"
            roleLabel="Intern"
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
                    title="My Performance Portal"
                    subtitle="Personal statistics, task summary, and evaluation score"
                    role="intern"
                    stats={internStats}
                    internScore={meObj.score}
                    notices={notices}
                    onViewAllNotices={() => setActiveTab("notices")}
                    chartTitle="My Score & Performance Trajectory"
                    chartSubtitle={`Interactive evaluation tracking for ${userName}`}
                    chartDataPoints={meObj.scoreHistory || null}
                />
            )}

            {activeTab === "tasks" && (
                <TasksView
                    title="My Logged Tasks"
                    subtitle="Log your daily work hours for mentor approval"
                    tasks={myTasks}
                    goals={myGoals}
                    canApprove={false}
                    canCreate={true}
                    onCreateTask={logTask}
                    showInternColumn={false}
                />
            )}

            {activeTab === "evaluations" && (
                <EvaluationsView
                    title="My Evaluation Scorecard"
                    subtitle={`Official evaluation breakdown from your mentor (${meObj.mentor})`}
                    mode="personal"
                    currentUser={user}
                    personalIntern={meObj}
                />
            )}

            {activeTab === "notices" && (
                <NoticesView
                    title="Company & Department Notices"
                    subtitle="Broadcast announcements"
                    notices={notices}
                    canBroadcast={false}
                />
            )}

            {activeTab === "goals" && (
                <GoalsView
                    title="My Target Milestones"
                    subtitle="Progress indicators towards quarterly performance goals"
                    goals={myGoals}
                    showInternColumn={false}
                />
            )}

            {activeTab === "requests" && (
                <RequestsView
                    title="Leave & Extension Requests"
                    subtitle="Submit new time-off or deadline extension requests"
                    requests={myRequests}
                    canReview={false}
                    canSubmit={true}
                    onSubmitRequest={requestLeave}
                    showInternColumn={false}
                />
            )}
        </PortalLayout>
    );
}
