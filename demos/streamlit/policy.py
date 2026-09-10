from dataclasses import dataclass
from datetime import datetime, timezone

POLICY_VERSION = "edge-governance-v1.0"
RISK_THRESHOLD = 30
DRIFT_THRESHOLD = 25


@dataclass(frozen=True)
class GateInput:
    deployment_id: str
    risk_score: float
    drift_score: float
    signature_valid: bool
    attestation_valid: bool
    regression_passed: bool
    approver_one_id: str
    approver_one_approved: bool
    approver_two_id: str
    approver_two_approved: bool


def evaluate_gate(value: GateInput) -> dict:
    reasons: list[str] = []
    approver_one = value.approver_one_id.strip()
    approver_two = value.approver_two_id.strip()

    if not value.deployment_id.strip():
        reasons.append("Deployment identity is missing")
    if not approver_one or not approver_two:
        reasons.append("Both approver identities are required")
    if approver_one and approver_one == approver_two:
        reasons.append("Approvers must be two distinct identities")
    if not value.approver_one_approved or not value.approver_two_approved:
        reasons.append("Two-person approval is incomplete")
    if value.risk_score > RISK_THRESHOLD:
        reasons.append(f"Risk score exceeds the policy threshold of {RISK_THRESHOLD}")
    if value.drift_score > DRIFT_THRESHOLD:
        reasons.append(f"Drift score exceeds the policy threshold of {DRIFT_THRESHOLD}")
    if not value.signature_valid:
        reasons.append("Bundle signature is invalid")
    if not value.attestation_valid:
        reasons.append("Device attestation is invalid")
    if not value.regression_passed:
        reasons.append("Qualification regression gate failed")

    return {
        "status": "approved" if not reasons else "manual_hold",
        "reasons": reasons,
        "policy_version": POLICY_VERSION,
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
    }
