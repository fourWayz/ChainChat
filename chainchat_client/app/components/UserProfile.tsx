import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useBalance } from "wagmi";

interface UserProfileProps {
  user: {
    username: string;
    address?: string;
    profileImage?: string;
    balance? : string;
  };
  onSetProfileImage: (file: File) => void;
}

const UserProfile = ({ user, onSetProfileImage }: UserProfileProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { wallets } = useWallets();
  const { login, authenticated, user: privyUser } = usePrivy();
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onSetProfileImage(file);
    }
  };

  const connectedWallet = wallets.find(w => w.address === user.address);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700/50 mb-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {user.profileImage || preview ? (
              <img
                src={preview || user.profileImage}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-purple-500"
              />
            ) : (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-xs text-purple-400 hover:underline"
            >
              Change profile image
            </button>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">{user.username}</h3>
            <p className="text-gray-400 text-sm">
              {user.address?.slice(0, 6)}...{user.address?.slice(-4)}
            </p>
            
            {/* Wallet Balance Display */}
            {user.balance && (
              <div className="mt-2 flex items-center">
                <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-md text-xs font-mono">
                  {parseFloat(user.balance).toFixed(2)} CCT
                </span>
                {connectedWallet && (
                  <span className="ml-2 text-xs text-gray-400">
                    ({connectedWallet.connectorType})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Social Login Connections */}
        {authenticated && (
          <div className="flex space-x-2">
            {privyUser?.google && (
              <div className="p-1 bg-white rounded-full">
                <img src="/google-icon.png" alt="Google" className="w-5 h-5" />
              </div>
            )}
            {privyUser?.github && (
              <div className="p-1 bg-white rounded-full">
                <img src="/github-icon.png" alt="GitHub" className="w-5 h-5" />
              </div>
            )}
            {privyUser?.email && (
              <div className="p-1 bg-white rounded-full">
                <img src="/email-icon.png" alt="Email" className="w-5 h-5" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Social Login Button (if not authenticated) */}
      {!authenticated && (
        <button
          onClick={login}
          className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg flex items-center justify-center"
        >
          Connect Social Accounts
        </button>
      )}

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-white">142</p>
          <p className="text-gray-400 text-sm">Posts</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-white">3.2k</p>
          <p className="text-gray-400 text-sm">Likes</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-white">428</p>
          <p className="text-gray-400 text-sm">Comments</p>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfile;