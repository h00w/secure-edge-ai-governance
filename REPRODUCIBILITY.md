# Reproducibility

This repository implements the **Production AI Evidence Contract v1**.

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

The command runs the deterministic TypeScript release-policy tests and independent Python Streamlit policy tests, captures stdout/stderr, records source/runtime identity, hashes relevant policy, scenario, dependency and implementation files, and emits:

```text
evidence/out/current/
├── evidence.json
├── verification.stdout.log
├── verification.stderr.log
├── checksums.sha256
└── summary.md
```

## Interpretation

A reproduction `PASS` proves that the repository's configured governance implementation and tests reproduce for the recorded commit/environment. It does **not** prove hardware-backed TPM/TEE verification, production signing, real OTA orchestration, or fleet rollback execution.

Those production-security capabilities remain explicitly outside the current implementation boundary.

## Clean-room check

```bash
git clone https://github.com/h00w/secure-edge-ai-governance.git
cd secure-edge-ai-governance
git checkout <commit>
npm ci
python -m pip install -r demos/streamlit/requirements.txt
make reproduce
cat evidence/out/current/summary.md
```
