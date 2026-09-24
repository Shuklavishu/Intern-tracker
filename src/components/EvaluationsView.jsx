import { Avatar, GradeChip, Card } from "../Theme";
import { initialsFromName, calculateCohortDataPoints } from "../utils/helpers";
import {
    InteractivePerformanceChart,
    CompetencyBreakdownChart
} from "../Charts";

const CRITERIA = ["Quality of work", "Communication", "Initiative", "Teamwork"];

export default function EvaluationsView({
    title = "Scorecards & Evaluations",
    subtitle = "Performance reviews and competency metrics",
    mode = "team", // "personal" | "team"
    interns = [],
    currentUser,
    personalIntern,
    canEditScore = false,
    onUpdateScore
}) {
    if (mode === "personal") {
        const me = personalIntern || { name: currentUser?.name || "Intern", score: 8.5, dept: "Engineering", mentor: "Rohan Verma" };
        return (
            <div>
                <div className="mb-4">
                    <h2 className="font-display text-skywash m-0">{title}</h2>
                    <div className="text-fog small">{subtitle || `Official evaluation breakdown from your mentor (${me.mentor})`}</div>
                </div>

                <div className="row g-4 mb-4">
                    <div className="col-12 col-lg-5">
                        <Card className="p-4 h-100">
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <div className="d-flex align-items-center gap-3">
                                    <Avatar initials={initialsFromName(currentUser?.name || me.name)} size={48} />
                                    <div>
                                        <div className="font-display text-frost fw-bold fs-4">{currentUser?.name || me.name}</div>
                                        <div className="text-fog small">Dept: {me.dept} &middot; Mentor: {me.mentor}</div>
                                    </div>
                                </div>
                                <GradeChip score={me.score} />
                            </div>

                            <div className="border-top border-secondary border-opacity-10 pt-3">
                                <div className="text-fog extra-small font-eyebrow mb-3">CRITERIA SCORE BREAKDOWN</div>
                                {CRITERIA.map((c, idx) => {
                                    const subVal = Math.max(4, Math.min(10, (me.score || 8.5) + (idx % 2 === 0 ? 0.3 : -0.4)));
                                    return (
                                        <div key={c} className="d-flex align-items-center justify-content-between py-2 border-bottom border-secondary border-opacity-10">
                                            <span className="text-moon fw-medium">{c}</span>
                                            <span className="text-frost fw-bold fs-6">{subVal.toFixed(1)} / 10</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>

                    <div className="col-12 col-lg-7">
                        <CompetencyBreakdownChart title="Competency Distribution" />
                    </div>
                </div>

                <InteractivePerformanceChart
                    title="Evaluation & Trajectory Over Time"
                    subtitle={`Tracking progress for ${currentUser?.name || me.name}`}
                    dataPoints={me.scoreHistory || null}
                />
            </div>
        );
    }

    // mode === "team" (Mentor / Admin)
    return (
        <div>
            <div className="mb-4">
                <h2 className="font-display text-skywash m-0">{title}</h2>
                <div className="text-fog small">{subtitle}</div>
            </div>

            <div className="row g-4 mb-5">
                {interns.map((i) => (
                    <div key={i.id} className="col-12 col-md-6 col-xl-4">
                        <Card className="h-100 p-4 d-flex flex-column justify-content-between">
                            <div>
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <Avatar initials={i.avatar} bg={i.avatarBg} fg={i.avatarFg} size={42} />
                                        <div>
                                            <div className="font-display text-frost fw-bold fs-5">{i.name}</div>
                                            <div className="text-fog small">{i.dept} &middot; Mentor: {i.mentor}</div>
                                        </div>
                                    </div>
                                    <GradeChip score={i.score} />
                                </div>
                            </div>

                            {canEditScore && (
                                <div className="mt-3 pt-3 border-top border-secondary border-opacity-10">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <span className="text-moon small fw-medium">Update Score:</span>
                                        <span className="text-frost fw-bold">{i.score} / 10</span>
                                    </div>
                                    <input
                                        type="range"
                                        className="form-range"
                                        min="1"
                                        max="10"
                                        step="0.1"
                                        value={i.score}
                                        onChange={(e) => onUpdateScore && onUpdateScore(i.id, e.target.value)}
                                    />
                                </div>
                            )}
                        </Card>
                    </div>
                ))}
                {interns.length === 0 && (
                    <div className="col-12">
                        <Card className="p-4 text-center text-fog">No interns found for evaluation.</Card>
                    </div>
                )}
            </div>

            <InteractivePerformanceChart
                title="Cohort Performance Trends"
                subtitle="Aggregated evaluation trajectory across active interns"
                dataPoints={calculateCohortDataPoints(interns)}
            />
        </div>
    );
}
