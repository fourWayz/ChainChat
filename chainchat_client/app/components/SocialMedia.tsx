"use client";

import { useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { formatEther } from "ethers/lib/utils";
import axios from 'axios';

// Components
import ParticleBackground from "@/app/components/ParticleBackground";
import NavBar from "@/app/components/NavBar";
import WalletConnect from "@/app/components/WalletConnect";
import RegisterForm from "@/app/components/RegisterForm";
import CreatePost from "@/app/components/CreatePost";
import PostCard from "@/app/components/PostCard";
import UserProfile from "@/app/components/UserProfile";
import FloatingActionButton from "@/app/components/FloatingActionButton";

// Utils
import {
  getSupportedTokens,
  initAAClient,
  createPost,
  initAABuilder,
  getSigner,
  registerUser,
  likePost,
  addComment,
  getPostsCount,
  getPost,
  getComment,
  getUserByAddress,
  getAAWalletAddress,
  UploadProfileImage,
  getBalance,
  getFreePostRemaining
} from '@/utils/aautils';

export default function SocialMediaApp() {
  const [username, setUsername] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<any>([]);
  const [registeredUser, setRegisteredUser] = useState<any>(null);
  const [signer, setSigner] = useState<ethers.Signer | undefined>(undefined);
  const [eoaAddress, setEoaAddress] = useState<string>('');
  const [aaAddress, setAaAddress] = useState<string>('');
  const [balance, setBalance] = useState<any>()
  const [freePosts, setFreePosts] = useState<any>()
  const [isConnecting, setIsConnecting] = useState(false);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle');
  const [registrationKey, setRegistrationKey] = useState(0);

  useEffect(() => {
    if (signer) {
      fetchPosts(signer);
      getBalance(signer,aaAddress)
      getRemainingFreePosts(signer,aaAddress)

      // fetchRegisteredUser()
      // setNeedsRefresh(false);
    }
  }, [posts, signer]);

  useEffect(() => {
    if (signer && aaAddress) {
      getUserByAddress(signer, aaAddress).then(user => {
        if (user) setRegisteredUser(user);
        retrieveBalance(signer,aaAddress)
        getRemainingFreePosts(signer,aaAddress)
        fetchPosts(signer);
      });
    }
  }, [signer, aaAddress, registrationKey])


  useEffect(() => {
    // Check every 5 seconds if still connected but no user
    const interval = setInterval(() => {
      if (aaAddress && signer && !registeredUser) {
        console.log('Periodic registration check...');
        forceUserRefresh();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [aaAddress, signer, registeredUser]);

  const retrieveBalance = async (signer:any, aaAddress:any)=>{
    const balance = await getBalance(signer, aaAddress)
    setBalance(formatEther(balance.toString()))
  }

  const getRemainingFreePosts = async(signer:any,aaAddress:any)=>{
    const freepost = await getFreePostRemaining(signer,aaAddress)
    setFreePosts(freepost.toNumber())
  }

  const uploadToPinata = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        pinata_api_key: process.env.NEXT_PUBLIC_PINATA_KEY!,
        pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET!,
      },
    });

    return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
  };

  const handleWalletConnected = async (eoaAddr: string, aaAddr: string) => {
    console.log('Connection initiated');
    if (connectionState === 'connected') return;

    setConnectionState('connecting');
    setIsLoading(true);

    try {
      const realSigner = await getSigner();

      setEoaAddress(eoaAddr);
      setAaAddress(aaAddr);
      setSigner(realSigner);

      // EMERGENCY FIX
      window.addEventListener('visibilitychange', forceUserRefresh);
      window.addEventListener('focus', forceUserRefresh);

      try {
        // Attempt to get user, but don't fail if not found
        const user = await getUserByAddress(realSigner, aaAddr);
        console.log('User fetch result:', user);

        if (user) {
          // User exists - proceed normally
          setRegisteredUser(user);
          await fetchPosts(realSigner);
        } else {
          // User not found - this is normal for new users
          setRegisteredUser(null);
        }
        setConnectionState('connected');

      } catch (userError: any) {
        // Special handling for "user not found" errors
        if (userError.message.includes('User not found')) {
          console.log('New user detected - showing registration form');
          setRegisteredUser(null);
          setConnectionState('connected');
        } else {
          throw userError;
        }
      }

    } catch (error) {
      console.error("Actual connection error:", error);
      setConnectionState('disconnected');
      setRegisteredUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  const handleWalletDisconnected = () => {
    // Remove the listeners when disconnecting
    window.removeEventListener('visibilitychange', forceUserRefresh);
    window.removeEventListener('focus', forceUserRefresh)
    setConnectionState('disconnected');
    setEoaAddress('');
    setAaAddress('');
    setSigner(undefined);
    setRegisteredUser(null);
  };

  const handleConnectWallet = async () => {
    if (connectionState === 'connected' || isConnecting) return;

    setIsConnecting(true);
    try {
      const signer = await getSigner();
      const address = await signer.getAddress();
      const aaWalletAddress = await getAAWalletAddress(signer);

      await handleWalletConnected(address, aaWalletAddress);
    } catch (error) {
      console.error("Connection error:", error);
      setConnectionState('disconnected');
    } finally {
      setIsConnecting(false);
    }
  }

  const sharePost = async (postId: any) => {
    try {
      const shareUrl = `${window.location.origin}`;

      if (navigator.share) {
        await navigator.share({
          title: 'Check out this post',
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied!')
      }
    } catch (error) {
      throw error;
    }
  };
  const setProfileImage = async (file: File) => {
    if (!signer) return;
    try {
      const imageUrl = await uploadToPinata(file);
      await UploadProfileImage(signer, imageUrl);
      console.log("Profile image set:", imageUrl);
      await fetchRegisteredUser();
    } catch (err) {
      console.error("Error setting profile image", err);
    }
  };



  // Fetch user data
  const fetchRegisteredUser = async () => {
    console.log('checkings')
    if (!signer || !aaAddress) return;
    try {
      const user = await getUserByAddress(signer, '0x6158c3929EAC7beFe0Ae729b5f8E135010640181');
      console.log(user, 'aa')
      setRegisteredUser(user || null);
    } catch (error) {
      setRegisteredUser(null);
      console.error(error);
    }
  };

  // Fetch posts
  const fetchPosts = async (signer: any) => {
    try {
      // setIsLoading(true);
      if (!signer) return;
      const count = await getPostsCount(signer);
      const fetchedPosts = [];

      for (let i = 0; i < count; i++) {
        const post = await getPost(signer, i);
        const comments = [];

        for (let j = 0; j < post.commentsCount; j++) {
          const comment = await getComment(signer, i, j);
          comments.push(comment);
        }

        fetchedPosts.push({ ...post, comments });
      }

      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setIsLoading(false);
    }
  };

  // register user

  const register_user = async () => {
    try {
      if (!signer) return;
      setIsLoading(true)
      const tx = await registerUser(signer, username);
      if (tx.transactionHash) {
        toast.success('Registered Successfully!')
        forceUserRefresh();
      }
      setIsLoading(false)
    } catch (error: any) {
      toast.error('Error registering!')
      console.error(error);
      setIsLoading(false)

    }
  };
  const create_post = async (imageUrl?: string) => {
    try {
      if (!signer) return;
      setIsLoading(true)
      const tx = await createPost(signer, content, imageUrl ?? "");
      await tx.transactionHash
      setNeedsRefresh(true);
      setTimeout(()=>{

      },7000)

        toast.success("Post created successfully!");
      setContent('');
      setIsLoading(false)
    } catch (error: any) {
      setIsLoading(false)
      console.error(error);
    }
  };

  const like_post = async (postId: number) => {
    try {
      if (!signer) return;
      await likePost(signer, postId);
      setNeedsRefresh(true);
      toast.success("Post liked!");
      await fetchPosts(signer);
    } catch (error: any) {
      console.error(error);
    }
  };

  const add_comment = async (postId: number, comment: string) => {
    try {
      if (!signer) return;
      await addComment(signer, postId, comment);
      setNeedsRefresh(true);
      toast.success("Comment added!");
    } catch (error: any) {
      console.error(error);
    }
  };

  const forceUserRefresh = async () => {
    if (!signer || !aaAddress) return;

    console.log('Forcing user data refresh...');
    try {
      const user = await getUserByAddress(signer, aaAddress);
      if (user) {
        console.log('Found registered user:', user);
        setRegisteredUser(user);
        await fetchPosts(signer)
      } else {
        console.log('No user found');
        setRegisteredUser(null);
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };



  // Loading state
  if (connectionState === 'connecting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-300">Connecting to wallet...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-x-hidden">
      <ParticleBackground />
      <ToastContainer position="top-right" autoClose={3000} />

      <NavBar>
        <WalletConnect
          isConnected={connectionState === 'connected'}
          isConnecting={isConnecting}
          onConnect={handleConnectWallet}
          onDisconnect={handleWalletDisconnected}
          eoaAddress={eoaAddress}
          aaAddress={aaAddress}
        />
      </NavBar>


      <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        {!registeredUser && (
          <motion.div
            key="register-form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <RegisterForm
              username={username}
              setUsername={setUsername}
              registerUser={register_user}
              isLoading={isLoading}
              isWalletConnected={connectionState === 'connected'}
            />
          </motion.div>
        )}
        {registeredUser && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <UserProfile
              user={{
                username: registeredUser.username || "Anonymous",
                address: registeredUser.userAddress,
                profileImage: registeredUser.profileImage,
                balance,
              }}
              onSetProfileImage={setProfileImage}
            />
          </motion.div>
        )}

        {/* Registration/Post Creation */}
        <AnimatePresence mode="wait">
          {registeredUser && (
            <>
              <motion.div
                key="create-post"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CreatePost
                  content={content}
                  setContent={setContent}
                  createPost={create_post}
                  isLoading={isLoading}
                  freePosts={freePosts}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {registeredUser && (
          <>
            {/* Posts Feed */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Latest Posts</h2>

              <div className="space-y-6">
                {posts.map((post: any, index: number) => {
                  const safePost = {
                    ...post,
                    id: index,
                    likes: BigNumber.isBigNumber(post.likes) ? post.likes.toNumber() : post.likes,
                    commentsCount: BigNumber.isBigNumber(post.commentsCount) ? post.commentsCount.toNumber() : post.commentsCount,
                    timestamp: BigNumber.isBigNumber(post.timestamp) ? post.timestamp.toNumber() : post.timestamp,
                  };

                  return (
                    <PostCard
                      key=
                      {index}
                      post={safePost}
                      onLike={like_post}
                      onComment={add_comment}
                      onShare={sharePost}
                      isRegistered={!!registeredUser}
                      signer={signer}
                      getUserByAddress={getUserByAddress}
                    />
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </main>

      {/* Floating Action Button */}
      {registeredUser && (
        <FloatingActionButton onClick={() => setContent('')} />
      )}
    </div>
  );
}