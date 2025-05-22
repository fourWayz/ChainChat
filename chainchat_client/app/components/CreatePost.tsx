import { useState } from "react";
import { motion } from "framer-motion";
import { FaPaperPlane, FaImage } from "react-icons/fa";
import axios from "axios";

const CreatePost = ({
  content,
  setContent,
  createPost,
  isLoading,
}: {
  content: string;
  setContent: (content: string) => void;
  createPost: (imageUrl?: string) => void;
  isLoading: boolean;
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadToPinata = async () => {
    if (!imageFile) return null;

    const formData = new FormData();
    formData.append("file", imageFile);

    const metadata = JSON.stringify({
      name: imageFile.name,
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 1,
    });
    formData.append("pinataOptions", options);

    try {
      setUploading(true);
      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxBodyLength: Infinity,
          headers: {
            "Content-Type": `multipart/form-data`,
             pinata_api_key: process.env.NEXT_PUBLIC_PINATA_KEY!,
             pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET!,
          },
        }
      );
      return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
    } catch (err) {
      console.error("Pinata upload failed", err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleCreatePost = async () => {
    let imageUrl;
    if (imageFile) {
      imageUrl = await handleUploadToPinata();
    }
    createPost(imageUrl!); // include image URL
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
        />

        <div className="mt-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-white cursor-pointer">
            <FaImage />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            Upload Image
          </label>

          <button
            onClick={handleCreatePost}
            disabled={isLoading || uploading || !content.trim()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading || uploading ? (
              <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            ) : (
              <FaPaperPlane />
            )}
          </button>
        </div>
      </div>

      {previewUrl && (
        <div className="mt-3">
          <img
            src={previewUrl}
            alt="Preview"
            className="rounded-lg max-h-60 object-contain border border-gray-600"
          />
        </div>
      )}
    </motion.div>
  );
};

export default CreatePost;
