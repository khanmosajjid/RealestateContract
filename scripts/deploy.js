const { ethers, upgrades } = require("hardhat");

async function main() {
  const RealestateContract = await ethers.getContractFactory("RealEstateContract");
  const proxy = await upgrades.deployProxy(RealestateContract, []);
  await proxy.deployed();

  console.log(proxy.address);
}

main();