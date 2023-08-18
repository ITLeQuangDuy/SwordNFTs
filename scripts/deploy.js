
const deployToken = async () => {
    const MyToken = await ethers.getContractFactory("MyToken");
    myToken = await MyToken.deploy("My Token", "MTK");
    console.log("Token address:", await myToken.getAddress());
}

const deploySword = async () => {
    const BuyNftSword = await ethers.getContractFactory("BuyNftSword");
    const buyNftSword = await BuyNftSword.deploy("0x5ca9DBE013096FEe02B6CfDbff73973E24B9B93E");
    console.log("Token address:", await buyNftSword.getAddress());
}

async function main() {
    const [deployer] = await ethers.getSigners();
    // await deployToken();
    await deploySword();
  }
  main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });