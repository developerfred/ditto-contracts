const contractConfig = require('../contract-config.js')
const Ditto = artifacts.require("Ditto");
const SimpleOracle = artifacts.require("SimpleOracle");
const valueStart = web3.utils.toBN("1e18")
const Master = artifacts.require("Master");
const DittoClaimDistributor = artifacts.require('MerkleDistributor');
const BigNumber = web3.BigNumber;

module.exports = function (deployer, network, accounts) {
    deployer.then(async () => {
        // Deploy Ditto ERC20
        await deployer.deploy(Ditto);
        let dittoAddress = await deployer.deploy(Ditto);

        // Deploy SimpleOracle and set 1 USD price
        await deployer.deploy(SimpleOracle);
        simpleOracleInstance = await SimpleOracle.deployed();
        await simpleOracleInstance.setData(valueStart);

        let oracleAddress = await deployer.deploy(SimpleOracle);

        // Deploy Master and pass Ditto ERC20 address
        await deployer.deploy(Master, dittoAddress.address);
        masterInstance = await Master.deployed();
        await masterInstance.setMarketOracle(oracleAddress.address);

        // set master address on DittoERC20 contract
        let masterAdress = await deployer.deploy(Master, dittoAddress.address);
        dittoInstace = await Ditto.deployed();
        await dittoInstace.setMaster(masterAdress.address);

        // Deploy MerkleDistribution Contract
        const config = contractConfig[network]
        let { dittoTokenAddress, merkleRoot, withdrawBlock, withdrawAddress } = config

        withdrawBlock = withdrawBlock || 120
        withdrawAddress = withdrawAddress || accounts[20]

        console.log("dittoTokenAddress", dittoTokenAddress)
        console.log("merkleRoot", merkleRoot)
        console.log("withdrawBlock", withdrawBlock)
        console.log("withdrawAddress", withdrawAddress)

        await deployer.deploy(DittoClaimDistributor, dittoTokenAddress, merkleRoot, withdrawBlock, withdrawAddress)
    })
};
