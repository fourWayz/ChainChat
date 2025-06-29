"use client"
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FiLogIn, FiLogOut, FiCopy, FiCheck, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { usePrivy, useWallets, useCreateWallet } from '@privy-io/react-auth';

interface WalletConnectProps {
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
  eoaAddress?: string;
  aaAddress?: string;
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  isConnected,
  isConnecting,
  onConnect,
  onDisconnect,
  eoaAddress = '',
  aaAddress = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const { login, logout, user,authenticated,ready  } = usePrivy();
  const { wallets } = useWallets()
  const {createWallet} = useCreateWallet({
    onSuccess: ({wallet}) => {
        console.log('Created wallet ', wallet);
    },
    onError: (e) => {
        console.error('Failed to create wallet with error ', e)
    }
})

  const privyWallet = wallets.find(w => w.walletClientType === 'privy');
  const activeAddress = eoaAddress || privyWallet?.address;
  const isPrivyConnected = !eoaAddress && user; // Privy-only connection


  const copyAddress = () => {
    if (!activeAddress) return;
    navigator.clipboard.writeText(activeAddress);
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

const signIn = async () => {
  try {
    if (!authenticated) {
      login();
      // Wait for user to be populated
      // await new Promise((resolve) => {
      //   const checkUser = () => {
      //     if (user) resolve(true);
      //     else setTimeout(checkUser, 100);
      //   };
      //   checkUser();
      // });
      await createWallet();
    }
  } catch (err) {
    console.error(err);
    toast.error("Error during sign in");
  }
};


  return (
    <div className="relative">
      <AnimatePresence>
        {!isConnected && !isPrivyConnected ? (
          <motion.div
            className="flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Traditional Wallet Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onConnect}
              disabled={isConnecting}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium ${isConnecting ? 'bg-gray-600' : 'bg-blue-500 text-white'
                }`}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </motion.button>

            {/* OR divider */}
            <div className="flex items-center text-gray-400">or</div>

            {/* Privy Social Login */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={signIn}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-medium bg-gradient-to-r from-purple-600 to-pink-500 text-white"
            >
              <FiUser /> Sign In
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="connected-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            {/* Address Display */}
            <div className="relative group">
              <button
                onClick={copyAddress}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 rounded-full text-sm font-mono hover:border-purple-500"
              >
                <span className="text-purple-400">
                  {activeAddress?.slice(0, 6)}...{activeAddress?.slice(-4)}
                </span>
                {copied ? <FiCheck /> : <FiCopy />}
              </button>
            </div>

            {/* Wallet Menu Trigger */}
            <button
              onClick={() => setShowWalletMenu(!showWalletMenu)}
              className="p-2 bg-gray-800 rounded-full hover:bg-gray-700"
            >
              <FiUser />
            </button>

            {/* Wallet Menu Dropdown */}
            {showWalletMenu && (
              <motion.div
                className="absolute top-full right-0 mt-2 bg-gray-900 rounded-lg shadow-lg border border-gray-700 z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="p-2 text-sm">
                  {isPrivyConnected ? (
                    <button
                      onClick={() => { logout(); onDisconnect(); }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-800 rounded"
                    >
                      Sign Out (Privy)
                    </button>
                  ) : (
                    <>
                      <div className="px-4 py-2 text-gray-400">Connected with MetaMask</div>
                      <button
                        onClick={() => { onDisconnect(); login(); }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-800 rounded"
                      >
                        Switch to Social Login
                      </button>
                      <button
                        onClick={onDisconnect}
                        className="w-full px-4 py-2 text-left hover:bg-gray-800 rounded"
                      >
                        Disconnect
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletConnect 