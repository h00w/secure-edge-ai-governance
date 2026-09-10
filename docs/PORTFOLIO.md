# Portfolio Proof — Secure Edge AI Governance Playground

## Positioning

This project demonstrates how to turn Edge AI governance principles into executable release controls rather than leaving them as architecture slides or policy prose.

It is designed to support discussions around:

- Director / Head of Edge AI
- AI platform and infrastructure leadership
- secure MLOps / Edge MLOps
- AI governance and assurance
- trusted computing and device attestation
- industrial AI lifecycle engineering
- agentic AI with deterministic controls

## Proof statement

> Built an executable Secure Edge AI governance demonstrator that separates probabilistic AI advice from deterministic release authority. The system enforces two-person approval, explicit risk/drift thresholds, signature, attestation, and regression evidence, with fail-closed `manual_hold` behavior and an MCP tool surface for agent integration.

## Verifiable artifacts

| Artifact | Evidence |
| --- | --- |
| Web playground | interactive governance scenarios |
| `lib/policy.ts` | executable deterministic release policy |
| `/api/mcp` | JSON-RPC/MCP-compatible tool surface |
| `governance.agentflow` | declarative agent/governance design |
| `tests/` | rendered-output and UI checks |
| GitHub Actions | reproducible build/lint/test evidence |
| `docs/ARCHITECTURE.md` | lifecycle and control-plane architecture |
| `docs/SECURITY_MODEL.md` | threat/trust boundary documentation |
| Streamlit demo | portable independent reviewer surface |

## Suggested REWORK proof

**Title**  
Secure Edge AI Governance — Deterministic Release Control & Human Approval

**Category**  
AI Integration & APIs, Workflow Automation, or Other AI / Automation depending on the available specialization taxonomy.

**Description**  
Executable Edge AI governance demonstrator that separates advisory AI from release authority. Implements deterministic deployment gates for risk, drift, signatures, device attestation, regression qualification, and two distinct human approvals. Includes an interactive web application, MCP tool endpoint, Streamlit reviewer demo, architecture and security documentation, automated tests, and GitHub CI.

## Outcome / ROI wording

Do not claim financial ROI for the public demonstrator. Use a technical outcome:

> Converts nine explicit release-evidence inputs into a reproducible approve/manual-hold decision with fail-closed behavior. Demonstrates two-person separation of duties, configurable risk/drift limits, signature/attestation/regression gates, auditable decision reasons, and independently testable governance scenarios.

## Demo-video evidence sequence

1. Show repository and green CI.
2. Open architecture diagram.
3. Run one valid release → `approved`.
4. Set risk to 31 → `manual_hold`.
5. Fail attestation → `manual_hold`.
6. Reuse one approver identity → separation-of-duties hold.
7. Show MCP tool list or curl call.
8. Close on the explicit demo-vs-production disclaimer.

The reviewer should be able to see that the governance rule is implemented, reproducible, and not represented as a real production attestation/signing platform.
