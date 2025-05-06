import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract, Wallet, EventLog } from 'ethers';

describe('Chainchat', function () {
  let socialMedia:any;
  let user1: Wallet;
  let user2: Wallet;
  let owner: Wallet;

  before(async function() {
    // Get signers from Hardhat 
    [owner, user1, user2] = await (ethers as any).getSigners();

    // Deploy contract
    const Chainchat = await ethers.getContractFactory('Chainchat');
    socialMedia = await Chainchat.deploy();
    await socialMedia.waitForDeployment();
  });

  it('should register a user', async function () {
    const username = 'user1';

    await socialMedia.connect(user1).registerUser(username);
    const user = await socialMedia.users(user1.address);

    expect(user.username).to.equal(username);
    expect(user.userAddress).to.equal(user1.address);
    expect(user.isRegistered).to.be.true;

    const events = await socialMedia.queryFilter('UserRegistered');
    expect(events.length).to.equal(1);
  });

  it('should create a post', async function () {
    const content = 'This is a test post';
    await socialMedia.connect(user1).createPost(content);
    const postsCount = await socialMedia.getPostsCount();
    expect(postsCount.toString()).to.equal('1');

    const post = await socialMedia.getPost(0);
    expect(post.author).to.equal(user1.address);
    expect(post.content).to.equal(content);
    expect(post.likes.toString()).to.equal('0');
    expect(post.commentsCount.toString()).to.equal('0');
  });
 
  it('should like a post', async function () {
    await socialMedia.connect(user2).registerUser('user2');
    await socialMedia.connect(user2).likePost(0);
    const post = await socialMedia.getPost(0);
    expect(post.likes.toString()).to.equal('1');
    expect(post.author).to.equal(user1.address);
  });

  it('should add a comment to a post', async function () {
    const commentContent = 'This is a test comment';

    await socialMedia.connect(user2).addComment(0, commentContent);

    const comment = await socialMedia.getComment(0, 0);
    expect(comment.commenter).to.equal(user2.address);
    expect(comment.content).to.equal(commentContent);

    const post = await socialMedia.getPost(0);
    expect(post.commentsCount.toString()).to.equal('1');

    const events = await socialMedia.queryFilter('CommentAdded');
    const event = events[0] as EventLog;
    const [commenter, postId, content] = event.args;

    expect(commenter).to.equal(user2.address);
    expect(postId.toString()).to.equal('0');
    expect(content).to.equal(commentContent);
  });

  it('should return correct user details by address', async function () {
    const userDetails = await socialMedia.getUserByAddress(user1.address);
    expect(userDetails.userAddress).to.equal(user1.address);
    expect(userDetails.isRegistered).to.equal(true);
  });
});