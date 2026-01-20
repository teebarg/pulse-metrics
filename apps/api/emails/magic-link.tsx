import type React from "react";

interface MagicLinkProps {
    magicLink: string;
}

export const MagicLink: React.FC<Readonly<MagicLinkProps>> = ({ magicLink }: MagicLinkProps) => {
    const styles = {
        container: {
            backgroundColor: "#f6f9fc",
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
            padding: "40px 20px",
        },
        content: {
            backgroundColor: "#ffffff",
            margin: "0 auto",
            maxWidth: "600px",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
        },
        header: {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "40px 40px 50px",
            textAlign: "center" as const,
        },
        logo: {
            fontSize: "32px",
            fontWeight: "700",
            color: "#ffffff",
            margin: "0",
            letterSpacing: "-0.5px",
        },
        body: {
            padding: "40px",
        },
        title: {
            fontSize: "24px",
            fontWeight: "600",
            color: "#1a1a1a",
            margin: "0 0 16px 0",
            lineHeight: "1.3",
        },
        text: {
            fontSize: "16px",
            color: "#525252",
            lineHeight: "1.6",
            margin: "0 0 24px 0",
        },
        buttonContainer: {
            textAlign: "center" as const,
            margin: "32px 0",
        },
        button: {
            backgroundColor: "#667eea",
            color: "#ffffff",
            padding: "16px 40px",
            textDecoration: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            display: "inline-block",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
        },
        divider: {
            borderTop: "1px solid #e5e7eb",
            margin: "32px 0",
        },
        alternativeText: {
            fontSize: "14px",
            color: "#737373",
            margin: "0 0 12px 0",
        },
        linkBox: {
            backgroundColor: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            padding: "16px",
            wordBreak: "break-all" as const,
            fontSize: "13px",
            color: "#667eea",
            fontFamily: "monospace",
        },
        footer: {
            padding: "32px 40px",
            textAlign: "center" as const,
            backgroundColor: "#f9fafb",
            borderTop: "1px solid #e5e7eb",
        },
        footerText: {
            fontSize: "14px",
            color: "#737373",
            margin: "0 0 8px 0",
            lineHeight: "1.5",
        },
        securityNote: {
            backgroundColor: "#fef3c7",
            border: "1px solid #fcd34d",
            borderRadius: "8px",
            padding: "16px",
            margin: "24px 0",
        },
        securityText: {
            fontSize: "14px",
            color: "#92400e",
            margin: "0",
            lineHeight: "1.5",
        },
    };
    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <div style={styles.header}>
                    <h1 style={styles.logo}>Pulse</h1>
                </div>

                <div style={styles.body}>
                    <h2 style={styles.title}>Your secure sign-in link</h2>

                    <p style={styles.text}>
                        Click the button below to securely sign in to your account. This link will expire in 15 minutes for your security.
                    </p>

                    <div style={styles.buttonContainer}>
                        <a href={magicLink} style={styles.button} target="_blank" rel="noopener noreferrer">
                            Sign in to Pulse
                        </a>
                    </div>

                    <div style={styles.securityNote}>
                        <p style={styles.securityText}>
                            <strong>🔒 Security tip:</strong> Never share this link with anyone. We will never ask for this link via email, phone, or
                            text message.
                        </p>
                    </div>

                    <div style={styles.divider}></div>

                    <p style={styles.alternativeText}>Or copy and paste this link into your browser:</p>

                    <div style={styles.linkBox}>{magicLink}</div>
                </div>

                <div style={styles.footer}>
                    <p style={styles.footerText}>If you didn't request this link, you can safely ignore this email.</p>
                    <p style={styles.footerText}>© 2026 Pulse Metrics. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};
