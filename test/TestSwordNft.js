
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BuySwordNft contract", function () {
    let myToken;
    let buyNftSword;
    let owner;
    let signer;
    it("Deploy",async function () { 
        [owner, signer, signer1, signer2] = await ethers.getSigners();
        const MyToken = await ethers.getContractFactory("MyToken");
        myToken = await MyToken.deploy("My Token", "MTK");

        const addr = await myToken.getAddress();
        const BuyNftSword = await ethers.getContractFactory("BuyNftSword");
        buyNftSword = await BuyNftSword.deploy(addr)
    });
    
    // setTime
    it("Set Time", async function(){
        const startTime = Math.floor(Date.now() / 1000);
        const endTime = startTime + 3600;
        await buyNftSword.connect(owner).setTimeOnSale(startTime, endTime);     
        const updateStartTime = await buyNftSword.startTime();
        const updateEndTime = await buyNftSword.endTime();
        expect (startTime).to.equal(updateStartTime);
        expect (endTime).to.equal(updateEndTime)
    });

    // setPrice
    it("Set Price", async function(){
        const newPrice = ethers.parseEther("2");
        await buyNftSword.connect(owner).setPriceNft(0, newPrice);
        const updatedPrice = await buyNftSword.nftPrices(0);
        expect(updatedPrice).to.equal(newPrice); 
    });

    it("Invalid token ID", async function(){
        await expect(buyNftSword.connect(owner).setPriceNft(2, ethers.parseEther("2"))).to.be.revertedWith("Invalid token ID");
    });

    // buy token 
    it("Buy NFTs: Invalid token ID", async function(){
        await expect(buyNftSword.connect(signer2).buyNft(true, 2, 2, { value: await buyNftSword.nftPrices(1) * BigInt(2) })).to.be.revertedWith("Invalid token ID");       
    });

    it("Buy NFTs: Total quantity exceeds the maximum allowed", async function(){
        await expect(buyNftSword.connect(signer2).buyNft(true, 0, 11, { value: await buyNftSword.nftPrices(0) * BigInt(11) })).to.be.revertedWith("Total quantity exceeds the maximum allowed");       
    });

    it("Buy NFTs: Not enough native coin", async function(){
        await expect(buyNftSword.connect(signer2).buyNft(true, 0, 5, { value: await buyNftSword.nftPrices(0) * BigInt(6) })).to.be.revertedWith("Not enough native coin");       
    });

    it("Buy NFTs: Don't need ether", async function(){
        await expect(buyNftSword.connect(signer2).buyNft(false, 0, 4, { value: await buyNftSword.nftPrices(0) * BigInt(5) })).to.be.revertedWith("Dont need ether");       
    });

    it("Buy with token", async function (){
        const tokenId = 0; 
        const quantityMintToken = "10";
        const quantity = 4;

        await myToken.mint(owner, ethers.parseEther(quantityMintToken));

        const nftBalanceBefore = await buyNftSword.balanceOf(owner.address, tokenId);
        const addr = await buyNftSword.getAddress();

        await myToken.connect(owner).approve(addr, ethers.parseEther(quantityMintToken));
        
        const tokenContractBeforeBuy = await myToken.balanceOf(await buyNftSword.getAddress());
        const tokenAddressBeforeBuy = await myToken.balanceOf(owner.address);
        
        await buyNftSword.connect(owner).buyNft(false, tokenId, quantity);
        
        const nftBalanceAfter = await buyNftSword.balanceOf(owner.address, tokenId);
        const tokenContractAfterBuy = await myToken.balanceOf(await buyNftSword.getAddress())
        const tokenAddressAfterBuy = await myToken.balanceOf(owner.address);

        expect(nftBalanceAfter).to.equal(nftBalanceBefore + BigInt(quantity));  
        expect(tokenAddressAfterBuy).to.equal(tokenAddressBeforeBuy - tokenContractAfterBuy);
        expect(tokenContractAfterBuy).to.equal(tokenAddressBeforeBuy - tokenAddressAfterBuy);
    });

    // buy ether
    it("Buy with ether", async function () {
        const tokenId = 0; 
        const quantity = 2; 
        const price = await buyNftSword.nftPrices(tokenId);
        const nftBalanceBefore = await buyNftSword.balanceOf(owner.address, tokenId);

        await buyNftSword.connect(owner).buyNft(true, tokenId, quantity, { value: price * BigInt(quantity) });  
        
        const nftBalanceAfter = await buyNftSword.balanceOf(owner.address, tokenId);

        expect(nftBalanceAfter).to.equal(nftBalanceBefore + BigInt(quantity));
    });

    it("Swap", async function () {  
        
        const amountBought = await buyNftSword.amountBought(owner.address);
        const beforeSwapId0 = await buyNftSword.balanceOf(owner,0)
        const beforeSwapId1 = await buyNftSword.balanceOf(owner,1)

        await buyNftSword.connect(owner).swapNft()
        
        const afterSwapId0 = await buyNftSword.balanceOf(owner,0)
        const afterSwapId1 = await buyNftSword.balanceOf(owner,1)

        expect(afterSwapId0).to.equal(beforeSwapId0 - BigInt(2));
    });

    it("Unqualified", async function() {
        await expect(buyNftSword.connect(signer1).swapNft()).to.be.revertedWith("Unqualified");
    });

    it("Insufficient quantity of Token ID 0", async function() {
        const price = await buyNftSword.nftPrices(1);
        await buyNftSword.connect(signer1).buyNft(true, 1, 6, { value: price * BigInt(6) });  
        await expect(buyNftSword.connect(signer1).swapNft()).to.be.revertedWith("Insufficient quantity of Token ID 0");
    });
}); 
