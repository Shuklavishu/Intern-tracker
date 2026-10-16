/**
 * Calendar-aware internship duration and status calculation helper.
 * Uses COMPANY_TZ environment variable (default: Asia/Kolkata).
 * End dates are inclusive.
 */

export function getTodayString(tz = process.env.COMPANY_TZ || "Asia/Kolkata") {
    try {
        const formatter = new Intl.DateTimeFormat("en-CA", {
            timeZone: tz,
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });
        return formatter.format(new Date()); // Returns "YYYY-MM-DD"
    } catch {
        const fallback = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });
        return fallback.format(new Date());
    }
}

export function parseYMD(dateStr) {
    if (!dateStr || typeof dateStr !== "string") return null;
    const match = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    const [, y, m, d] = match.map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    if (
        date.getUTCFullYear() !== y ||
        date.getUTCMonth() !== m - 1 ||
        date.getUTCDate() !== d
    ) {
        return null;
    }
    return { year: y, month: m, day: d, utcMs: date.getTime(), dateObj: date };
}

/**
 * Add 1 day in UTC to represent inclusive end date boundary
 */
function addOneDayUTC(dateObj) {
    const next = new Date(dateObj.getTime());
    next.setUTCDate(next.getUTCDate() + 1);
    return next;
}

/**
 * Calendar-aware difference between d1 and d2 (d1 <= d2)
 * Returns { months, days }
 */
export function getCalendarDiff(d1, d2) {
    let y1 = d1.getUTCFullYear();
    let m1 = d1.getUTCMonth();
    let day1 = d1.getUTCDate();

    let y2 = d2.getUTCFullYear();
    let m2 = d2.getUTCMonth();
    let day2 = d2.getUTCDate();

    let months = (y2 - y1) * 12 + (m2 - m1);
    let days = day2 - day1;

    if (days < 0) {
        months -= 1;
        // Number of days in the month preceding d2
        const prevMonthDays = new Date(Date.UTC(y2, m2, 0)).getUTCDate();
        days += prevMonthDays;
    }

    return {
        months: Math.max(0, months),
        days: Math.max(0, days)
    };
}

/**
 * Human-friendly string for months and days (e.g. "3 months", "1 month 11 days", "15 days")
 */
export function formatCalendarDiff(months, days, suffix = "") {
    const parts = [];
    if (months > 0) {
        parts.push(`${months} month${months === 1 ? "" : "s"}`);
    }
    if (days > 0 || parts.length === 0) {
        parts.push(`${days} day${days === 1 ? "" : "s"}`);
    }
    const label = parts.join(" ");
    return suffix ? `${label} ${suffix}` : label;
}

/**
 * Shared helper to calculate internship info on read
 * @param {Object} intern - Intern object containing startDate and endDate (YYYY-MM-DD)
 * @param {string} [todayOverride] - Optional YYYY-MM-DD for testing
 * @returns {Object} { state, durationLabel, remainingLabel, daysRemaining, totalDays, progress, startDate, endDate }
 */
export function internshipInfo(intern, todayOverride = null) {
    const startStr = intern?.startDate || null;
    const endStr = intern?.endDate || null;

    if (!startStr || !endStr) {
        return {
            state: "Not set",
            durationLabel: "Not set",
            remainingLabel: "Not set",
            daysRemaining: 0,
            totalDays: 0,
            progress: 0,
            startDate: startStr,
            endDate: endStr
        };
    }

    const startParsed = parseYMD(startStr);
    const endParsed = parseYMD(endStr);

    if (!startParsed || !endParsed || endParsed.utcMs < startParsed.utcMs) {
        return {
            state: "Not set",
            durationLabel: "Invalid dates",
            remainingLabel: "Invalid dates",
            daysRemaining: 0,
            totalDays: 0,
            progress: 0,
            startDate: startStr,
            endDate: endStr
        };
    }

    const todayStr = todayOverride || getTodayString();
    const todayParsed = parseYMD(todayStr) || parseYMD(getTodayString());

    // Total days (inclusive: start date to end date)
    const msPerDay = 86400000;
    const totalDays = Math.round((endParsed.utcMs - startParsed.utcMs) / msPerDay) + 1;

    // Inclusive end boundary is 1 day after end date
    const inclusiveEndBoundary = addOneDayUTC(endParsed.dateObj);

    // Duration label: calendar-aware difference between start and end+1day
    const durationDiff = getCalendarDiff(startParsed.dateObj, inclusiveEndBoundary);
    const durationLabel = formatCalendarDiff(durationDiff.months, durationDiff.days);

    let state;
    let remainingLabel;
    let daysRemaining;
    let progress;

    if (todayParsed.utcMs < startParsed.utcMs) {
        state = "Not started";
        daysRemaining = totalDays;
        progress = 0;

        const untilStartDiff = getCalendarDiff(todayParsed.dateObj, startParsed.dateObj);
        const untilStartStr = formatCalendarDiff(untilStartDiff.months, untilStartDiff.days);
        remainingLabel = `Starts in ${untilStartStr}`;
    } else if (todayParsed.utcMs > endParsed.utcMs) {
        state = "Ended";
        daysRemaining = 0;
        progress = 100;
        remainingLabel = "Ended";
    } else {
        state = "Ongoing";
        // Days remaining includes today
        daysRemaining = Math.max(1, Math.round((endParsed.utcMs - todayParsed.utcMs) / msPerDay) + 1);

        const daysPassed = Math.round((todayParsed.utcMs - startParsed.utcMs) / msPerDay) + 1;
        progress = Math.min(100, Math.max(0, Math.round((daysPassed / totalDays) * 100)));

        const remainingDiff = getCalendarDiff(todayParsed.dateObj, inclusiveEndBoundary);
        remainingLabel = formatCalendarDiff(remainingDiff.months, remainingDiff.days, "left");
    }

    return {
        state,
        durationLabel,
        remainingLabel,
        daysRemaining,
        totalDays,
        progress,
        startDate: startStr,
        endDate: endStr
    };
}
