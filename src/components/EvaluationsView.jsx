import { useState, useMemo } from "react";
import { Avatar, GradeChip, Card, EmptyState } from "../Theme";
import {
    initialsFromName,
    formatCompetenciesList
} from "../utils/helpers";
import {
    CompetencyBreakdownChart
} from "../Charts";

function PersonalEvaluationView({
    title = "Scorecards & Evaluations",
    subtitle = "Performance reviews and competency metrics",
    currentUser,
    personalIntern
}) {
    const me = personalIntern || {
        name: currentUser?.name || "Intern",
        score: 8.5,
        dept: "Engineering",
        mentor: "Rohan Verma",
        competencies: null
    };
    const criteriaList = formatCompetenciesList(me.competencies, me.score);

    return (
        <div className="text-start">
            <div className="mb-4 text-start">
                <h2 className="font-display h3 m-0" style={{ color: "var(--text-primary)" }}>{title}</h2>
                <div className="text-secondary small mt-1" style={{ maxWidth: "65ch" }}>
                    {subtitle || `Official evaluation breakdown from your mentor (${me.mentor})`}
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-12 col-lg-5">
                    <Card className="p-4 h-100 text-start">
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <div className="d-flex align-items-center gap-3">
                                <Avatar initials={initialsFromName(currentUser?.name || me.name)} size={44} />
                                <div>
                                    <div className="font-display fw-bold fs-5" style={{ color: "var(--text-primary)" }}>{currentUser?.name || me.name}</div>
                                    <div className="text-secondary small">Dept: {me.dept} &middot; Mentor: {me.mentor}</div>
                                </div>
                            </div>
                            <GradeChip score={me.score} />
                        </div>

                        <div className="border-top border-secondary border-opacity-15 pt-3">
                            <div className="text-secondary small font-monospace mb-3" style={{ fontSize: "11px" }}>CRITERIA SCORE BREAKDOWN</div>
                            {criteriaList.map((c) => (
                                <div key={c.name} className="d-flex align-items-center justify-content-between py-2 border-bottom border-secondary border-opacity-10">
                                    <span className="small fw-medium" style={{ color: "var(--text-primary)" }}>{c.name}</span>
                                    <span className="fw-bold small" style={{ color: "var(--text-primary)" }}>{c.score.toFixed(1)} / 10</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="col-12 col-lg-7">
                    <CompetencyBreakdownChart
                        title="Competency Distribution"
                        subtitle="Multi-attribute scoring matrix across key evaluation parameters"
                        criteriaList={criteriaList}
                        editable={false}
                    />
                </div>
            </div>

            {/* Qualitative Mentor Feedback Section */}
            <div className="row g-4">
                <div className="col-12">
                    <Card className="p-4 text-start">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom border-secondary border-opacity-15 pb-3">
                            <div className="d-flex align-items-center gap-2">
                                <i className="ph ph-chat-circle-text fs-5 text-primary"></i>
                                <div>
                                    <h5 className="font-display m-0 fs-6" style={{ color: "var(--text-primary)" }}>Mentor Qualitative Assessment</h5>
                                    <div className="text-secondary small">Strengths, areas for improvement, and progression appraisal</div>
                                </div>
                            </div>
                            {me.feedback?.recommendation && (
                                <span className="badge px-3 py-1.5" style={{ background: "var(--accent-subtle)", color: "var(--accent)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius)" }}>
                                    <i className="ph ph-star me-1"></i>
                                    {me.feedback.recommendation}
                                </span>
                            )}
                        </div>

                        {me.feedback && (me.feedback.strengths || me.feedback.improvements || me.feedback.mentorNotes) ? (
                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <div className="p-3 h-100" style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "var(--radius)" }}>
                                        <div className="d-flex align-items-center gap-1.5 mb-2 text-success fw-semibold small">
                                            <i className="ph ph-thumbs-up"></i>
                                            <span>Key Strengths & Achievements</span>
                                        </div>
                                        <p className="small mb-0 lh-base" style={{ color: "var(--text-primary)", whiteSpace: "pre-line", maxWidth: "60ch" }}>
                                            {me.feedback.strengths || "Consistently delivering quality work on assignments."}
                                        </p>
                                    </div>
                                </div>

                                <div className="col-12 col-md-6">
                                    <div className="p-3 h-100" style={{ background: "rgba(217, 119, 6, 0.08)", border: "1px solid rgba(217, 119, 6, 0.2)", borderRadius: "var(--radius)" }}>
                                        <div className="d-flex align-items-center gap-1.5 mb-2" style={{ color: "#d97706" }}>
                                            <i className="ph ph-trend-up"></i>
                                            <span className="fw-semibold small">Areas for Improvement & Growth</span>
                                        </div>
                                        <p className="small mb-0 lh-base" style={{ color: "var(--text-primary)", whiteSpace: "pre-line", maxWidth: "60ch" }}>
                                            {me.feedback.improvements || "Continue refining technical edge-case handling and proactive communication."}
                                        </p>
                                    </div>
                                </div>

                                {me.feedback.mentorNotes && (
                                    <div className="col-12">
                                        <div className="p-3" style={{ background: "var(--bg-surface-elevated)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)" }}>
                                            <div className="text-secondary small font-monospace mb-1" style={{ fontSize: "11px" }}>MENTOR GUIDANCE & ADVICE</div>
                                            <div className="small lh-base fst-italic" style={{ color: "var(--text-primary)", maxWidth: "60ch" }}>"{me.feedback.mentorNotes}"</div>
                                        </div>
                                    </div>
                                )}

                                <div className="col-12 text-end text-secondary small" style={{ fontSize: "11px" }}>
                                    Evaluated by <strong style={{ color: "var(--text-primary)" }}>{me.feedback.updatedBy || me.mentor}</strong>
                                    {me.feedback.updatedAt && ` on ${new Date(me.feedback.updatedAt).toLocaleDateString()}`}
                                </div>
                            </div>
                        ) : (
                            <EmptyState
                                icon="ph-clipboard-text"
                                title="No qualitative feedback recorded yet"
                                description="Your mentor will document key strengths, improvement points, and recommendations here."
                            />
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}

function ActiveInternEvaluationEditor({ activeIntern, canEditScore, onUpdateScore }) {
    const [criteriaList, setCriteriaList] = useState(() =>
        formatCompetenciesList(activeIntern.competencies, activeIntern.score)
    );
    const [feedbackDraft, setFeedbackDraft] = useState({
        strengths: activeIntern.feedback?.strengths || "",
        improvements: activeIntern.feedback?.improvements || "",
        recommendation: activeIntern.feedback?.recommendation || "Strongly Recommend for PPO / Full-time",
        mentorNotes: activeIntern.feedback?.mentorNotes || ""
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleCriteriaChange = (key, val) => {
        const rounded = Math.min(10, Math.max(1, Number(Number(val).toFixed(1))));
        setCriteriaList((prev) =>
            prev.map((c) => (c.key === key || c.name === key ? { ...c, score: rounded } : c))
        );
        setSaved(false);
    };

    const handlePreset = (presetScore) => {
        setCriteriaList((prev) => prev.map((c) => ({ ...c, score: presetScore })));
        setSaved(false);
    };

    const overallCalculatedScore = useMemo(() => {
        if (!criteriaList.length) return 8.0;
        const sum = criteriaList.reduce((acc, c) => acc + (Number(c.score) || 0), 0);
        return Number((sum / criteriaList.length).toFixed(1));
    }, [criteriaList]);

    const handleSaveEvaluation = async () => {
        if (!activeIntern) return;
        setSaving(true);
        const compMap = {};
        criteriaList.forEach((c) => {
            compMap[c.key] = c.score;
        });

        try {
            if (onUpdateScore) {
                await onUpdateScore(activeIntern.id || activeIntern._id, {
                    score: overallCalculatedScore,
                    competencies: compMap,
                    feedback: feedbackDraft
                });
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("Failed to save evaluation:", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Card className="p-3 mb-3 d-flex flex-wrap align-items-center justify-content-between gap-3 text-start">
                <div className="d-flex align-items-center gap-3">
                    <Avatar initials={activeIntern.avatar} bg={activeIntern.avatarBg} fg={activeIntern.avatarFg} size={44} />
                    <div>
                        <div className="d-flex align-items-center gap-2">
                            <h4 className="font-display fs-5 m-0" style={{ color: "var(--text-primary)" }}>{activeIntern.name}</h4>
                            <GradeChip score={overallCalculatedScore} />
                        </div>
                        <div className="text-secondary small mt-0.5">
                            Department: <span style={{ color: "var(--text-primary)" }}>{activeIntern.dept}</span> &middot; Mentor: <span style={{ color: "var(--text-primary)" }}>{activeIntern.mentor}</span>
                        </div>
                    </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <div className="text-end">
                        <div className="text-secondary small font-monospace" style={{ fontSize: "11px" }}>OVERALL RATING</div>
                        <div className="font-display fw-bold fs-5" style={{ color: "var(--text-primary)" }}>
                            {overallCalculatedScore.toFixed(1)} <span className="text-secondary small fw-normal">/ 10</span>
                        </div>
                    </div>
                </div>
            </Card>

            <CompetencyBreakdownChart
                title="Competency Distribution"
                subtitle="Multi-attribute scoring matrix across key evaluation parameters"
                criteriaList={criteriaList}
                editable={canEditScore}
                onCriteriaChange={handleCriteriaChange}
                onPreset={handlePreset}
                onSave={handleSaveEvaluation}
                saving={saving}
                saved={saved}
                overallScore={overallCalculatedScore}
            />

            <Card className="p-4 mt-4 text-start">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 border-bottom border-secondary border-opacity-15 pb-3">
                    <div className="d-flex align-items-center gap-2">
                        <i className="ph ph-pencil-simple text-primary fs-5"></i>
                        <div>
                            <h5 className="font-display m-0 fs-6" style={{ color: "var(--text-primary)" }}>Qualitative Appraisal & Growth Notes</h5>
                            <div className="text-secondary small">Strengths, areas of improvement, and career recommendation</div>
                        </div>
                    </div>

                    {canEditScore && (
                        <button
                            type="button"
                            className="btn btn-sm btn-secondary-flat d-flex align-items-center gap-1.5"
                            onClick={handleSaveEvaluation}
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status"></span>
                                    <span>Saving...</span>
                                </>
                            ) : saved ? (
                                <>
                                    <i className="ph ph-check-circle text-success"></i>
                                    <span className="text-success">Saved!</span>
                                </>
                            ) : (
                                <>
                                    <i className="ph ph-cloud-arrow-up text-primary"></i>
                                    <span>Save All Feedback</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                <div className="row g-3">
                    <div className="col-12">
                        <label className="form-label text-secondary small fw-medium mb-1">
                            Career & PPO Recommendation
                        </label>
                        <select
                            className="form-select glass-input py-2 px-3 small"
                            disabled={!canEditScore}
                            value={feedbackDraft.recommendation}
                            onChange={(e) => setFeedbackDraft({ ...feedbackDraft, recommendation: e.target.value })}
                        >
                            <option value="Strongly Recommend for PPO / Full-time">Strongly Recommend for PPO / Full-time</option>
                            <option value="Recommend for Extended Internship">Recommend for Extended Internship & Mentorship</option>
                            <option value="On Track - Under Evaluation">On Track - Continue Regular Evaluation</option>
                            <option value="Needs Significant Improvement">Needs Significant Improvement</option>
                        </select>
                    </div>

                    <div className="col-12 col-md-6">
                        <label className="form-label text-success small fw-medium mb-1 d-flex align-items-center gap-1">
                            <i className="ph ph-thumbs-up"></i> Key Strengths & Technical Highlights
                        </label>
                        <textarea
                            className="form-control glass-input py-2 px-3 small"
                            rows="3"
                            disabled={!canEditScore}
                            placeholder={canEditScore ? "e.g. Quick learner, wrote clean modular components, demonstrated high initiative and ownership..." : "No specific strengths recorded yet."}
                            value={feedbackDraft.strengths}
                            onChange={(e) => setFeedbackDraft({ ...feedbackDraft, strengths: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="col-12 col-md-6">
                        <label className="form-label small fw-medium mb-1 d-flex align-items-center gap-1" style={{ color: "#d97706" }}>
                            <i className="ph ph-trend-up"></i> Areas for Improvement & Growth Objectives
                        </label>
                        <textarea
                            className="form-control glass-input py-2 px-3 small"
                            rows="3"
                            disabled={!canEditScore}
                            placeholder={canEditScore ? "e.g. Needs to write more unit tests, improve sprint communication frequency..." : "No specific improvement areas recorded yet."}
                            value={feedbackDraft.improvements}
                            onChange={(e) => setFeedbackDraft({ ...feedbackDraft, improvements: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="col-12">
                        <label className="form-label text-secondary small fw-medium mb-1 d-flex align-items-center gap-1">
                            <i className="ph ph-chat-teardrop-dots"></i> Mentor Guidance & Advice for Intern
                        </label>
                        <textarea
                            className="form-control glass-input py-2 px-3 small"
                            rows="2"
                            disabled={!canEditScore}
                            placeholder={canEditScore ? "Any personal advice, encouraging notes, or next-step targets for the intern..." : "No additional mentor notes recorded yet."}
                            value={feedbackDraft.mentorNotes}
                            onChange={(e) => setFeedbackDraft({ ...feedbackDraft, mentorNotes: e.target.value })}
                        ></textarea>
                    </div>

                    {(activeIntern.feedback?.updatedBy || activeIntern.mentor) && (
                        <div className="col-12 text-end text-secondary small mt-1" style={{ fontSize: "11px" }}>
                            Evaluated by <strong style={{ color: "var(--text-primary)" }}>{activeIntern.feedback?.updatedBy || activeIntern.mentor}</strong>
                            {activeIntern.feedback?.updatedAt && ` on ${new Date(activeIntern.feedback.updatedAt).toLocaleDateString()}`}
                        </div>
                    )}
                </div>
            </Card>
        </>
    );
}

function TeamEvaluationView({
    title = "Scorecards & Evaluations",
    subtitle = "Performance reviews and competency metrics",
    interns = [],
    canEditScore = false,
    onUpdateScore
}) {
    const [selectedInternId, setSelectedInternId] = useState(interns[0]?.id || interns[0]?._id);
    const [searchQuery, setSearchQuery] = useState("");

    const activeIntern = useMemo(() => {
        if (!interns.length) return null;
        return interns.find((i) => (i.id || i._id) === selectedInternId) || interns[0];
    }, [interns, selectedInternId]);

    const filteredInterns = interns.filter((i) =>
        (i.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.dept || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="text-start">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                <div className="text-start">
                    <h2 className="font-display h3 m-0" style={{ color: "var(--text-primary)" }}>{title}</h2>
                    <div className="text-secondary small mt-1" style={{ maxWidth: "65ch" }}>
                        {subtitle || "Mark intern competency metrics and review performance"}
                    </div>
                </div>
            </div>

            {interns.length === 0 ? (
                <EmptyState
                    icon="ph-users"
                    title="No interns available"
                    description="No intern records found to evaluate."
                />
            ) : (
                <div className="row g-4 mb-4">
                    <div className="col-12 col-lg-4">
                        <Card className="p-3 h-100 d-flex flex-column text-start">
                            <div className="d-flex align-items-center justify-content-between mb-3 px-1">
                                <div className="text-secondary small font-monospace" style={{ fontSize: "11px" }}>
                                    SELECT INTERN ({interns.length})
                                </div>
                            </div>

                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control form-control-sm glass-input py-2 px-3 small"
                                    placeholder="Search by name or dept..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="overflow-auto pe-1 flex-grow-1" style={{ maxHeight: 440 }}>
                                <div className="d-flex flex-column gap-2">
                                    {filteredInterns.map((i) => {
                                        const isSelected = (i.id || i._id) === (activeIntern?.id || activeIntern?._id);
                                        return (
                                            <div
                                                key={i.id || i._id}
                                                onClick={() => setSelectedInternId(i.id || i._id)}
                                                className="p-3 cursor-pointer d-flex align-items-center justify-content-between"
                                                style={{
                                                    cursor: "pointer",
                                                    borderRadius: "var(--radius)",
                                                    backgroundColor: isSelected ? "var(--accent-subtle)" : "var(--bg-surface-elevated)",
                                                    border: `1px solid ${isSelected ? "var(--accent)" : "var(--border-color)"}`,
                                                }}
                                            >
                                                <div className="d-flex align-items-center gap-2.5">
                                                    <Avatar initials={i.avatar} bg={i.avatarBg} fg={i.avatarFg} size={34} />
                                                    <div>
                                                        <div className="fw-semibold small" style={{ color: "var(--text-primary)" }}>{i.name}</div>
                                                        <div className="text-secondary small" style={{ fontSize: "11px" }}>{i.dept} &middot; {i.mentor}</div>
                                                    </div>
                                                </div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <GradeChip score={i.score} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {filteredInterns.length === 0 && (
                                        <div className="p-3 text-secondary small">No matches found.</div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="col-12 col-lg-8">
                        {activeIntern && (
                            <ActiveInternEvaluationEditor
                                key={activeIntern.id || activeIntern._id}
                                activeIntern={activeIntern}
                                canEditScore={canEditScore}
                                onUpdateScore={onUpdateScore}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function EvaluationsView(props) {
    if (props.mode === "personal") {
        return <PersonalEvaluationView {...props} />;
    }
    return <TeamEvaluationView {...props} />;
}
