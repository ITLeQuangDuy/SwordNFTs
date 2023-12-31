// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0; 

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./MyToken.sol";

contract BuyNftSword is ERC1155, Ownable, ReentrancyGuard {
    IERC20 public token;

    event SetTimeOnSale(address user,uint256 startTime, uint256 endTime);
    event SetPriceNft(address user,uint256 id, uint256 price);
    event BuyNftEther(address user,uint256 tokenID,uint256 quantity);
    event BuyNftTokenCoin(address user,uint256 tokenID,uint256 quantity);
    event SwapNft(address user,uint256 quantity);

    uint256 public constant swordWoodId = 0;
    uint256 public constant swordIronId = 1;
    uint256 public maxQuantityNft = 10;
    uint256 public startTime;
    uint256 public endTime;

    MyToken public myTokenContract;

    mapping(uint256 => uint256) public nftPrices;
    mapping(address => uint256) public amountBought;

    constructor(address tokenAddress) ERC1155("") {
        token = IERC20(tokenAddress);      
        
        nftPrices[swordWoodId] = 1 ether;
        nftPrices[swordIronId] = 3 ether;

        startTime = block.timestamp;
        endTime = block.timestamp + 7 days;
    }

    modifier onlyOnSale() {
        require(block.timestamp >= startTime, "It's not time on sale");
        require(block.timestamp <= endTime, "Passed time on sale");
        _;
    } 
    
    function setTimeOnSale(uint256 _startTime, uint256 _endTime) external onlyOwner {
        startTime = _startTime;
        endTime = _endTime;

        emit SetTimeOnSale(msg.sender,_startTime, _endTime);
    }

    function setPriceNft(uint256 id ,uint256 _price) external onlyOwner{
        require(id == swordWoodId || id == swordIronId,"Invalid token ID");
        nftPrices[id] = _price;

        emit SetPriceNft(msg.sender,id, _price);
    }

    function buyNft(bool isNativePayment, uint256 tokenId, uint256 quantity) external payable onlyOnSale nonReentrant {
        require(tokenId == swordWoodId || tokenId == swordIronId, "Invalid token ID");
        require(amountBought[msg.sender] + quantity <= maxQuantityNft, "Total quantity exceeds the maximum allowed");
        uint256 totalPrice = nftPrices[tokenId] * quantity;

        if (isNativePayment) {
            require(msg.value == nftPrices[tokenId] * quantity, "Not enough native coin");
            _mint(msg.sender, tokenId, quantity,"");
            amountBought[msg.sender] += quantity;            
        } else {
            require(msg.value == 0, "Dont need ether");
            token.transferFrom(msg.sender, address(this), totalPrice);
            _mint(msg.sender, tokenId, quantity,"");
            amountBought[msg.sender] += quantity;
        }
    }    

    function generateRandomNumber() public view returns (uint256) {
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, block.difficulty, block.number))) % 100;
        return randomNumber;
    } 

    function swapNft() external nonReentrant() { 
        require(amountBought[msg.sender] >= 5, "Unqualified");
        require(balanceOf(msg.sender, 0) >= 2,"Insufficient quantity of Token ID 0");
        
        if(generateRandomNumber() >= 50){
            _mint(msg.sender,1, 1,"");   
        }     
        _burn(msg.sender, 0, 2);
    } 
}