# Amendra Intelligent Contract

## Deployment

- Network: GenLayer StudioNet
- Chain ID: `61999`
- Source file: `contract/Amendra.py`
- Contract class: `Amendra`
- Public name: `Amendra`
- Contract version: `1.3`
- Prompt version: `2026-09-v1.2`
- Address: `0x6518B4908588f40dE74C6B43f8bA4aB42131D327`
- Explorer:
  <https://explorer-studio.genlayer.com/address/0x6518B4908588f40dE74C6B43f8bA4aB42131D327>
- Deployment transaction:
  `0xcdf68e12bb2d1bd037eca33c07c2b962df777b27f64fd4d359222aa4961d5c09`
- Deployment status: `FINALIZED`
- Normalized source SHA-256:
  `f2c60f80d0994bcc0a3194d99b61868089295649e57bbe192ee32c7f8a2a0f53`

The normalized hash of the deployed source and the repository source is
identical. The zero-argument constructor initializes an empty ledger.

## State model

Each workspace records its creator and independent counters for statements,
active statements, retracted statements, and retraction attempts. Statements
and attempts are append-only records.

A statement begins as `ACTIVE`. It becomes `RETRACTED` only when validator
consensus returns `RETRACTION_CLEAR`; the successful attempt ID is stored on the
statement. `RETRACTION_NONE` records the attempt without changing the statement
status.

## Authorization and limits

- Only the workspace creator may register a statement in that workspace.
- Only the original statement author may submit its retraction.
- A retracted statement cannot be retracted again.
- Identical normalized retraction text cannot be evaluated twice for the same
  workspace and statement.
- Maximum statements per workspace: `100`.
- Maximum retraction attempts per workspace: `200`.
- Maximum statement length: `3000` characters.
- Maximum retraction length: `3000` characters.

## Public interface

The contract exposes three write methods and six read methods. Paginated list
reads accept a one-based starting ID and a bounded item count.

| Type | Method |
|---|---|
| Write | `create_workspace()` |
| Write | `register_statement(workspace_id, statement_text)` |
| Write | `submit_retraction(workspace_id, statement_id, retraction_text)` |
| Read | `get_config()` |
| Read | `get_workspace(workspace_id)` |
| Read | `get_statement(workspace_id, statement_id)` |
| Read | `get_attempt(workspace_id, attempt_id)` |
| Read | `get_statements(workspace_id, from_id, count)` |
| Read | `get_attempts(workspace_id, from_id, count)` |
