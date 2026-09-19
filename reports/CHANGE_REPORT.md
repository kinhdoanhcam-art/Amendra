# Amendra — inherited v1.2 change and verification report

> Historical evidence: this report predates the name-only v1.3 source change.

## Result

The v1.2 source is ready for a fresh StudioNet deployment. Local checks pass,
but the semantic correction is not yet a runtime PASS because the exact source
has not been evaluated by real GenVM model consensus.

The v1.1 runtime exposed one semantic defect: diagnostic K3 finalized
successfully but returned `RETRACTION_CLEAR` instead of the committed expected
`RETRACTION_NONE`. Transaction:
`0x19105a2265b795fa774154b9aa3003fe9c7f996ebd87397460a2ef56f7a2b504`.

## Exact source change

The rubric now applies two ordered gates:

1. Determine whether the new text clearly performs a communicative act that
   revokes the cited assertion itself as the author's position.
2. Only after that act exists, determine whether it covers the cited statement
   completely.

A correction, narrowing, replacement, supersession, or logical inconsistency
does not by itself establish retraction. No specific keyword or syntax is
required. The production prompt does not quote K1, K2, K3, or their expected
answers.

Metadata changed from version 1.1 / `2026-09-v1.1` to version 1.2 /
`2026-09-v1.2` so cached semantic decisions cannot cross prompt versions.

## Preserved contract surface

- Depends header and GenVM runner
- Constructor and storage annotations
- All 9 public method signatures: 6 read, 3 write
- Authorization and terminal-state rules
- Input, workspace, statement, attempt, and page limits
- Cache scope and text normalization
- Validator callback and strict verdict parsing
- One model invocation per participating node
- Existing error messages and state-transition behavior

Automated structural comparison confirms that reversing only
`PROMPT_VERSION`, the rubric block, and `get_config().version` restores the v1.1
source exactly.

## Executed checks

| Check | Actual | Status |
|---|---:|---|
| Normalized v1.2 SHA-256 | `0a08c1964258cd0e959a510ef7446a36bcfd71ed85ab4c47dff46d655c730c8e` | PASS |
| Python parse/compile | Exact source | PASS |
| Production-source tests | 35/35, including 250 seeded state-machine operations | PASS |
| Mutation suite | 13/13 mutants killed | PASS |
| Public signatures vs v1.1 | Equal | PASS |
| Storage annotations vs v1.1 | Equal | PASS |
| Approved-scope reverse reconstruction | Exact v1.1 bytes | PASS |
| GenVM linter/SDK validation | 9 methods; 6 read, 3 write; constructor 0 args | PASS |
| Linter warnings | 6 W020 missing read return annotations, unchanged from v1.1 | ACCEPTED |

Baseline normalized v1.1 SHA-256:
`ad5c27fbbf7452c33cf035022e5688174ebe29baf212784322c7ee0e0e3c69ea`.

## Gates still required

- GenVM schema generation for the exact v1.2 bytes
- Fresh deployment on StudioNet chain ID 61999
- Finalized `get_config()` evidence
- Authorization/refusal probes with unchanged-state evidence
- Fixed K2 NONE, K3 NONE, K1 CLEAR sequence without rerolls
- Duplicate-cache and terminal-latch probes
- Deployed-source normalized SHA parity

The schema-for-code call was attempted locally but blocked before transmission
because sending the complete source to `studio.genlayer.com` requires explicit
approval. No v1.2 source bytes were sent by that attempt.

## Deployment rule

For historical v1.2 reproduction, deploy the original audited source without
editing it. For the current project, deploy `contract/Amendra.py`. Run one critical
transaction at a time and stop on any mismatch. A finalized transaction is not
semantic proof by itself; compare the authoritative verdict and post-state with
the committed expectations. Do not rerun a mismatched semantic vector in search
of a favorable result.
