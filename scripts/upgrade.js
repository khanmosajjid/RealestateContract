const { ethers, upgrades } = require("hardhat");

async function main() {
    // const ProxyContract = await ethers.getContractFactory("EQXTokenV1");
    const proxyAddress = "0xE9Bc5998A40ddc947df789Ee3fa80Adbc27D4A86"; // Specify the address of your existing proxy contract
    const newImplementation = await ethers.getContractFactory("EQXToken");

    // Upgrade the proxy contract
    const upgradedProxy = await upgrades.upgradeProxy(proxyAddress, newImplementation);
    console.log("Proxy contract upgraded:", upgradedProxy.address);
}

main();
