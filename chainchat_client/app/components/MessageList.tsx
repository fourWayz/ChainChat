import { motion, AnimatePresence } from "framer-motion";
import ChatBubble from "./ChatBubble";

const MessageList = ({ messages }: { messages: any[] }) => {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      <AnimatePresence>
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChatBubble
              message={message.content}
              isCurrentUser={message.isCurrentUser}
              timestamp={message.timestamp}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default MessageList;