# Amendra v1.3 verification

Verification target:
`0x6518B4908588f40dE74C6B43f8bA4aB42131D327` on GenLayer StudioNet,
chain ID `61999`.

## Source and build checks

| Check | Result |
|---|---|
| Contract Python syntax | PASS |
| Public surface | PASS — 3 write and 6 read methods |
| Normalized local/deployed source SHA-256 | PASS |
| Finalized `get_config()` | PASS — `Amendra`, `1.3`, `2026-09-v1.2` |
| ESLint | PASS |
| Next.js production build | PASS |

Normalized source SHA-256:
`f2c60f80d0994bcc0a3194d99b61868089295649e57bbe192ee32c7f8a2a0f53`.

## Live StudioNet scenario

All write operations used the same wallet, which owned both workspace `1` and
statement `1`.

### 1. Workspace creation

- Method: `create_workspace()`
- Result: finalized and accepted
- Created workspace: `1`

### 2. Statement registration

- Method: `register_statement(1, statement_text)`
- Statement ID: `1`
- Text:

```text
Amendra will publish the complete audit report on 30 September 2026.
```

- Result: finalized and accepted
- Post-state: statement `1` was `ACTIVE`

### 3. Incomplete retraction

- Method: `submit_retraction(1, 1, retraction_text)`
- Text:

```text
The audit report might be published one day later.
```

- Verdict: `RETRACTION_NONE`
- Post-state: statement `1` remained `ACTIVE`
- Attempt count: `1`

This text changes timing but does not clearly withdraw the complete cited
assertion.

### 4. Complete retraction

- Method: `submit_retraction(1, 1, retraction_text)`
- Text:

```text
I fully and unconditionally retract the entire statement that Amendra will publish the complete audit report on 30 September 2026.
```

- Verdict: `RETRACTION_CLEAR`
- Post-state: statement `1` became `RETRACTED`
- Attempt count: `2`

### 5. Finalized ledger read

| Field | Final value |
|---|---:|
| Workspace ID | 1 |
| Statements | 1 |
| Active statements | 0 |
| Retracted statements | 1 |
| Retraction attempts | 2 |
| Attempt 1 | `RETRACTION_NONE` |
| Attempt 2 | `RETRACTION_CLEAR` |

The ledger preserved both attempts and linked the terminal statement state to
attempt `2`. This verifies the required `NONE → CLEAR → RETRACTED` transition
on the deployed v1.3 contract without rerunning either semantic input.

## Explorer evidence

- Contract:
  <https://explorer-studio.genlayer.com/address/0x6518B4908588f40dE74C6B43f8bA4aB42131D327>
- Deployment transaction:
  `0xcdf68e12bb2d1bd037eca33c07c2b962df777b27f64fd4d359222aa4961d5c09`
