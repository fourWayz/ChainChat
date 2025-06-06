import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // Deploy CCToken first
  const tokenDeployment = await deploy("CCToken", {
    from: deployer,
    args: [], 
    log: true,
    waitConfirmations: 1,
  });

  // Deploy Chainchat with token address
  const chainchatDeployment = await deploy("Chainchat", {
    from: deployer,
    args: [tokenDeployment.address], 
    log: true,
    waitConfirmations: 1,
  });

  // Fund Chainchat contract with CCT for rewards
  const ccToken = await ethers.getContractAt("CCToken", tokenDeployment.address);
  const rewardPoolAmount = ethers.parseEther("10000"); // 10,000 CCT for rewards pool
  
  console.log(`Funding Chainchat contract with ${ethers.formatEther(rewardPoolAmount)} CCT...`);
  const transferTx = await ccToken.transfer(chainchatDeployment.address, rewardPoolAmount);
  await transferTx.wait();
  console.log("Funding complete");



  console.log("\nDeployment Summary:");
  console.log("----------------------------------");
  console.log(`CCToken deployed to: ${tokenDeployment.address}`);
  console.log(`Chainchat deployed to: ${chainchatDeployment.address}`);
  console.log(`Reward pool funded with: ${ethers.formatEther(rewardPoolAmount)} CCT`);
  console.log("----------------------------------\n");
};

func.tags = ["Chainchat", "CCToken"];
export default func;