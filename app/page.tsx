"use client"

import { useMemo, useState } from "react"
import {
  Activity,
  Bot,
  Cable,
  Check,
  ChevronRight,
  CircleAlert,
  CloudCog,
  Code2,
  Copy,
  Cpu,
  Fingerprint,
  Gauge,
  GitBranch,
  KeyRound,
  LockKeyhole,
  Play,
  RefreshCcw,
  RotateCcw,
  ServerCog,
  ShieldCheck,
  SquareTerminal,
  Sparkles,
  UserCheck,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { evaluateGate, type GateDecision } from "@/lib/policy"

type StepTone = "human" | "control" | "advisory" | "transport" | "device"

const architectureSteps: Array<{
  title: string
  short: string
  tone: StepTone
  icon: typeof UserCheck
}> = [
  { title: "Human governance", short: "2-person approval", tone: "human", icon: UserCheck },
  { title: "Control plane", short: "policy + provenance", tone: "control", icon: CloudCog },
  { title: "Advisory AI", short: "drift + anomaly", tone: "advisory", icon: Bot },
  { title: "Secure transport", short: "mTLS + attestation", tone: "transport", icon: LockKeyhole },
  { title: "Device runtime", short: "blue/green + rollback", tone: "device", icon: Cpu },
]

const lessons = [
  {
    number: "01",
    title: "Read the notation",
    body: "agentflow TB means a top-to-bottom agent workflow. flow groups a trust boundary; arrows show sequence; @{ instruction } adds behavioral guidance.",
  },
  {
    number: "02",
    title: "Separate advice from authority",
    body: "Drift and anomaly agents recommend. Humans and deterministic policy decide. An LLM must never become the deployment authorization source.",
  },
  {
    number: "03",
    title: "Make controls executable",
    body: "A diagram is a specification, not enforcement. Each security claim needs code, identity, signed evidence, failure behavior, and an auditable record.",
  },
  {
    number: "04",
    title: "Fail closed",
    body: "Missing identity, one-person approval, invalid signature, failed attestation, or excessive risk sends the candidate to manual hold—not deployment.",
  },
]

const nodeDetails = [
  ["Registry", "Package candidate and compatibility metadata"],
  ["Compressor", "Optimize while preserving accuracy constraints"],
  ["HSM signer", "Sign model bundle and SBOM"],
  ["Policy engine", "Evaluate deterministic release rules"],
  ["Attestation", "Verify device identity and measured state"],
  ["Monitor", "Collect latency, power, failures, and drift"],
  ["Audit ledger", "Preserve the governance evidence chain"],
]

const mcpConnectorSnippet = `connector governance_portal["Governance Portal"]
governance_portal@{
  protocol: "mcp",
  url: "https://secure-edge-ai-governance.hendar2-0.chatgpt.site/api/mcp"
}`

function MetricSlider({
  label,
  value,
  threshold,
  onChange,
}: {
  label: string
  value: number
  threshold: number
  onChange: (value: number) => void
}) {
  const passing = value <= threshold
  return (
    <div className="metric-control">
      <div className="metric-label">
        <span>{label}</span>
        <span className={passing ? "metric-value passing" : "metric-value failing"}>
          {value} / 100
        </span>
      </div>
      <Slider
        aria-label={label}
        value={[value]}
        max={100}
        step={1}
        onValueChange={(next) => onChange(next[0] ?? value)}
      />
      <p>Policy threshold ≤ {threshold}</p>
    </div>
  )
}

function BooleanControl({
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  label: string
  hint: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <label className="boolean-control">
      <span>
        <strong>{label}</strong>
        <small>{hint}</small>
      </span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={label} />
    </label>
  )
}

function DecisionCard({ decision }: { decision: GateDecision | null }) {
  if (!decision) {
    return (
      <section className="decision-card waiting" aria-live="polite">
        <div className="decision-icon"><Gauge /></div>
        <div>
          <span className="eyebrow">Deterministic gate</span>
          <h3>Ready to evaluate</h3>
          <p>Adjust the evidence, then run the same explicit policy every time.</p>
        </div>
      </section>
    )
  }

  const approved = decision.status === "approved"
  return (
    <section className={`decision-card ${approved ? "approved" : "held"}`} aria-live="polite">
      <div className="decision-icon">{approved ? <ShieldCheck /> : <CircleAlert />}</div>
      <div className="decision-copy">
        <span className="eyebrow">Policy decision</span>
        <div className="decision-heading">
          <h3>{approved ? "Deployment approved" : "Manual hold"}</h3>
          <Badge variant={approved ? "default" : "destructive"}>
            {approved ? "PASS" : "FAIL CLOSED"}
          </Badge>
        </div>
        {approved ? (
          <p>All required evidence passed. The signed candidate may continue to blue/green activation.</p>
        ) : (
          <ul>{decision.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
        )}
        <footer>
          <span>{decision.policyVersion}</span>
          <span>{new Date(decision.evaluatedAt).toLocaleTimeString()}</span>
        </footer>
      </div>
    </section>
  )
}

function ArchitectureRail({ approved }: { approved: boolean | null }) {
  return (
    <div className="architecture-rail" aria-label="End-to-end secure Edge AI lifecycle">
      {architectureSteps.map((step, index) => {
        const Icon = step.icon
        return (
          <div className="rail-fragment" key={step.title}>
            <article className={`rail-step tone-${step.tone}`}>
              <span className="rail-icon"><Icon /></span>
              <span><strong>{step.title}</strong><small>{step.short}</small></span>
              {index === architectureSteps.length - 1 && approved !== null ? (
                <span className={`rail-state ${approved ? "is-pass" : "is-hold"}`}>
                  {approved ? <Check /> : <RotateCcw />}
                </span>
              ) : null}
            </article>
            {index < architectureSteps.length - 1 ? <ChevronRight className="rail-arrow" /> : null}
          </div>
        )
      })}
    </div>
  )
}

export default function Home() {
  const [riskScore, setRiskScore] = useState(24)
  const [driftScore, setDriftScore] = useState(12)
  const [signatureValid, setSignatureValid] = useState(true)
  const [attestationValid, setAttestationValid] = useState(true)
  const [regressionPassed, setRegressionPassed] = useState(true)
  const [approverOneApproved, setApproverOneApproved] = useState(true)
  const [approverTwoApproved, setApproverTwoApproved] = useState(true)
  const [decision, setDecision] = useState<GateDecision | null>(null)
  const [runCount, setRunCount] = useState(0)
  const [copied, setCopied] = useState(false)

  const candidate = useMemo(
    () => ({
      deploymentId: "fleet-se-042 / vision-7.3.1",
      riskScore,
      driftScore,
      signatureValid,
      attestationValid,
      regressionPassed,
      approverOneId: "safety-lead@demo",
      approverOneApproved,
      approverTwoId: "release-owner@demo",
      approverTwoApproved,
    }),
    [
      riskScore,
      driftScore,
      signatureValid,
      attestationValid,
      regressionPassed,
      approverOneApproved,
      approverTwoApproved,
    ]
  )

  function runGate() {
    setDecision(evaluateGate(candidate))
    setRunCount((count) => count + 1)
  }

  function resetDemo() {
    setRiskScore(24)
    setDriftScore(12)
    setSignatureValid(true)
    setAttestationValid(true)
    setRegressionPassed(true)
    setApproverOneApproved(true)
    setApproverTwoApproved(true)
    setDecision(null)
  }

  async function copyConnector() {
    await navigator.clipboard.writeText(mcpConnectorSnippet)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Secure Edge AI Governance home">
          <span className="brand-mark"><Fingerprint /></span>
          <span><strong>EDGE//GOV</strong><small>governed AI delivery lab</small></span>
        </a>
        <div className="topbar-meta">
          <Badge variant="outline" className="live-badge"><span /> Interactive portfolio</Badge>
          <span className="author">Hendarmawan, PhD Eng.</span>
        </div>
      </header>

      <section className="intro" id="top">
        <div>
          <span className="kicker"><Sparkles /> Lifecycle-first Edge AI</span>
          <h1>Make every deployment<br /><em>prove it is safe.</em></h1>
        </div>
        <div className="intro-copy">
          <p>
            Your <code>agentflow</code> is an architecture specification. This playground turns its
            central governance rule into an executable, deterministic simulation.
          </p>
          <div className="principle-row">
            <span><UserCheck /> Humans approve</span>
            <span><Code2 /> Policy decides</span>
            <span><Bot /> AI advises</span>
          </div>
        </div>
      </section>

      <ArchitectureRail approved={decision ? decision.status === "approved" : null} />

      <Tabs defaultValue="playground" className="experience-tabs">
        <TabsList variant="line" className="experience-tab-list" aria-label="Playground sections">
          <TabsTrigger value="playground"><Play /> Playground</TabsTrigger>
          <TabsTrigger value="architecture"><GitBranch /> Architecture</TabsTrigger>
          <TabsTrigger value="learn"><Code2 /> Learn the DSL</TabsTrigger>
          <TabsTrigger value="mcp"><Cable /> MCP lab</TabsTrigger>
        </TabsList>

        <TabsContent value="playground" className="tab-panel">
          <section className="workspace-grid">
            <div className="panel evidence-panel">
              <div className="panel-heading">
                <div><span className="section-index">01</span><h2>Evidence inputs</h2></div>
                <Badge variant="secondary">candidate 7.3.1</Badge>
              </div>
              <p className="panel-lead">Change any signal and observe how the fail-closed gate behaves.</p>

              <div className="metric-grid">
                <MetricSlider label="Deployment risk" value={riskScore} threshold={30} onChange={setRiskScore} />
                <MetricSlider label="Model drift" value={driftScore} threshold={25} onChange={setDriftScore} />
              </div>

              <div className="control-stack">
                <BooleanControl label="Bundle signature" hint="HSM-backed artifact + SBOM" checked={signatureValid} onCheckedChange={setSignatureValid} />
                <BooleanControl label="Device attestation" hint="Trusted identity and measured state" checked={attestationValid} onCheckedChange={setAttestationValid} />
                <BooleanControl label="Regression qualification" hint="Accuracy, latency, power, compatibility" checked={regressionPassed} onCheckedChange={setRegressionPassed} />
              </div>
            </div>

            <div className="panel approval-panel">
              <div className="panel-heading">
                <div><span className="section-index">02</span><h2>Human approval</h2></div>
                <KeyRound />
              </div>
              <p className="panel-lead">Both named, distinct roles must explicitly approve this exact deployment.</p>

              <div className="approver-card">
                <span className="avatar avatar-one">SL</span>
                <span><strong>Safety lead</strong><small>safety-lead@demo</small></span>
                <Switch checked={approverOneApproved} onCheckedChange={setApproverOneApproved} aria-label="Safety lead approval" />
              </div>
              <div className="approval-join"><span /> two-person rule <span /></div>
              <div className="approver-card">
                <span className="avatar avatar-two">RO</span>
                <span><strong>Release owner</strong><small>release-owner@demo</small></span>
                <Switch checked={approverTwoApproved} onCheckedChange={setApproverTwoApproved} aria-label="Release owner approval" />
              </div>

              <div className="action-row">
                <Button onClick={runGate} size="lg"><Play /> Evaluate gate</Button>
                <Button onClick={resetDemo} variant="outline" size="lg"><RefreshCcw /> Reset</Button>
              </div>
              <p className="run-note">Evaluation #{runCount + 1} · no LLM is used in the decision</p>
            </div>

            <div className="result-column">
              <DecisionCard decision={decision} />
              <section className="evidence-trace">
                <header><Activity /><span><strong>Evidence trace</strong><small>what the policy inspected</small></span></header>
                <ol>
                  <li><span>01</span><p><strong>Identity</strong>Unique deployment and approver IDs</p></li>
                  <li><span>02</span><p><strong>Provenance</strong>Signed bundle and SBOM evidence</p></li>
                  <li><span>03</span><p><strong>Qualification</strong>Risk, drift, and regression limits</p></li>
                  <li><span>04</span><p><strong>Release</strong>Activate or preserve known-good model</p></li>
                </ol>
              </section>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="architecture" className="tab-panel">
          <section className="architecture-panel">
            <div className="architecture-summary">
              <span className="section-index">SYSTEM MAP</span>
              <h2>Five trust boundaries, one evidence chain.</h2>
              <p>The original vertical diagram is sound as a conceptual architecture. The critical upgrade is to make every boundary exchange verifiable and every failure state explicit.</p>
              <div className="boundary-key">
                {architectureSteps.map((step) => <span key={step.title} className={`tone-${step.tone}`}>{step.title}</span>)}
              </div>
            </div>
            <div className="control-plane-list">
              {nodeDetails.map(([name, description], index) => (
                <article key={name}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><strong>{name}</strong><p>{description}</p></div>
                  <ServerCog />
                </article>
              ))}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="learn" className="tab-panel">
          <section className="learn-grid">
            <div className="lesson-list">
              {lessons.map((lesson) => (
                <article key={lesson.number}>
                  <span>{lesson.number}</span>
                  <div><h3>{lesson.title}</h3><p>{lesson.body}</p></div>
                </article>
              ))}
            </div>
            <aside className="code-card">
              <header><span /><span /><span /><small>governance.agentflow</small></header>
              <pre><code>{`agentflow TB

connector governance_portal {
  protocol: "mcp"
  url: "https://YOUR-HOST/mcp"
}

flow governance {
  portal "Assess risk + 2 approvals"
  escalation "Manual hold"

  portal --> escalation
  portal -.- governance_portal
}

governance --> control_plane
           --> device_runtime`}</code></pre>
              <footer><CircleAlert /> <span><strong>Important</strong>The URL must be a real MCP endpoint—not Webhook.site and not example.com.</span></footer>
            </aside>
          </section>
        </TabsContent>

        <TabsContent value="mcp" className="tab-panel">
          <section className="mcp-lab">
            <div className="mcp-intro">
              <Badge variant="outline">REAL JSON-RPC ENDPOINT INCLUDED</Badge>
              <h2>Connect the diagram to tools—not a webhook inbox.</h2>
              <p>
                MCP is the protocol layer between an AI client and callable governance tools.
                This project implements initialization, tool discovery, and deterministic gate calls at <code>/api/mcp</code>.
              </p>
              <div className="protocol-flow">
                <span><strong>1</strong> initialize</span>
                <ChevronRight />
                <span><strong>2</strong> tools/list</span>
                <ChevronRight />
                <span><strong>3</strong> tools/call</span>
              </div>
              <aside>
                <CircleAlert />
                <span><strong>Learning endpoint</strong>It is intentionally stateless and unauthenticated. Add OAuth, durable state, authorization, and audit storage before production use.</span>
              </aside>
            </div>

            <div className="setup-stack">
              <article className="setup-card">
                <span className="setup-number">01</span>
                <div><h3>Run locally</h3><p>Node.js 22+ is enough. No AI API key is required.</p></div>
                <pre><code>npm ci{"\n"}npm run dev</code></pre>
              </article>
              <article className="setup-card">
                <span className="setup-number">02</span>
                <div><h3>Test the handshake</h3><p>POST JSON-RPC to the same MCP endpoint.</p></div>
                <pre><code>{`curl -X POST http://localhost:5173/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18"}}'`}</code></pre>
              </article>
              <article className="setup-card connector-card">
                <span className="setup-number">03</span>
                <div><h3>Use in AgentFlow</h3><p>This public deployment exposes the learning MCP endpoint.</p></div>
                <pre><code>{mcpConnectorSnippet}</code></pre>
                <Button variant="secondary" size="sm" onClick={copyConnector}>
                  {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy connector"}
                </Button>
              </article>
              <article className="setup-card">
                <span className="setup-number">04</span>
                <div><h3>Publish to GitHub</h3><p>Use the included README, architecture note, AgentFlow source, and CI workflow.</p></div>
                <pre><code>git remote add origin YOUR_REPO_URL{"\n"}git push -u origin main</code></pre>
              </article>
            </div>
          </section>
        </TabsContent>
      </Tabs>

      <footer className="site-footer">
        <span><SquareTerminal /> Secure Edge AI Governance Playground</span>
        <span>Architecture demonstrator · not a production authorization system</span>
      </footer>
    </main>
  )
}
