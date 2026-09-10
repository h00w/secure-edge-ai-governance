from policy import GateInput, evaluate_gate


def valid_input(**overrides):
    base = dict(
        deployment_id="edge-model-1",
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
