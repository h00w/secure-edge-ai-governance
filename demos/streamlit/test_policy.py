from policy import GateInput, evaluate_gate


def test_truthy_non_boolean_evidence_cannot_authorize_release():
    for field in ("signature_valid", "attestation_valid", "regression_passed", "approver_one_approved", "approver_two_approved"):
        for invalid in ("false", 1, None):
            assert evaluate_gate(valid_input(**{field: invalid}))["status"] == "manual_hold"


def valid_input(**overrides):
    base = dict(
        deployment_id="edge-model-1",
        evidence_deployment_id="edge-model-1",
        artifact_sha256="a" * 64,
        evidence_artifact_sha256="a" * 64,
        risk_score=10,
        drift_score=10,
        signature_valid=True,
        attestation_valid=True,
        regression_passed=True,
        approver_one_id="security",
        approver_one_approved=True,
        approver_two_id="operations",
        approver_two_approved=True,
    )
    base.update(overrides)
    return GateInput(**base)


def test_valid_release_is_approved():
    assert evaluate_gate(valid_input())["status"] == "approved"


def test_high_risk_fails_closed():
    decision = evaluate_gate(valid_input(risk_score=31))
    assert decision["status"] == "manual_hold"
    assert any("Risk score" in reason for reason in decision["reasons"])


def test_attestation_failure_holds():
    decision = evaluate_gate(valid_input(attestation_valid=False))
    assert decision["status"] == "manual_hold"
    assert any("attestation" in reason.lower() for reason in decision["reasons"])


def test_same_approver_identity_is_rejected():
    decision = evaluate_gate(valid_input(approver_two_id="security"))
    assert decision["status"] == "manual_hold"
    assert any("distinct" in reason.lower() for reason in decision["reasons"])


def test_case_variant_approver_identity_is_rejected():
    assert evaluate_gate(valid_input(approver_two_id=" SECURITY "))["status"] == "manual_hold"


def test_non_finite_and_negative_scores_hold():
    for overrides in ({"risk_score": float("nan")}, {"drift_score": float("inf")}, {"risk_score": -1}):
        assert evaluate_gate(valid_input(**overrides))["status"] == "manual_hold"


def test_evidence_from_another_deployment_cannot_authorize_candidate():
    decision = evaluate_gate(valid_input(evidence_deployment_id="edge-model-2"))
    assert decision["status"] == "manual_hold"
    assert any("bound" in reason.lower() for reason in decision["reasons"])


def test_artifact_digest_mismatch_or_malformed_digest_holds():
    for overrides in ({"evidence_artifact_sha256": "b" * 64}, {"artifact_sha256": "not-a-digest"}):
        decision = evaluate_gate(valid_input(**overrides))
        assert decision["status"] == "manual_hold"
        assert any("SHA-256" in reason for reason in decision["reasons"])
