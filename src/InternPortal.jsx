import { useState, useMemo } from "react";
import PortalLayout from "./components/PortalLayout";
import DashboardOverview from "./components/views/DashboardOverview";
import TasksView from "./components/TasksView";
import NoticesView from "./components/NoticesView";
import RequestsView from "./components/RequestsView";
import GoalsView from "./components/GoalsView";
import EvaluationsView from "./components/EvaluationsView";
import { API } from "./services/api";
import { internshipInfo } from "./utils/internshipInfo";

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
    const meObj = useMemo(() =>
        interns.find((i) => (user?.email && i.email?.toLowerCase() === user?.email?.toLowerCase()) || i.name === userName) || {
            name: userName,
            score: 8.7,
            dept: "Engineering",
            mentor: "Rohan Verma",
            scoreHistory: null
        },
        [interns, user?.email, userName]
    );

    // Scoped intern data — memoized (case-insensitive and ID resilient)
    const myTasks = useMemo(() =>
        tasks.filter((t) => {
            if (!t) return false;
            const nameMatch = (t.intern || "").toLowerCase() === (userName || "").toLowerCase();
            const meNameMatch = meObj?.name && (t.intern || "").toLowerCase() === meObj.name.toLowerCase();
            const idMatch = meObj?._id && t.internId && String(t.internId) === String(meObj._id);
            return nameMatch || meNameMatch || idMatch;
        }),
        [tasks, userName, meObj]
    );
    const myGoals = useMemo(() =>
        goals.filter((g) => {
            if (!g) return false;
            const internName = g.internName || g.intern?.name || (typeof g.intern === "string" ? g.intern : "");
            const nameMatch = internName.toLowerCase() === (userName || "").toLowerCase();
            const meNameMatch = meObj?.name && internName.toLowerCase() === meObj.name.toLowerCase();
            const idMatch = meObj?._id && (g.internId || g.intern?._id || g.intern) && String(g.internId || g.intern?._id || g.intern) === String(meObj._id);
            return nameMatch || meNameMatch || idMatch;
        }),
        [goals, userName, meObj]
    );
    const myRequests = useMemo(() =>
        requests.filter((r) => (r.intern || "").toLowerCase() === (userName || "").toLowerCase()),
        [requests, userName]
    );

    const logTask = async ({ title, hours, goalId, goal }) => {
        const targetGoalId = goalId || goal;
        const currentStatus = meObj.status || "Active";
        if (currentStatus !== "Active") {
            alert(`You can't log tasks while your status is ${currentStatus}.`);
            return;
        }

        // Backend derives intern from JWT — only send task content
        const payload = {
            title: title.trim(),
            hours: Number(hours) || 4,
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            goalId: targetGoalId,
            goal: targetGoalId,
        };
        try {
            const created = await API.createTask(payload);
            const mapped = {
                ...created,
                id: created._id || created.id,
                intern: created.intern || userName,
                internName: created.internName || userName
            };
            setTasks((prev) => [mapped, ...prev.filter((t) => (t.id || t._id) !== mapped.id)]);
        } catch (err) {
            console.error("Backend log task error:", err.message);
            alert(err.message || "Failed to log task");
        }
    };

    const requestLeave = async (req) => {
        if (req.type === "Goal Date Extension") {
            const payload = {
                intern: userName,
                internId: meObj?._id || meObj?.id,
                internName: userName,
                type: "Goal Date Extension",
                goalId: req.goalId,
                goalTitle: req.goalTitle,
                currentDueDate: req.currentDueDate,
                extendedDate: req.extendedDate || req.date,
                date: req.extendedDate || req.date,
                startDate: req.currentDueDate || req.startDate,
                endDate: req.extendedDate || req.endDate,
                reason: req.reason,
                status: "Pending"
            };
            try {
                const created = await API.createRequest(payload);
                const mapped = { ...created, id: created._id || created.id };
                setRequests((prev) => [mapped, ...prev]);
            } catch (err) {
                console.error("Backend goal extension request error:", err.message);
                alert(err.message || "Failed to submit goal extension request");
            }
            return;
        }

        const payload = {
            startDate: req.startDate || req.date,
            endDate: req.endDate || req.date,
            reason: req.reason,
        };
        try {
            const created = await API.createLeave(payload);
            const mapped = {
                ...created,
                id: created._id || created.id,
                type: req.type || "Time-off / Leave",
                date: `${created.startDate} to ${created.endDate}`,
                startDate: created.startDate,
                endDate: created.endDate,
            };
            setRequests((prev) => [mapped, ...prev]);
        } catch (err) {
            console.warn("Backend leave error, fallback:", err.message);
            try {
                const legacyPayload = {
                    intern: userName,
                    type: req.type || "Time-off / Leave",
                    reason: req.reason,
                    status: "Pending",
                    date: req.date || req.targetDate || new Date().toISOString().split("T")[0]
                };
                const created = await API.createRequest(legacyPayload);
                const mapped = { ...created, id: created._id || created.id };
                setRequests((prev) => [mapped, ...prev]);
            } catch {
                alert(err.message || "Failed to submit request");
            }
        }
    };

    // Interns cannot update goal progress — it is auto-calculated server-side from approved tasks.

    const pendingRequestsCount = myRequests.filter((r) => r.status === "Pending").length;

    const navItems = [
        { id: "dashboard", label: "My Portal", icon: "ph-gauge" },
        { id: "tasks", label: "Log Tasks", icon: "ph-check-square" },
        { id: "evaluations", label: "My Scorecard", icon: "ph-star" },
        { id: "notices", label: "Notices", icon: "ph-megaphone-simple" },
        { id: "goals", label: "Goals", icon: "ph-flag" },
        { id: "requests", label: "Requests", icon: "ph-file-text", badge: pendingRequestsCount },
    ];

    const internStats = [
        { label: "Program Status", value: meObj.status || "Active", trend: (meObj.status === "Active" ? "In Program" : "Status"), icon: "ph-identification-badge" },
        { label: "Approved Tasks", value: myTasks.filter((t) => t.status === "Approved").length, trend: "Validated by Mentor", icon: "ph-checks" },
        { label: "Logged Tasks", value: myTasks.length, trend: `${myTasks.filter((t) => t.status === "Approved").length} approved`, icon: "ph-check-square" },
        { label: "Evaluation Score", value: `${meObj.score} / 10`, trend: "Latest rating", icon: "ph-star" },
    ];

    const myInternshipInfo = meObj?.internshipInfo || internshipInfo(meObj);

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
                    internshipInfo={myInternshipInfo}
                    notices={notices}
                    onViewAllNotices={() => setActiveTab("notices")}
                    tasks={myTasks}
                    goals={myGoals}
                    interns={interns}
                    user={user}
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
                    role="intern"
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
                    subtitle="Assigned objectives and milestone tasks"
                    goals={myGoals}
                    tasks={myTasks}
                    requests={myRequests}
                    showInternColumn={false}
                    role="intern"
                    canCreate={false}
                    onRequestExtension={() => setActiveTab("requests")}
                />
            )}

            {activeTab === "requests" && (
                <RequestsView
                    title="Requests & Applications"
                    subtitle="Submit leave applications, Work From Home (WFH), or goal deadline extensions"
                    requests={myRequests}
                    goals={myGoals}
                    canReview={false}
                    canSubmit={true}
                    onSubmitRequest={requestLeave}
                    showInternColumn={false}
                />
            )}
        </PortalLayout>
    );
}
