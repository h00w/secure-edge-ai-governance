import json
import streamlit as st

from policy import GateInput, evaluate_gate, RISK_THRESHOLD, DRIFT_THRESHOLD

st.set_page_config(page_title="Secure Edge AI Governance", page_icon="🛡️", layout="wide")

st.title("Secure Edge AI Governance Playground")
st.caption("Two-person approval · deterministic gates · attestation · rollback-oriented governance")

with st.sidebar:
    st.header("Policy")
    st.write(f"Risk threshold: ≤ {RISK_THRESHOLD}")
    st.write(f"Drift threshold: ≤ {DRIFT_THRESHOLD}")
    st.write("Two distinct approvals required")
    st.write("Signature, attestation and regression evidence must pass")
    st.info("Demo policy is fail-closed: any failed or missing evidence produces manual_hold.")

left, right = st.columns([1, 1])

with left:
    st.subheader("1. Deployment evidence")
    deployment_id = st.text_input("Deployment ID", "edge-model-2026.09.1")
    risk_score = st.slider("Risk score", 0, 100, 18)
    drift_score = st.slider("Drift score", 0, 100, 12)
    signature_valid = st.checkbox("Bundle signature valid", True)
    attestation_valid = st.checkbox("Device attestation valid", True)
    regression_passed = st.checkbox("Qualification regression passed", True)

    st.subheader("2. Human governance")
    approver_one_id = st.text_input("Approver 1", "security-owner")
    approver_one_approved = st.checkbox("Approver 1 approved", True)
    approver_two_id = st.text_input("Approver 2", "operations-owner")
    approver_two_approved = st.checkbox("Approver 2 approved", True)

    evaluate = st.button("Evaluate deployment gate", type="primary", use_container_width=True)

with right:
    st.subheader("3. Governance decision")
    if evaluate:
        decision = evaluate_gate(
            GateInput(
                deployment_id=deployment_id,
                risk_score=risk_score,
                drift_score=drift_score,
                signature_valid=signature_valid,
                attestation_valid=attestation_valid,
                regression_passed=regression_passed,
                approver_one_id=approver_one_id,
                approver_one_approved=approver_one_approved,
                approver_two_id=approver_two_id,
                approver_two_approved=approver_two_approved,
            )
        )

        c1, c2, c3 = st.columns(3)
        c1.metric("Decision", decision["status"])
        c2.metric("Risk", risk_score)
        c3.metric("Drift", drift_score)

        if decision["status"] == "approved":
            st.success("Deployment gate approved. All configured evidence and governance checks passed.")
        else:
            st.error("Manual hold. One or more mandatory governance checks failed.")
            st.markdown("### Hold reasons")
            for reason in decision["reasons"]:
                st.write("•", reason)

        st.markdown("### Evidence summary")
        evidence = {
            "deployment_id": deployment_id,
            "risk_score": risk_score,
            "drift_score": drift_score,
            "signature_valid": signature_valid,
            "attestation_valid": attestation_valid,
            "regression_passed": regression_passed,
            "approver_one_id": approver_one_id,
            "approver_one_approved": approver_one_approved,
            "approver_two_id": approver_two_id,
            "approver_two_approved": approver_two_approved,
        }
        st.json(evidence)

        with st.expander("Decision record", expanded=True):
            st.code(json.dumps(decision, indent=2), language="json")
    else:
        st.info("Adjust the evidence and approvals, then evaluate the deployment gate.")

st.divider()
st.markdown("""
### Try these reviewer scenarios

1. **Approved release** — keep all defaults and evaluate.
2. **High-risk hold** — move Risk score above 30.
3. **Attestation failure** — clear Device attestation valid.
4. **Separation-of-duties failure** — use the same identity for both approvers.
5. **Incomplete governance** — clear either approval checkbox.

This Streamlit surface reproduces the same governance rule as the TypeScript playground for portfolio demonstration. It is intentionally deterministic and does not claim to perform real TPM attestation, HSM signing, identity verification, or deployment execution.
""")
