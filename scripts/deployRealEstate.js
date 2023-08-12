const { ethers, upgrades } = require("hardhat");

async function verifyContract(contractAddress) {
    try {
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: ["ABC", "ABC", 1000000, "0x3569feBDDf342769713c144D63440036658bD0ec"],
        });
        console.log("Contract verified on Etherscan");
    } catch (error) {
        console.error("Error verifying contract:", error);
    }
}

async function readEventLogs(transactionHash) {
    try {
        const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/rfCruuBJ6-ND7sPx8qfywX0PjKWcmIQq");

        const contractAbi = [
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "propertyId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "buyer",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "EscrowCancelled",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "escrowId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "buyer",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "propertyId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "EscrowCreated",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "escrowId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "propertyId",
                        "type": "uint256"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "buyer",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "EscrowReleased",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "previousOwner",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "newOwner",
                        "type": "address"
                    }
                ],
                "name": "OwnershipTransferred",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "account",
                        "type": "address"
                    }
                ],
                "name": "Paused",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "propertyId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "pricePerToken",
                        "type": "uint256"
                    }
                ],
                "name": "PropertyListedForSale",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "propertyId",
                        "type": "uint256"
                    }
                ],
                "name": "PropertyRemovedFromListing",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "sender",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "propertyId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "PropertyStaked",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "propertyId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "totalSupply",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "propertyAddress",
                        "type": "string"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "tokenAddress",
                        "type": "address"
                    }
                ],
                "name": "PropertyTokenized",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "proposalId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    }
                ],
                "name": "ProposalCreated",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "proposalId",
                        "type": "uint256"
                    }
                ],
                "name": "ProposalExecuted",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "propertyId",
                        "type": "uint256"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "stakingPool",
                        "type": "address"
                    }
                ],
                "name": "StakingPoolCreated",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "buyer",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "propertyId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "totalPrice",
                        "type": "uint256"
                    }
                ],
                "name": "TokenPurchased",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "account",
                        "type": "address"
                    }
                ],
                "name": "Unpaused",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "proposalId",
                        "type": "uint256"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "voter",
                        "type": "address"
                    }
                ],
                "name": "Voted",
                "type": "event"
            },
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "_address",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_totalSupply",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_initialPrice",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "_tokenName",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "_tokenSymbol",
                        "type": "string"
                    },
                    {
                        "internalType": "address",
                        "name": "_manager",
                        "type": "address"
                    }
                ],
                "name": "createPropertyToken",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "_description",
                        "type": "string"
                    }
                ],
                "name": "createProposal",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_propertyId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "_rewardToken",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_rewardPerToken",
                        "type": "uint256"
                    }
                ],
                "name": "createStakingPool",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "contract SimpleToken",
                        "name": "_token",
                        "type": "address"
                    }
                ],
                "name": "destroyPropertyToken",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "escrowCount",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "name": "escrows",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "propertyId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "buyer",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "completed",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint256",
                        "name": "ethAmount",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_proposalId",
                        "type": "uint256"
                    }
                ],
                "name": "executeProposal",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "initialize",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_propertyId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_pricePerToken",
                        "type": "uint256"
                    }
                ],
                "name": "listPropertyForSale",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "owner",
                "outputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "pause",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "paused",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "name": "properties",
                "outputs": [
                    {
                        "internalType": "string",
                        "name": "propertyAddress",
                        "type": "string"
                    },
                    {
                        "internalType": "address",
                        "name": "owner",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalSupply",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "initialPrice",
                        "type": "uint256"
                    },
                    {
                        "internalType": "contract SimpleToken",
                        "name": "token",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "stakingPool",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "propertyCount",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "proposalCount",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "name": "proposals",
                "outputs": [
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "voteCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "executed",
                        "type": "bool"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_propertyId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_amount",
                        "type": "uint256"
                    }
                ],
                "name": "purchaseTokensAndEscrow",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_escrowId",
                        "type": "uint256"
                    }
                ],
                "name": "releaseEscrow",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_propertyId",
                        "type": "uint256"
                    }
                ],
                "name": "removeFromListing",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "renounceOwnership",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "name": "rewardPercent",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_propertyId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_amount",
                        "type": "uint256"
                    }
                ],
                "name": "stakePropertyTokens",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "name": "stakedBalances",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "name": "stakingStartTime",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "newOwner",
                        "type": "address"
                    }
                ],
                "name": "transferOwnership",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "unpause",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_proposalId",
                        "type": "uint256"
                    }
                ],
                "name": "voteOnProposal",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "votingDuration",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_reciever",
                        "type": "address"
                    }
                ],
                "name": "withdrawExcessEth",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_reciever",
                        "type": "address"
                    },
                    {
                        "internalType": "contract ERC20",
                        "name": "_token",
                        "type": "address"
                    }
                ],
                "name": "withdrawExcessToken",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ];
        // Get the transaction receipt
        const receipt = await provider.getTransactionReceipt(transactionHash);
        console.log("receipt", receipt)
        // Decode the event logs
        const contract = new ethers.Contract("0xefe7da2d34847e397c454e309ab141b58bdb890f", contractAbi, provider);
        const eventFilter = contract.filters.PropertyTokenized();

        // Get the event logs
        const logs = await provider.getLogs({
            ...eventFilter,
            fromBlock: receipt.blockNumber,
            toBlock: receipt.blockNumber,
        });
        const parsedLogs = logs.map((log) => contract.interface.parseLog(log));

        console.log("Event logs:", parsedLogs[0]?.args["tokenAddress"]);
        verifyContract(parsedLogs[0]?.args["tokenAddress"])
    } catch (error) {
        console.error("Error reading event logs:", error);
    }
}

async function main() {
    const RealEstateContract = await ethers.getContractFactory("RealEstateContract");
    const realEstate = await RealEstateContract.deploy();
    await realEstate.deployed();
    console.log("RealEstateContract deployed to:", realEstate.address);
    verifyContract(realEstate.address)
}


main();

