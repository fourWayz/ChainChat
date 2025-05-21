"use client"

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Container, Navbar, Nav, Card, Button, Form, Alert, Row, Col, Spinner, Modal } from "react-bootstrap";
import { FaThumbsUp, FaCommentDots, FaLink } from "react-icons/fa";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine, ISourceOptions } from "tsparticles-engine"; 
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {  toast } from 'react-toastify';
import { getSupportedTokens, initAAClient,createPost,
  initAABuilder,getSigner,registerUser, 
  likePost,
  addComment,
  getPostsCount,
  getPost,
  getComment,
  getUserByAddress} from '@/utils/aautils';
import WalletConnect from "./WalletConnect";
import ParticleBackground from "@/app/components/ParticleBackground";
import NavBar from "@/app/components/NavBar";
import PostCard from "@/app/components/PostCard";
import RegisterForm from "@/app/components/RegisterForm";
import CreatePost from "@/app/components/CreatePost";



function SocialMedia() {
  const [username, setUsername] = useState('');
  const [account, setAccount] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [posts, setPosts] = useState<any>([]);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [commentText, setCommentText] = useState<Record<number, any>>({});
  const [socialAccount, setSocialAccount] = useState({ username: '', type: '' });
  const [showModal, setShowModal] = useState(false);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [profileImage, setProfileImage] = useState('');
  const [profileImageURL, setProfileImageURL] = useState('');
  const [signer, setSigner] = useState<ethers.Signer | undefined>(undefined);
  const [eoaAddress, setEoaAddress] = useState<string>('');
  const [aaAddress, setAaAddress] = useState<string>('');
  const [supportedTokens, setSupportedTokens] = useState<Array<any>>([]);
  const [isFetchingTokens, setIsFetchingTokens] = useState(false);

  const router = useRouter()
  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine); // Load tsparticles-slim
  };
  
  useEffect(() => {
    setIsLoading(true);

    const loadTokens = async () => {
      // Only run if signer is defined
      if (signer) {
        try {
          // Check if signer has getAddress method
          if (typeof signer.getAddress !== 'function') {
            console.error("Invalid signer: missing getAddress method");
            toast.error("Wallet connection issue: please reconnect your wallet");
            return;
          }

          // Verify signer is still connected by calling getAddress
          await signer.getAddress();

          // If connected, fetch tokens
          fetchSupportedTokens();
        } catch (error) {
          console.error("Signer validation error:", error);
          toast.error("Wallet connection issue: please reconnect your wallet");
        }
      } else {
        // Reset tokens if signer is not available
        setSupportedTokens([]);
        console.log("Signer not available, tokens reset");
      }
    };

    loadTokens();
    fetchRegisteredUser()
    fetchPosts()
  }, [signer]);

  const fetchSupportedTokens = async () => {
    if (!signer) {
      console.log("Signer not available");
      return;
    }

    // Verify signer has getAddress method
    if (typeof signer.getAddress !== 'function') {
      console.error("Invalid signer: missing getAddress method");
      toast.error("Wallet connection issue: please reconnect your wallet");
      return;
    }

    try {
      setIsFetchingTokens(true);

      // Replace with your implementation based on the tutorial
      const client = await initAAClient(signer);
      const builder = await initAABuilder(signer);

      // Fetch supported tokens
      const tokens = await getSupportedTokens(client, builder);
      setSupportedTokens(tokens);
    } catch (error: any) {
      console.error("Error fetching supported tokens:", error);
      toast.error(`Token loading error: ${error.message || "Unknown error"}`);
    } finally {
      setIsFetchingTokens(false);
    }
  };

    /**
* Handle wallet connection - important to get a real signer!
*/
const handleWalletConnected = async (eoaAddr: string, aaAddr: string) => {
  setIsLoading(true)
  try {
    // Get the real signer from the wallet - don't use mock signers!
    const realSigner = await getSigner();

    setEoaAddress(eoaAddr);
    setAaAddress(aaAddr);
    setSigner(realSigner);

    toast.success('Wallet connected successfully!');

  } catch (error) {
    console.error("Error getting signer:", error);
    toast.error('Failed to get wallet signer. Please try again.');
  }
};

  const fetchPosts = async () => {
    try {
      await getPosts();
    } catch (error:any) {
      console.error(error);
      setMessage(error);
    }
  };

  const fetchRegisteredUser = async () => {
    setIsLoading(true)

    if (!signer || !aaAddress) return;
    try {
      console.log(aaAddress,'chc')
        const user = await getUserByAddress(signer,aaAddress);
        console.log(user)
        if (user) {
          setRegisteredUser(user);
          setIsLoading(false)

        }
    } catch (error) {
    setIsLoading(false)

      console.error(error);
    }
  };

  const register_user = async () => {
    try {
      if (!signer) return;
      setMessage('Registering, please wait!');
      const transaction = await registerUser(signer,username)
      console.log(transaction.transactionHash);
      if(transaction.transactionHash){
        setMessage('User registered successfully.');
        fetchRegisteredUser()
        setTimeout(()=>{
          setUsername('');
          window.location.reload()
        },3000)

      }
      else{
        setMessage('Error registering.');
      }
      

    } catch (error :any) {
      console.error(error);
      setMessage(error.message);
    }
  };

  const create_post = async () => {
    try {
      setMessage('Creating post, please wait!');
      if (!signer) return;
      const transaction = await createPost(signer,content)
      if (transaction.transactionHash) {
        setMessage('Post created successfully!');
        await fetchPosts();
        setTimeout(() => {
          setMessage('');
          setContent('');
          window.location.reload()
        }, 3000);
        
      } else {
        setMessage('Error creating post');
        setTimeout(() => {
          setMessage('');        
        }, 3000);
      }
    } catch (error :any) {
      setMessage(error.message);

      console.error(error);
    }
  };

  const like_post = async (postId :number) => {
    try {
      if (!signer) return;
      setMessage('Liking post, please wait!');
      await likePost(signer,postId)
      setMessage('Post liked successfully.');
      await fetchPosts();
      setTimeout(() => {
        setMessage('');
        setContent('');
        window.location.reload()
      }, 3000);
    } catch (error :any) {
      console.error(error);
      setMessage(error.message);
    }
  };

  const add_comment = async (postId :number, comment : string)  => {
    try {
      if (!signer) return;
      setMessage('Adding comment, please wait!');
      await addComment(signer,postId,comment)
      setMessage('Comment added successfully.');
      await getPosts();

      setTimeout(() => {
        setMessage('');
        setContent('');
        window.location.reload()
      }, 3000);
    } catch (error :any) {
      console.error(error);
      setMessage(error.message);
    }
  };

  const getPosts = async () => {
    try {
      if (!signer) return;
      const count = await getPostsCount(signer);
      const fetchedPosts = [];
      for (let i = 0; i < count; i++) {
        const post = await getPost(signer,i);
        const comments = [];
        for (let j = 0; j < post.commentsCount; j++) {
          const comment = await getComment(signer,i, j);
          comments.push(comment);
        }
        fetchedPosts.push({ ...post, comments });
      }
      setPosts(fetchedPosts);
      setMessage('');
    } catch (error :any) {
      console.error(error);
      setMessage(error.message);
    }
  };

  const handleCommentChange = (postId :number, text :string) => {
    setCommentText(prevState => ({ ...prevState, [postId]: text }));
  };

  const handleAddComment = (postId :number) => {
    const comment = commentText[postId];
    add_comment(postId, comment);
    setCommentText(prevState => ({ ...prevState, [postId]: '' }));
  };


  const particlesOptions: ISourceOptions = {  
    background: {
      color: "#ffffff",
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onClick: { enable: true, mode: "push" },
        onHover: { enable: true, mode: "repulse" },
      },
      modes: {
        push: { quantity: 4 },
        repulse: { distance: 200 },
      },
    },
    particles: {
      color: { value: "#ff0000" },
      links: { color: "#ffffff", distance: 150, opacity: 0.5, width: 1 },
      move: { enable: true, speed: 6, direction: "none" },
      number: { value: 80, density: { enable: true, value_area: 800 } },
      opacity: { value: 0.5 },
      shape: { type: "circle" },
      size: { value: 5, random: true },
    },
    detectRetina: true,
  };

 

 return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <ParticleBackground />
      <NavBar onWalletConnected={handleWalletConnected} />

      <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        {!registeredUser ? (
          <RegisterForm 
            username={username} 
            setUsername={setUsername} 
            registerUser={register_user} 
            isLoading={isLoading} 
          />
        ) : (
          <>
            <CreatePost 
              content={content} 
              setContent={setContent} 
              createPost={create_post} 
              isLoading={isLoading} 
            />

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Latest Posts</h2>
              
              <div className="space-y-6">
                {posts.map((post:any, index:any) => (
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
          </>
        )}
      </main>
    </div>
  );
};


export default SocialMedia;