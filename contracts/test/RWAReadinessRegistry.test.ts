import { expect } from 'chai'
import { ethers } from 'hardhat'
import { loadFixture, time } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { RWAReadinessRegistry } from '../typechain-types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ZERO_BYTES32 = ethers.ZeroHash

function projectId(slug: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(slug))
}

function reportHash(content: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(content))
}

const PROJ_A = projectId('project-alpha')
const PROJ_B = projectId('project-beta')
const HASH_1 = reportHash('report content v1')
const HASH_2 = reportHash('report content v2')
const HASH_3 = reportHash('report content v3')
const HASH_B = reportHash('project beta report v1')

// Default valid snapshot args
const SNAP = {
  trustScore: 80,
  supplyScore: 75,
  distributionScore: 70,
  utilityScore: 65,
  overallReadinessScore: 74,
  grade: 2, // B
  version: 1,
}

// ─── Fixture ─────────────────────────────────────────────────────────────────

async function deployFixture() {
  const [owner, analyst1, analyst2, stranger] = await ethers.getSigners()
  const Registry = await ethers.getContractFactory('RWAReadinessRegistry')
  const registry = (await Registry.deploy()) as unknown as RWAReadinessRegistry
  return { registry, owner, analyst1, analyst2, stranger }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('RWAReadinessRegistry', () => {

  // ── Successful publication ──────────────────────────────────────────────

  describe('publishReport — successful publication', () => {
    it('publishes version 1 without error', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await expect(
        registry.connect(analyst1).publishReport(
          PROJ_A, HASH_1,
          SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
          SNAP.overallReadinessScore, SNAP.grade, SNAP.version,
        )
      ).to.not.be.reverted
    })

    it('emits ReportPublished with correct fields', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      const ts = await time.latest()
      await time.setNextBlockTimestamp(ts + 1)

      const tx = await registry.connect(analyst1).publishReport(
        PROJ_A, HASH_1,
        SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
        SNAP.overallReadinessScore, SNAP.grade, SNAP.version,
      )
      const receipt = await tx.wait()
      const block = await ethers.provider.getBlock(receipt!.blockNumber)

      await expect(tx)
        .to.emit(registry, 'ReportPublished')
        .withArgs(
          PROJ_A, HASH_1, analyst1.address, 1,
          SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
          SNAP.overallReadinessScore, SNAP.grade,
          BigInt(block!.timestamp),
        )
    })

    it('records publisher as msg.sender', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await registry.connect(analyst1).publishReport(
        PROJ_A, HASH_1,
        SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
        SNAP.overallReadinessScore, SNAP.grade, SNAP.version,
      )
      const snap = await registry.getSnapshot(PROJ_A, 1)
      expect(snap.publisher).to.equal(analyst1.address)
    })

    it('records timestamp from block.timestamp', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      const nextTs = (await time.latest()) + 100
      await time.setNextBlockTimestamp(nextTs)
      await registry.connect(analyst1).publishReport(
        PROJ_A, HASH_1,
        SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
        SNAP.overallReadinessScore, SNAP.grade, SNAP.version,
      )
      const snap = await registry.getSnapshot(PROJ_A, 1)
      expect(snap.publishedAt).to.equal(BigInt(nextTs))
    })

    it('latestVersion becomes 1 after first publication', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await registry.connect(analyst1).publishReport(
        PROJ_A, HASH_1,
        SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
        SNAP.overallReadinessScore, SNAP.grade, SNAP.version,
      )
      expect(await registry.latestVersion(PROJ_A)).to.equal(1)
    })

    it('getLatestSnapshot matches published data', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await registry.connect(analyst1).publishReport(
        PROJ_A, HASH_1,
        SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
        SNAP.overallReadinessScore, SNAP.grade, SNAP.version,
      )
      const snap = await registry.getLatestSnapshot(PROJ_A)
      expect(snap.projectId).to.equal(PROJ_A)
      expect(snap.reportHash).to.equal(HASH_1)
      expect(snap.trustScore).to.equal(SNAP.trustScore)
      expect(snap.supplyScore).to.equal(SNAP.supplyScore)
      expect(snap.distributionScore).to.equal(SNAP.distributionScore)
      expect(snap.utilityScore).to.equal(SNAP.utilityScore)
      expect(snap.overallReadinessScore).to.equal(SNAP.overallReadinessScore)
      expect(snap.grade).to.equal(SNAP.grade)
      expect(snap.version).to.equal(1)
    })

    it('getSnapshot by version matches published data', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await registry.connect(analyst1).publishReport(
        PROJ_A, HASH_1,
        SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
        SNAP.overallReadinessScore, SNAP.grade, SNAP.version,
      )
      const snap = await registry.getSnapshot(PROJ_A, 1)
      expect(snap.reportHash).to.equal(HASH_1)
    })

    it('allows score of 0 for all dimensions', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await expect(
        registry.connect(analyst1).publishReport(
          PROJ_A, HASH_1,
          0, 0, 0, 0, 0, 4, 1,
        )
      ).to.not.be.reverted
    })

    it('allows score of 100 for all dimensions', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await expect(
        registry.connect(analyst1).publishReport(
          PROJ_A, HASH_1,
          100, 100, 100, 100, 100, 1, 1,
        )
      ).to.not.be.reverted
    })
  })

  // ── Versioning ──────────────────────────────────────────────────────────

  describe('publishReport — versioning rules', () => {
    it('version 2 succeeds after version 1', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await registry.connect(analyst1).publishReport(
        PROJ_A, HASH_1,
        SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
        SNAP.overallReadinessScore, SNAP.grade, 1,
      )
      await expect(
        registry.connect(analyst1).publishReport(
          PROJ_A, HASH_2,
          SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
          SNAP.overallReadinessScore, SNAP.grade, 2,
        )
      ).to.not.be.reverted
      expect(await registry.latestVersion(PROJ_A)).to.equal(2)
    })

    it('version 3 succeeds after version 2', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      for (const [h, v] of [[HASH_1, 1], [HASH_2, 2]] as const) {
        await registry.connect(analyst1).publishReport(
          PROJ_A, h,
          SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
          SNAP.overallReadinessScore, SNAP.grade, v,
        )
      }
      await expect(
        registry.connect(analyst1).publishReport(
          PROJ_A, HASH_3,
          SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
          SNAP.overallReadinessScore, SNAP.grade, 3,
        )
      ).to.not.be.reverted
      expect(await registry.latestVersion(PROJ_A)).to.equal(3)
    })

    it('skipping from 1 to 3 fails with InvalidVersion', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await registry.connect(analyst1).publishReport(
        PROJ_A, HASH_1,
        SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
        SNAP.overallReadinessScore, SNAP.grade, 1,
      )
      await expect(
        registry.connect(analyst1).publishReport(
          PROJ_A, HASH_2,
          SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
          SNAP.overallReadinessScore, SNAP.grade, 3,
        )
      ).to.be.revertedWithCustomError(registry, 'InvalidVersion')
        .withArgs(3, 2)
    })

    it('repeating version 1 fails with InvalidVersion', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await registry.connect(analyst1).publishReport(
        PROJ_A, HASH_1,
        SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
        SNAP.overallReadinessScore, SNAP.grade, 1,
      )
      await expect(
        registry.connect(analyst1).publishReport(
          PROJ_A, HASH_2,
          SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
          SNAP.overallReadinessScore, SNAP.grade, 1,
        )
      ).to.be.revertedWithCustomError(registry, 'InvalidVersion')
        .withArgs(1, 2)
    })

    it('starting with version 0 fails with InvalidVersion', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await expect(
        registry.connect(analyst1).publishReport(
          PROJ_A, HASH_1,
          SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
          SNAP.overallReadinessScore, SNAP.grade, 0,
        )
      ).to.be.revertedWithCustomError(registry, 'InvalidVersion')
        .withArgs(0, 1)
    })

    it('starting with version 2 fails with InvalidVersion', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await expect(
        registry.connect(analyst1).publishReport(
          PROJ_A, HASH_1,
          SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
          SNAP.overallReadinessScore, SNAP.grade, 2,
        )
      ).to.be.revertedWithCustomError(registry, 'InvalidVersion')
        .withArgs(2, 1)
    })
  })

  // ── Input validation ────────────────────────────────────────────────────

  describe('publishReport — input validation', () => {
    it('rejects empty projectId', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await expect(
        registry.connect(analyst1).publishReport(
          ZERO_BYTES32, HASH_1,
          SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
          SNAP.overallReadinessScore, SNAP.grade, 1,
        )
      ).to.be.revertedWithCustomError(registry, 'EmptyProjectId')
    })

    it('rejects empty reportHash', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await expect(
        registry.connect(analyst1).publishReport(
          PROJ_A, ZERO_BYTES32,
          SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
          SNAP.overallReadinessScore, SNAP.grade, 1,
        )
      ).to.be.revertedWithCustomError(registry, 'EmptyReportHash')
    })

    it('rejects trustScore of 101', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await expect(
        registry.connect(analyst1).publishReport(
          PROJ_A, HASH_1,
          101, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
          SNAP.overallReadinessScore, SNAP.grade, 1,
        )
      ).to.be.revertedWithCustomError(registry, 'ScoreOutOfRange').withArgs(101)
    })

    it('rejects supplyScore of 101', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await expect(
        registry.connect(analyst1).publishReport(
          PROJ_A, HASH_1,
          SNAP.trustScore, 101, SNAP.distributionScore, SNAP.utilityScore,
          SNAP.overallReadinessScore, SNAP.grade, 1,
        )
      ).to.be.revertedWithCustomError(registry, 'ScoreOutOfRange').withArgs(101)
    })

    it('rejects distributionScore of 101', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await expect(
        registry.connect(analyst1).publishReport(
          PROJ_A, HASH_1,
          SNAP.trustScore, SNAP.supplyScore, 101, SNAP.utilityScore,
          SNAP.overallReadinessScore, SNAP.grade, 1,
        )
      ).to.be.revertedWithCustomError(registry, 'ScoreOutOfRange').withArgs(101)
    })

    it('rejects utilityScore of 101', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await expect(
        registry.connect(analyst1).publishReport(
          PROJ_A, HASH_1,
          SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, 101,
          SNAP.overallReadinessScore, SNAP.grade, 1,
        )
      ).to.be.revertedWithCustomError(registry, 'ScoreOutOfRange').withArgs(101)
    })

    it('rejects overallReadinessScore of 101', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await expect(
        registry.connect(analyst1).publishReport(
          PROJ_A, HASH_1,
          SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
          101, SNAP.grade, 1,
        )
      ).to.be.revertedWithCustomError(registry, 'ScoreOutOfRange').withArgs(101)
    })

    it('rejects grade 0', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await expect(
        registry.connect(analyst1).publishReport(
          PROJ_A, HASH_1,
          SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
          SNAP.overallReadinessScore, 0, 1,
        )
      ).to.be.revertedWithCustomError(registry, 'InvalidGrade').withArgs(0)
    })

    it('rejects grade 5', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await expect(
        registry.connect(analyst1).publishReport(
          PROJ_A, HASH_1,
          SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
          SNAP.overallReadinessScore, 5, 1,
        )
      ).to.be.revertedWithCustomError(registry, 'InvalidGrade').withArgs(5)
    })

    it('accepts grades 1, 2, 3, 4', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      const hashes = [HASH_1, HASH_2, HASH_3, reportHash('v4')]
      for (let g = 1; g <= 4; g++) {
        await expect(
          registry.connect(analyst1).publishReport(
            projectId(`grade-test-${g}`), hashes[g - 1],
            SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
            SNAP.overallReadinessScore, g, 1,
          )
        ).to.not.be.reverted
      }
    })

    it('rejects duplicate report hash for same project', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await registry.connect(analyst1).publishReport(
        PROJ_A, HASH_1,
        SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
        SNAP.overallReadinessScore, SNAP.grade, 1,
      )
      await expect(
        registry.connect(analyst1).publishReport(
          PROJ_A, HASH_1,
          SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
          SNAP.overallReadinessScore, SNAP.grade, 2,
        )
      ).to.be.revertedWithCustomError(registry, 'DuplicateReportHash')
        .withArgs(PROJ_A, HASH_1)
    })

    it('same report hash for a different project is allowed', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await registry.connect(analyst1).publishReport(
        PROJ_A, HASH_1,
        SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
        SNAP.overallReadinessScore, SNAP.grade, 1,
      )
      // Same hash, different project — allowed (rare but not prohibited globally)
      await expect(
        registry.connect(analyst1).publishReport(
          PROJ_B, HASH_1,
          SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
          SNAP.overallReadinessScore, SNAP.grade, 1,
        )
      ).to.not.be.reverted
    })
  })

  // ── Retrieval ────────────────────────────────────────────────────────────

  describe('retrieval', () => {
    it('latestVersion returns 0 for unknown project', async () => {
      const { registry } = await loadFixture(deployFixture)
      expect(await registry.latestVersion(PROJ_A)).to.equal(0)
    })

    it('getLatestSnapshot reverts for unknown project', async () => {
      const { registry } = await loadFixture(deployFixture)
      await expect(registry.getLatestSnapshot(PROJ_A))
        .to.be.revertedWithCustomError(registry, 'SnapshotNotFound')
        .withArgs(PROJ_A, 0)
    })

    it('getSnapshot reverts for unknown version', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await registry.connect(analyst1).publishReport(
        PROJ_A, HASH_1,
        SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
        SNAP.overallReadinessScore, SNAP.grade, 1,
      )
      await expect(registry.getSnapshot(PROJ_A, 99))
        .to.be.revertedWithCustomError(registry, 'SnapshotNotFound')
        .withArgs(PROJ_A, 99)
    })

    it('two projects maintain independent version sequences', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await registry.connect(analyst1).publishReport(
        PROJ_A, HASH_1,
        SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
        SNAP.overallReadinessScore, SNAP.grade, 1,
      )
      await registry.connect(analyst1).publishReport(
        PROJ_A, HASH_2,
        SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
        SNAP.overallReadinessScore, SNAP.grade, 2,
      )
      await registry.connect(analyst1).publishReport(
        PROJ_B, HASH_B,
        SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
        SNAP.overallReadinessScore, SNAP.grade, 1,
      )
      expect(await registry.latestVersion(PROJ_A)).to.equal(2)
      expect(await registry.latestVersion(PROJ_B)).to.equal(1)
    })

    it('isReportHashUsed returns false before and true after', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      expect(await registry.isReportHashUsed(PROJ_A, HASH_1)).to.equal(false)
      await registry.connect(analyst1).publishReport(
        PROJ_A, HASH_1,
        SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
        SNAP.overallReadinessScore, SNAP.grade, 1,
      )
      expect(await registry.isReportHashUsed(PROJ_A, HASH_1)).to.equal(true)
    })
  })

  // ── Multi-publisher (open registry) ─────────────────────────────────────

  describe('open registry — multiple publishers', () => {
    it('a different wallet can publish version 1 for a new project', async () => {
      const { registry, analyst1, analyst2 } = await loadFixture(deployFixture)
      await registry.connect(analyst1).publishReport(
        PROJ_A, HASH_1,
        SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
        SNAP.overallReadinessScore, SNAP.grade, 1,
      )
      await expect(
        registry.connect(analyst2).publishReport(
          PROJ_B, HASH_B,
          SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
          SNAP.overallReadinessScore, SNAP.grade, 1,
        )
      ).to.not.be.reverted
    })

    /**
     * Open registry: a different wallet CAN publish a later version for the same project.
     * The contract records who published each version.
     * Consumers must evaluate publisher trust independently.
     */
    it('a different wallet can publish version 2 for an existing project (open registry)', async () => {
      const { registry, analyst1, analyst2 } = await loadFixture(deployFixture)
      await registry.connect(analyst1).publishReport(
        PROJ_A, HASH_1,
        SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
        SNAP.overallReadinessScore, SNAP.grade, 1,
      )
      await expect(
        registry.connect(analyst2).publishReport(
          PROJ_A, HASH_2,
          SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
          SNAP.overallReadinessScore, SNAP.grade, 2,
        )
      ).to.not.be.reverted
      const snap = await registry.getSnapshot(PROJ_A, 2)
      expect(snap.publisher).to.equal(analyst2.address)
    })

    it('each version records the specific publisher who called it', async () => {
      const { registry, analyst1, analyst2 } = await loadFixture(deployFixture)
      await registry.connect(analyst1).publishReport(
        PROJ_A, HASH_1,
        SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
        SNAP.overallReadinessScore, SNAP.grade, 1,
      )
      await registry.connect(analyst2).publishReport(
        PROJ_A, HASH_2,
        SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
        SNAP.overallReadinessScore, SNAP.grade, 2,
      )
      const s1 = await registry.getSnapshot(PROJ_A, 1)
      const s2 = await registry.getSnapshot(PROJ_A, 2)
      expect(s1.publisher).to.equal(analyst1.address)
      expect(s2.publisher).to.equal(analyst2.address)
    })
  })

  // ── ETH rejection ────────────────────────────────────────────────────────

  describe('ETH/AVAX rejection', () => {
    it('reverts when AVAX is sent directly to the contract', async () => {
      const { registry, analyst1 } = await loadFixture(deployFixture)
      await expect(
        analyst1.sendTransaction({
          to: await registry.getAddress(),
          value: ethers.parseEther('0.1'),
        })
      ).to.be.reverted
    })
  })

  // ── Fuzz / property tests ────────────────────────────────────────────────

  describe('fuzz / property tests', () => {
    it('scores 0–100 all succeed', async () => {
      const { registry } = await loadFixture(deployFixture)
      const [signer] = await ethers.getSigners()
      const testCases = [0, 1, 50, 99, 100]
      for (const s of testCases) {
        const pid = projectId(`fuzz-score-${s}`)
        const rh = reportHash(`fuzz-score-${s}-v1`)
        await expect(
          registry.connect(signer).publishReport(
            pid, rh, s, s, s, s, s, 1, 1,
          )
        ).to.not.be.reverted
      }
    })

    it('scores above 100 always fail', async () => {
      const { registry } = await loadFixture(deployFixture)
      const [signer] = await ethers.getSigners()
      const invalidScores = [101, 200, 500, 65535]
      for (const s of invalidScores) {
        const pid = projectId(`fuzz-invalid-${s}`)
        const rh = reportHash(`fuzz-invalid-${s}`)
        await expect(
          registry.connect(signer).publishReport(
            pid, rh, s, 50, 50, 50, 50, 1, 1,
          )
        ).to.be.revertedWithCustomError(registry, 'ScoreOutOfRange')
      }
    })

    it('sequential versions succeed up to N', async () => {
      const { registry } = await loadFixture(deployFixture)
      const [signer] = await ethers.getSigners()
      const pid = projectId('fuzz-sequential')
      const N = 5
      for (let v = 1; v <= N; v++) {
        const rh = reportHash(`fuzz-seq-v${v}`)
        await expect(
          registry.connect(signer).publishReport(
            pid, rh,
            SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
            SNAP.overallReadinessScore, SNAP.grade, v,
          )
        ).to.not.be.reverted
      }
      expect(await registry.latestVersion(pid)).to.equal(N)
    })

    it('nonzero projectIds succeed, zero projectId always fails', async () => {
      const { registry } = await loadFixture(deployFixture)
      const [signer] = await ethers.getSigners()
      // Zero always fails
      await expect(
        registry.connect(signer).publishReport(
          ZERO_BYTES32, HASH_1,
          SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
          SNAP.overallReadinessScore, SNAP.grade, 1,
        )
      ).to.be.revertedWithCustomError(registry, 'EmptyProjectId')

      // Various non-zero values succeed
      for (const slug of ['alpha', 'beta', 'gamma']) {
        const pid = projectId(slug)
        const rh = reportHash(`${slug}-v1`)
        await expect(
          registry.connect(signer).publishReport(
            pid, rh,
            SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
            SNAP.overallReadinessScore, SNAP.grade, 1,
          )
        ).to.not.be.reverted
      }
    })

    it('nonzero reportHashes succeed, zero reportHash always fails', async () => {
      const { registry } = await loadFixture(deployFixture)
      const [signer] = await ethers.getSigners()
      await expect(
        registry.connect(signer).publishReport(
          PROJ_A, ZERO_BYTES32,
          SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
          SNAP.overallReadinessScore, SNAP.grade, 1,
        )
      ).to.be.revertedWithCustomError(registry, 'EmptyReportHash')

      // Valid hash succeeds
      await expect(
        registry.connect(signer).publishReport(
          PROJ_A, HASH_1,
          SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
          SNAP.overallReadinessScore, SNAP.grade, 1,
        )
      ).to.not.be.reverted
    })

    it('all valid grades (1–4) succeed, all invalid grades fail', async () => {
      const { registry } = await loadFixture(deployFixture)
      const [signer] = await ethers.getSigners()
      for (let g = 1; g <= 4; g++) {
        const pid = projectId(`grade-fuzz-${g}`)
        const rh = reportHash(`grade-fuzz-${g}`)
        await expect(
          registry.connect(signer).publishReport(
            pid, rh,
            SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
            SNAP.overallReadinessScore, g, 1,
          )
        ).to.not.be.reverted
      }
      for (const g of [0, 5, 10, 255]) {
        const pid = projectId(`invalid-grade-${g}`)
        const rh = reportHash(`invalid-grade-${g}`)
        await expect(
          registry.connect(signer).publishReport(
            pid, rh,
            SNAP.trustScore, SNAP.supplyScore, SNAP.distributionScore, SNAP.utilityScore,
            SNAP.overallReadinessScore, g, 1,
          )
        ).to.be.revertedWithCustomError(registry, 'InvalidGrade')
      }
    })
  })
})
