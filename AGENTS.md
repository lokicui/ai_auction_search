# AGENTS.md

## Cursor Cloud specific instructions

This repository (`ai_auction_search`) is currently a greenfield project with no source code, dependencies, or build infrastructure. The only file is `README.md`.

### Current state

- **No programming language or framework** has been chosen yet.
- **No package manager, dependency files, or lock files** exist.
- **No services, databases, or external dependencies** are configured.
- **No lint, test, or build commands** are available.

### When code is added

Once source code and dependency files are added, future agents should:

1. Identify the package manager from lock files (`package-lock.json` → npm, `yarn.lock` → yarn, `pnpm-lock.yaml` → pnpm, `requirements.txt`/`pyproject.toml` → pip/uv, etc.).
2. Install dependencies accordingly.
3. Check `README.md` or any new documentation for build/run/test instructions.
4. Update the VM environment setup script via `SetupVmEnvironment` to include the correct dependency install command.
