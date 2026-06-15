# RWA Readiness Radar — Avalanche Edition

Evidence-linked RWA readiness assessment with reviewable evidence-adjusted scoring and versioned publication on Avalanche.

---

## Problem

Tokenized real-world assets arrive with claims — legal structure, custody arrangements, redemption terms, DeFi utility. Institutional due diligence on these claims is fragmented, unversioned, and hard to audit. Reports are created in private, updated silently, and impossible to compare over time.

## Solution

RWA Readiness Radar structures analyst evidence into a deterministic canonical report, applies evidence-aware scoring across eleven dimensions, hashes the result with keccak256, and anchors that hash to an immutable Avalanche registry. Every publication is timestamped, versioned, and linked to the publishing wallet. Any party can re-hash the report and verify it against the on-chain record.

---

## How it works

```
Evidence input
  → Structured assessment (9-step wizard)
  → Analyst review and scoring
  → Evidence-adjusted scores
  → Canonical report serialization
  → keccak256 report hash
  → Avalanche Fuji publication
  → Immutable version entry in registry
```

---

## Current user flows

### Quick Scan
Supply a project URL and evidence links. The system organizes supplied information into a structured research draft that opens in the assessment wizard. No AI due diligence is performed — URLs are not independently verified. All dimensions default to 0 and require manual analyst input before publication.

### Load Demo Project
Loads a fictional demonstration assessment with realistic evidence links, scores, and version history. Explore the full scoring, hashing, and publication flow without real data.

### Manual Assessment
Complete the nine-step form wizard from scratch. Enter project metadata, legal details, custody links, backing, distribution, utility, evidence links, and score each dimension individually.

---

## Trust Foundation and Market Readiness

### Trust Foundation (40% of overall score)

Eight dimensions totaling 100 points:

| Dimension | Max |
|-----------|-----|
| Legal Clarity | 15 |
| Custody Transparency | 15 |
| Asset Backing | 15 |
| Redemption Process | 10 |
| Compliance | 15 |
| Issuer Credibility | 10 |
| Smart Contract Transparency | 10 |
| Liquidity Risk | 10 |

### Market Readiness (60% of overall score)

| Dimension | Weight |
|-----------|--------|
| Supply Readiness | 20% |
| Distribution Readiness | 20% |
| Utility Readiness | 20% |

---

## Evidence-adjusted scoring

Every scored dimension has an associated evidence status. The status applies a cap:

| Evidence status | Cap | Effect on max-20 dimension |
|----------------|-----|---------------------------|
| Verified | 100% | max 20 |
| Partial | 70% | max 14 |
| Manual review | 50% | max 10 |
| Missing | 25% | max 5 |

**Formula:**
```
maximumAllowedScore = floor(maximumScore × evidenceCap)
adjustedScore = min(rawScore, maximumAllowedScore)
```

Caps reduce unsupported confidence. They do not prove the evidence is accurate.

---

## Canonical report and keccak256

Every submitted report is serialized into a deterministic canonical JSON payload and hashed with keccak256 via viem. The same meaningful content always produces the same hash.

**Canonicalization rules:**
- Object keys sorted alphabetically at every level
- Strings trimmed; `\r\n` normalized to `\n`
- URLs normalized (lowercase scheme and host)
- Ethereum addresses lowercased
- `undefined` values excluded
- Evidence array sorted by dimension, title, id
- Risk flags sorted by severity, category, id
- `evidenceIds` sorted alphanumerically

**What changes the hash:**
Any meaningful field — project name, issuer, legal summary, evidence links, raw scores, evidence status, adjusted scores, risk flags, analyst notes, schema version, or report version.

**What does not change the hash:**
Object key insertion order, leading or trailing whitespace, `\r\n` vs `\n`, URL scheme casing, or re-rendering the UI without editing content.

---

## Avalanche publication

The platform publishes to a verified registry contract on Avalanche Fuji C-Chain.

**Network:** Avalanche Fuji C-Chain  
**Chain ID:** 43113  
**Registry contract:** `0x14Dd58b6ae69631Bb9caa88A094Ed1F07F6505C5`  
**Verified source:** https://testnet.snowtrace.io/address/0x14Dd58b6ae69631Bb9caa88A094Ed1F07F6505C5#code

The registry is the publication registry for readiness reports. It is not the token contract of any assessed RWA.

### What on-chain publication proves

