# Secure Edge AI Governance Playground

An interactive, portfolio-ready demonstration of lifecycle-first governance for
Edge AI fleets. It converts a Mermaid AgentFlow architecture into two working
surfaces:

1. A browser playground for deterministic deployment decisions.
2. A minimal MCP Streamable HTTP endpoint for AgentFlow connector experiments.

Created by **Hendarmawan, PhD Eng.**

## Why this project exists

The original diagram correctly separates human governance, the cloud control
plane, advisory AI, secure transport, and the device runtime. However, an
AgentFlow diagram is a declarative design—not a running security system.

This project makes the central policy executable:

- two named, distinct human approvers are mandatory;
- risk and drift must remain within explicit thresholds;
- signature, attestation, and regression evidence must pass;
- advisory AI never authorizes deployment; and
- any missing or failed evidence produces `manual_hold`.

## Included

- Responsive interactive governance simulator
- Architecture and AgentFlow learning views
- JSON-RPC MCP endpoint at `/api/mcp`
- MCP tools for approval requests, gate evaluation, and manual hold
- Corrected [`governance.agentflow`](./governance.agentflow) source
- Detailed [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- GitHub Actions build/test workflow
- No AI API key required

## Local playground

Requirements:

- Node.js 22.13 or newer
- npm

```bash
git clone https://github.com/h00w/secure-edge-ai-governance.git
cd secure-edge-ai-governance
npm ci
npm run dev
```

Open the local URL printed by the development server. The MCP endpoint is on the
same origin at `/api/mcp`.

## Test MCP initialization

```bash
curl -X POST http://localhost:5173/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-06-18",
      "capabilities": {},
      "clientInfo": {"name": "curl-demo", "version": "1.0.0"}
    }
  }'
```

List tools:

```bash
curl -X POST http://localhost:5173/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

## AgentFlow connector

The included cloud deployment uses this connector:

```text
connector governance_portal["Governance Portal"]
governance_portal@{
  protocol: "mcp",
  url: "https://secure-edge-ai-governance.hendar2-0.chatgpt.site/api/mcp"
}
```

Webhook.site cannot replace an MCP server. It can capture an HTTP request, but
it does not implement MCP JSON-RPC initialization, tool discovery, or tool calls.

## Build and verification

```bash
npm run lint
npm test
```

`npm test` performs a production build and the included rendered-output tests.
The same checks run in GitHub Actions.

## Portfolio talking points

Use the project to discuss:

- deterministic control versus probabilistic AI advice;
- separation of duties and two-person approval;
- signed software/model supply chains and SBOM evidence;
- TPM/TEE-backed device identity and attestation;
- blue/green deployment and known-good rollback;
- operational gates for latency, power, failures, and drift; and
- why architectural claims need executable evidence.

## Production hardening

This repository is an educational demonstrator, not a production authorization
system. Before real deployment, add:

- OAuth 2.1/OIDC and role-based authorization;
- durable approval and governance records;
- replay protection and idempotency keys;
- canonical evidence signing and HSM/KMS integration;
- a real TPM/TEE attestation verifier;
- append-only or transparency-log audit storage;
- schema validation, rate limits, monitoring, and security tests; and
- independent threat modeling and compliance review.

## References

- [Model Context Protocol architecture](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture)
- [MCP tools specification](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
- [MCP Streamable HTTP transport](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports)
- [OpenAI Agents SDK: guardrails and human review](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals)
- [Mermaid MCP server documentation](https://mermaid.ai/docs/ai/mcp-server)

## License

Choose and add a license before publishing the repository as open source.
