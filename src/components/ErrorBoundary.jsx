import React from "react";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("IMS Production ErrorBoundary caught an error:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleReset = () => {
        try {
            localStorage.removeItem("ims_user");
        } catch {
            // ignore
        }
        window.location.href = "/";
    };

    render() {
        if (this.state.hasError) {
            return (
                <div
                    className="min-vh-100 d-flex align-items-center justify-content-center p-4"
                    style={{
                        backgroundColor: "var(--bg-canvas, #090d16)",
                        color: "var(--text-primary, #f1f5f9)",
                        fontFamily: "Inter, -apple-system, sans-serif"
                    }}
                >
                    <div
                        className="p-4 p-md-5 text-center"
                        style={{
                            maxWidth: "480px",
                            backgroundColor: "var(--bg-surface, #0f172a)",
                            border: "1px solid var(--border-color, #1e293b)",
                            borderRadius: "var(--radius, 8px)"
                        }}
                    >
                        <div
                            className="d-inline-flex align-items-center justify-content-center mb-3"
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "var(--radius, 8px)",
                                backgroundColor: "rgba(239, 68, 68, 0.12)",
                                color: "#ef4444"
                            }}
                        >
                            <i className="ph ph-warning-circle" style={{ fontSize: "24px" }} />
                        </div>
                        <h2 className="fs-5 fw-bold mb-2 font-display" style={{ color: "var(--text-primary, #f1f5f9)" }}>
                            Something went wrong
                        </h2>
                        <p className="fs-6 mb-4" style={{ color: "var(--text-secondary, #94a3b8)", lineHeight: 1.5 }}>
                            An unexpected error occurred while running the application. You can reload the page or return to the home screen.
                        </p>
                        <div className="d-flex gap-2 justify-content-center flex-wrap">
                            <button
                                type="button"
                                onClick={this.handleReload}
                                className="btn px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                                style={{
                                    backgroundColor: "var(--accent, #0284c7)",
                                    color: "#ffffff",
                                    borderRadius: "var(--radius, 8px)",
                                    border: "none"
                                }}
                            >
                                <i className="ph ph-arrows-clockwise" />
                                Reload Page
                            </button>
                            <button
                                type="button"
                                onClick={this.handleReset}
                                className="btn px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                                style={{
                                    backgroundColor: "transparent",
                                    color: "var(--text-primary, #f1f5f9)",
                                    border: "1px solid var(--border-color, #334155)",
                                    borderRadius: "var(--radius, 8px)"
                                }}
                            >
                                <i className="ph ph-house" />
                                Return Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
