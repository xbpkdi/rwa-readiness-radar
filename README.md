# RWA Readiness Radar — Avalanche Edition

**Research-assisted RWA readiness assessment** — structure evidence, score with caps, hash the report, publish a versioned proof on Avalanche.

**Live demo:** [https://rwa-readiness-radar.vercel.app](https://rwa-readiness-radar.vercel.app)

> Research-assisted draft. Manual review required.  
> Not investment advice.

---

## What is this?

RWA Readiness Radar is a web app for evaluating **tokenized real-world assets (RWAs)** before institutions or analysts treat them as market-ready.

It helps you:

1. Collect project and evidence inputs in a structured form  
2. Score readiness across **11 dimensions** (trust + market)  
3. Apply **evidence-aware caps** so weak proof cannot score too high  
4. Serialize a **canonical report** and hash it with keccak256  
5. Publish the hash to an **on-chain registry** on Avalanche Fuji with version history  

The on-chain record proves **report integrity and publication provenance** — not that the asset itself is safe or the evidence is true.

---

## Why it exists

RWA due diligence is usually:

- scattered across PDFs, websites, and internal notes  
- updated without a clear version trail  
- hard for a third party to audit or reproduce  

This project turns that workflow into something **reviewable and reproducible**:

| Problem | How this app helps |
|---------|-------------------|
| Unstructured evidence | 9-step wizard + evidence links per dimension |
| Scores without proof | Evidence status caps limit unsupported confidence |
| Silent report changes | Canonical JSON → deterministic keccak256 hash |
| No public audit trail | Versioned entries in `RWAReadinessRegistry` on Fuji |

---

## Features

### Assessment

- **Quick Scan** — project URL + evidence links → structured draft (`/quick-scan`)
- **Manual Assessment** — full wizard from scratch (`/submit`)
- **Load Demo Project** — fictional end-to-end sample (`/assess`)
- **9-step wizard** — metadata, legal, custody, backing, distribution, utility, evidence, scoring
- **Evidence-adjusted scoring** — verified / partial / manual review / missing caps per dimension
- **Two-layer model** — Trust Foundation (40%) + Market Readiness (60%)
- **Risk flags & analyst notes** — captured in the canonical report

### Publication & verification

- **Canonical report serialization** — stable key order, normalized URLs and addresses
- **keccak256 report hash** — same content → same hash (via viem)
- **Wallet publish flow** — MetaMask on Avalanche Fuji (`/publish`)
- **Simulation mode** — full UX without registry address in `.env.local`
- **On-chain registry** — project ID, report hash, grade, version, publisher, timestamp
- **Version timeline** — v1, v2, … per project slug

### Explorer & documentation

- **Project explorer** — browse fictional sample profiles (`/explore`)
- **Project detail** — scores, radar chart, evidence table, version history
- **Methodology** — scoring weights, caps, grades (`/methodology`)
- **Architecture** — system design and trust boundaries (`/architecture`)
- **Home command center** — illustrative readiness dashboard (demo data)

### Smart contract (Fuji)

| | |
|---|---|
| **Network** | Avalanche Fuji C-Chain · chain ID `43113` |
| **Registry** | [`0x14Dd58b6ae69631Bb9caa88A094Ed1F07F6505C5`](https://testnet.snowtrace.io/address/0x14Dd58b6ae69631Bb9caa88A094Ed1F07F6505C5#code) |
| **Contract** | `RWAReadinessRegistry.sol` — report hash registry, not an RWA token |
| **Tests** | 42 Hardhat tests (publish, version, duplicates, fuzz) |

---

## How it works

```
Evidence input
  → Structured assessment (wizard)
  → Analyst review & scoring
  → Evidence-adjusted scores
  → Canonical JSON → keccak256 hash
  → Publish on Avalanche Fuji
  → Immutable version in registry
```

**Scoring layers**

- **Trust Foundation** — legal clarity, custody, backing, redemption, compliance, issuer, smart contracts, liquidity  
- **Market Readiness** — supply, distribution, utility  

Detail: in-app `/methodology` or `src/config/scoring.ts`.

---

## What on-chain publication proves

| Proves | Does not prove |
|--------|----------------|
| Which report hash was published | Evidence documents are truthful |
| Who published (wallet) | Asset is safe or investable |
| When (block time) | Reserves exist on-chain |
| Version number | Analyst is independent |

---

## Quick start

```bash
bun install
cp .env.example .env.local
bun run dev          # http://localhost:5173
```

**.env.local**

```env
VITE_RWA_REGISTRY_ADDRESS=0x14Dd58b6ae69631Bb9caa88A094Ed1F07F6505C5
VITE_FUJI_RPC_URL=           # optional
```

```bash
bun run build
bun run test               # 188 frontend tests
bun run lint
cd contracts && npm test   # 42 contract tests
```

Deployment secrets (`DEPLOYER_PRIVATE_KEY`, etc.) go in `contracts/.env` only — never in `VITE_*`.

---

## Project layout

```
src/           React app — pages, scoring, wallet, publish flow
contracts/     Registry contract, Hardhat tests, Fuji deploy scripts
```

Notable files: `src/utils/canonical-report.ts`, `src/hooks/usePublishReport.ts`, `contracts/deployments/fuji.json`

---

## Current limitations

- Fuji **testnet** only  
- Explorer projects are **fictional demos**  
- **Manual** evidence review — no AI due diligence or live data feeds  
- No public registry indexer yet  
- Simulation mode when registry address is unset  

---

## Disclaimer

Structured analyst opinions — not credit ratings or financial advice. On-chain proof anchors **report integrity and version history**, not the truth of underlying RWA claims.

---

## Author

**[xbpkdi](https://github.com/xbpkdi)**