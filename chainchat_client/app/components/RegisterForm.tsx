import { motion } from "framer-motion";

const RegisterForm = ({
  username,
  setUsername,
  registerUser,
  isLoading,
}: {
  username: string;
  setUsername: (username: string) => void;
  registerUser: () => void;
  isLoading: boolean;
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
            disabled={isLoading || !username.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                <span>Registering...</span>
              </div>
            ) : (
              "Complete Registration"
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterForm;