# Reproducibility

Secure Edge AI Governance implements **Production AI Evidence Contract v1** so release-governance evidence can be tied to an exact source revision, deterministic policy, independent implementation, security boundary, tests and runtime environment.

## One-command reproduction

```bash
git clone https://github.com/h00w/secure-edge-ai-governance.git
cd secure-edge-ai-governance
npm ci
python -m pip install -r demos/streamlit/requirements.txt
make reproduce
```

The default reproduction path does not require live devices, production credentials, or external AI providers.

## What is reproduced

The plan at `evidence/reproduction-plan.json` verifies:

1. TypeScript linting;
2. TypeScript build + regression tests;
3. independent Python policy tests for the Streamlit reviewer implementation;
4. SHA-256 identities for the deterministic release policy, independent policy implementation, test suite, security model and dependency manifest;
5. generation of a Production AI Evidence Contract v1 bundle.

The purpose is to show that the declared fail-closed governance semantics can be reconstructed for the exact source revision.

## Evidence output

```text
artifacts/reproduction/<UTC timestamp>-<git sha>/
├── evidence.json
├── summary.md
├── checksums.sha256
└── logs/
```

Statuses:

- `REPRODUCED` — all declared deterministic checks passed from a clean tracked checkout;
- `PARTIAL` — checks passed but tracked local changes were present;
- `FAILED` — a declared input or verification step failed.

These are reproduction statuses, not deployment decisions. `approved` / `manual_hold` remain outputs of the deterministic governance gate.

## Security boundary

A reproduced result demonstrates software-level governance controls for the tested revision. It does **not** claim that the repository has completed production infrastructure for:

- hardware-backed TPM/TEE quote verification;
- HSM/KMS signing;
- production mTLS identity lifecycle;
- append-only audit storage;
- real OTA fleet orchestration;
- production rollback execution.

Those remain separate hardening and integration milestones.

## Verify checksums

```bash
cd artifacts/reproduction/$(cat artifacts/reproduction/LATEST)
sha256sum --check checksums.sha256
```

## Custom output location

```bash
REPRO_OUT=/tmp/secure-edge-ai-evidence make reproduce
```

## Clean-room standard

For publishable evidence:

1. checkout an immutable tag or full commit SHA;
2. start from a clean tracked working tree;
3. install dependencies from that revision;
4. run `make reproduce`;
5. preserve the complete evidence directory;
6. report any external attestation/signing/fleet assumptions separately rather than implying they were reproduced locally.

## Contract source

The canonical contract is maintained by the AI Model Release Control Center and vendored locally at:

`evidence/production-ai-evidence-contract-v1.schema.json`

Every generated bundle records the local schema SHA-256.

## Updating the plan

When release policy, attestation semantics, approval rules, regression gates or security boundaries change, update `evidence/reproduction-plan.json` in the same pull request. A failing reproduction should remain visible until the underlying reason is understood and fixed.
