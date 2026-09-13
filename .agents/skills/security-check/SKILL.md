---
name: security-check
description: Run canpark's complete local security scan when asked to check the repository for secrets, vulnerable dependencies, configuration issues, or production image vulnerabilities.
---

# Security Check

Run the repository-owned security workflow from the repository root:

```sh
./scripts/security-check.sh full
```

Use `pre-commit`, `pre-push`, `pre-merge`, or `pre-deploy` instead of `full` when the user asks to validate a specific lifecycle gate. The Git hooks use those same modes; Pull Request CI remains the authoritative pre-merge gate for CodeQL and the production image.

Report which scan failed and summarize its actionable findings. Do not change dependencies, configuration, or source code unless the user separately asks for remediation.

The command requires Git and Docker but must not install host libraries or additional CLIs. It uses digest-pinned Gitleaks and Trivy container images and removes its temporary image archive and locally built scan image when it exits.
