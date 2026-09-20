# Reproducibility

This repository implements **Production AI Evidence Contract v1** and the **Production AI Five-Level Proof Model v1**.

## Prerequisites

- Git
- Node.js 22+
- npm
- Python 3.12+

Install dependencies:

```bash
npm ci
python -m pip install -r demos/streamlit/requirements.txt
```

## Reproduce

```bash
make reproduce
```

The command runs the deterministic TypeScript release-policy tests and independent Python Streamlit policy tests, captures stdout/stderr, records source/runtime identity, hashes relevant policy, scenario, dependency and implementation files, and emits the Evidence Contract bundle under `evidence/out/current/`.

A reproduction `PASS` is **L2 — Reproducible**. It proves only the configured governance implementation and tests for the recorded source/environment.

## Assess the five-level proof

```bash
make proof
```

The assessor additionally verifies the public Streamlit reviewer surface and emits `proof.json` plus `proof-summary.md`.

The current project ceiling is **L3 — Capability-Validated**: the governance behavior, reviewer scenarios and hosted demo are inspectable, but hardware-backed TPM/TEE verification, production signing, real OTA orchestration, fleet rollback execution and target-fleet observation remain explicitly outside the implementation boundary.

For a network-independent run:

```bash
make proof-offline
```

Offline assessment can establish at most L2.

See [PROOF_MODEL.md](PROOF_MODEL.md) for all five cumulative levels.

## Clean-room check

```bash
git clone https://github.com/h00w/secure-edge-ai-governance.git
cd secure-edge-ai-governance
git checkout <commit>
npm ci
python -m pip install -r demos/streamlit/requirements.txt
make proof
cat evidence/out/current/proof-summary.md
```
