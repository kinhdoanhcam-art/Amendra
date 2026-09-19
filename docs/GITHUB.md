# GitHub upload checklist

Upload the repository contents while preserving the directory structure.

## Include

Directories:

- `app/` — Next.js application and styles
- `components/` — reusable interface controls
- `contract/` — deployed GenLayer Intelligent Contract source
- `docs/` — deployment, testing, and submission documentation
- `lib/` — shared frontend utilities
- `public/` — public assets

Root files:

- `.gitignore`
- `README.md`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `next.config.ts`
- `next-env.d.ts`
- `postcss.config.mjs`
- `eslint.config.mjs`
- `tsconfig.json`

## Exclude

- `node_modules/`
- `.next/`, `out/`, `dist/`, `coverage/`
- `.env`, `.env.local`, and other secret-bearing environment files
- `__pycache__/`, `*.pyc`, logs, ZIP archives, and OS metadata
- editor settings and local tool metadata

Never commit wallet credentials, seed phrases, private keys, or deployment
secrets. The public contract address in `app/page.tsx` is safe to commit.
