import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Secure Edge AI Governance Playground",
  description: "Interactive lifecycle-first Edge AI governance, approval, attestation, and rollback demonstrator by Hendarmawan, PhD Eng.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <div style={{
          borderTop: "1px solid rgba(148,163,184,.18)",
          padding: "18px 24px 26px",
          textAlign: "center",
          fontSize: 13,
          color: "#64748b",
        }}>
          <strong>Hendarmawan, PhD Eng.</strong>
          <span> · </span>
          <a href="https://github.com/h00w/" target="_blank" rel="noreferrer">GitHub</a>
          <span> · </span>
          <a href="https://www.linkedin.com/in/hender/" target="_blank" rel="noreferrer">LinkedIn</a>
          <span> · </span>
          <a href="https://hendarmawan.se" target="_blank" rel="noreferrer">hendarmawan.se</a>
        </div>
      </body>
    </html>
  )
}
