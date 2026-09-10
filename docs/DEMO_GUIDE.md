# Live Demo & Verification Guide

This repository exposes two complementary demonstration surfaces:

1. the primary TypeScript/React governance playground and MCP endpoint; and
2. a portable Streamlit policy demonstrator under `demos/streamlit/`.

The two surfaces exist for different reviewer needs. The web playground shows the richer product experience and protocol integration. The Streamlit surface makes the core governance policy easy to deploy, inspect, and reproduce independently.

## Reviewer acceptance scenarios

| Scenario | Change | Expected decision |
| --- | --- | --- |
| Approved release | Keep all controls valid and two distinct approvals | `approved` |
| High risk | Set risk score to 31 or higher | `manual_hold` |
| Excess drift | Set drift score to 26 or higher | `manual_hold` |
| Invalid signature | Clear signature validity | `manual_hold` |
| Failed attestation | Clear attestation validity | `manual_hold` |
| Regression failure | Clear regression gate | `manual_hold` |
| Same approver | Use the same identity twice | `manual_hold` |
| Missing approval | Clear either approval | `manual_hold` |

## Run the TypeScript playground

Requirements: Node.js 22.13+ and npm.

```bash
npm ci
npm run dev
```

Then open the local URL printed by the development server.

Validate before publishing:

```bash
npm run lint
npm test
```

## Run the Streamlit governance demo

```bash
cd demos/streamlit
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m pytest -q
python -m streamlit run app.py
```

macOS/Linux:

```bash
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m pytest -q
python -m streamlit run app.py
```

## Deploy to Streamlit Community Cloud

Create a new Streamlit app from this GitHub repository and set the entrypoint to:

```text
demos/streamlit/app.py
```

No secrets are required. The demo is deterministic and uses no customer data.

After deployment, test from an incognito/private browser and run all reviewer scenarios above. Add the resulting public URL to the repository About/Website field and README.

## MCP verification

The TypeScript application exposes a Streamable HTTP-style JSON-RPC endpoint at `/api/mcp`.

Initialize:

```bash
curl -X POST http://localhost:5173/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"initialize",
    "params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"reviewer","version":"1.0"}}
  }'
```

List tools:

```bash
curl -X POST http://localhost:5173/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

The server exposes tools for two-person approval, deterministic deployment-gate evaluation, and manual hold.

## 90-second portfolio video

Record the following sequence:

1. Repository README and CI badge.
2. Architecture diagram.
3. Live demo with an approved release.
4. Move risk above 30 and show `manual_hold`.
5. Restore risk, fail attestation, and show `manual_hold`.
6. Use the same approver identity twice and show separation-of-duties enforcement.
7. Briefly show `lib/policy.ts`, tests, and `/api/mcp`.

Recommended closing statement:

> This project demonstrates a lifecycle-first governance pattern for Edge AI: probabilistic AI can advise, but deterministic policy, evidence, and distinct human approvals control release authority.

## Evidence integrity

This is an educational and portfolio demonstrator. It does not claim to implement real TPM/TEE verification, HSM-backed signing, production identity, fleet deployment, or customer ROI. Those are explicitly identified as production-hardening steps rather than simulated as completed capabilities.
