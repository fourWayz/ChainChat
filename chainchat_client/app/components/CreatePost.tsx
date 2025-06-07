import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPaperPlane, FaImage, FaTimes } from "react-icons/fa";
import axios from "axios";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "react-toastify";
import { uploadToIPFS } from "../lib/ipfs";

const CreatePost = ({
  content,
  setContent,
  createPost,
  isLoading,
  freePosts
}: {
  content: string;
  setContent: (content: string) => void;
  createPost: (imageUrl?: string) => Promise<void>;
  isLoading: boolean;
  freePosts: any

}) => {
  const { user } = usePrivy();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [postCost, setPostCost] = useState<number>(0);
  const [freePostsRemaining, setFreePostsRemaining] = useState<number>(0);

  // Check user's free post allowance and post cost
  useEffect(() => {
    console.log(freePosts,'test')
    setPostCost(10); // 10 CCT
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("Image size must be less than 10MB");
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreatePost = async () => {
    if (!content.trim()) {
      toast.error("Post content cannot be empty");
      return;
    }

    try {
      let imageUrl;
      if (imageFile) {
        setIsUploading(true);
        imageUrl = await uploadToIPFS(imageFile, (progress) => {
          setUploadProgress(progress);
        });
        setIsUploading(false);
      }

      await createPost(imageUrl);

      // Reset form on success
      setContent("");
      removeImage();
      toast.success("Post created successfully!");
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error(error.message || "Failed to create post");
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700/50 mb-8"
    >
      <h3 className="text-xl font-semibold text-white mb-4">Create Post</h3>

      <div className="relative mb-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none min-h-[120px]"
          maxLength={280} // Character limit
        />
        <div className="text-xs text-gray-400 text-right mt-1">
          {content.length}/280
        </div>

        {/* Cost indicator */}
        <div className="text-sm text-purple-300 mt-2">
          {freePosts > 0 ? (
            <span>Free posts remaining: {freePosts}</span>
          ) : (
            <span>Cost: {postCost} CCT</span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-white cursor-pointer hover:text-purple-300 transition-colors">
              <FaImage />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />
              Add Media
            </label>
          </div>

          <button
            onClick={handleCreatePost}
            disabled={isLoading || isUploading || !content.trim()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading || isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                {isUploading ? `Uploading (${uploadProgress}%)` : "Posting..."}
              </>
            ) : (
              <>
                <FaPaperPlane />
                Post
              </>
            )}
          </button>
        </div>
      </div>

      {/* Image preview with upload progress */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 relative"
          >
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="rounded-lg max-h-60 w-full object-contain border border-gray-600"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-gray-900/80 rounded-full p-2 hover:bg-gray-800 transition-colors"
              >
                <FaTimes className="text-white" />
              </button>
            </div>

            {isUploading && (
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CreatePost;