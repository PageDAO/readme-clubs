MyReadme Smart Contract Deployment Details
----------------------------------------

DEPLOYED CONTRACTS (Sepolia Testnet)
MyReadme NFT: 0x9d1CdD84c53Ec745b03aB1E94327068538FE2449
ERC6551Account Implementation: 0x95Db94e87877eFD2821b5CBE7C3eaf344628ff80
ERC6551Registry: 0x000000006551c19487814612e58FE06813775758

TEST PROFILE
Token ID: 1
Token-bound Account: 0xC7A84E7477568743a0E0A95FC54587DD3E2aC4f5

FRONTEND INTEGRATION GUIDE
-------------------------

1. Minting New Profiles
Function: myReadme.mint()
Returns: tokenId

2. Setting Profile Metadata
Function: myReadme.setURI(tokenId, uri)
Parameters:
- tokenId: uint256
- uri: string

3. Getting Token-bound Account Address
Use registry.account() with:
- implementation: "0x95Db94e87877eFD2821b5CBE7C3eaf344628ff80"
- salt: "0x0000000000000000000000000000000000000000000000000000000000000000"
- chainId: 11155111 (Sepolia)
- tokenContract: "0x9d1CdD84c53Ec745b03aB1E94327068538FE2449"
- tokenId: Your token's ID

Each profile NFT automatically gets its own smart contract wallet (token-bound account) that can:
- Hold assets
- Execute transactions
- Store additional profile data
- Transfer control with the profile token

The token-bound account address is deterministic and can be derived at any time using the registry's account() function.
