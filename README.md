# RWA Readiness Radar — Avalanche Edition

Turn fragmented RWA evidence into a **reviewable readiness report**, then publish a **versioned proof** on Avalanche.

> Research-assisted draft. Manual review required.  
> Scores are analyst opinions — not investment advice.

---

## At a glance

| | |
|---|---|
| **What it does** | Structures evidence → scores readiness → hashes report → publishes version on-chain |
| **Network** | Avalanche Fuji C-Chain (testnet) |
| **Registry** | [`0x14Dd58b6ae69631Bb9caa88A094Ed1F07F6505C5`](https://testnet.snowtrace.io/address/0x14Dd58b6ae69631Bb9caa88A094Ed1F07F6505C5#code) |
| **Stack** | React · Vite · wagmi/viem · Hardhat |

---

## Quick start

```bash
bun install
cp .env.example .env.local   # optional — see below
bun run dev                  # http://localhost:5173
```

**Environment** (`.env.local`):

```env
VITE_RWA_REGISTRY_ADDRESS=0x14Dd58b6ae69631Bb9caa88A094Ed1F07F6505C5
VITE_FUJI_RPC_URL=           # optional; defaults to public Fuji RPC
```

Leave `VITE_RWA_REGISTRY_ADDRESS` empty to run publication in **simulation mode** (no wallet tx).

**Other commands:**

```bash
bun run build
bun run test          # 188 frontend tests
bun run lint
cd contracts && npm test   # 42 contract tests
```

---

## User flows

| Flow | Path | What happens |
|------|------|--------------|
| **Quick Scan** | `/quick-scan` | Paste project URL + evidence links → opens structured draft in wizard |
| **Load Demo** | `/assess` | Fictional project with scores, evidence, and version history |
| **Manual Assessment** | `/submit` | Full 9-step wizard from scratch |

Explorer sample projects are **fictional demonstration data**, not live evaluations.

---

## How it works

```
Evidence  →  9-step wizard  →  Analyst review  →  Evidence-adjusted scores
    →  Canonical JSON  →  keccak256 hash  →  Publish on Fuji  →  Versioned registry entry
```

**Two scoring layers**

1. **Trust Foundation** (40%) — legal, custody, backing, redemption, compliance, issuer, contracts, liquidity  
2. **Market Readiness** (60%) — supply, distribution, utility  

Evidence status caps how high a dimension can score (verified 100% → missing 25%). Caps limit overconfidence; they do not verify truth.

Full methodology is documented in-app at `/methodology` and `/architecture`.

---

## What on-chain publication proves

| Proves | Does not prove |
|--------|----------------|
| Report hash at publish time | Evidence documents are truthful |
| Publisher wallet | Asset is safe or investable |
| Block timestamp | Reserves actually exist |
| Version number | Analyst independence |

The registry stores **report integrity metadata** — not token contracts for assessed RWAs.

---

## Project layout

```
src/           React app (pages, scoring, wallet, publish flow)
contracts/     RWAReadinessRegistry.sol + Hardhat tests + Fuji deploy scripts
```

Key paths:

- `src/utils/canonical-report.ts` — deterministic serialization + keccak256
- `src/hooks/usePublishReport.ts` — publication state machine
- `src/config/scoring.ts` — weights, caps, grade bands
- `contracts/deployments/fuji.json` — public deployment record

---

## Security notes

- Private keys stay in the wallet — never in the frontend
- `DEPLOYER_PRIVATE_KEY` belongs in `contracts/.env` only, never in `VITE_*`
- `.env.local` and `contracts/.env` are gitignored

---

## Demo limitations

- Fuji testnet only (not mainnet)
- Manual evidence review — no live feeds or AI due diligence
- No public registry indexer yet (planned)
- Simulation mode without registry address in `.env.local`

---

## Disclaimer

This is a **research and structuring tool**. On-chain proof shows *when* and *by whom* a report hash was published — not whether the underlying RWA claims are correct.

---

## Author

**[xbpkdi](https://github.com/xbpkdi)**