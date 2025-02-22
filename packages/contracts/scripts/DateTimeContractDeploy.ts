import { deployContract } from "@nomicfoundation/hardhat-ethers/types";
import { ethers, upgrades, run } from "hardhat";

async function main() {
  await run("compile");
  console.log("Compiled contract...");

  const DateTimeContract = await ethers.getContractFactory("DateTimeContract");

  const dateTimeContract = await DateTimeContract.deploy();
  await dateTimeContract.waitForDeployment();

  const dateTimeContractAddr = await dateTimeContract.getAddress();
  console.log("DateTimeContract deployed at: ", dateTimeContractAddr);

  console.log("Wait to verify contract");

  await new Promise((resolve) => {
    setTimeout(resolve, 60 * 1000);
  });
  await run("verify:verify", {
    address: dateTimeContractAddr,
    constructorArgs: [],
  });
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });