# Amendra

**Change the record. Keep the trace.**

Amendra is an append-only semantic revision ledger built on GenLayer. A wallet
creates a workspace, records the exact wording of a public statement, and may
later submit a retraction for validator consensus. Every attempt remains in the
ledger, whether the verdict is `RETRACTION_NONE` or `RETRACTION_CLEAR`.

## Deployed contract

- Network: GenLayer StudioNet
- Chain ID: `61999`
- Source: [`contract/Amendra.py`](contract/Amendra.py)
- Contract class: `Amendra`
- Contract version: `1.3`
- Prompt version: `2026-09-v1.2`
- Address: `0x6518B4908588f40dE74C6B43f8bA4aB42131D327`
- Explorer: <https://explorer-studio.genlayer.com/address/0x6518B4908588f40dE74C6B43f8bA4aB42131D327>
- Deployment transaction:
  `0xcdf68e12bb2d1bd037eca33c07c2b962df777b27f64fd4d359222aa4961d5c09`
- Normalized source SHA-256:
  `f2c60f80d0994bcc0a3194d99b61868089295649e57bbe192ee32c7f8a2a0f53`

The deployed source matches `contract/Amendra.py` after CRLF/LF
normalization. Finalized `get_config()` reads report `Amendra` version `1.3`
and prompt version `2026-09-v1.2`.

## How it works

1. Connect an EVM-compatible wallet on StudioNet.
2. Create a creator-owned workspace.
3. Register the exact wording of a public statement.
4. Submit a proposed retraction for semantic consensus.
5. Inspect the finalized statement, attempts, verdicts, and terminal status.

Only the workspace creator can register statements in that workspace, and only
the original statement author can retract a statement. A clear, complete
withdrawal changes the statement from `ACTIVE` to `RETRACTED`; corrections,
replacements, ambiguity, and partial withdrawals remain `ACTIVE`.

## Verified live scenario

The current v1.3 deployment was exercised through the production interface:

| Step | Observed result |
|---|---|
| Create workspace `1` | Finalized |
| Register statement `1` | `ACTIVE` |
| Submit an ambiguous timing change | `RETRACTION_NONE` |
| Submit a full unconditional withdrawal | `RETRACTION_CLEAR` |
| Read the final ledger | 1 statement, 2 attempts, 0 active, 1 retracted |

See [`docs/TESTING.md`](docs/TESTING.md) for the exact test text and final
state.

## Public contract interface

Write methods:

- `create_workspace()`
- `register_statement(workspace_id, statement_text)`
- `submit_retraction(workspace_id, statement_id, retraction_text)`

Read methods:

- `get_config()`
- `get_workspace(workspace_id)`
- `get_statement(workspace_id, statement_id)`
- `get_attempt(workspace_id, attempt_id)`
- `get_statements(workspace_id, from_id, count)`
- `get_attempts(workspace_id, from_id, count)`

## Local development

Requirements: Node.js 20+ and pnpm.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Production checks:

```bash
pnpm lint
pnpm build
```

No private key, wallet credential, or environment secret is stored in this
repository. The StudioNet contract address is public and intentionally fixed in
the frontend.

## Documentation

- [`docs/CONTRACT.md`](docs/CONTRACT.md) — contract behavior and deployment
- [`docs/TESTING.md`](docs/TESTING.md) — current v1.3 verification results
- [`docs/GITHUB.md`](docs/GITHUB.md) — repository upload checklist
