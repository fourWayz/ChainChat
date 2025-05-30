import { useRef, useState } from "react";
import { motion } from "framer-motion";

const UserProfile = ({
  user,
  onSetProfileImage,
}: {
  user: any;
  onSetProfileImage: (file: File) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onSetProfileImage(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700/50 mb-6"
    >
      <div className="flex items-center space-x-4">
      <div className="relative">
  {user.profileImage || preview ? (
    <img
      src={preview || user.profileImage}
      alt="Profile"
      className="w-16 h-16 rounded-full object-cover border-2 border-purple-500"
    />
  ) : (
    <div
      className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
    >
      {user.username.charAt(0).toUpperCase()}
    </div>
  )}
  <input
    type="file"
    accept="image/*"
    ref={fileInputRef}
    className="hidden"
    onChange={handleImageChange}
  />
  <button
    onClick={() => fileInputRef.current?.click()}
    className="mt-2 text-xs text-purple-400 hover:underline"
  >
    Change profile image
  </button>
</div>

        <div>
          <h3 className="text-xl font-bold text-white">{user.username}</h3>
          <p className="text-gray-400 text-sm">
            {user.address?.slice(0, 6)}...{user.address?.slice(-4)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-white">142</p>
          <p className="text-gray-400 text-sm">Posts</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-white">3.2k</p>
          <p className="text-gray-400 text-sm">Likes</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-white">428</p>
          <p className="text-gray-400 text-sm">Comments</p>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfile;
