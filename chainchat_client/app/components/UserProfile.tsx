import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePrivy, useWallets } from "@privy-io/react-auth";

interface UserProfileProps {
  user: {
    username: string;
    address?: string;
    profileImage?: string;
    balance?: string;
    userStats?: any;
    bio?: string;
    coverPhoto?: string;
    interests?: string[];
  };
  onSetProfileImage: (file: File) => void;
  onSetCoverPhoto: (file: File) => void;
   onUpdateProfile?: (
    username: string,
    profileImage: string,
    bio: string,
    coverPhoto: string,
    interests: string[]
  ) => void;
}
const UserProfile = ({
  user,
  onSetProfileImage,
  onSetCoverPhoto,
  onUpdateProfile
}: UserProfileProps) => {
  const profileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user.username || "Anonymous");
  const [bio, setBio] = useState(user.bio || "");
  const [coverPhoto, setCoverPhoto] = useState(user.coverPhoto || "");
  const [interests, setInterests] = useState(user.interests || []);
  const [newInterest, setNewInterest] = useState("");

  const { wallets } = useWallets();
  const { login, authenticated, user: privyUser } = usePrivy();
  const connectedWallet = wallets.find(w => w.address === user.address);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onSetProfileImage(file);
    }
  };

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const coverUrl = URL.createObjectURL(file);
      setCoverPreview(coverUrl);
      onSetCoverPhoto(file);
      setCoverPhoto(coverUrl); // Update local state
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim()) {
      setInterests(prev => [...prev, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const handleSave = () => {
    onUpdateProfile?.(
      username,
      preview || user.profileImage || "",
      bio,
      coverPreview || user.coverPhoto || "",
      interests
    );
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/70 backdrop-blur-lg rounded-xl overflow-hidden shadow-lg border border-gray-700/50 mb-6"
    >
      {/* Cover Photo Section */}
      <div className="relative group h-40 w-full bg-gray-900">
        {coverPreview || user.coverPhoto ? (
          <img
            src={coverPreview || user.coverPhoto}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No Cover Photo
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          ref={coverRef}
          className="hidden"
          onChange={handleCoverPhotoChange}
        />
        <button
          onClick={() => coverRef.current?.click()}
          className="absolute right-3 bottom-3 bg-black/60 text-white px-3 py-1 text-sm rounded-md opacity-0 group-hover:opacity-100 transition"
        >
          Change Cover Photo
        </button>
      </div>

      {/* Profile Info */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {user.profileImage || preview ? (
                <img
                  src={preview || user.profileImage}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-purple-500"
                />
              ) : (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                ref={profileRef}
                className="hidden"
                onChange={handleProfileImageChange}
              />
              <button
                onClick={() => profileRef.current?.click()}
                className="mt-2 text-xs text-purple-400 hover:underline"
              >
                Change profile image
              </button>
            </div>

            <div>
              {editing ? (
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="bg-gray-900 text-white border border-gray-600 rounded px-2 py-1 w-full"
                />
              ) : (
                <h3 className="text-xl font-bold text-white">{user.username}</h3>
              )}
              <p className="text-gray-400 text-sm">
                {user.address?.slice(0, 6)}...{user.address?.slice(-4)}
              </p>
              {user.balance && (
                <div className="mt-2 flex items-center">
                  <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-md text-xs font-mono">
                    {parseFloat(user.balance).toFixed(2)} CCT
                  </span>
                  {connectedWallet && (
                    <span className="ml-2 text-xs text-gray-400">
                      ({connectedWallet.connectorType})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {authenticated && (
            <div className="flex space-x-2">
              {privyUser?.google && <img src="/google-logo.jpg" className="w-5 h-5" />}
              {privyUser?.github && <img src="/github-logo.jpg" className="w-5 h-5" />}
              {privyUser?.email && <img src="/email-logo.png" className="w-5 h-5" />}
            </div>
          )}
        </div>

        {!authenticated && (
          <button
            onClick={login}
            className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg"
          >
            Connect Social Accounts
          </button>
        )}

        {/* Editable Fields */}
        <div className="mt-6 space-y-3">
          {editing ? (
            <>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="w-full p-2 rounded bg-gray-900 text-white border border-gray-600"
                placeholder="Your bio"
              />
              <div className="flex flex-wrap gap-2">
                {interests.map((tag, i) => (
                  <span key={i} className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInterest}
                  onChange={e => setNewInterest(e.target.value)}
                  className="flex-1 p-2 rounded bg-gray-900 text-white border border-gray-600"
                  placeholder="Add interest"
                />
                <button
                  onClick={handleAddInterest}
                  className="bg-purple-600 px-4 py-2 text-white rounded hover:bg-purple-700"
                >
                  Add
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="bg-red-600 px-4 py-2 rounded text-white hover:bg-red-700"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              {user.bio && <p className="text-gray-300">{user.bio}</p>}
              {user.interests && user.interests.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {user.interests.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={() => setEditing(true)}
                className="mt-3 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded"
              >
                Edit Profile
              </button>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{user.userStats?.posts?.toString() ?? 0}</p>
            <p className="text-gray-400 text-sm">Posts</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{user.userStats?.likes?.toString() ?? 0}</p>
            <p className="text-gray-400 text-sm">Likes</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{user.userStats?.comments?.toString() ?? 0}</p>
            <p className="text-gray-400 text-sm">Comments</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


export default UserProfile;
