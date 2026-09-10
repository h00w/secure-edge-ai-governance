# Security review checklist

Use this checklist when reviewing a contribution that changes release-control semantics.

- Does the change preserve fail-closed behavior?
- Can one identity satisfy both approval roles?
- Can an agent/tool call bypass policy evaluation?
- Is every security-relevant input bound to the intended deployment ID/artifact?
- Are invalid or missing signature and attestation evidence rejected?
- Are threshold comparisons explicit and covered at boundary values?
- Are regression failures blocking?
- Is the manual-hold reason actionable and auditable?
- Are rollback assumptions documented?
- Does the change introduce secrets, privileged credentials, or unsafe defaults?

Behavioral changes should include tests for both the allowed path and at least one negative path.
