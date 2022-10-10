// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const main = async () => {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with account: ", deployer.address);

  const Web3SNSContractFactory = await hre.ethers.getContractFactory("Web3SNS");
  const Web3SNSContract = await Web3SNSContractFactory.deploy({
    value: hre.ethers.utils.parseEther("0.001"),
  });

  await Web3SNSContract.deployed();

  console.log("Web3SNS Contract Address: ", Web3SNSContract.address);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();