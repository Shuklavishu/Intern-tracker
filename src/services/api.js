// Frontend API Service Layer connecting to Express & MongoDB Backend

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

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

    async deleteIntern(id) {
        return await this.request(`/interns/${id}`, {
            method: "DELETE",
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
        // Backend accepts both PUT (legacy) and PATCH
        return await this.request(`/tasks/${id}/status`, {
            method: "PUT",
            body: JSON.stringify({ status }),
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

    // Mentor/Admin only — intern field and setBy validated server-side
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
}

export const API = new ApiService();
