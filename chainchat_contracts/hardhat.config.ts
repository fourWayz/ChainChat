import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'hardhat-deploy'
import * as dotenv from 'dotenv'
dotenv.config()


const TESTNET_RPC= process.env.NERO_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    nero_testnet: {
      url: TESTNET_RPC,
      accounts: [PRIVATE_KEY!],
      saveDeployments: true,
    },
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    }
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    },

  }
};

export default config;
