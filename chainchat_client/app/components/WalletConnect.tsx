import React, { useState, useEffect } from 'react';
import { getSigner, getAAWalletAddress } from '@/utils/aautils';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogIn, FiLogOut, FiCopy, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';

interface WalletConnectProps {
  onWalletConnected: (eoaAddress: string, aaAddress: string) => void;
  onDisconnect: () => void;
  initialConnectionState: boolean;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ 
  onWalletConnected, 
  onDisconnect,
  initialConnectionState
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [eoaAddress, setEoaAddress] = useState('');
  const [aaAddress, setAaAddress] = useState('');
  const [copied, setCopied] = useState(false);

  const connectWallet = async () => {
     if (isConnected) return; // Prevent reconnection if already connected
     setIsConnecting(true);
    try {
      setIsLoading(true);
      
      // Get signer from wallet
      const signer = await getSigner();
      if (!signer) {
        throw new Error("Failed to get signer from wallet");
      }
      
      // Get EOA address
      const address = await signer.getAddress();
      setEoaAddress(address);
      
      // Get AA wallet address
      const aaWalletAddress = await getAAWalletAddress(signer);
      setAaAddress(aaWalletAddress);
      
      // Update state
      setIsConnected(true);
      
      // Call callback if provided
      if (onWalletConnected) {
        onWalletConnected(address, aaWalletAddress);
      }

      toast.success('Wallet connected successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'dark',
      });
      
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast.error(error.message || "Failed to connect wallet", {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'dark',
      });
    } finally {
      setIsConnecting(false);
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
     onDisconnect();
    setIsConnected(false);
    setEoaAddress('');
    setAaAddress('');
    toast.info('Wallet disconnected', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: true,
    });
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(eoaAddress);
    setCopied(true);
    toast.success('Address copied to clipboard!', {
      position: 'top-right',
      autoClose: 1500,
      hideProgressBar: true,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Check wallet connection on mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            await connectWallet();
          }
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    };
    
    checkWalletConnection();
    
    // Account change listener
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      });
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  return (
    <div className="relative">
       {!initialConnectionState ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className={`... ${isConnecting ? 'opacity-75' : ''}`}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
      <AnimatePresence>
        {!isConnected ? (
          <motion.button
            key="connect-button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={connectWallet}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
              isLoading
                ? "bg-gray-600 text-gray-300 cursor-wait"
                : "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg hover:shadow-purple-500/30"
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <FiLogIn className="text-lg" />
                Connect Wallet
              </>
            )}
          </motion.button>
        ) : (
          <motion.div
            key="connected-state"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-3"
          >
            <div className="relative group">
              <button
                onClick={copyAddress}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 rounded-full text-sm font-mono border border-gray-700 hover:border-purple-500 transition-colors"
                title="Copy address"
              >
                <span className="text-purple-400">
                  {eoaAddress.slice(0, 6)}...{eoaAddress.slice(-4)}
                </span>
                {copied ? (
                  <FiCheck className="text-green-400" />
                ) : (
                  <FiCopy className="text-gray-400 group-hover:text-purple-400 transition-colors" />
                )}
              </button>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {copied ? "Copied!" : "Click to copy"}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={disconnectWallet}
              className="p-2 bg-gray-800 rounded-full text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              title="Disconnect"
            >
              <FiLogOut />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      )}
      {/* AA Address Tooltip */}
      {isConnected && aaAddress && (
        <div className="absolute top-full right-0 mt-2 bg-gray-900 text-xs p-2 rounded-lg shadow-lg border border-gray-700 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <div className="text-purple-400 font-mono">AA: {aaAddress}</div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;