- Which report was published (by hash)
- Who published it (wallet address)
- When it was published (block timestamp)
- The report version
- Whether the published report content was later changed

### What it does not prove

- That the underlying evidence documents are truthful
- That the asset is safe, legitimate, or investable
- That reserves are actually present
- That the analyst is independent or competent

---

## Local development

```bash
bun install
bun run dev        # development server at http://localhost:5173
bun run build      # production build
bun run test       # Vitest unit tests
bun run lint       # ESLint
```

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in the required values.

```
VITE_RWA_REGISTRY_ADDRESS=   # deployed registry address
VITE_FUJI_RPC_URL=           # optional; defaults to public Avalanche Fuji endpoint
```

Without `VITE_RWA_REGISTRY_ADDRESS`, the publication flow runs in simulation mode. No blockchain transaction is sent.

Contract deployment secrets (`DEPLOYER_PRIVATE_KEY`, `FUJI_EXPLORER_API_KEY`) belong in `contracts/.env` only and must never be placed in `VITE_` variables.

---

## Testing

```bash
# Frontend unit tests
bun run test

# Contract tests
cd contracts && npm test
```

Frontend tests cover:
- Canonical report serialization and determinism
- keccak256 hashing
- Evidence-aware scoring calculations
- Contract argument encoding
- Error decoding
- Event parsing
- Navigation and shell configuration
- Home page content accuracy
- Readiness dashboard data integrity

Contract tests cover registry publication, versioning, duplicate detection, and error conditions on Hardhat.

---

## Project structure

```
src/
  app/router.tsx                   — route configuration
  config/
    contracts.ts                   — chain ID, registry address, explorer URLs
    scoring.ts                     — weights, dimension maximums, evidence caps, grade bands
  domain/types.ts                  — all TypeScript types
  utils/
    canonical-report.ts            — canonicalize, serialize, keccak256 hash
    scoring.ts                     — evidence-aware scoring functions
    contract-encoding.ts           — project ID derivation
    contract-errors.ts             — contract error decoding
    event-parsing.ts               — ReportPublished event extraction
  services/
    report-hash.ts                 — thin wrapper over hashCanonicalReport
    publication.placeholder.ts     — demo simulation when registry not configured
  context/
    ReportDraftContext.tsx          — draft and report hash stored in sessionStorage
  hooks/
    usePublishReport.ts             — publication state machine
    useRegistryReads.ts             — on-chain version and snapshot queries
    useWalletConnection.ts          — wallet address, network, connection state
  pages/
    Landing.tsx                    — home page with command center visualization
    Assess.tsx                     — assessment mode selection
    QuickScan.tsx                  — evidence link intake form
    Submit.tsx                     — 9-step assessment wizard
    Publish.tsx                    — publication flow with all states
    Explore.tsx                    — demo project browser
    ProjectDetail.tsx              — project detail with version history
    Methodology.tsx                — scoring methodology documentation
    Architecture.tsx               — system architecture documentation
  contracts/
    RWAReadinessRegistry.abi.ts    — ABI for the deployed registry

contracts/
  src/RWAReadinessRegistry.sol     — registry contract source
  test/                            — Hardhat tests
  script/deploy.ts                 — Fuji deployment script
  deployments/fuji.json            — public Fuji deployment metadata
```

---

## Demo limitations

- Projects shown in the Explorer are fictional examples created for demonstration
- Public registry indexing is planned for a future release
- Evidence verification is manual — no automated real-time monitoring or live data feeds
- No AI due-diligence provider is integrated
- Deployment targets Avalanche Fuji testnet, not mainnet
- Simulation mode is active when `VITE_RWA_REGISTRY_ADDRESS` is not configured

---

## Security

- Private keys never enter the frontend
- No secrets are stored in `VITE_` variables
- Wallet signing occurs entirely in MetaMask
- `.env.local` and `contracts/.env` are excluded from version control
- The registry contract is verified on Snowtrace

---

## Roadmap

- Public registry indexing and search
- Automated evidence link validation
- Multi-analyst workflows
- Mainnet deployment
- IPFS or Arweave evidence archival
- Verification UI for independent report confirmation

---

## Disclaimer

This platform is a research tool. Scores are structured analyst opinions, not investment ratings, credit ratings, or financial advice. On-chain publication proves report integrity and version history — it does not guarantee the accuracy of the underlying evidence or the quality of the asset.

---

## Author

**xbpkdi** — https://github.com/xbpkdi
