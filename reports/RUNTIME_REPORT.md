# Amendra — inherited v1.2 StudioNet runtime baseline

> Historical evidence: this report was produced before the class was renamed
> to `Amendra`. Its semantic results apply to unchanged logic, but its deployed
> source hash is not the renamed v1.3 source hash.

## Verdict

**PASS.** The exact v1.2 source was deployed on StudioNet and completed the
committed runtime sequence without a semantic mismatch or reroll.

- Address: `0xAF9dCdCCF2aC2B3b5820A20b4e79f29D786Ac7b6`
- Explorer: <https://explorer-studio.genlayer.com/address/0xAF9dCdCCF2aC2B3b5820A20b4e79f29D786Ac7b6>
- Chain ID: `61999`
- Deployment transaction: `0x81fd63e9a8d12538d150c48a0666a523f29bd8088718b5770a6ff92a0dcaf223`
- Normalized deployed/local SHA-256:
  `0a08c1964258cd0e959a510ef7446a36bcfd71ed85ab4c47dff46d655c730c8e`
- Source parity after runtime: exact after CRLF/LF normalization
- Config: version `1.2`, prompt version `2026-09-v1.2`
- Schema: 9 methods, 6 read, 3 write, constructor 0 arguments

All 16 address transactions visible in the final RPC read were `FINALIZED`:
one deployment and 15 runtime transactions.

## Semantic gates

| Gate | Expected | Actual state verdict | Statement after | Transaction | Status |
|---|---|---|---|---|---|
| K2 partial withdrawal | `RETRACTION_NONE` | `RETRACTION_NONE` | `ACTIVE` | `0x9a6ec332a408c6e9f8c2656ea0a8aabde305b11c66cf7b2e4c9fc31209028a2d` | PASS |
| K3 replacement wording | `RETRACTION_NONE` | `RETRACTION_NONE` | `ACTIVE` | `0x55a6454cfef9aeb45ca83cf62496f2519a2781878c5fc786e3ad19c4fccdb8ff` | PASS |
| K1 complete withdrawal | `RETRACTION_CLEAR` | `RETRACTION_CLEAR` | `RETRACTED` | `0x0d1f424dacf4d8ebb9c1cd683ab3ceeae6a706e1c78855d415dffe966b2c2e16` | PASS |

K3 is the vector that v1.1 classified incorrectly. Its first and only v1.2
execution returned `RETRACTION_NONE`; it was not rerun to seek a favorable
result.

## State and refusal gates

| Gate | Authoritative result | Transaction | Status |
|---|---|---|---|
| Create workspace | `SUCCESS` | `0x8402d323e2f54f1081047b3863b0f0b29bc104bc8d1f7f01166e9eff23ac4328` | PASS |
| Register statement | `SUCCESS` | `0x81ea2e193387142ae21afca4b59393311822c21613b910537446140345dbf3d6` | PASS |
| Outsider register | `Only the workspace creator may register statements` | `0xd0861e14b825320835922505674b25f51ea8dfd8a613839fb95162a2d6a60e71` | PASS |
| Outsider retract | `Only the original author may retract this statement` | `0xdfe426d7f259ed4d2455a35ea383ee0903a385a0c74d0a7e10f133806a690fa4` | PASS |
| Invalid statement | `Invalid statement id` | `0xb4b81bb54144a8083c772d4e26d31599290929bc97f86b1187a965bbc820706a` | PASS |
| Empty statement | `Statement cannot be empty` | `0xbeb8ccfa27012f24139bfcdcb0a3b341049aa02496918b1e92c585dbf42a7242` | PASS |
| Empty retraction | `Retraction text cannot be empty` | `0xd6daa47ccb483c051f5d530dce7f34c377eb3f85a75f9b40151f39913e6d7c25` | PASS |
| Sanitized-empty retraction | `Retraction text has no evaluable content` | `0xab3cb3e3b3da4fdf3437b18730223ae24a85536c47c3294164d069d9e6ba4318` | PASS |
| Exact duplicate | `Identical retraction text was already evaluated for this statement` | `0x3aeefbbb8785f16e4451735d53f51e93ada30e5423d72d02831ea4f0b2959608` | PASS |
| Whitespace duplicate | Same duplicate refusal | `0x2277cf8d06b21c66570dcc5b0a1897ce925dedbfe50fff8543e85be588dcca21` | PASS |
| Tagged/fence duplicate | Same duplicate refusal | `0xab1f13f24f2064520e705317af3acb43cafab61f97c1df07201ce7e4d67cbee5` | PASS |
| Replay after retraction | `Statement is already retracted` | `0xc2866acf6597075225325dbf79fa020bf32f477e73e87a573c03a953e6a14b44` | PASS |

Every expected refusal was checked against complete before/after workspace,
statement, and attempt reads. No refusal changed contract state.

## Final state

- Workspace ID: `1`
- Statements: `1`
- Attempts: `3`
- Active statements: `0`
- Retracted statements: `1`
- Statement 1: `RETRACTED`, linked to attempt 3
- Attempt 1 / K2: `RETRACTION_NONE`
- Attempt 2 / K3: `RETRACTION_NONE`
- Attempt 3 / K1: `RETRACTION_CLEAR`

## Execution note

After the workspace transaction finalized, one RPC post-state read was
temporarily blocked by a tunnel `403`. The harness had already persisted the
transaction hash, so it resumed by confirming that same finalized transaction;
it did not submit a replacement. This was an infrastructure interruption, not a
contract or semantic failure.

The local verification remains PASS: 35/35 production-source tests, a
250-operation seeded state machine, 13/13 killed mutations, and GenVM linter
validation of the exact source.
