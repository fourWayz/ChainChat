"use client"
import { motion } from "framer-motion";

const ChatBubble = ({
  message,
  isCurrentUser,
  timestamp,
}: {
  message: string;
  isCurrentUser: boolean;
  timestamp: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isCurrentUser
            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-none"
            : "bg-gray-700 text-gray-100 rounded-bl-none"
        }`}
      >
        <div className="text-sm">{message}</div>
        <div
          className={`text-xs mt-1 ${
            isCurrentUser ? "text-purple-100" : "text-gray-400"
          }`}
        >
          {timestamp}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBubble;