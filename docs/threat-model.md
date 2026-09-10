# Threat Model

The project assumes adversaries may target the AI artifact, deployment pipeline, device identity, policy layer, operator approvals, or agent/tool boundary.

## Primary threats

- Tampered or untrusted model artifacts
- Unauthorized deployment or rollback
- Forged device identity or attestation evidence
- Policy bypass through malformed inputs or tool calls
- Compromised credentials or approval accounts
- Stale or incomplete lifecycle evidence
- Unsafe automation that exceeds delegated authority

## Core controls

Use authenticated artifacts, attestation, deterministic policy gates, least privilege, explicit human approvals for sensitive transitions, immutable evidence where practical, staged rollout, and tested rollback paths.
