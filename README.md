# Amendra

**Change the record. Keep the trace.**

Amendra is a GenLayer project for registering public statements, submitting
semantic retractions, and reading the immutable revision trail. The product,
contract file, contract class, and public metadata all use the same name.

## Intelligent Contract

- Network: GenLayer StudioNet
- Chain ID: `61999`
- Source: [`contract/Amendra.py`](contract/Amendra.py)
- Class: `Amendra`
- Contract metadata: `Amendra` v1.3
- Prompt version: `2026-09-v1.2`
- Address: `0x6518B4908588f40dE74C6B43f8bA4aB42131D327`
- Explorer: <https://explorer-studio.genlayer.com/address/0x6518B4908588f40dE74C6B43f8bA4aB42131D327>
- Deployment transaction:
  `0xcdf68e12bb2d1bd037eca33c07c2b962df777b27f64fd4d359222aa4961d5c09`
- Normalized source SHA-256:
  `f2c60f80d0994bcc0a3194d99b61868089295649e57bbe192ee32c7f8a2a0f53`

The deployed source was read directly from StudioNet and matches
`contract/Amendra.py` after CRLF/LF normalization. Its finalized config reports
`Amendra` version `1.3` with an empty initial workspace ledger.

## Product flow

1. Connect an EVM-compatible wallet on StudioNet.
2. Create a creator-owned workspace.
3. Register the exact wording of a public statement.
4. Submit a semantic retraction for validator consensus.
5. Inspect the finalized statements, attempts, verdicts, and terminal status.

Amendra supports all three contract write methods and all six read methods
through the live interface. Reads use the latest finalized state.

## Local development

```text
cp .env.example .env.local
pnpm dev
pnpm build
```

The app uses Next.js, React, TypeScript, Tailwind CSS, the GenLayer JavaScript
SDK, and the StudioNet JSON-RPC endpoint. No private key or wallet credential is
stored in the project.

## Submission evidence

- [`docs/CONTRACT.md`](docs/CONTRACT.md) records the deployed contract, source
  checksum, network, and deployment transaction.
- [`docs/TESTING.md`](docs/TESTING.md) records the local and StudioNet runtime
  verification results.
- [`docs/GITHUB.md`](docs/GITHUB.md) lists exactly what to upload and exclude.

The submission bundle includes the renamed `contract/Amendra.py` source and
the full verification reports.
