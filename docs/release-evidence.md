# Release Evidence

A production release should be backed by evidence, not only a successful build.

## Minimum release packet

- Artifact identity, digest, and provenance
- Test and evaluation results
- Security and policy-gate results
- Device or target compatibility evidence
- Approval records for sensitive transitions
- Rollout strategy and rollback criteria
- Known risks and accepted exceptions

Evidence should be immutable or tamper-evident where practical and linked to the exact artifact being released.

The demo gate requires the evidence deployment ID and artifact SHA-256 to match the candidate. Evidence for artifact A cannot authorize artifact B even when both claim the same deployment ID. These are supplied fields: the demo compares them but does not hash binaries or verify a cryptographic signature. A production verifier must compute the candidate digest and authenticate the evidence source before applying this policy.
