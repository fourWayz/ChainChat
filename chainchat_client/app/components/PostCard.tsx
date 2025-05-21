"use client"
import { motion } from "framer-motion";
import { useState } from "react";
import { FaThumbsUp, FaComment, FaShare } from "react-icons/fa";

const PostCard = ({
  post,
  onLike,
  onComment,
  isRegistered,
}: {
  post: any;
  onLike: (postId: number) => void;
  onComment: (postId: number, comment: string) => void;
  isRegistered: boolean;
}) => {
  const [commentText, setCommentText] = useState("");

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-gray-700/50 mb-6"
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">
            {post[0].charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <p className="text-white font-medium">{post[0]}</p>
            <p className="text-gray-400 text-xs">2 hours ago</p>
          </div>
        </div>

        <p className="text-gray-200 mb-4">{post[1]}</p>

        <div className="flex justify-between items-center text-gray-400 mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onLike(post.id)}
              className="flex items-center space-x-1 hover:text-pink-500 transition-colors"
            >
              <FaThumbsUp />
              <span>{post[3]?.toString()}</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-blue-400 transition-colors">
              <FaComment />
              <span>{post.comments.length}</span>
            </button>
          </div>
          <button className="hover:text-purple-400 transition-colors">
            <FaShare />
          </button>
        </div>

        {isRegistered && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() => {
                onComment(post.id, commentText);
                setCommentText("");
              }}
              className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Post Comment
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PostCard;