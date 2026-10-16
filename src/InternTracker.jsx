import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Homepage from "./Homepage";
import {
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
        <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: "var(--bg-canvas)", color: "var(--text-primary)" }}>
            <div className="spinner-border mb-3" role="status" style={{ width: "2.5rem", height: "2.5rem", color: "var(--accent)" }}>
                <span className="visually-hidden">Loading...</span>
            </div>
            <div className="font-display fs-6" style={{ color: "var(--text-primary)" }}>Loading IMS Workspace...</div>
        </div>
    );
}

export default function InternTrackerApp() {
    const navigate = useNavigate();

    // Persist authenticated user across browser reloads only if valid token exists
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem("ims_user");
            const token = localStorage.getItem("ims_token");
            if (!saved || !token) return null;
            return JSON.parse(saved);
        } catch {
            return null;
        }
    });

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
    const syncBackendData = useCallback(async () => {
        try {
            const [
                internsRes,
                deptsRes,
                mentorsRes,
                tasksRes,
                goalsRes,
                noticesRes,
                reqsRes,
                leavesRes
            ] = await Promise.allSettled([
                API.getInterns(),
                API.getDepartments(),
                API.getMentors(),
                API.getTasks(),
                API.getGoals(),
                API.getNotices(),
                API.getRequests(),
                API.getLeaves()
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
                setTasks(tasksRes.value.map((d) => {
                    const resolvedName = d.internName || (typeof d.intern === "object" ? d.intern?.name : d.intern) || "";
                    return {
                        ...d,
                        id: d._id || d.id,
                        internName: resolvedName,
                        intern: resolvedName,
                    };
                }));
            }
            if (goalsRes.status === "fulfilled" && Array.isArray(goalsRes.value)) {
                setGoals(goalsRes.value.map((d) => ({
                    ...d,
                    id: d._id || d.id,
                    internName: d.internName || d.intern?.name || (typeof d.intern === "string" ? d.intern : ""),
                    intern: d.internName || d.intern?.name || (typeof d.intern === "string" ? d.intern : ""),
                })));
            }
            if (noticesRes.status === "fulfilled" && Array.isArray(noticesRes.value)) {
                setNotices(noticesRes.value.map((d) => ({ ...d, id: d._id || d.id })));
            }
            const loadedLeaves = leavesRes.status === "fulfilled" && Array.isArray(leavesRes.value) ? leavesRes.value.map((l) => ({
                ...l,
                id: l._id || l.id,
                type: "Leave",
                date: `${l.startDate} to ${l.endDate}`,
                intern: l.internName || (typeof l.intern === "object" ? l.intern?.name : l.intern) || "Intern",
                internName: l.internName || (typeof l.intern === "object" ? l.intern?.name : l.intern) || "Intern"
            })) : [];
            const loadedReqs = reqsRes.status === "fulfilled" && Array.isArray(reqsRes.value) ? reqsRes.value.map((d) => ({ ...d, id: d._id || d.id })) : [];
            if (loadedLeaves.length > 0 || loadedReqs.length > 0) {
                const combined = [...loadedLeaves];
                for (const r of loadedReqs) {
                    if (!combined.some((c) => String(c.id || c._id) === String(r.id || r._id))) {
                        combined.push(r);
                    }
                }
                setRequests(combined);
            }
        } catch (err) {
            console.log("Using cached/fallback data:", err.message);
        }
    }, []);

    // Initial sync on mount
    useEffect(() => {
        let isMounted = true;
        const initData = async () => {
            if (isMounted) {
                await syncBackendData();
            }
        };
        initData();
        return () => {
            isMounted = false;
        };
    }, [syncBackendData]);

    const getPortalPathForRole = (role) => {
        if (role === "admin") return "/admin";
        if (role === "mentor") return "/mentor";
        return "/intern";
    };

    const handleLogin = (u) => {
        const fullUser = {
            ...u,
            name: u.name || "User",
            email: u.email || "",
            role: u.role
        };

        if (u.token) {
            API.setToken(u.token);
        }

        setUser(fullUser);
        localStorage.setItem("ims_user", JSON.stringify(fullUser));

        // Navigate to the role-specific portal
        navigate(getPortalPathForRole(fullUser.role), { replace: true });

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

        localStorage.removeItem("ims_user");
        localStorage.removeItem("ims_token");
        navigate("/", { replace: true });
    };

    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                {/* Public Homepage */}
                <Route
                    path="/"
                    element={
                        user ? (
                            <Navigate to={getPortalPathForRole(user.role)} replace />
                        ) : (
                            <Homepage
                                onGetStarted={() => navigate("/login")}
                                theme={theme}
                                toggleTheme={toggleTheme}
                            />
                        )
                    }
                />

                {/* Login Page */}
                <Route
                    path="/login"
                    element={
                        user ? (
                            <Navigate to={getPortalPathForRole(user.role)} replace />
                        ) : (
                            <AuthPage
                                onLogin={handleLogin}
                                onBack={() => navigate("/")}
                                theme={theme}
                                toggleTheme={toggleTheme}
                            />
                        )
                    }
                />

                {/* Admin Portal (Protected) */}
                <Route
                    path="/admin/*"
                    element={
                        !user ? (
                            <Navigate to="/login" replace />
                        ) : user.role !== "admin" ? (
                            <Navigate to={getPortalPathForRole(user.role)} replace />
                        ) : (
                            <AdminPortal
                                user={user}
                                interns={interns}
                                setInterns={setInterns}
                                departments={departments}
                                tasks={tasks}
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
                        )
                    }
                />

                {/* Mentor Portal (Protected) */}
                <Route
                    path="/mentor/*"
                    element={
                        !user ? (
                            <Navigate to="/login" replace />
                        ) : user.role !== "mentor" ? (
                            <Navigate to={getPortalPathForRole(user.role)} replace />
                        ) : (
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
                        )
                    }
                />

                {/* Intern Portal (Protected) */}
                <Route
                    path="/intern/*"
                    element={
                        !user ? (
                            <Navigate to="/login" replace />
                        ) : user.role !== "intern" ? (
                            <Navigate to={getPortalPathForRole(user.role)} replace />
                        ) : (
                            <InternPortal
                                user={user}
                                interns={interns}
                                tasks={tasks}
                                setTasks={setTasks}
                                goals={goals}
                                setGoals={setGoals}
                                notices={notices}
                                requests={requests}
                                setRequests={setRequests}
                                onLogout={logout}
                                theme={theme}
                                toggleTheme={toggleTheme}
                            />
                        )
                    }
                />

                {/* Fallback wildcard route */}
                <Route
                    path="*"
                    element={<Navigate to={user ? getPortalPathForRole(user.role) : "/"} replace />}
                />
            </Routes>
        </Suspense>
    );
}