// Frontend API Service Layer connecting to Express & MongoDB Backend

const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const rawUrl = (import.meta.env.VITE_API_URL || (isLocal ? "http://localhost:5000/api" : "/api")).trim().replace(/\/+$/, "");
const BASE_URL = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;

class ApiService {
    getToken() {
        return localStorage.getItem("ims_token") || "";
    }

    setToken(token) {
        if (token) {
            localStorage.setItem("ims_token", token);
        } else {
            localStorage.removeItem("ims_token");
        }
    }

    clearToken() {
        localStorage.removeItem("ims_token");
    }

    async request(endpoint, options = {}) {
        const token = this.getToken();
        const headers = {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const config = {
            ...options,
            headers,
            credentials: "include",
        };

        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            let errMsg = `Request failed with status ${response.status}`;
            try {
                const errJson = await response.json();
                errMsg = errJson.message || errJson.error || errMsg;
            } catch {
                // response wasn't json
            }
            if (response.status === 401 && !endpoint.includes("/auth/login")) {
                this.clearToken();
                try {
                    localStorage.removeItem("ims_user");
                } catch {
                    // ignore
                }
                if (typeof window !== "undefined" && window.location.pathname !== "/login" && window.location.pathname !== "/") {
                    window.location.href = "/login";
                }
            }
            throw new Error(errMsg);
        }

        // Return empty object on 204 or empty responses
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        }
        return await response.text();
    }

    // --- Authentication ---
    async login(email, password) {
        const data = await this.request("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        if (data.token) {
            this.setToken(data.token);
        }
        return data;
    }

    async logout() {
        try {
            await this.request("/auth/logout", { method: "POST" });
        } finally {
            this.clearToken();
        }
    }

    // Admin only staff registration (mentors and other admins)
    async registerStaff(staffData) {
        return await this.request("/auth/register-staff", {
            method: "POST",
            body: JSON.stringify(staffData),
        });
    }

    // --- Interns ---
    async getInterns() {
        return await this.request("/interns");
    }

    async createIntern(internData) {
        return await this.request("/interns", {
            method: "POST",
            body: JSON.stringify(internData),
        });
    }

    async updateIntern(id, internData) {
        return await this.request(`/interns/${id}`, {
            method: "PUT",
            body: JSON.stringify(internData),
        });
    }

    async updateInternDates(id, { startDate, endDate }) {
        return await this.request(`/interns/${id}/dates`, {
            method: "PATCH",
            body: JSON.stringify({ startDate, endDate }),
        });
    }

    async deleteIntern(id) {
        return await this.request(`/interns/${id}`, {
            method: "DELETE",
        });
    }

    async updateInternStatus(id, status) {
        return await this.request(`/interns/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
        });
    }

    // --- Leaves ---
    async getLeaves() {
        return await this.request("/leaves");
    }

    async createLeave(leaveData) {
        return await this.request("/leaves", {
            method: "POST",
            body: JSON.stringify(leaveData),
        });
    }

    async approveLeave(id) {
        return await this.request(`/leaves/${id}/approve`, {
            method: "PATCH",
        });
    }

    async denyLeave(id) {
        return await this.request(`/leaves/${id}/deny`, {
            method: "PATCH",
        });
    }

    // --- Mentors ---
    async getMentors() {
        return await this.request("/mentors");
    }

    async createMentor(mentorData) {
        return await this.request("/mentors", {
            method: "POST",
            body: JSON.stringify(mentorData),
        });
    }

    async deleteMentor(id) {
        return await this.request(`/mentors/${id}`, {
            method: "DELETE",
        });
    }

    // --- Tasks ---
    async getTasks() {
        return await this.request("/tasks");
    }

    // Note: intern field is derived server-side from JWT — only send title, hours, date, goal
    async createTask(taskData) {
        return await this.request("/tasks", {
            method: "POST",
            body: JSON.stringify(taskData),
        });
    }

    async updateTaskStatus(id, status) {
        if (status === "Approved") return this.approveTask(id);
        if (status === "Rejected") return this.rejectTask(id);
        return await this.request(`/tasks/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
        });
    }

    async approveTask(id) {
        return await this.request(`/tasks/${id}/approve`, {
            method: "PATCH",
        });
    }

    async rejectTask(id, reason = "") {
        return await this.request(`/tasks/${id}/reject`, {
            method: "PATCH",
            body: JSON.stringify({ reason, rejectionReason: reason }),
        });
    }

    // --- Departments ---
    async getDepartments() {
        return await this.request("/departments");
    }

    async createDepartment(deptData) {
        return await this.request("/departments", {
            method: "POST",
            body: JSON.stringify(deptData),
        });
    }

    // --- Goals ---
    async getGoals() {
        return await this.request("/goals");
    }

    async getMyGoals() {
        return await this.request("/goals/mine");
    }

    // Mentor only — intern field and setBy validated server-side
    async createGoal(goalData) {
        return await this.request("/goals", {
            method: "POST",
            body: JSON.stringify(goalData),
        });
    }

    // Mentor/Admin only — update goal status (progress is auto-calculated from approved tasks)
    async updateGoalStatus(id, status) {
        return await this.request(`/goals/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
        });
    }

    // Mentor/Admin — extend goal due date
    async extendGoalDueDate(id, due) {
        return await this.request(`/goals/${id}/due-date`, {
            method: "PATCH",
            body: JSON.stringify({ due }),
        });
    }

    // Get a goal's linked tasks (rollup view)
    async getGoalTasks(goalId) {
        return await this.request(`/goals/${goalId}/tasks`);
    }

    // --- Notices ---
    async getNotices() {
        return await this.request("/notices");
    }

    async createNotice(noticeData) {
        return await this.request("/notices", {
            method: "POST",
            body: JSON.stringify(noticeData),
        });
    }

    // --- Requests ---
    async getRequests() {
        return await this.request("/requests");
    }

    async createRequest(requestData) {
        return await this.request("/requests", {
            method: "POST",
            body: JSON.stringify(requestData),
        });
    }

    async updateRequestStatus(id, status) {
        return await this.request(`/requests/${id}/status`, {
            method: "PUT",
            body: JSON.stringify({ status }),
        });
    }

    // --- Notifications ---
    async getNotifications() {
        return await this.request("/notifications");
    }

    async markNotificationRead(id) {
        return await this.request(`/notifications/${id}/read`, {
            method: "PATCH",
        });
    }

    async markAllNotificationsRead() {
        return await this.request("/notifications/read-all", {
            method: "PATCH",
        });
    }

    async deleteNotification(id) {
        return await this.request(`/notifications/${id}`, {
            method: "DELETE",
        });
    }
}

export const API = new ApiService();
