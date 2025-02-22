import { ethers, upgrades, run } from "hardhat";

async function main() {
  await run("compile");
  console.log("Compiled contract...");

  console.log("Deploying LuckyPosition...");
  const vrfCoordinator = "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B";
  const keyHash = "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";
  const subscriptionId = "58606996257988646084336249475995019086133242598980405301265407015377774284160";
  const allowedToken = "0x29450e8180b90D66829303E98AB5E02125F3d6Be";
  const dateTimeContract = "0x311A9De80C3Ac8809f935b9BA36b3d867f4C2B8D";

  const constructorArgs: [string, string, string, string, string] = [
    vrfCoordinator,
    keyHash,
    subscriptionId,
    allowedToken,
    dateTimeContract
  ];

  const LuckyPosition = await ethers.getContractFactory("LuckyPosition");

  const luckyPosition = await upgrades.deployProxy(
    LuckyPosition,
    constructorArgs,
    {
      kind: "uups",
      initializer: "initialize",
    }
  );
  await luckyPosition.waitForDeployment();

  const proxyAddr = await luckyPosition.getAddress();
  console.log("LuckyPosition deployed at: ", proxyAddr);

  console.log("Wait to verify contract");

  await new Promise((resolve) => {
    setTimeout(resolve, 60 * 1000);
  });
  await run("verify:verify", {
    address: proxyAddr,
    constructorArgs: [],
  });
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });