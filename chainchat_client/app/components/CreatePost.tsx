import { motion } from "framer-motion";
import { FaPaperPlane } from "react-icons/fa";

const CreatePost = ({
  content,
  setContent,
  createPost,
  isLoading,
}: {
  content: string;
  setContent: (content: string) => void;
  createPost: () => void;
  isLoading: boolean;
}) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700/50 mb-8"
    >
      <h3 className="text-xl font-semibold text-white mb-4">Create Post</h3>
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none min-h-[120px]"
        />
        <button
          onClick={createPost}
          disabled={isLoading || !content.trim()}
          className="absolute right-3 bottom-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
          ) : (
            <FaPaperPlane />
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default CreatePost;