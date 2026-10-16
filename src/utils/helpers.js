import { useState, useEffect } from "react";
export { internshipInfo } from "./internshipInfo";

// Responsive viewport detection hook
export function useViewport() {
    const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

    useEffect(() => {
        const onResize = () => setW(window.innerWidth);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    return {
        width: w,
        isMobile: w < 768,
        isTablet: w >= 768 && w < 1024,
    };
}

// Avatar color palettes
export const AVATAR_COLORS = [
    { bg: "rgba(224, 86, 38, 0.25)", fg: "#d8ecf8" },
    { bg: "rgba(2, 125, 234, 0.25)", fg: "#b6d9fc" },
    { bg: "rgba(38, 150, 132, 0.25)", fg: "#c7d3ea" },
];

// Extract up to 2 uppercase initials from a full name string
export const initialsFromName = (name = "") => {
    if (!name) return "U";
    return name
        .trim()
        .split(/\s+/)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
};

// Map a 0-10 numeric score to a letter grade
export const grade = (score) => {
    if (score >= 9) return "A";
    if (score >= 8) return "A-";
    if (score >= 7) return "B";
    if (score >= 6) return "C";
    return "D";
};

// Calculate aggregated cohort trajectory from intern records
export const calculateCohortDataPoints = (interns = []) => {
    if (!Array.isArray(interns) || interns.length === 0) return null;

    const labelSet = new Set();
    interns.forEach((i) => {
        (i.scoreHistory || []).forEach((pt) => {
            if (pt.label) labelSet.add(pt.label);
        });
    });

    if (labelSet.size === 0) {
        const avgScore = Number((interns.reduce((acc, i) => acc + (Number(i.score) || 0), 0) / interns.length).toFixed(1));
        return [{ label: "Current", score: avgScore, benchmark: 7.5, tasks: 20 }];
    }

    return Array.from(labelSet).map((lbl) => {
        const matching = [];
        interns.forEach((i) => {
            const pt = (i.scoreHistory || []).find((h) => h.label === lbl);
            if (pt) matching.push(pt);
            else if (i.score !== undefined) matching.push({ score: i.score, benchmark: 7.5, tasks: 15 });
        });

        const count = matching.length || 1;
        const avgScore = Number((matching.reduce((acc, m) => acc + (Number(m.score) || 0), 0) / count).toFixed(1));
        const avgBenchmark = Number((matching.reduce((acc, m) => acc + (Number(m.benchmark) || 7.5), 0) / count).toFixed(1));
        const totalTasks = matching.reduce((acc, m) => acc + (Number(m.tasks) || 0), 0);

        return {
            label: lbl,
            score: avgScore,
            benchmark: avgBenchmark,
            tasks: totalTasks
        };
    });
};

// Email format regular expression and validation helper
export const EMAIL_REGEX = /^[^\s@]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*(?<!\.(?:com|org|net|edu|gov))\.(?!comcom|netnet|orgorg|educom)(?:com|org|net|edu|gov|in|io|co|me|[A-Za-z]{2,6})$/i;
export const isValidEmail = (email) => EMAIL_REGEX.test(String(email || "").trim());

// Person name format regular expression (letters, spaces, dots, hyphens, apostrophes; 2-50 chars)
export const NAME_REGEX = /^[a-zA-Z\s.'-]{2,50}$/;
export const isValidName = (name) => NAME_REGEX.test(String(name || "").trim());

// Competency evaluation parameters matching performance matrix
export const DEFAULT_COMPETENCIES = [
    { key: "qualityOfWork", name: "Quality of Work", defaultScore: 8.5, target: 8.5, color: "#e05626" },
    { key: "technicalExecution", name: "Technical Execution", defaultScore: 8.0, target: 8.0, color: "#06b6d4" },
    { key: "communication", name: "Communication & Sync", defaultScore: 7.5, target: 7.5, color: "#8b5cf6" },
    { key: "initiative", name: "Initiative & Problem Solving", defaultScore: 8.2, target: 8.2, color: "#10b981" },
    { key: "teamwork", name: "Teamwork & Collaboration", defaultScore: 8.0, target: 8.0, color: "#f59e0b" }
];

export const formatCompetenciesList = (competencies = {}, baseScore = 8.5) => {
    return DEFAULT_COMPETENCIES.map((comp) => {
        let score = comp.defaultScore;
        if (competencies && typeof competencies[comp.key] === "number") {
            score = competencies[comp.key];
        } else if (typeof baseScore === "number") {
            score = Math.max(1, Math.min(10, baseScore));
        }
        return {
            key: comp.key,
            name: comp.name,
            score: Number(Number(score).toFixed(1)),
            target: comp.target,
            color: comp.color
        };
    });
};

