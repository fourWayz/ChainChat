import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa";

const FloatingActionButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg flex items-center justify-center z-50"
    >
      <FaPlus className="text-xl" />
    </motion.button>
  );
};

export default FloatingActionButton;