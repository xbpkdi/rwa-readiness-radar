// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title RWAReadinessRegistry
 * @notice An open proof-of-publication registry for RWA readiness report snapshots.
 *
 * @dev Records compact, versioned snapshots containing report hashes and scores
 * for tokenized real-world asset (RWA) readiness reports. Each snapshot references
 * a canonical off-chain report payload via its keccak256 hash.
 *
 * WHAT THIS CONTRACT DOES:
 *   - Stores compact report snapshots on-chain for verifiability
 *   - Enforces monotonic version sequencing per project
 *   - Records the publisher wallet and block timestamp automatically
 *   - Enables filtering by project, report hash, and publisher via events
 *
 * WHAT THIS CONTRACT DOES NOT DO:
 *   - Hold user funds or receive deposits
 *   - Issue tokens or tokenize assets
 *   - Validate legal ownership of real-world assets
 *   - Verify that evidence documents are genuine
 *   - Claim that a report score reflects actual asset quality
 *   - Restrict publishing to approved parties (open registry model)
 *   - Store sensitive documents or full research reports
 *   - Provide investment advice
 *
 * GRADE ENCODING:
 *   0 = Unrated / invalid (never stored)
 *   1 = A  (overall score 85–100)
 *   2 = B  (overall score 70–84)
 *   3 = C  (overall score 50–69)
 *   4 = D  (overall score  0–49)
 *
 * PUBLISHER MODEL:
 *   Publication is open. Any wallet may publish a report for any project.
 *   The publisher wallet is always recorded. The contract does not imply
 *   that every publisher is a trusted analyst. Consumers must evaluate
 *   the publisher independently.
 *
 * PROJECT ID:
 *   projectId is derived off-chain as keccak256(UTF-8 bytes of lowercase project slug).
 *   Example: keccak256("meridian-tbill-fund")
 *
 * REPORT HASH:
 *   reportHash is keccak256 of the deterministically serialized canonical report JSON.
 *   It uniquely identifies the off-chain report content at the time of publication.
 */
