import * as dotenv from "dotenv";
import { ethers, upgrades, run } from "hardhat";
dotenv.config();

async function main() {
  await run("compile");
  console.log("Compiled contracts...");

  console.log("Upgrade UUPS");

  const proxyAddr = "0x087a9DFe5C97519B79d7731892E6915c32522a6D";
  const LuckyPosition = await ethers.getContractFactory("LuckyPosition");
  
  const luckyPositionUpgrade = await upgrades.upgradeProxy(
    proxyAddr,
    LuckyPosition
  );

  await luckyPositionUpgrade.waitForDeployment();
  console.log("Waiting for 5 confirmations...");
  await luckyPositionUpgrade.deploymentTransaction()?.wait(5);

  const implAddr = await upgrades.erc1967.getImplementationAddress(proxyAddr);

  console.log("Contract upgrade to new implemention: ", implAddr);
  console.log("Wait to verify contract");

  await new Promise((resolve) => {
    setTimeout(resolve, 60 * 1000);
  });

  await run("verify:verify", {
    address: implAddr,
    constructorArgs: [],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });