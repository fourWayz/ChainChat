"use client"
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FaReply, FaThumbsUp } from "react-icons/fa";

const CommentSection = ({
  comments,
  postId,
  onAddComment,
  isRegistered,
}: {
  comments: any[];
  postId: number;
  onAddComment: (postId: number, comment: string) => void;
  isRegistered: boolean;
}) => {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  return (
    <div className="mt-6 border-t border-gray-700/30 pt-4">
      <h4 className="text-lg font-semibold text-gray-300 mb-4">Comments</h4>

      <div className="space-y-4">
        <AnimatePresence>
          {comments.map((comment, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="pl-4 border-l-2 border-purple-500/20"
            >
              <div className="flex items-start">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-8 h-8 rounded-full flex-shrink-0" />
                <div className="ml-3 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-200">
                      {comment.commenter.slice(0, 8)}...{comment.commenter.slice(-4)}
                    </span>
                    <span className="text-xs text-gray-500">2h ago</span>
                  </div>
                  <p className="text-gray-300 mt-1">{comment.content}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <button className="flex items-center text-xs text-gray-400 hover:text-purple-400">
                      <FaThumbsUp className="mr-1" /> 12
                    </button>
                    {isRegistered && (
                      <button
                        onClick={() => setReplyingTo(replyingTo === index ? null : index)}
                        className="flex items-center text-xs text-gray-400 hover:text-blue-400"
                      >
                        <FaReply className="mr-1" /> Reply
                      </button>
                    )}
                  </div>

                  {replyingTo === index && (
                    <div className="mt-3 flex">
                      <input
                        type="text"
                        placeholder="Write a reply..."
                        className="flex-1 bg-gray-700/50 border border-gray-600 rounded-l-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <button className="bg-purple-500 text-white px-3 py-2 rounded-r-lg text-sm hover:bg-purple-600">
                        Send
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isRegistered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1 flex">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-gray-700/50 border border-gray-600 rounded-l-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button
                  onClick={() => {
                    if (newComment.trim()) {
                      onAddComment(postId, newComment);
                      setNewComment("");
                    }
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-r-lg hover:opacity-90"
                >
                  Post
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;