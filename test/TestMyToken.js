
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken contract",function(){
    it("Mint and burn", async function(){
        const [owner, signer] = await ethers.getSigners();
        const MyToken = await ethers.getContractFactory("MyToken");
        const myToken = await MyToken.deploy("My Token", "MTK");
        const quantityMintToken = 5;
        const quantityBurnToken = 3;
        const nftBalance = quantityMintToken - quantityBurnToken;

        await myToken.mint(owner.address, quantityMintToken);
        console.log("quantity before mint token:", await myToken.balanceOf(owner.address));
        await myToken.connect(owner).burn(quantityBurnToken)
        console.log("quantity after mint token:", await myToken.balanceOf(owner.address));
        expect(nftBalance).to.equal(2)
    });
})

describe("BuySwordNft contract", function () {
    let myToken;
    let buyNftSword;
    let owner;
    let signer;
    it("Deploy",async function () { 
        [owner, signer] = await ethers.getSigners();
        const MyToken = await ethers.getContractFactory("MyToken");
        myToken = await MyToken.deploy("My Token", "MTK");

        const addr = await myToken.getAddress();
        const BuyNftSword = await ethers.getContractFactory("BuyNftSword");
        buyNftSword = await BuyNftSword.deploy(addr)
    });

    // setTime
    it("Set Time", async function(){
        const startTime = 1691053248;
        const endTime = 1691139648;
        await buyNftSword.connect(owner).setTimeOnSale(startTime, endTime);     
        const updateStartTime = await buyNftSword.startTime();
        const updateEndTime = await buyNftSword.endTime();
        expect (startTime).to.equal(updateStartTime);
        expect (endTime).to.equal(updateEndTime)
    });

    // setPrice
    it("Set Price", async function(){
        const newPrice = ethers.parseEther("2");
        const currentPrice = await buyNftSword.nftPrices(0);
        //console.log("current price", currentPrice)
        await buyNftSword.connect(owner).setPriceNft(0, newPrice);
        //await expect(buyNftSword.connect(owner).setPriceNft(0, newPrice)).to.be.revertedWith("Invalid token ID");
        const updatedPrice = await buyNftSword.nftPrices(0);
        console.log("updatedPrice", updatedPrice)
        expect(updatedPrice).to.equal(newPrice);

        //await expect(buyNftSword.connect(owner).swapNft()).to.be.revertedWith("Unqualified");
    });

    // buy ether
    it("Buy with ether", async function () {
        const tokenId = 0; // swordWoodId
        const quantity = 2; 
        const price = await buyNftSword.nftPrices(tokenId);
    
        await buyNftSword.connect(owner).buyNft(true, tokenId, quantity, { value: price * BigInt(quantity) });
    
        const nftBalance = await buyNftSword.balanceOf(owner.address, tokenId);
        //console.log("nft balance",nftBalance);
        expect(nftBalance).to.equal(quantity);
    });

    // buy token
    it("Buy with token", async function (){
        const tokenId = 0; 
        const price = await buyNftSword.nftPrices(tokenId);
        const quantityMintToken = "10";
        const quantity = 4;
        // mint token
        await myToken.mint(owner, ethers.parseEther(quantityMintToken));
        //console.log("balance of", await myToken.balanceOf(owner));
        const nftBalanceBefore =   await buyNftSword.balanceOf(owner.address, tokenId);
        
        const addr = await buyNftSword.getAddress();
        await myToken.connect(owner).approve(addr, ethers.parseEther(quantityMintToken));

        //buy nft = token
        await buyNftSword.connect(owner).buyNft(false, tokenId, quantity);
        const nftBalanceAfter = await buyNftSword.balanceOf(owner.address, tokenId);
        expect(nftBalanceAfter).to.equal(nftBalanceBefore + BigInt(quantity));  
    });

    it("Swap", async function () {  
        const amountBought = await buyNftSword.amountBought(owner.address);
        //console.log("amount Bought",amountBought);
        console.log("balance ",await buyNftSword.balanceOf(owner.address, 0))
        //await expect(buyNftSword.connect(owner).swapNft()).to.be.revertedWith("Unqualified");
        
        const beforeSwapId0 = await buyNftSword.balanceOf(owner,0)
        const beforeSwapId1 = await buyNftSword.balanceOf(owner,1)
        //console.log("beforeSwapId0", beforeSwapId0);
        //console.log("beforeSwapId1", beforeSwapId1);
        await buyNftSword.connect(owner).swapNft()
        const afterSwapId0 = await buyNftSword.balanceOf(owner,0)
        const afterSwapId1 = await buyNftSword.balanceOf(owner,1)
        //console.log("afterSwapId0", afterSwapId0);
        //console.log("afterSwapId1", afterSwapId1);
        expect(afterSwapId0).to.equal(beforeSwapId0 - BigInt(2));
    });
}); 
