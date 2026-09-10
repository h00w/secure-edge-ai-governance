# Adoption checklist

Before adapting the playground to a production environment, verify:

- identities are authenticated and authorized by a real identity provider;
- approver separation is enforced server-side;
- artifact signatures are verified against trusted roots;
- TPM/TEE attestation evidence is validated against expected measurements;
- release policy is versioned, tested, and auditable;
- rollout is staged with health criteria and stop conditions;
- rollback points are known-good and independently recoverable;
- logs and evidence are durable and tamper-evident;
- MCP or agent tools operate under least privilege;
- production secrets are managed outside application source code.

The public repository demonstrates governance semantics and testable release controls; it does not claim these production integrations are already complete.
