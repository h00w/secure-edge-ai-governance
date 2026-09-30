export type GateInputs = {
  deploymentId: string
  evidenceDeploymentId: string
  artifactSha256: string
  evidenceArtifactSha256: string
  riskScore: number
  driftScore: number
  signatureValid: boolean
  attestationValid: boolean
  regressionPassed: boolean
  approverOneId: string
  approverOneApproved: boolean
  approverTwoId: string
  approverTwoApproved: boolean
}

export type GateDecision = {
  status: "approved" | "manual_hold"
  reasons: string[]
  policyVersion: string
  evaluatedAt: string
}

export const POLICY_VERSION = "edge-governance-v1.0"

export function evaluateGate(
  input: GateInputs,
  evaluatedAt = new Date().toISOString()
): GateDecision {
  const reasons: string[] = []
  const approverOneId = input.approverOneId.trim()
  const approverTwoId = input.approverTwoId.trim()

  if (!input.deploymentId.trim()) reasons.push("Deployment identity is missing")
  if (!input.evidenceDeploymentId.trim() || input.evidenceDeploymentId.trim() !== input.deploymentId.trim()) {
    reasons.push("Evidence is not bound to this deployment identity")
  }
  const artifactDigest = input.artifactSha256?.trim().toLowerCase() ?? ""
  const evidenceDigest = input.evidenceArtifactSha256?.trim().toLowerCase() ?? ""
  if (!/^[0-9a-f]{64}$/.test(artifactDigest) || evidenceDigest !== artifactDigest) {
    reasons.push("Evidence artifact SHA-256 does not match the candidate artifact")
  }
  if (!approverOneId || !approverTwoId) reasons.push("Both approver identities are required")
  if (approverOneId && approverOneId === approverTwoId) {
    reasons.push("Approvers must be two distinct identities")
  }
  if (!input.approverOneApproved || !input.approverTwoApproved) {
    reasons.push("Two-person approval is incomplete")
  }
  if (!Number.isFinite(input.riskScore) || input.riskScore < 0 || input.riskScore > 30) reasons.push("Risk score must be finite and within the policy threshold of 0–30")
  if (!Number.isFinite(input.driftScore) || input.driftScore < 0 || input.driftScore > 25) reasons.push("Drift score must be finite and within the policy threshold of 0–25")
  if (!input.signatureValid) reasons.push("Bundle signature is invalid")
  if (!input.attestationValid) reasons.push("Device attestation is invalid")
  if (!input.regressionPassed) reasons.push("Qualification regression gate failed")

  return {
    status: reasons.length === 0 ? "approved" : "manual_hold",
    reasons,
    policyVersion: POLICY_VERSION,
    evaluatedAt,
  }
}
