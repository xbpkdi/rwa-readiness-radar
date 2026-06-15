# RWA Readiness Radar — Avalanche Edition

**A learning project on Avalanche** — explore how to anchor RWA readiness reports on-chain with versioned, reviewable proof on Fuji.

**Live demo:** [https://rwa-readiness-radar.vercel.app](https://rwa-readiness-radar.vercel.app)

> **Side project for learning.** Built in ~1.5 days to experiment with Avalanche wallet flows, contract deployment, and on-chain report anchoring — not a production due-diligence product.  
> Research-assisted draft. Manual review required. Not investment advice.

---

## Why Avalanche?

RWAs need more than a PDF and a spreadsheet — analysts need a **reproducible trail** when scores or evidence change.

Avalanche is a practical place to try that:

- **Fast, low-cost C-Chain** — good for publishing compact proof snapshots on **Fuji testnet** while learning
- **EVM-compatible** — MetaMask, viem/wagmi, Hardhat — same tooling many RWA teams already use
- **Public audit trail** — a wallet publishes a report hash, scores, and version; anyone can verify on [Snowtrace](https://testnet.snowtrace.io)
- **Version history per project** — v1, v2, v3… without rewriting the whole workflow

This app is an experiment in that pattern: **off-chain structured assessment → canonical hash → on-chain registry on Avalanche**.

---

## What is this?

RWA Readiness Radar is a web app prototype for evaluating **tokenized real-world assets (RWAs)** — with the Avalanche layer as the proof anchor.

It walks through:

1. Collect project and evidence inputs in a structured form  
2. Score readiness across **11 dimensions** (trust + market)  
3. Apply **evidence-aware caps** so weak proof cannot score too high  
4. Serialize a **canonical report** and hash it with keccak256  
5. Publish the hash to **`RWAReadinessRegistry`** on **Avalanche Fuji** with version history  

The on-chain record proves **report integrity and publication provenance on Avalanche** — not that the asset itself is safe or the evidence is true.

---

## What I was trying to learn

Roughly **1.5 days** of hands-on exploration:

| Topic | What this repo practices |
|-------|--------------------------|
| Avalanche Fuji | Deploy + verify a registry contract on testnet |
| Wallet UX | MetaMask connect, chain check (43113), publish flow |
| On-chain proof | Store report hash + scores + version — not the full report |
| Canonical hashing | Stable JSON → keccak256 so hashes are reproducible |
| Trust boundaries | Be explicit about what chain proof does *not* mean |

If you're learning Avalanche + RWAs the same way, the code and in-app `/architecture` page are meant to be readable starting points.

---

## Features

### Assessment (off-chain)

- **Quick Scan** — project URL + evidence links → structured draft (`/quick-scan`)
- **Manual Assessment** — full wizard from scratch (`/submit`)
- **Load Demo Project** — fictional end-to-end sample (`/assess`)
- **9-step wizard** — metadata, legal, custody, backing, distribution, utility, evidence, scoring
- **Evidence-adjusted scoring** — verified / partial / manual review / missing caps per dimension
- **Two-layer model** — Trust Foundation (40%) + Market Readiness (60%)

### Avalanche publication & verification

- **Wallet publish flow** — MetaMask on Avalanche Fuji (`/publish`)
- **Canonical report → keccak256** — same content → same hash (via viem)
- **On-chain registry** — project ID, report hash, grade, version, publisher, block timestamp
- **Version timeline** — v1, v2, … per project slug on Fuji
- **Simulation mode** — full UX without registry address in `.env.local`

### Explorer & docs

- **Project explorer** — fictional sample profiles (`/explore`)
- **Methodology** — scoring weights, caps, grades (`/methodology`)
- **Architecture** — system design and Avalanche trust boundaries (`/architecture`)

### Smart contract on Avalanche Fuji

| | |
|---|---|
| **Network** | Avalanche Fuji C-Chain · chain ID `43113` |
| **Registry** | [`0x14Dd58b6ae69631Bb9caa88A094Ed1F07F6505C5`](https://testnet.snowtrace.io/address/0x14Dd58b6ae69631Bb9caa88A094Ed1F07F6505C5#code) |
| **Contract** | `RWAReadinessRegistry.sol` — report hash registry, not an RWA token |
| **Tests** | 42 Hardhat tests (publish, version, duplicates, fuzz) |

Contract details: [`contracts/README.md`](contracts/README.md)

---

## How it works (Avalanche path)

```
Evidence input
  → Structured assessment (wizard)
  → Analyst review & scoring
  → Evidence-adjusted scores
  → Canonical JSON → keccak256 hash
  → Wallet signs tx on Avalanche Fuji
  → Immutable version in RWAReadinessRegistry
  → Verifiable on Snowtrace
```

**Scoring layers**

- **Trust Foundation** — legal clarity, custody, backing, redemption, compliance, issuer, smart contracts, liquidity  
- **Market Readiness** — supply, distribution, utility  

Detail: in-app `/methodology` or `src/config/scoring.ts`.

---

## What Avalanche publication proves

| Proves on Fuji | Does not prove |
|----------------|----------------|
| Which report hash was published | Evidence documents are truthful |
| Which wallet published (`msg.sender`) | Asset is safe or investable |
| Block timestamp | Reserves exist on-chain |
| Monotonic version per project | Analyst is independent or qualified |

---

## Quick start

**Prerequisites:** Node.js 20+, npm, MetaMask (optional — for live Fuji publish)

```bash
npm install
cp .env.example .env.local
npm run dev          # http://localhost:5173
```

**.env.local** (Avalanche Fuji)

```env
VITE_RWA_REGISTRY_ADDRESS=0x14Dd58b6ae69631Bb9caa88A094Ed1F07F6505C5
VITE_FUJI_RPC_URL=           # optional — defaults to public Fuji RPC
```

```bash
npm run build
npm test                   # 188 frontend tests
npm run lint
cd contracts && npm test   # 42 contract tests
```

Deployment secrets (`DEPLOYER_PRIVATE_KEY`, etc.) go in `contracts/.env` only — never in `VITE_*`.

---

## Tech stack

React 19 · Vite · TypeScript · Tailwind CSS · wagmi/viem · Hardhat · Avalanche Fuji

---

## Project layout

```
src/           React app — pages, scoring, wallet, Avalanche publish flow
contracts/     RWAReadinessRegistry, Hardhat tests, Fuji deploy scripts
```

Notable files: `src/utils/canonical-report.ts`, `src/hooks/usePublishReport.ts`, `contracts/deployments/fuji.json`

---

## Current limitations

- **Fuji testnet only** — no mainnet deployment  
- **Learning prototype** — ~1.5 days of scope; not audited for production  
- Explorer projects are **fictional demos**  
- **Manual** evidence review — no AI due diligence or live data feeds  
- No public registry indexer yet  
- Simulation mode when registry address is unset  

---

## Disclaimer

Structured analyst opinions — not credit ratings or financial advice. On-chain proof on Avalanche anchors **report integrity and version history**, not the truth of underlying RWA claims.

---

## Author

**[xbpkdi](https://github.com/xbpkdi)** — built to learn Avalanche + RWA proof patterns.