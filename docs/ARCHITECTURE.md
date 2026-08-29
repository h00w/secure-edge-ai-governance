# Architecture notes

The `agentflow` diagram is a **declarative design artifact**. It describes actors,
sequence, connectors, and behavioral instructions. It does not by itself create
an HSM, verify TPM evidence, authorize approvers, persist audit records, or deploy
a model.

## Trust boundaries

| Boundary | Authority | Evidence produced | Failure behavior |
| --- | --- | --- | --- |
| Human governance | Two authenticated, distinct approvers | Approval identities, decision, timestamp | Manual hold |
| Cloud control plane | Deterministic policy and release services | Signed bundle, SBOM, gate result, audit event | Stop packaging/signing/deployment |
| Advisory AI | Drift, anomaly, and optimization assistants | Scores and recommendations | Advisory flag only |
| Secure transport | mTLS and attestation verifier | Peer certificate and measured-state result | Refuse connection |
| Device runtime | Secure bootloader and blue/green runtime | Activation, health, rollback telemetry | Restore known-good model |

## Control rule

The playground policy approves only when all conditions are true:

1. Deployment identity is present.
2. Two distinct approver identities are present and both approved.
3. Risk score is at most 30.
4. Drift score is at most 25.
5. Bundle signature is valid.
6. Device attestation is valid.
7. Regression qualification passed.

The policy is deterministic. Advisory AI can supply evidence, but cannot change
the rule or authorize a release.

## Demo versus production

The included MCP endpoint is intentionally stateless and unauthenticated so the
protocol can be studied. A production implementation needs OAuth 2.1, role and
separation-of-duty enforcement, durable approval state, replay protection,
canonical signed evidence, HSM/KMS integration, real attestation verification,
append-only audit storage, rate limiting, monitoring, and security testing.
