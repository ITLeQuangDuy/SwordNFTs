
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken contract", function () {
  let owner;
  let addr1;
  it("Mint burn token", async function () {
    const [owner, signer] = await ethers.getSigners();
    const MyToken = await ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy("MyToken", "MTK");
    const addr = await myToken.getAddress();
    const BuyNftSword = await ethers.getContractFactory("BuyNftSword");
    const buyNftSword = await BuyNftSword.deploy(addr)

    console.log(await myToken.getAddress())
    const a = ethers.parseEther("1");
    console.log("ether",a);
    await myToken.mint(signer.address, 5);
    await myToken.connect(signer).burn(3);

    const balance = await myToken.balanceOf(signer.address);
    expect(balance).to.equal(2);
  });
}); 