import { useState, useEffect, lazy, Suspense } from "react";
import Homepage from "./Homepage";
import { AVATAR_COLORS, initialsFromName } from "./utils/helpers";
import {
    DEMO_USERS,
    SEED_INTERNS,
    SEED_DEPARTMENTS,
    SEED_TASKS,
    SEED_GOALS,
    SEED_NOTICES,
    SEED_REQUESTS,
    SEED_MENTORS_DATA
} from "./data/mockData";
import { API } from "./services/api";

// Code splitting / Lazy loading portal views for instant initial load
const AuthPage = lazy(() => import("./AuthPage"));
const AdminPortal = lazy(() => import("./AdminPortal"));
const MentorPortal = lazy(() => import("./MentorPortal"));
const InternPortal = lazy(() => import("./InternPortal"));

function LoadingFallback() {
    return (
        <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center text-light">
            <div className="spinner-border text-warning mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
                <span className="visually-hidden">Loading...</span>
            </div>
            <div className="font-display text-skywash fs-5">Loading IMS Workspace...</div>
        </div>
    );
}

export default function InternTrackerApp() {
    const [stage, setStage] = useState("home"); // 'home' | 'auth' | 'app'
    const [user, setUser] = useState(null);

    // Theme state persistence
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("ims_theme") || "dark";
    });

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("ims_theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    // Centralized Application State
    const [interns, setInterns] = useState(SEED_INTERNS);
    const [departments, setDepartments] = useState(SEED_DEPARTMENTS);
    const [tasks, setTasks] = useState(SEED_TASKS);
    const [goals, setGoals] = useState(SEED_GOALS);
    const [notices, setNotices] = useState(SEED_NOTICES);
    const [requests, setRequests] = useState(SEED_REQUESTS);
    const [mentorsData, setMentorsData] = useState(SEED_MENTORS_DATA);

    // Function to load fresh synchronized data from the backend
    const syncBackendData = async () => {
        try {
            const [
                internsRes,
                deptsRes,
                mentorsRes,
                tasksRes,
                goalsRes,
                noticesRes,
                reqsRes
            ] = await Promise.allSettled([
                API.getInterns(),
                API.getDepartments(),
                API.getMentors(),
                API.getTasks(),
                API.getGoals(),
                API.getNotices(),
                API.getRequests()
            ]);

            if (internsRes.status === "fulfilled" && Array.isArray(internsRes.value)) {
                setInterns(internsRes.value.map((d) => ({ ...d, id: d._id || d.id })));
            }
            if (deptsRes.status === "fulfilled" && Array.isArray(deptsRes.value) && deptsRes.value.length > 0) {
                setDepartments(deptsRes.value.map((d) => ({ ...d, id: d._id || d.id })));
            }
            if (mentorsRes.status === "fulfilled" && Array.isArray(mentorsRes.value)) {
                setMentorsData(mentorsRes.value.map((d) => ({ ...d, id: d._id || d.id })));
            }
            if (tasksRes.status === "fulfilled" && Array.isArray(tasksRes.value)) {
                setTasks(tasksRes.value.map((d) => ({ ...d, id: d._id || d.id })));
            }
            if (goalsRes.status === "fulfilled" && Array.isArray(goalsRes.value)) {
                setGoals(goalsRes.value.map((d) => ({ ...d, id: d._id || d.id })));
            }
            if (noticesRes.status === "fulfilled" && Array.isArray(noticesRes.value)) {
                setNotices(noticesRes.value.map((d) => ({ ...d, id: d._id || d.id })));
            }
            if (reqsRes.status === "fulfilled" && Array.isArray(reqsRes.value)) {
                setRequests(reqsRes.value.map((d) => ({ ...d, id: d._id || d.id })));
            }
        } catch (err) {
            console.log("Using cached/fallback data:", err.message);
        }
    };

    // Initial sync on mount
    useEffect(() => {
        syncBackendData();
    }, []);

    const handleLogin = (u) => {
        const demoDefaults = DEMO_USERS[u.role] || {};
        const fullUser = {
            ...demoDefaults,
            ...u,
            name: u.name || demoDefaults.name || "User",
            email: u.email || demoDefaults.email || `${u.role}@gmail.com`,
            role: u.role
        };

        setUser(fullUser);
        setStage("app");
        // Fresh backend sync with authenticated credentials
        syncBackendData();
    };

    const logout = async () => {
        try {
            await API.logout();
        } catch (err) {
            console.warn("Backend logout error:", err.message);
        }
        setUser(null);
        setStage("home");
    };

    if (stage === "home") {
        return <Homepage onGetStarted={() => setStage("auth")} theme={theme} toggleTheme={toggleTheme} />;
    }

    if (stage === "auth") {
        return (
            <Suspense fallback={<LoadingFallback />}>
                <AuthPage onLogin={handleLogin} onBack={() => setStage("home")} theme={theme} toggleTheme={toggleTheme} />
            </Suspense>
        );
    }

    // Role-based portal rendering
    const currentRole = user?.role || "admin";

    return (
        <Suspense fallback={<LoadingFallback />}>
            {currentRole === "admin" && (
                <AdminPortal
                    user={user}
                    interns={interns}
                    setInterns={setInterns}
                    departments={departments}
                    setDepartments={setDepartments}
                    tasks={tasks}
                    setTasks={setTasks}
                    goals={goals}
                    setGoals={setGoals}
                    notices={notices}
                    setNotices={setNotices}
                    requests={requests}
                    setRequests={setRequests}
                    mentorsData={mentorsData}
                    setMentorsData={setMentorsData}
                    onLogout={logout}
                    theme={theme}
                    toggleTheme={toggleTheme}
                />
            )}
            {currentRole === "mentor" && (
                <MentorPortal
                    user={user}
                    interns={interns}
                    setInterns={setInterns}
                    departments={departments}
                    tasks={tasks}
                    setTasks={setTasks}
                    goals={goals}
                    setGoals={setGoals}
                    notices={notices}
                    setNotices={setNotices}
                    requests={requests}
                    setRequests={setRequests}
                    onLogout={logout}
                    theme={theme}
                    toggleTheme={toggleTheme}
                />
            )}
            {currentRole === "intern" && (
                <InternPortal
                    user={user}
                    interns={interns}
                    tasks={tasks}
                    setTasks={setTasks}
                    goals={goals}
                    notices={notices}
                    requests={requests}
                    setRequests={setRequests}
                    onLogout={logout}
                    theme={theme}
                    toggleTheme={toggleTheme}
                />
            )}
        </Suspense>
    );
}