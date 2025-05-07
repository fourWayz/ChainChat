"use client"

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Container, Navbar, Nav, Card, Button, Form, Alert, Row, Col, Spinner, Modal } from "react-bootstrap";
import { FaThumbsUp, FaCommentDots, FaLink } from "react-icons/fa";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine, ISourceOptions } from "tsparticles-engine"; 
import { motion } from "framer-motion";
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

  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine); // Load tsparticles-slim
  };
  
  useEffect(() => {
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
    setIsLoading(false);
    fetchPosts()
    fetchRegisteredUser()
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
    if (!signer || !aaAddress) return;
    try {
        const user = await getUserByAddress(signer,aaAddress);
        console.log(user)
        if (user) {
          setRegisteredUser(user);
        }
    } catch (error) {
      console.error(error);
    }
  };

  const register_user = async () => {
    try {
      if (!signer) return;
      setMessage('Registering, please wait!');
      const transaction = await registerUser(signer,username)
      console.log(transaction.transactionHash);
      setMessage('User registered successfully.');
      setUsername('');
      fetchRegisteredUser()

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
        setTimeout(() => {
          setMessage('');
          setContent('');
        }, 3000);
        getPosts();
      } else {
        setMessage('Error creating post');
        setTimeout(() => {
          setMessage('');
        }, 2000);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const like_post = async (postId :number) => {
    try {
      if (!signer) return;
      setMessage('Liking post, please wait!');
      await likePost(signer,postId)
      setMessage('Post liked successfully.');
      await getPosts();
      setTimeout(() => {
        setMessage('');
        setContent('');
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
      getPosts();

      setTimeout(() => {
        setMessage('');
        setContent('');
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
    addComment(signer!,postId, comment);
    setCommentText(prevState => ({ ...prevState, [postId]: '' }));
  };


  const particlesOptions: ISourceOptions = {  // Use ISourceOptions for config
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
    <div>
      <Particles
       id="tsparticles"
       init={particlesInit}
       options={particlesOptions} 
        style={{ position: "absolute", zIndex: -1, width: "100%", height: "100%" }}
      />
      <Container className="mt-5"  style={{ backgroundColor: "#36394" }}>
      <Navbar style={{ backgroundColor: "rgb(0 0 0 / 14%)" }} expand="lg" className="rounded">
  <Container className="d-flex justify-content-between align-items-center">
    <div className="d-flex align-items-center">
      <Navbar.Brand href="#" className=" fw-bolder fs-4" style={{color : 'gray'}}>
        🧠 Chain Chat
      </Navbar.Brand>
    </div>

    <div className="d-flex align-items-center">
      <WalletConnect onWalletConnected={handleWalletConnected} />

      <Navbar.Toggle aria-controls="basic-navbar-nav" className="ms-2" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-3">
          {registeredUser && (
            <Nav.Item>
              <Button variant="warning" disabled>
                {profileImageURL && (
                  <Image
                    src={profileImageURL}
                    alt="Profile"
                    className="rounded-circle me-2"
                    width={30}
                    height={30}
                  />
                )}
                {aaAddress.slice(0, 6)}
              </Button>
            </Nav.Item>
          )}
        </Nav>
      </Navbar.Collapse>
    </div>
  </Container>
</Navbar>


        {!registeredUser && (
          <Row className="mt-3">
            <Col md={6}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                <Card style={{ backgroundColor: "#1C2541" }}>
                  <Card.Body>
                    <Card.Title className="text-white">Register</Card.Title>
                    <Form.Control
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <Button variant="primary" onClick={register_user} disabled={isLoading} className="mt-2">
                      {isLoading ? <Spinner animation="border" size="sm" /> : 'Register'}
                    </Button>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>
        )}

        {registeredUser && (
          <>

            <Row className="mt-3">
              <Col md={6}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                  <Card style={{ backgroundColor: "#1C2541" }}>
                    <Card.Body>
                      <Card.Title className="text-white">Create Post</Card.Title>
                      <Form.Control         
                        as="textarea"
                        rows={3}
                        placeholder="Content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{ backgroundColor: "#0B132B", color: "#c8c8c" }}
                      />
                      <Button variant="primary" onClick={create_post} disabled={isLoading} className="mt-2">
                        {isLoading ? <Spinner animation="border" size="sm" /> : 'Create Post'}
                      </Button>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            </Row>
          </>
        )}

        <div className="mt-3">
          {message && <Alert variant="info">{message}</Alert>}
          <h3 className="text-white">Posts</h3>
          <Row>
            {posts.map((post :any, index :any) => (
              <Col md={6} key={index}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                  <Card className="shadow p-2 mb-3" style={{ backgroundColor: "#1C2541" }}>
                    <Card.Body>
                      <Card.Title style={{ color: 'darkgrey' }}>Author: {post[0]}</Card.Title>
                      <Card.Text style={{ color: 'darkgrey' }}>{post[1]}</Card.Text>
                      <Card.Text style={{ color: 'darkgrey' }}>Likes: {post[3]?.toString()}</Card.Text>

                      {registeredUser && (
                        <>
                          <Button variant="primary" onClick={() => like_post(index)} className="m-2">
                            <FaThumbsUp /> Like
                          </Button>
                          <Form.Control
                            type="text"
                            placeholder="Add a comment..."
                            value={commentText[index] || ''}
                            onChange={(e) => handleCommentChange(index, e.target.value)}
                            className="m-2"
                          />
                          <Button variant="secondary" onClick={() => handleAddComment(index)}>
                            <FaCommentDots /> Comment
                          </Button>
                        </>
                      )}

                      <div className="mt-3">
                        <h5>Comments</h5>
                        {post.comments.map((comment:any, commentIndex:any) => (
                          <p key={commentIndex} className="text-info">
                            {comment.content} <br />
                            <span className="text-primary">
                              {`${comment.commenter.slice(0, 6)}...${comment.commenter.slice(comment.commenter.length - 4)}`}
                            </span>
                          </p>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>
        
      </Container>
    </div>
  );
}

export default SocialMedia;