contract RWAReadinessRegistry {
    // ─── Data types ──────────────────────────────────────────────────────────

    /**
     * @notice A compact on-chain snapshot of an RWA readiness report.
     * @dev Scores are integers in [0, 100]. grade is encoded as 1–4.
     *      publisher and publishedAt are set from msg.sender and block.timestamp.
     */
    struct ReportSnapshot {
        bytes32 projectId;
        bytes32 reportHash;
        uint16 trustScore;
        uint16 supplyScore;
        uint16 distributionScore;
        uint16 utilityScore;
        uint16 overallReadinessScore;
        uint8 grade;
        uint32 version;
        address publisher;
        uint64 publishedAt;
    }

    // ─── Storage ─────────────────────────────────────────────────────────────

    /// @dev projectId => version => snapshot
    mapping(bytes32 => mapping(uint32 => ReportSnapshot)) private _snapshots;

    /// @dev projectId => latest published version (0 means no versions yet)
    mapping(bytes32 => uint32) private _latestVersion;

    /// @dev projectId => version => snapshot exists
    mapping(bytes32 => mapping(uint32 => bool)) private _snapshotExists;

    /// @dev projectId => reportHash => already used for this project
    mapping(bytes32 => mapping(bytes32 => bool)) private _reportHashUsed;

    // ─── Events ──────────────────────────────────────────────────────────────

    /**
     * @notice Emitted on every successful report publication.
     * @param projectId      keccak256 of the lowercase project slug
     * @param reportHash     keccak256 of the canonical report JSON payload
     * @param publisher      wallet that called publishReport
     * @param version        monotonically increasing version (starts at 1)
     * @param trustScore     Trust Foundation score 0–100
     * @param supplyScore    Supply Readiness score 0–100
     * @param distributionScore Distribution Readiness score 0–100
     * @param utilityScore   Utility Readiness score 0–100
     * @param overallReadinessScore Weighted overall score 0–100
     * @param grade          1=A, 2=B, 3=C, 4=D
     * @param publishedAt    block.timestamp at publication
     */
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

    // ─── Custom errors ────────────────────────────────────────────────────────

    /// @notice projectId must not be zero bytes
    error EmptyProjectId();

    /// @notice reportHash must not be zero bytes
    error EmptyReportHash();

    /// @notice A score argument exceeded 100
    /// @param score The invalid score value provided
    error ScoreOutOfRange(uint16 score);

    /// @notice grade must be 1, 2, 3, or 4
    /// @param grade The invalid grade value provided
    error InvalidGrade(uint8 grade);

    /**
     * @notice version must equal latestVersion + 1 (or 1 for first publication)
     * @param provided  version supplied by caller
     * @param expected  version the contract requires
     */
    error InvalidVersion(uint32 provided, uint32 expected);

    /// @notice No snapshot exists for the given projectId and version
    error SnapshotNotFound(bytes32 projectId, uint32 version);

    /// @notice This report hash has already been used for this project
    error DuplicateReportHash(bytes32 projectId, bytes32 reportHash);

    // ─── Publication ─────────────────────────────────────────────────────────

    /**
     * @notice Publish a new versioned readiness report snapshot for a project.
     *
     * @dev Caller's address is recorded as publisher. Block timestamp is recorded.
     *      Caller cannot supply a publisher or timestamp — those are trust-minimized.
     *
     * Version rules:
     *   - First publication for a project must use version 1
     *   - Each subsequent version must equal the previous version + 1
     *   - Gaps and repeats are rejected
     *
     * @param projectId             keccak256(UTF-8 bytes of lowercase project slug)
     * @param reportHash            keccak256 of the canonical report JSON
     * @param trustScore            Trust Foundation score [0, 100]
     * @param supplyScore           Supply Readiness score [0, 100]
     * @param distributionScore     Distribution Readiness score [0, 100]
     * @param utilityScore          Utility Readiness score [0, 100]
     * @param overallReadinessScore Weighted overall readiness score [0, 100]
     * @param grade                 Grade: 1=A, 2=B, 3=C, 4=D
     * @param version               Monotonically increasing version starting at 1
     */
    function publishReport(
        bytes32 projectId,
        bytes32 reportHash,
        uint16 trustScore,
        uint16 supplyScore,
        uint16 distributionScore,
        uint16 utilityScore,
        uint16 overallReadinessScore,
        uint8 grade,
        uint32 version
    ) external {
        // ── Checks ────────────────────────────────────────────────────────────
        if (projectId == bytes32(0)) revert EmptyProjectId();
        if (reportHash == bytes32(0)) revert EmptyReportHash();
        if (trustScore > 100) revert ScoreOutOfRange(trustScore);
        if (supplyScore > 100) revert ScoreOutOfRange(supplyScore);
        if (distributionScore > 100) revert ScoreOutOfRange(distributionScore);
        if (utilityScore > 100) revert ScoreOutOfRange(utilityScore);
        if (overallReadinessScore > 100) revert ScoreOutOfRange(overallReadinessScore);
        if (grade == 0 || grade > 4) revert InvalidGrade(grade);

        uint32 latest = _latestVersion[projectId];
        uint32 expected = latest == 0 ? 1 : latest + 1;
        if (version != expected) revert InvalidVersion(version, expected);

        if (_reportHashUsed[projectId][reportHash]) {
            revert DuplicateReportHash(projectId, reportHash);
        }

        // ── Effects ───────────────────────────────────────────────────────────
        uint64 ts = uint64(block.timestamp);

        _latestVersion[projectId] = version;
        _reportHashUsed[projectId][reportHash] = true;
        _snapshotExists[projectId][version] = true;
        _snapshots[projectId][version] = ReportSnapshot({
            projectId: projectId,
            reportHash: reportHash,
            trustScore: trustScore,
            supplyScore: supplyScore,
            distributionScore: distributionScore,
            utilityScore: utilityScore,
            overallReadinessScore: overallReadinessScore,
            grade: grade,
            version: version,
            publisher: msg.sender,
            publishedAt: ts
        });

        // ── Interactions (none needed) ─────────────────────────────────────────
        emit ReportPublished(
            projectId,
            reportHash,
            msg.sender,
            version,
            trustScore,
            supplyScore,
            distributionScore,
            utilityScore,
            overallReadinessScore,
            grade,
            ts
        );
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    /**
     * @notice Returns the latest published version number for a project.
     *         Returns 0 if no versions have been published.
     * @param projectId keccak256 of the project slug
     */
    function latestVersion(bytes32 projectId) external view returns (uint32) {
        return _latestVersion[projectId];
    }

    /**
     * @notice Returns the latest snapshot for a project.
     * @dev Reverts with SnapshotNotFound if no versions have been published.
     * @param projectId keccak256 of the project slug
     */
    function getLatestSnapshot(bytes32 projectId)
        external
        view
        returns (ReportSnapshot memory)
    {
        uint32 v = _latestVersion[projectId];
        if (v == 0) revert SnapshotNotFound(projectId, 0);
        return _snapshots[projectId][v];
    }

    /**
     * @notice Returns a specific version snapshot for a project.
     * @dev Reverts with SnapshotNotFound if the version does not exist.
     * @param projectId keccak256 of the project slug
     * @param version   version number to retrieve
     */
    function getSnapshot(bytes32 projectId, uint32 version)
        external
        view
        returns (ReportSnapshot memory)
    {
        if (!_snapshotExists[projectId][version]) {
            revert SnapshotNotFound(projectId, version);
        }
        return _snapshots[projectId][version];
    }

    /**
     * @notice Returns true if the given report hash has already been published
     *         for this project under any version.
     * @param projectId  keccak256 of the project slug
     * @param reportHash keccak256 of the canonical report JSON
     */
    function isReportHashUsed(bytes32 projectId, bytes32 reportHash)
        external
        view
        returns (bool)
    {
        return _reportHashUsed[projectId][reportHash];
    }

    // ─── ETH rejection ───────────────────────────────────────────────────────

    /**
     * @notice Reject any accidental ETH/AVAX transfers.
     * @dev No payable functions exist. This is an explicit safety net.
     */
    receive() external payable {
        revert("RWAReadinessRegistry: does not accept AVAX");
    }
}
