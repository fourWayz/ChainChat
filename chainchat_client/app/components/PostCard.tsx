"use client"
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FaThumbsUp, FaComment, FaShare, FaRegCopy } from "react-icons/fa";
import { formatDistanceToNow } from 'date-fns';
import CommentSection from "./CommentSection";
import { toast } from 'react-toastify';

interface UserProfile {
  username: string;
  profileImage?: string;
  address: string;
}

interface Comment {
  id: number;
  commenter: string;
  content: string;
  timestamp: number;
  likes: number;
  image?: string;
}

interface Post {
  id: number;
  author: string;
  content: string;
  image?: string;
  timestamp: number;
  likes: number;
  comments: Comment[];
}

interface PostCardProps {
  post: Post;
  onLike: (postId: number) => void;
  onComment: (postId: number, comment: string) => void;
  onShare: (postId: number) => Promise<void>;
  isRegistered: boolean;
  getUserByAddress: (signer : any, address: string) => Promise<UserProfile>;
  signer :any
}
const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onLike, 
  onComment, 
  onShare, 
  isRegistered,
  getUserByAddress,
  signer
}) => {
  const [showComments, setShowComments] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
const [authorProfile, setAuthorProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // Fetch author profile
  useEffect(() => {
    const loadAuthorProfile = async () => {
      try {
        const profile = await getUserByAddress(signer,post.author);
        setAuthorProfile(profile);
      } catch (error) {
        console.error("Failed to fetch author profile:", error);
      } finally {
        setIsProfileLoading(false);
      }
    };

    loadAuthorProfile();
  }, [post.author, getUserByAddress]);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await onShare(post.id);
      toast.success("Post shared successfully!");
    } catch (error) {
      toast.error("Failed to share post");
      console.error("Sharing error:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(post.author);
    toast.info("Address copied to clipboard");
  };

  return (
    <motion.div 
      className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700/50"
      whileHover={{ scale: 1.01 }}
    >
      {/* Post header with profile picture */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {isProfileLoading ? (
            <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
          ) : (
            <div className="relative w-10 h-10">
              {authorProfile?.profileImage ? (
                <img
                  src={authorProfile.profileImage}
                  alt={authorProfile.username || 'User'}
                  className="w-full h-full rounded-full object-cover border-2 border-purple-500"
                  onError={(e) => {
                    e.currentTarget.src = '/default-avatar.png';
                    e.currentTarget.onerror = null;
                  }}
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {authorProfile?.username?.charAt(0)?.toUpperCase() || post.author.charAt(2).toUpperCase()}
                </div>
              )}
            </div>
          )}
          <div className="ml-3">
            <p className="text-white font-medium">
              {authorProfile?.username || `${post.author.slice(0, 6)}...${post.author.slice(-4)}`}
            </p>
            <p className="text-gray-400 text-xs">
              {formatDistanceToNow(new Date(post.timestamp * 1000))} ago
            </p>
          </div>
        </div>
        <button 
          onClick={copyAddress}
          className="text-gray-400 hover:text-purple-400 p-1"
          title="Copy address"
        >
          <FaRegCopy size={14} />
        </button>
      </div>

      {/* Post content */}
      <p className="text-gray-200 mb-4">{post.content}</p>

      {/* Post image */}
      {post.image && (
        <div className="mb-4 rounded-lg overflow-hidden border border-gray-700">
          <img 
            src={post.image} 
            alt="Post content" 
            className="w-full h-auto max-h-96 object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-between items-center text-gray-400 mb-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => onLike(post.id)} 
            className="flex items-center space-x-1 hover:text-pink-500"
          >
            <FaThumbsUp />
            <span>{post.likes}</span>
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 hover:text-blue-400"
          >
            <FaComment />
            <span>{post.comments.length}</span>
          </button>
        </div>
        <button
          onClick={handleShare}
          disabled={isSharing}
          className={`flex items-center space-x-1 ${isSharing ? 'text-gray-500' : 'hover:text-green-400'}`}
        >
          <FaShare />
          <span>{isSharing ? 'Sharing...' : 'Share'}</span>
        </button>
      </div>

      {/* Comment Section */}
      {showComments && (
        <CommentSection 
          comments={post.comments}
          postId={post.id}
          onAddComment={onComment}
          isRegistered={isRegistered}
        />
      )}
    </motion.div>
  );
};

export default PostCard;