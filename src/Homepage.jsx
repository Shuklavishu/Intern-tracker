import { PillButton, Card, SectionEyebrow, ThemeToggle } from "./Theme";

// Public landing page with AuthKit aesthetic
export default function Homepage({ onGetStarted, isMobile, theme, toggleTheme }) {
    return (
        <div className="min-vh-100 d-flex flex-column text-light">
            {/* Header / Navbar */}
            <header className="container py-4 border-bottom border-secondary border-opacity-10">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="font-display fs-3 text-skywash d-flex align-items-center gap-2">
                        <span className="rounded-pill p-1 d-inline-flex" style={{ width: 12, height: 12, backgroundColor: "#e05626" }}></span>
                        IMS <span className="fs-6 font-normal text-fog ms-1">&middot; Intern Management System</span>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                        <PillButton variant="ghost" onClick={onGetStarted}>
                            Log in / Sign in
                        </PillButton>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="container flex-grow-1 d-flex flex-column justify-content-center py-5">
                <div className="text-center mx-auto" style={{ maxWidth: 800 }}>
                    <SectionEyebrow>INTRODUCING INTERN LEDGER</SectionEyebrow>

                    <h1 className={`font-display text-skywash ${isMobile ? "display-4" : "display-2"} my-3`}>
                        Track intern performance, all in one record.
                    </h1>

                    <p className="text-moon lead fs-5 mx-auto mb-4" style={{ maxWidth: 620 }}>
                        Admins manage the roster, mentors score and approve work, interns log tasks and goals — one shared frosted ledger for everyone on program.
                    </p>

                    <div className="d-grid gap-3 d-sm-flex justify-content-sm-center mb-5">
                        <PillButton variant="filled" onClick={onGetStarted} className={isMobile ? "w-100" : "px-5 py-3 fs-6"}>
                            Get started <i className="bi bi-arrow-right ms-2"></i>
                        </PillButton>
                    </div>
                </div>

                {/* Feature Grid with Frosted Glass Tiles */}
                <div className="row g-4 mt-4 mx-auto w-100" style={{ maxWidth: 1060 }}>
                    {[
                        ["Admin Console", "bi-shield-check", "Full operational oversight, roster management, department allocation, and broadcast notices."],
                        ["Mentor WorkSpace", "bi-person-badge", "Approve tasks, conduct periodic performance reviews, and assign target goals."],
                        ["Intern Portal", "bi-journal-check", "Log daily task progress, view evaluation scorecard, submit requests, and track goals."],
                    ].map(([title, icon, desc]) => (
                        <div key={title} className="col-12 col-md-4">
                            <Card className="h-100 text-start p-4">
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{
                                            width: 52,
                                            height: 52,
                                            background: "rgba(186, 214, 247, 0.06)",
                                            border: "1px solid rgba(186, 215, 247, 0.12)",
                                            color: "#d1e4fa"
                                        }}
                                    >
                                        <i className={`bi ${icon} fs-4`}></i>
                                    </div>
                                    <div className="font-display fs-5 text-frost">{title}</div>
                                </div>
                                <p className="text-fog small mb-0 leading-relaxed">{desc}</p>
                            </Card>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}