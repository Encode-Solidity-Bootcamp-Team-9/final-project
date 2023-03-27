import { expect } from 'chai';
import "@nomiclabs/hardhat-ethers";
import { Arbitrage, ArbitrageToken } from '../typechain-types';
import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe("Arbitrage contract", async () => {

    const PURCHASE_RATIO = 2;
    const STAKE_DURATION = 600;
    const INTEREST_RATE = 1;
    const TOKEN_NAME = "MyTokenName";
    const TOKEN_SYMBOL = "MyTokenSymbol";
    
    let signers: SignerWithAddress[];
    
    let arbitrageContract: Arbitrage;
    let tokenContract: ArbitrageToken;

    function bnToNumber(numBn: BigNumber) {
        return Number(numBn.toString());
    }

    function numberToBN(number: number) {
        return ethers.utils.parseEther(number.toString());
    }
    
    async function deployArbitrage() {
        signers = await ethers.getSigners();
        const contractFactory = await ethers.getContractFactory("Arbitrage");
        arbitrageContract = await contractFactory.deploy(
            PURCHASE_RATIO,
            STAKE_DURATION,
            INTEREST_RATE
        );
        await arbitrageContract.deployed();
    }

    async function deployToken() {
        await arbitrageContract.createArbitrageToken(TOKEN_NAME, TOKEN_SYMBOL);
        let tokenAddress = await arbitrageContract.arbitrageToken();
        tokenContract = await ethers.getContractAt("ArbitrageToken", tokenAddress);
    }

    describe("When the Arbitrage contract is deployed", async () => {

        beforeEach(async () => {
            await deployArbitrage();
        });

        it("assigns the correct values to the parameters", async () => {
            let params = [
                await arbitrageContract.purchaseRatio(),
                await arbitrageContract.stakeDuration(),
                await arbitrageContract.interestRate()
            ];
            expect(params).to.deep.eq([PURCHASE_RATIO,STAKE_DURATION,INTEREST_RATE]);
        });
    });
    
    describe("When the create token function is called", async () => {

        before(async () => {
            await deployArbitrage();
            await deployToken();
        });

        it("deploys a new token contract", async () => {
            expect(await arbitrageContract.arbitrageToken()).to.not.eq(ethers.constants.AddressZero);
        });

        //connect to token contract with hardhat helper: https://hardhat.org/hardhat-runner/plugins/nomiclabs-hardhat-ethers#helpers
        it("sets the correct name and symbol", async () => {
            expect(await tokenContract.name()).to.eq(TOKEN_NAME);
            expect(await tokenContract.symbol()).to.eq(TOKEN_SYMBOL);
        });
    
        it("does not deploy a new token contract if one already exists", async () => {
            await expect(arbitrageContract.createArbitrageToken("MyToken", "MTK")).to.be.revertedWith('Token already set');
        });
    });

    describe("When the user purchases tokens", async () => {

        const PURCHASE_AMOUNT: BigNumber = numberToBN(2);
        let totalSupplyBeforePurchase: BigNumber;
        let tokenBalanceBefore: BigNumber;
        let ethBalanceBefore: BigNumber;
        let purchaseGasCost: number;

        before(async () => {
            await deployArbitrage();
            await deployToken();
            totalSupplyBeforePurchase = await tokenContract.totalSupply();
            tokenBalanceBefore = await tokenContract.balanceOf(signers[2].address);
            ethBalanceBefore = await signers[2].getBalance();
            const purchaseTx = await arbitrageContract.connect(signers[2]).purchaseTokens({value: PURCHASE_AMOUNT});
            const txReceipt = await purchaseTx.wait();
            purchaseGasCost = bnToNumber(txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice));
        });

        it("charges the correct amount of ETH", async () => {
            const ethBalanceAfterPurchase = await signers[2].getBalance();
            const expected = PURCHASE_AMOUNT.add(purchaseGasCost);
            expect(ethBalanceBefore.sub(ethBalanceAfterPurchase)).to.eq(expected);
        });

        it("their token balance increases by the correct amount for the ETH price paid", async () => {
            const tokenBalanceAfterPurchase = await tokenContract.balanceOf(signers[2].getAddress());
            expect(tokenBalanceAfterPurchase.sub(tokenBalanceBefore)).to.eq(PURCHASE_AMOUNT.mul(PURCHASE_RATIO));
        });

        it("mints new tokens", async () => {
            const totalSupplyAfterPurchase = await tokenContract.totalSupply();
            expect(totalSupplyAfterPurchase.sub(totalSupplyBeforePurchase)).to.eq(PURCHASE_AMOUNT.mul(PURCHASE_RATIO));
        })

        describe("When the user returns tokens", async () => {

            const RETURN_AMOUNT: BigNumber = numberToBN(1);
            let totalSupplyBeforeReturn: BigNumber;
            let tokenBalanceBeforeReturn: BigNumber;
            let ethBalanceBeforeReturn: BigNumber;
            let approveGasCost: number;
            let returnGasCost: number;

            before(async () => {
                totalSupplyBeforeReturn = await tokenContract.totalSupply();
                tokenBalanceBeforeReturn = await tokenContract.balanceOf(signers[2].address);
                ethBalanceBeforeReturn = await signers[2].getBalance();
                const approveTx = await tokenContract.connect(signers[2]).approve(arbitrageContract.address, RETURN_AMOUNT);
                const approveReceipt = await approveTx.wait();
                approveGasCost = bnToNumber(approveReceipt.gasUsed.mul(approveReceipt.effectiveGasPrice));
                const returnTx = await arbitrageContract.connect(signers[2]).returnTokens(RETURN_AMOUNT);
                const returnTxReceipt = await returnTx.wait();
                returnGasCost = bnToNumber(returnTxReceipt.gasUsed.mul(returnTxReceipt.effectiveGasPrice));
            });

            it("their token balance reduces by the amount returned", async () => {
                const tokenBalanceAfterReturn = await tokenContract.balanceOf(signers[2].getAddress());
                expect(tokenBalanceBeforeReturn.sub(tokenBalanceAfterReturn)).to.eq(RETURN_AMOUNT);
            });

            it("charges the correct amount of ETH", async () => {
                const ethBalanceAfterReturn = await signers[2].getBalance();
                const expected = (RETURN_AMOUNT.div(PURCHASE_RATIO / 2).sub(returnGasCost+approveGasCost));
                expect(ethBalanceAfterReturn.sub(ethBalanceBeforeReturn)).to.eq(expected);
            });

            it("burns the tokens returned", async () => {
                const totalSupplyAfterReturn = await tokenContract.totalSupply();
                expect(totalSupplyBeforeReturn.sub(totalSupplyAfterReturn)).to.eq(RETURN_AMOUNT);
            })
        });
    });

})



