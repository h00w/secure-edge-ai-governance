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
      <body>{children}</body>
    </html>
  )
}
