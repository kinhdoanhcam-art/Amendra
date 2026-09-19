# Amendra verification summary

## Frontend

- Production build: PASS
- Desktop visual and interaction QA: PASS
- Live StudioNet `get_config` read: PASS
- Project address source parity: PASS
- Wallet actions expose all three write methods: PASS
- Ledger exposes all six read methods: PASS

The project deployment is intentionally clean (`workspace_count = 0`). Write
transactions are initiated only after the visitor connects an EVM-compatible
wallet on StudioNet.

## Amendra v1.3 rename verification

- Python parse/compile: PASS
- Public method signatures: unchanged from v1.2
- Storage fields and annotations: unchanged from v1.2
- Semantic prompt: unchanged from v1.2
- Name-only source changes: file, class, public name, and contract version
- Fresh StudioNet deployment: PASS
- Deployment transaction finalized: PASS
- Deployed/local normalized SHA-256 parity: PASS
- Finalized config (`Amendra`, `1.3`, `2026-09-v1.2`): PASS

The verified v1.3 address is
`0x6518B4908588f40dE74C6B43f8bA4aB42131D327`. The deployed source matches
`contract/Amendra.py` exactly after CRLF/LF normalization.

## v1.2 semantic baseline

The semantic logic inherited by v1.3 was previously exercised on a dedicated
StudioNet verification instance:

- Runtime address: `0xAF9dCdCCF2aC2B3b5820A20b4e79f29D786Ac7b6`
- Production-source tests: 35/35 PASS
- Seeded state-machine operations: 250 PASS
- Mutation suite: 13/13 killed
- GenVM surface validation: 9 methods, 6 read, 3 write
- StudioNet transactions: 16/16 finalized
- Semantic gates: partial withdrawal NONE, replacement wording NONE, complete
  withdrawal CLEAR
- Authorization, invalid-input, duplicate, and terminal-state refusal gates:
  PASS with unchanged state

Explorer evidence:
<https://explorer-studio.genlayer.com/address/0xAF9dCdCCF2aC2B3b5820A20b4e79f29D786Ac7b6>

These results are historical evidence for the unchanged semantic logic. They
must not be presented as byte-for-byte runtime proof for the renamed v1.3 file.
