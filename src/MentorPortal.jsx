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

    // Scoped data for this mentor — memoized to avoid recomputation on every render
    const myInterns = useMemo(() =>
        interns.filter((i) => (i.mentor || "").trim().toLowerCase() === (user?.name || "").trim().toLowerCase()),
        [interns, user?.name]
    );
    const myInternNames = useMemo(() =>
        myInterns.map((i) => (i.name || "").trim().toLowerCase()),
        [myInterns]
    );
    const myTasks = useMemo(() =>
        tasks.filter((t) => {
            const name = (t.internName || (typeof t.intern === "object" ? t.intern?.name : t.intern) || "").trim().toLowerCase();
            return myInternNames.includes(name);
        }),
        [tasks, myInternNames]
    );
    const myPendingTasks = useMemo(() => myTasks.filter((t) => t.status === "Pending"), [myTasks]);
    const myActiveGoals = useMemo(() =>
        goals.filter((g) => {
            const name = (g.internName || (typeof g.intern === "object" ? g.intern?.name : g.intern) || "").trim().toLowerCase();
            return myInternNames.includes(name);
        }),
        [goals, myInternNames]
    );
    const myRequests = useMemo(() =>
        requests.filter((r) => {
            const name = (r.intern || r.internName || "").trim().toLowerCase();
            return myInternNames.includes(name);
        }),
        [requests, myInternNames]
    );

    // Action handlers
    const approveTask = async (id) => {
        setTasks((prev) => prev.map((t) => ((t.id === id || t._id === id) ? { ...t, status: "Approved" } : t)));
        try {
            const res = await API.approveTask(id);
            if (res && res.goal) {
                const goalId = res.goal?._id || res.goal;
                const progress = res.goalProgress ?? res.goal?.progress;
                const status = res.goalStatus ?? res.goal?.status;
                if (setGoals && goalId) {
                    setGoals((prev) => prev.map((g) => (g.id === goalId || g._id === goalId) ? { ...g, progress, status } : g));
                }
            }
        } catch (err) {
            console.warn("Backend approve task error:", err.message);
        }
    };

    const rejectTask = async (id, reason = "") => {
        setTasks((prev) => prev.map((t) => ((t.id === id || t._id === id) ? { ...t, status: "Rejected", rejectionReason: reason } : t)));
        try {
            const res = await API.rejectTask(id, reason);
            if (res && res.goal) {
                const goalId = res.goal?._id || res.goal;
                const progress = res.goalProgress ?? res.goal?.progress;
                const status = res.goalStatus ?? res.goal?.status;
                if (setGoals && goalId) {
                    setGoals((prev) => prev.map((g) => (g.id === goalId || g._id === goalId) ? { ...g, progress, status } : g));
                }
            }
        } catch (err) {
            console.warn("Backend reject task error:", err.message);
        }
    };

    const updateInternStatus = async (id, status) => {
        const prevInterns = [...interns];
        setInterns((prev) => prev.map((i) => ((i.id === id || i._id === id) ? { ...i, status } : i)));
        try {
            await API.updateInternStatus(id, status);
        } catch (err) {
            alert(err.message || "Failed to update status");
            setInterns(prevInterns);
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

    const updateScore = async (id, evalData) => {
        let newScore = typeof evalData === "object" ? evalData.score : evalData;
        const competencies = typeof evalData === "object" ? evalData.competencies : undefined;
        const feedback = typeof evalData === "object" ? evalData.feedback : undefined;

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
                    return {
                        ...i,
                        score: rounded,
                        scoreHistory: history,
                        ...(competencies ? { competencies: { ...(i.competencies || {}), ...competencies } } : {}),
                        ...(feedback ? { feedback: { ...(i.feedback || {}), ...feedback } } : {})
                    };
                }
                return i;
            })
        );

        try {
            const payload = { score: rounded };
            if (competencies) payload.competencies = competencies;
            if (feedback) payload.feedback = feedback;
            await API.updateIntern(id, payload);
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
            const mapped = {
                ...created,
                id: created._id || created.id,
                internName: created.internName || created.intern?.name || (typeof created.intern === "string" ? created.intern : ""),
                intern: created.internName || created.intern?.name || (typeof created.intern === "string" ? created.intern : ""),
            };
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
        { id: "dashboard", label: "Mentor Workspace", icon: "ph-gauge" },
        { id: "interns", label: "My Assigned Interns", icon: "ph-users" },
        { id: "tasks", label: "Approve Tasks", icon: "ph-check-square", badge: myPendingTasks.length },
        { id: "evaluations", label: "Score & Evaluations", icon: "ph-star" },
        { id: "notices", label: "Notices & Broadcasts", icon: "ph-megaphone-simple" },
        { id: "goals", label: "Goals Directory", icon: "ph-flag" },
        { id: "requests", label: "Requests", icon: "ph-file-text" },
    ];

    const mentorStats = [
        { label: "My Interns", value: myInterns.length, trend: "Assigned Cohort", icon: "ph-users" },
        { label: "Pending Task Approvals", value: myPendingTasks.length, trend: "Action Needed", trendUp: false, icon: "ph-check-square" },
        { label: "Active Goals", value: myActiveGoals.length, trend: "Tracking", icon: "ph-flag" },
        { label: "Approved Tasks", value: myTasks.filter((t) => t.status === "Approved").length, trend: "Reviewed", icon: "ph-checks" },
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
                    tasks={myTasks}
                    goals={myActiveGoals}
                    interns={interns}
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
                    role="mentor"
                    onUpdateStatus={updateInternStatus}
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
                    role="mentor"
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
                    subtitle="Set, track, and extend milestone goals for your assigned interns"
                    goals={myActiveGoals}
                    tasks={tasks}
                    interns={myInterns}
                    requests={myRequests}
                    showInternColumn={true}
                    canCreate={true}
                    onCreateGoal={createGoal}
                    onUpdateStatus={updateGoalStatus}
                    onExtendDueDate={handleExtendGoalDueDate}
                    role="mentor"
                />
            )}

            {activeTab === "requests" && (
                <RequestsView
                    title="Intern Requests Desk"
                    subtitle="Review leave applications, Work From Home (WFH) requests, and goal deadline extensions"
                    requests={myRequests}
                    goals={myActiveGoals}
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
