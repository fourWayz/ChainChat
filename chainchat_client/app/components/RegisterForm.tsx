import { motion } from "framer-motion";

const RegisterForm = ({
  username,
  setUsername,
  registerUser,
  isLoading,
   isWalletConnected
}: {
  username: string;
  setUsername: (username: string) => void;
  registerUser: () => void;
  isLoading: boolean;
   isWalletConnected : boolean
}) => {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto bg-gray-800/70 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-gray-700/50"
    >
      <div className="p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Join Chain Chat</h2>
          <p className="text-gray-400">Create your decentralized identity</p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Choose a username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="coolusername"
            />
          </div>

         <button
          onClick={registerUser}
          disabled={!isWalletConnected } 
          className={`w-full ${
            !isWalletConnected 
              ? "bg-gray-600 cursor-not-allowed"
              : isLoading
                ? "bg-purple-600"
                : "bg-purple-500 hover:bg-purple-600"
          }`}
        >
          {!isWalletConnected ? (
            "Connect Wallet First"
          ) : isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Registering...
            </>
          ) : (
            "Complete Registration"
          )}
        </button>

         {!isWalletConnected && (
          <div className="text-yellow-400 text-sm mt-2">
            Please connect your wallet before registering
          </div>
        )}
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterForm;