#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')

const ARTIFACT_PATH = path.join(
  __dirname,
  '..',
  'artifacts',
  'src',
  'RWAReadinessRegistry.sol',
  'RWAReadinessRegistry.json',
)

const OUTPUT_PATH = path.join(
  __dirname,
  '..',
  '..',
  'src',
  'contracts',
  'RWAReadinessRegistry.abi.ts',
)

if (!fs.existsSync(ARTIFACT_PATH)) {
  console.error('Artifact not found. Run `npm run compile` first.')
  console.error(`  Expected: ${ARTIFACT_PATH}`)
  process.exit(1)
}

const artifact = JSON.parse(fs.readFileSync(ARTIFACT_PATH, 'utf8'))
const fullAbi = artifact.abi

// Frontend-relevant entry names
const KEEP_NAMES = new Set([
  'publishReport',
  'latestVersion',
  'getLatestSnapshot',
  'getSnapshot',
  'isReportHashUsed',
  'ReportPublished',
  // Custom errors (useful for typed decoding in Phase 5)
  'EmptyProjectId',
  'EmptyReportHash',
  'ScoreOutOfRange',
  'InvalidGrade',
  'InvalidVersion',
  'SnapshotNotFound',
  'DuplicateReportHash',
])

const filteredAbi = fullAbi.filter(
  (entry) => entry.name === undefined || KEEP_NAMES.has(entry.name),
)

const banner = [
  '// AUTO-GENERATED — do not edit by hand.',
  '// Regenerate: cd contracts && npm run export-abi',
  `// Source: contracts/artifacts/src/RWAReadinessRegistry.sol/RWAReadinessRegistry.json`,
  `// Generated: ${new Date().toISOString()}`,
].join('\n')

const outputContent = `${banner}

export const RWA_READINESS_REGISTRY_ABI = ${JSON.stringify(filteredAbi, null, 2)} as const
`

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
fs.writeFileSync(OUTPUT_PATH, outputContent)

console.log(`ABI exported to: src/contracts/RWAReadinessRegistry.abi.ts`)
console.log(`  Entries: ${filteredAbi.length} (from full ABI of ${fullAbi.length})`)
