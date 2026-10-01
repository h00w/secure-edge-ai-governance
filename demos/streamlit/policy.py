from dataclasses import dataclass
from datetime import datetime, timezone
from math import isfinite
import re

POLICY_VERSION = "edge-governance-v1.0"
RISK_THRESHOLD = 30
DRIFT_THRESHOLD = 25


@dataclass(frozen=True)
class GateInput:
    deployment_id: str
    evidence_deployment_id: str
    artifact_sha256: str
    evidence_artifact_sha256: str
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
    if not value.evidence_deployment_id.strip() or value.evidence_deployment_id.strip() != value.deployment_id.strip():
        reasons.append("Evidence is not bound to this deployment identity")
    digest = value.artifact_sha256.strip().lower()
    evidence_digest = value.evidence_artifact_sha256.strip().lower()
    if not re.fullmatch(r"[0-9a-f]{64}", digest) or evidence_digest != digest:
        reasons.append("Evidence artifact SHA-256 does not match the candidate artifact")
    if not approver_one or not approver_two:
        reasons.append("Both approver identities are required")
    if approver_one and approver_one.casefold() == approver_two.casefold():
        reasons.append("Approvers must be two distinct identities")
    if value.approver_one_approved is not True or value.approver_two_approved is not True:
        reasons.append("Two-person approval is incomplete")
    if not isfinite(value.risk_score) or not 0 <= value.risk_score <= RISK_THRESHOLD:
        reasons.append(f"Risk score must be finite and within 0–{RISK_THRESHOLD}")
    if not isfinite(value.drift_score) or not 0 <= value.drift_score <= DRIFT_THRESHOLD:
        reasons.append(f"Drift score must be finite and within 0–{DRIFT_THRESHOLD}")
    if value.signature_valid is not True:
        reasons.append("Bundle signature is invalid")
    if value.attestation_valid is not True:
        reasons.append("Device attestation is invalid")
    if value.regression_passed is not True:
        reasons.append("Qualification regression gate failed")

    return {
        "status": "approved" if not reasons else "manual_hold",
        "reasons": reasons,
        "policy_version": POLICY_VERSION,
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
    }
