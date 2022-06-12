// async function deployFunc(hre) {
// 	console.log("Hi!!")
// }

// module.exports.default = deployFunc
// module.exports = async (hre) => {
// 	const { getNamedAccounts, deployments } = hre
// }
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../Utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log } = deployments
	const { deployer } = await getNamedAccounts()
	const chainId = network.config.chainId

	let ethUsdPriceFeedAddress
	if (chainId == 31337) {
		const ethUsdAggregator = await deployments.get("MockV3Aggregator")
		ethUsdPriceFeedAddress = ethUsdAggregator.address
	} else {
		ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
	}

	//use mocks on localhost
	const fundMe = await deploy("FundMe", {
		from: deployer,
		args: [ethUsdPriceFeedAddress], //price feed address
		log: true,
		waitConfirmations: network.config.blockConfirmations || 1,
	})

	if (
		!developmentChains.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	) {
		await verify(fundMe.address, [ethUsdPriceFeedAddress])
	}

	log(
		"-----------------------------------------------------------------------------------------"
	)
}
module.exports.tags = ["all", "FundMe"]
