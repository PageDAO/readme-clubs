README PROTOCOL V1 DEPLOYMENT

I. DEPLOYED INFRASTRUCTURE (SEPOLIA)

Core Contracts:
- PAGE Token: 0xBfce153c455190d92C5504C63CE51637433acC68 (8 decimals)
- LPTStaking: 0x3E09D2367703b24B9E08d7582EfC28eD908e7e41
- KeyFactory: 0x84181c79c9291ab4ADa6dCFD3a4DBEdB0713C9De
- Readme1155v1: 0x852c5cA39fD619C1a83e0d17A8aAC8F81ae184cE

Uniswap V2 Infrastructure:
- Router: 0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3
- PAGE/WETH Pool: 0x447287c2207c77395d2f3365c73c86A406FA87DA
- Initial Liquidity TX: 0xc36e364a649780e39e893ddf6fdd6cf66604ef4d7c84d7b8189332ea31f206fe

II. PROTOCOL ECONOMICS

Fee Distribution:
1. Minting Fees (100 PAGE)
   - 30% to LP Staking Contract
   - 70% to Key Token Bonding Curve

2. Trading Fees
   - 0.3% Uniswap LP Fee
   - Additional protocol fees distributed to stakers

Liquidity Mining:
1. LP Token Staking
   - Stake PAGE/WETH LP tokens
   - Earn protocol fees
   - 1-year lockup period
   - Continuous rewards distribution

2. Reward Structure
   - Base rewards from protocol fees
   - Bonus rewards from key trading fees
   - Compound options available

III. INTEGRATION COMPONENTS

Test Scripts:
- test/arweave-upload.js: Content storage testing
- test/readme-integration.js: Full protocol integration tests
- test/helpers/arweave-utils.js: Upload utilities

Deployment Scripts:
- scripts/deploy-v2.js: Main deployment script
- ignition/modules/Lock.js: Hardhat Ignition module

IV. PROTOCOL FLOW

1. Content Upload (Arweave)
   - Book content -> PDF/EPUB
   - Cover image -> PNG/JPG
   - Metadata -> JSON
   - Returns: {bookHash, coverHash, metadataHash}

2. NFT Minting
   - Cost: 100 PAGE tokens
   - Fee Split: 30% to LPTStaking, 70% to bonding curve
   - Returns: tokenId, keyTokenAddress

3. Key Token Creation
   - Automatic deployment via Factory
   - Initial mint: 100 keys to publisher
   - Linear bonding curve activated
   - Trading enabled immediately

4. Liquidity Provision
   - Add PAGE/WETH to Uniswap pool
   - Stake LP tokens in LPTStaking
   - Earn ongoing protocol fees
   - Monitor rewards via dashboard

V. FRONTEND REQUIREMENTS

Libraries:
- Arweave-js: Content upload
- Ethers.js: Contract interaction
- IPFS (optional): Temporary storage
- @uniswap/sdk: Pool interaction

Wallet Integration:
- PAGE token approval
- ETH for gas fees
- Key trading interface
- LP staking dashboard

Trading Interface:
1. Book Publishing
   - Content upload
   - NFT minting
   - Key distribution

2. Liquidity Management
   - Pool position creation
   - LP token staking
   - Reward claiming
   - Position management

3. Key Trading
   - Bonding curve interface
   - Price charts
   - Trade history
   - Portfolio tracking

VI. TESTING ENVIRONMENT

Local Testing:
- ArLocal for Arweave simulation
- Hardhat Network for blockchain
- Ethers for contract interaction
- Uniswap V2 SDK for pool testing

Test Coverage:
- Content upload verification
- Fee distribution accuracy
- Bonding curve mathematics
- Key token trading mechanics
- LP staking rewards
- Pool position management

VII. NEXT STEPS

1. Frontend Implementation
   - Publisher dashboard
   - Trading interface
   - Liquidity management
   - Analytics dashboard

2. Protocol Expansion
   - Additional pool incentives
   - Governance implementation
   - Cross-chain integration
   - Mobile app development

3. Community Building
   - Documentation portal
   - Developer resources
   - Community forums
   - Educational content
