/**
 * Frontend contract configuration for RWAReadinessRegistry on Avalanche Fuji.
 *
 * GRADE ENCODING (must match the Solidity contract exactly):
 *   0 = Unrated / invalid (never stored)
 *   1 = A  (overall score 85–100)
 *   2 = B  (overall score 70–84)
 *   3 = C  (overall score 50–69)
 *   4 = D  (overall score  0–49)
 *
 * PROJECT ID DERIVATION:
 *   projectIdBytes32 = keccak256(UTF-8 bytes of lowercase-trimmed project slug)
 *   Example: keccak256("meridian-tbill-fund")
 *
 * SECURITY NOTE:
 *   VITE_RWA_REGISTRY_ADDRESS and VITE_FUJI_RPC_URL are browser-safe variables.
 *   Never put DEPLOYER_PRIVATE_KEY or FUJI_EXPLORER_API_KEY into VITE_ variables.
 */

export const FUJI_CHAIN_ID = 43113 as const

export const FUJI_EXPLORER_BASE_URL = 'https://testnet.snowtrace.io'

export const FUJI_PUBLIC_RPC = import.meta.env.VITE_FUJI_RPC_URL ?? 'https://api.avax-test.network/ext/bc/C/rpc'

const rawAddress = import.meta.env.VITE_RWA_REGISTRY_ADDRESS ?? ''

function isValidAddress(addr: string): addr is `0x${string}` {
  return /^0x[0-9a-fA-F]{40}$/.test(addr)
}

export const REGISTRY_ADDRESS: `0x${string}` | null = isValidAddress(rawAddress) ? rawAddress : null

export const IS_CONTRACT_DEPLOYED = REGISTRY_ADDRESS !== null

export function explorerTxUrl(txHash: string): string {
  return `${FUJI_EXPLORER_BASE_URL}/tx/${txHash}`
}

export function explorerAddressUrl(address: string): string {
  return `${FUJI_EXPLORER_BASE_URL}/address/${address}`
}

export function explorerContractUrl(): string | null {
  if (!REGISTRY_ADDRESS) return null
  return explorerAddressUrl(REGISTRY_ADDRESS)
}

export const GRADE_TO_UINT8 = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
} as const satisfies Record<string, number>

export type GradeLabel = keyof typeof GRADE_TO_UINT8

export const UINT8_TO_GRADE: Record<number, GradeLabel> = {
  1: 'A',
  2: 'B',
  3: 'C',
  4: 'D',
}

export function gradeToUint8(grade: string): number {
  const g = grade.toUpperCase() as GradeLabel
  if (!(g in GRADE_TO_UINT8)) {
    throw new Error(`Invalid grade: "${grade}". Must be one of A, B, C, D`)
  }
  return GRADE_TO_UINT8[g]
}

export function uint8ToGrade(value: number): GradeLabel {
  const label = UINT8_TO_GRADE[value]
  if (!label) {
    throw new Error(`Invalid grade uint8: ${value}. Must be 1–4`)
  }
  return label
}
