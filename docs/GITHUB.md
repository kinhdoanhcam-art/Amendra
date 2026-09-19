# GitHub upload checklist

Upload the repository root while preserving the directory structure.

Required directories:

- `app/` — application interface
- `components/` — reusable UI controls
- `contract/` — GenLayer Intelligent Contract source
- `docs/` — contract and testing documentation
- `lib/` — shared utilities
- `public/` — favicon and public assets
- `reports/` — verification evidence

Required root files:

- `.env.example`
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

Do not commit generated or local-only data:

- `node_modules/`
- `.next/`, `out/`, `dist/`
- `.env`, `.env.local`
- `coverage/`, `__pycache__/`, `*.pyc`
- ZIP archives and OS metadata

Commit `.env.example`, but never commit a real `.env.local` or wallet secret.
