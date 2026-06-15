import { ethers, network } from 'hardhat'
import * as fs from 'fs'
import * as path from 'path'

async function main(): Promise<void> {
  console.log(`\nDeploying RWAReadinessRegistry to network: ${network.name}`)
  console.log(`Chain ID: ${network.config.chainId}`)

  const [deployer] = await ethers.getSigners()
  console.log(`Deployer: ${deployer.address}`)

  const balance = await ethers.provider.getBalance(deployer.address)
  console.log(`Deployer balance: ${ethers.formatEther(balance)} AVAX`)

  if (balance === 0n) {
    throw new Error('Deployer account has zero balance — fund it with Fuji test AVAX first')
  }

  const Registry = await ethers.getContractFactory('RWAReadinessRegistry')
  const registry = await Registry.deploy()
  await registry.waitForDeployment()

  const address = await registry.getAddress()
  const deployTx = registry.deploymentTransaction()
  if (!deployTx) throw new Error('No deployment transaction found')

  const txHash = deployTx.hash
  const receipt = await deployTx.wait()
  if (!receipt) throw new Error('Deployment receipt not available')

  const code = await ethers.provider.getCode(address)
  if (code === '0x') {
    throw new Error(`No bytecode at ${address} — deployment may have failed`)
  }

  console.log(`\nDeployment successful`)
  console.log(`  Contract address : ${address}`)
  console.log(`  Transaction hash : ${txHash}`)
  console.log(`  Block number     : ${receipt.blockNumber}`)
  console.log(`  Gas used         : ${receipt.gasUsed.toString()}`)

  const artifact: Record<string, unknown> = {
    network: network.name === 'fuji' ? 'avalanche-fuji' : network.name,
    chainId: network.config.chainId,
    contractName: 'RWAReadinessRegistry',
    address,
    transactionHash: txHash,
    blockNumber: receipt.blockNumber,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  }

  const deploymentsDir = path.join(__dirname, '..', 'deployments')
  fs.mkdirSync(deploymentsDir, { recursive: true })

  const filename = `${network.name}.json`
  const artifactPath = path.join(deploymentsDir, filename)
  fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2))
  console.log(`\nDeployment artifact written to: deployments/${filename}`)
  console.log('\nNext step: copy the contract address into your frontend .env.local:')
  console.log(`  VITE_RWA_REGISTRY_ADDRESS=${address}`)

  if (network.name === 'fuji') {
    console.log('\nVerification command (run after a few block confirmations):')
    console.log(`  npm run verify:fuji -- --contract src/RWAReadinessRegistry.sol:RWAReadinessRegistry ${address}`)
  }
}

main().catch((err) => {
  console.error('\nDeployment failed:', err.message ?? err)
  process.exit(1)
})
