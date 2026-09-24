import { useState, useEffect } from "react";

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
        isMobile: w < 640,
        isTablet: w >= 640 && w < 1024,
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

