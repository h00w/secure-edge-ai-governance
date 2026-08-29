import { evaluateGate } from "@/lib/policy"

type JsonRpcRequest = {
  jsonrpc?: string
  id?: string | number | null
  method?: string
  params?: Record<string, unknown>
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, MCP-Protocol-Version, MCP-Session-Id, Mcp-Method, Mcp-Name",
  "Access-Control-Expose-Headers": "MCP-Protocol-Version",
  "Cache-Control": "no-store",
}

const tools = [
  {
    name: "request_two_person_approval",
    description: "Validate two distinct approver identities and create a demonstration approval request for one deployment.",
    inputSchema: {
      type: "object",
      properties: {
        deployment_id: { type: "string", description: "Unique deployment candidate identifier" },
        approver_one_id: { type: "string", description: "First authorized approver identity" },
        approver_two_id: { type: "string", description: "Second authorized approver identity" },
      },
      required: ["deployment_id", "approver_one_id", "approver_two_id"],
      additionalProperties: false,
    },
  },
  {
    name: "evaluate_deployment_gate",
    description: "Apply a deterministic fail-closed policy to risk, drift, signature, attestation, regression, and two-person approval evidence.",
    inputSchema: {
      type: "object",
      properties: {
        deployment_id: { type: "string" },
        risk_score: { type: "number", minimum: 0, maximum: 100 },
        drift_score: { type: "number", minimum: 0, maximum: 100 },
        signature_valid: { type: "boolean" },
        attestation_valid: { type: "boolean" },
        regression_passed: { type: "boolean" },
        approver_one_id: { type: "string" },
        approver_one_approved: { type: "boolean" },
        approver_two_id: { type: "string" },
        approver_two_approved: { type: "boolean" },
      },
      required: [
        "deployment_id",
        "risk_score",
        "drift_score",
        "signature_valid",
        "attestation_valid",
        "regression_passed",
        "approver_one_id",
        "approver_one_approved",
        "approver_two_id",
        "approver_two_approved",
      ],
      additionalProperties: false,
    },
  },
  {
    name: "place_manual_hold",
    description: "Return a manual-hold governance record for a failed or anomalous deployment.",
    inputSchema: {
      type: "object",
      properties: {
        deployment_id: { type: "string" },
        reason: { type: "string" },
      },
      required: ["deployment_id", "reason"],
      additionalProperties: false,
    },
  },
]

function responseHeaders(protocolVersion = "2025-06-18") {
  return {
    ...corsHeaders,
    "Content-Type": "application/json",
    "MCP-Protocol-Version": protocolVersion,
  }
}

function jsonRpc(id: JsonRpcRequest["id"], result: unknown, protocolVersion?: string) {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id: id ?? null, result }), {
    status: 200,
    headers: responseHeaders(protocolVersion),
  })
}

function jsonRpcError(id: JsonRpcRequest["id"], code: number, message: string) {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }), {
    status: 200,
    headers: responseHeaders(),
  })
}

function stringArg(value: unknown) {
  return typeof value === "string" ? value : ""
}

function scoreArg(value: unknown) {
  const score = typeof value === "number" ? value : Number.NaN
  return Number.isFinite(score) && score >= 0 && score <= 100 ? score : 101
}

function toolResult(value: unknown, isError = false) {
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
    structuredContent: value,
    isError,
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

export async function GET() {
  return new Response(
    JSON.stringify({
      name: "secure-edge-governance",
      transport: "streamable-http",
      message: "Send MCP JSON-RPC requests with HTTP POST to this endpoint.",
    }),
    { status: 405, headers: { ...responseHeaders(), Allow: "POST, OPTIONS" } }
  )
}

export async function POST(request: Request) {
  let body: JsonRpcRequest
  try {
    body = (await request.json()) as JsonRpcRequest
  } catch {
    return jsonRpcError(null, -32700, "Parse error")
  }

  if (body.jsonrpc !== "2.0" || !body.method) {
    return jsonRpcError(body.id, -32600, "Invalid JSON-RPC request")
  }

  if (body.method === "initialize") {
    const requested = stringArg(body.params?.protocolVersion)
    const protocolVersion = requested === "2026-07-28" ? requested : "2025-06-18"
    return jsonRpc(body.id, {
      protocolVersion,
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: "secure-edge-governance", version: "1.0.0" },
      instructions: "Demo only. Advisory analysis never overrides deterministic policy or two-person human governance.",
    }, protocolVersion)
  }

  if (body.method === "notifications/initialized") {
    return new Response(null, { status: 202, headers: corsHeaders })
  }

  if (body.method === "ping") return jsonRpc(body.id, {})
  if (body.method === "tools/list") return jsonRpc(body.id, { tools })

  if (body.method !== "tools/call") {
    return jsonRpcError(body.id, -32601, `Method not found: ${body.method}`)
  }

  const toolName = stringArg(body.params?.name)
  const args = (body.params?.arguments ?? {}) as Record<string, unknown>

  if (toolName === "request_two_person_approval") {
    const deploymentId = stringArg(args.deployment_id).trim()
    const approverOneId = stringArg(args.approver_one_id).trim()
    const approverTwoId = stringArg(args.approver_two_id).trim()
    const valid = Boolean(deploymentId && approverOneId && approverTwoId && approverOneId !== approverTwoId)
    const result = valid
      ? {
          deployment_id: deploymentId,
          status: "approval_requested",
          approvers: [approverOneId, approverTwoId],
          note: "Demo request only; no identity provider or notification service is connected.",
        }
      : {
          deployment_id: deploymentId || null,
          status: "manual_hold",
          reason: "A deployment ID and two distinct approver identities are required.",
        }
    return jsonRpc(body.id, toolResult(result, !valid))
  }

  if (toolName === "evaluate_deployment_gate") {
    const decision = evaluateGate({
      deploymentId: stringArg(args.deployment_id),
      riskScore: scoreArg(args.risk_score),
      driftScore: scoreArg(args.drift_score),
      signatureValid: args.signature_valid === true,
      attestationValid: args.attestation_valid === true,
      regressionPassed: args.regression_passed === true,
      approverOneId: stringArg(args.approver_one_id),
      approverOneApproved: args.approver_one_approved === true,
      approverTwoId: stringArg(args.approver_two_id),
      approverTwoApproved: args.approver_two_approved === true,
    })
    return jsonRpc(body.id, toolResult(decision, decision.status === "manual_hold"))
  }

  if (toolName === "place_manual_hold") {
    const deploymentId = stringArg(args.deployment_id).trim()
    const reason = stringArg(args.reason).trim()
    if (!deploymentId || !reason) {
      return jsonRpc(body.id, toolResult({ status: "manual_hold", reason: "Deployment ID and hold reason are required." }, true))
    }
    return jsonRpc(body.id, toolResult({
      deployment_id: deploymentId,
      status: "manual_hold",
      reason,
      next_action: "Authorized human review",
    }))
  }

  return jsonRpcError(body.id, -32602, `Unknown tool: ${toolName}`)
}
