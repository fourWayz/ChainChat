"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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
  getAAWalletAddress
} from '@/utils/aautils';

export default function SocialMediaApp() {
  const [username, setUsername] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<any>([]);
  const [registeredUser, setRegisteredUser] = useState<any>(null);
  const [commentText, setCommentText] = useState<Record<number, any>>({});
  const [signer, setSigner] = useState<ethers.Signer | undefined>(undefined);
  const [eoaAddress, setEoaAddress] = useState<string>('');
  const [aaAddress, setAaAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasCheckedInitialConnection, setHasCheckedInitialConnection] = useState(false);
 const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle');


const handleWalletConnected = async (eoaAddr: string, aaAddr: string) => {
  console.log('Connection initiated');
  if (connectionState === 'connected') return;
  
  setConnectionState('connecting');
  setIsLoading(true); // Ensure loading state is set
  
  try {
    const realSigner = await getSigner();
    const user = await getUserByAddress(realSigner, aaAddr);
    
    console.log('Fetched user:', user); // Debug log
    
    setEoaAddress(eoaAddr);
    setAaAddress(aaAddr);
    setSigner(realSigner);
    setRegisteredUser(user || null); // Explicitly set to null if no user
    
    if (user) {
      await fetchPosts(realSigner);
    }
    
    setConnectionState('connected');
  } catch (error) {
    console.error("Connection error:", error);
    setConnectionState('disconnected');
    setRegisteredUser(null);
  } finally {
    setIsLoading(false); // Ensure loading is cleared
    console.log('Connection state:', connectionState); // Debug log
  }
};

    const handleWalletDisconnected = () => {
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

  //  useEffect(() => {
  //    if (hasCheckedInitialConnection) return;

  //   const checkInitialConnection = async () => {
  //     setConnectionState('connecting');
  //     try {
  //       if (window.ethereum) {
  //         const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  //         if (accounts && accounts.length > 0) {
  //           const signer = await getSigner();
  //           const address = await signer.getAddress();
  //           const aaWalletAddress = await getAAWalletAddress(signer);
  //           await handleWalletConnected(address, aaWalletAddress);
  //           return;
  //         }
  //       }
  //       setConnectionState('disconnected');
  //     }
  //     finally{
  //        setHasCheckedInitialConnection(true);
  //       if (connectionState === 'connecting') {
  //         setConnectionState('disconnected');
  //       }
  //     }      
  //     // catch (error) {
  //     //   setConnectionState('disconnected');
  //     //   console.error("Initial connection check failed:", error);
  //     // }
  //   };

  //   checkInitialConnection();
  // }, [hasCheckedInitialConnection]);

  // Fetch user data
  const fetchRegisteredUser = async () => {
    if (!signer || !aaAddress) return;
    try {
      const user = await getUserByAddress(signer, aaAddress);
      console.log(user,'aa')
      setRegisteredUser(user || null);
    } catch (error) {
      setRegisteredUser(null);
      console.error(error);
    }
  };

  // Fetch posts
  const fetchPosts = async (signer:any) => {
    try {
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
    } catch (error: any) {
      console.error(error);
    }
  };

  // Post actions
  const register_user = async () => {
    try {
      if (!signer) return;
      await registerUser(signer, username);
      await fetchRegisteredUser();
    } catch (error: any) {
      console.error(error);
    }
  };

  const create_post = async () => {
    try {
      if (!signer) return;
      await createPost(signer, content);
      await fetchPosts(signer);
      setContent('');
    } catch (error: any) {
      console.error(error);
    }
  };

  const like_post = async (postId: number) => {
    try {
      if (!signer) return;
      await likePost(signer, postId);
      await fetchPosts(signer);
    } catch (error: any) {
      console.error(error);
    }
  };

  const add_comment = async (postId: number, comment: string) => {
    try {
      if (!signer) return;
      await addComment(signer, postId, comment);
      await fetchPosts(signer);
    } catch (error: any) {
      console.error(error);
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
       
        {/* Registration/Post Creation */}
       <AnimatePresence mode="wait">
  {connectionState === 'connected' && (
    <>
      {registeredUser ? (
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
          />
        </motion.div>
      ) : (
        <motion.div
          key="register-form"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <RegisterForm 
            username={username} 
            setUsername={setUsername} 
            registerUser={register_user} 
            isLoading={isLoading} 
          />
        </motion.div>
      )}
    </>
  )}
</AnimatePresence>

        {/* Posts Feed */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Latest Conversations</h2>

          <div className="space-y-6">
            {posts.map((post: any, index: number) => (
              <PostCard
                key={index}
                post={{ ...post, id: index }}
                onLike={like_post}
                onComment={add_comment}
                isRegistered={!!registeredUser}
              />
            ))}
          </div>
        </motion.div>
      </main>

      {/* Floating Action Button */}
      {registeredUser && (
        <FloatingActionButton onClick={() => setContent('')} />
      )}
    </div>
  );
}