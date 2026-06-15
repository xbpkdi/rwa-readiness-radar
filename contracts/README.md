# RWAReadinessRegistry — Contract Workspace

Hardhat (TypeScript) workspace for the RWA Readiness Registry smart contract deployed on Avalanche Fuji C-Chain.

---

## What this contract does

`RWAReadinessRegistry` is an open proof-of-publication registry. It stores compact, versioned snapshots of RWA readiness reports on-chain.

**It proves:**
- A specific wallet published specific scores and a report hash at a specific block time.
- The report content has not changed since publication (integrity via keccak256 hash).
- A monotonically increasing version sequence exists per project.

**It does not prove:**
- The underlying report is accurate.
- The publisher is a qualified analyst.
- The real-world asset is safe or high quality.
- Evidence documents are genuine.

An on-chain snapshot proves that a wallet published specific scores and a report hash at a particular time. It does not prove the truth of the underlying report or the quality of the publisher.

---

## Stored data

Each snapshot (`ReportSnapshot` struct) contains:

| Field | Type | Description |
|---|---|---|
| `projectId` | `bytes32` | keccak256 of lowercase project slug |
| `reportHash` | `bytes32` | keccak256 of canonical report JSON |
| `trustScore` | `uint16` | Trust Foundation score 0–100 |
| `supplyScore` | `uint16` | Supply Readiness score 0–100 |
| `distributionScore` | `uint16` | Distribution Readiness score 0–100 |
| `utilityScore` | `uint16` | Utility Readiness score 0–100 |
| `overallReadinessScore` | `uint16` | Weighted overall score 0–100 |
| `grade` | `uint8` | Encoded grade 1–4 (see below) |
| `version` | `uint32` | Monotonically increasing per project |
| `publisher` | `address` | msg.sender — wallet that called publishReport |
| `publishedAt` | `uint64` | block.timestamp at publication |

---

## Grade encoding

| Contract value | Grade label | Overall score range |
|---|---|---|
| 0 | Unrated / invalid | Never stored |
| 1 | A | 85–100 |
| 2 | B | 70–84 |
| 3 | C | 50–69 |
| 4 | D | 0–49 |

---

## Event fields

```solidity
event ReportPublished(
    bytes32 indexed projectId,
    bytes32 indexed reportHash,
    address indexed publisher,
    uint32 version,
    uint16 trustScore,
    uint16 supplyScore,
    uint16 distributionScore,
    uint16 utilityScore,
    uint16 overallReadinessScore,
    uint8 grade,
    uint64 publishedAt
);
```

The three indexed fields support efficient log filtering by project, by report hash, or by publisher.

---

## Versioning model

- First publication for a project must use `version = 1`.
- Each subsequent publication must use `version = latestVersion + 1`.
- Gaps (e.g., 1 → 3) are rejected with `InvalidVersion`.
- Repeats are rejected with `InvalidVersion`.
- Duplicate report hashes for the same project are rejected with `DuplicateReportHash`.

---

## Open publisher model

Publication is open — any wallet may publish a snapshot for any project.

- The publisher wallet is always recorded and visible.
- The contract does not imply that any publisher is a verified analyst.
- Consumers must evaluate the credibility of the publisher independently.
- A future analyst identity or reputation layer can be added in a separate contract without modifying this registry.

**Trust implication:** Because the registry is open, a different wallet can publish a later version for an existing project. The UI must display the publisher wallet prominently so users can distinguish authorized from unauthorized publishers.

---

## Project ID derivation

```
projectIdBytes32 = keccak256(UTF-8 bytes of trim(slug).toLowerCase())
```

Example: `keccak256("meridian-tbill-fund")` → `0x...`

The frontend `deriveProjectId(slug)` function in `src/utils/contract-encoding.ts` applies the same rule using viem.

---

## Custom errors

| Error | Trigger |
|---|---|
| `EmptyProjectId` | projectId is zero bytes32 |
| `EmptyReportHash` | reportHash is zero bytes32 |
| `ScoreOutOfRange(score)` | Any score argument > 100 |
| `InvalidGrade(grade)` | grade is 0 or > 4 |
| `InvalidVersion(provided, expected)` | Version is not latestVersion + 1 (or 1 for first) |
| `SnapshotNotFound(projectId, version)` | Read request for non-existent snapshot |
| `DuplicateReportHash(projectId, reportHash)` | Same reportHash already used for this project |

---

## Local development

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run all tests (42 tests)
npm test

# Gas usage report
npm run test:gas

# Coverage report
npm run coverage

# Export ABI to frontend
npm run export-abi

# Clean build artifacts
npm run clean
```

---

## Environment variables

Copy `.env.example` to `.env` and fill in real values before deploying.

```text
FUJI_RPC_URL=           # Avalanche Fuji RPC endpoint
DEPLOYER_PRIVATE_KEY=   # Wallet private key (without 0x prefix)
FUJI_EXPLORER_API_KEY=  # Snowtrace API key for verification
```

**Never commit `.env`.** It is in `.gitignore`.

---

## Fuji deployment

### Prerequisites

1. Fund your deployer wallet with Fuji test AVAX:
   - Faucet: https://faucet.avax.network/
   - Minimum: ~0.5 AVAX for deployment

2. Create `contracts/.env` with your values (never commit this file).

3. Ensure all tests pass:
   ```bash
   npm test
   ```

### Deploy

```bash
npm run deploy:fuji
```

The script will:
- Print the deployer address and balance
- Deploy `RWAReadinessRegistry`
- Confirm bytecode exists at the deployed address
- Write `deployments/fuji.json` with the address and transaction hash
- Print the frontend env variable to copy

### After deployment

Copy the contract address into the frontend environment:

```bash
# In rwa-readiness-radar-app/.env.local (create if it doesn't exist):
VITE_RWA_REGISTRY_ADDRESS=0x<deployed address>
```

---

## Contract verification

After deployment, verify on Snowtrace (wait ~30 seconds for indexing):

```bash
npm run verify:fuji -- --contract src/RWAReadinessRegistry.sol:RWAReadinessRegistry <deployed address>
```

Requires `FUJI_EXPLORER_API_KEY` to be set in `.env`.

No constructor arguments are needed (the contract has no constructor parameters).

---

## ABI export

The ABI is auto-generated from compiled artifacts and written to `src/contracts/RWAReadinessRegistry.abi.ts`.

Regenerate after recompiling:

```bash
npm run compile && npm run export-abi
```

Do not edit the ABI file by hand.

---

## Security limitations

- **Open registry**: Any wallet can publish any project. The contract does not prevent spam or misinformation.
- **No content validation**: The contract does not verify that reportHash corresponds to a real or accurate report.
- **No publisher verification**: The publisher address is recorded but its credentials are not checked.
- **No upgradeability**: The contract cannot be updated after deployment. A new deployment produces a new address.
- **No funds**: The contract has no payable functions and rejects AVAX sent directly.
- **No access control**: There is no owner, pauser, or admin role in the MVP.

---

## Future roadmap (not in this phase)

- Analyst identity registry: a separate contract mapping addresses to verified analyst credentials.
- Publisher reputation scores: off-chain or on-chain reputation computed from publication history.
- Dispute mechanism: allow flagging of potentially inaccurate reports.
- Frontend wallet integration (Phase 5): wagmi/viem hooks for publishing reports from the browser.
