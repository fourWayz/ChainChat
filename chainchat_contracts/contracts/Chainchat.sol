// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Chainchat is ReentrancyGuard, Ownable {
    /**
     * @dev Struct representing a user in the dApp.
     * @param username The username of the user.
     * @param userAddress The address of the user.
     * @param isRegistered A boolean indicating if the user is registered.
     * @param profileImage The image URL or IPFS hash for the user's profile picture.
     */
    struct User {
        string username;
        address userAddress;
        bool isRegistered;
        string profileImage; // New field: profile picture
    }

    mapping(address => User) public users;

    /**
     * @dev Struct representing a post in the dApp.
     * @param author The address of the user who created the post.
     * @param content The content of the post.
     * @param image The optional image URL or IPFS hash attached to the post.
     * @param timestamp The time when the post was created.
     * @param likes The number of likes the post has received.
     * @param commentsCount The number of comments on the post.
     * @param originalPostId The ID of the post being shared (0 for original posts).
     * @param likedBy A mapping to track if a user has liked the post.
     */
    struct Post {
        address author;
        string content;
        string image; // New field: image URL or IPFS hash
        uint256 timestamp;
        uint256 likes;
        uint256 commentsCount;
        uint256 originalPostId; // New field: shared post reference
        mapping(address => bool) likedBy;
    }

    struct Comment {
        address commenter;
        string content;
        uint256 timestamp;
    }

    mapping(uint256 => mapping(uint256 => Comment)) public postComments;
    mapping(uint256 => uint256) public postCommentsCount;

    Post[] public posts;

    event UserRegistered(address indexed userAddress, string username);
    event ProfileImageUpdated(address indexed userAddress, string image);
    event PostCreated(address indexed author, string content, string image, uint256 timestamp);
    event PostShared(address indexed sharer, uint256 originalPostId, uint256 newPostId);
    event PostLiked(address indexed liker, uint256 indexed postId);
    event CommentAdded(address indexed commenter, uint256 indexed postId, string content, uint256 timestamp);

    modifier onlyRegisteredUser() {
        require(users[msg.sender].isRegistered, "User is not registered");
        _;
    }

    constructor() Ownable(msg.sender) {
        transferOwnership(msg.sender);
    }

    function registerUser(string memory _username) external {
        require(!users[msg.sender].isRegistered, "User is already registered");
        require(bytes(_username).length > 0, "Username should not be empty");

        users[msg.sender] = User({
            username: _username,
            userAddress: msg.sender,
            isRegistered: true,
            profileImage: ""
        });

        emit UserRegistered(msg.sender, _username);
    }

    /// @notice Sets or updates the user's profile picture
    function setProfileImage(string memory _image) external onlyRegisteredUser {
        users[msg.sender].profileImage = _image;
        emit ProfileImageUpdated(msg.sender, _image);
    }

    function getUserByAddress(address _userAddress) external view returns (User memory) {
        require(users[_userAddress].isRegistered, "User not found");
        return users[_userAddress];
    }

    /// @notice Creates a new post, optionally with an image
    function createPost(string memory _content, string memory _image) external onlyRegisteredUser {
        require(bytes(_content).length > 0, "Content should not be empty");

        Post storage newPost = posts.push();
        newPost.author = msg.sender;
        newPost.content = _content;
        newPost.image = _image;
        newPost.timestamp = block.timestamp;
        newPost.originalPostId = 0;

        emit PostCreated(msg.sender, _content, _image, block.timestamp);
    }

    /// @notice Shares an existing post
    function sharePost(uint256 _postId) external onlyRegisteredUser {
        require(_postId < posts.length, "Original post does not exist");

        Post storage sharedPost = posts.push();
        sharedPost.author = msg.sender;
        sharedPost.content = posts[_postId].content;
        sharedPost.image = posts[_postId].image;
        sharedPost.timestamp = block.timestamp;
        sharedPost.originalPostId = _postId;

        emit PostShared(msg.sender, _postId, posts.length - 1);
    }

    function likePost(uint256 _postId) external onlyRegisteredUser nonReentrant {
        require(_postId < posts.length, "Post does not exist");

        Post storage post = posts[_postId];
        require(!post.likedBy[msg.sender], "User has already liked this post");

        post.likes++;
        post.likedBy[msg.sender] = true;

        emit PostLiked(msg.sender, _postId);
    }

    function addComment(uint256 _postId, string memory _content) external onlyRegisteredUser nonReentrant {
        require(_postId < posts.length, "Post does not exist");
        require(bytes(_content).length > 0, "Comment should not be empty");

        uint256 commentId = postCommentsCount[_postId];
        postComments[_postId][commentId] = Comment({
            commenter: msg.sender,
            content: _content,
            timestamp: block.timestamp
        });

        postCommentsCount[_postId]++;
        posts[_postId].commentsCount++;

        emit CommentAdded(msg.sender, _postId, _content, block.timestamp);
    }

    function getPostsCount() external view returns (uint256) {
        return posts.length;
    }

    /// @notice Returns post data, including new image and originalPostId fields
    function getPost(uint256 _postId) external view returns (
        address author,
        string memory content,
        string memory image,
        uint256 timestamp,
        uint256 likes,
        uint256 commentsCount,
        uint256 originalPostId
    ) {
        require(_postId < posts.length, "Post does not exist");
        Post storage post = posts[_postId];
        return (post.author, post.content, post.image, post.timestamp, post.likes, post.commentsCount, post.originalPostId);
    }

    function getComment(uint256 _postId, uint256 _commentId) external view returns (
        address commenter,
        string memory content,
        uint256 timestamp
    ) {
        require(_postId < posts.length, "Post does not exist");
        require(_commentId < postCommentsCount[_postId], "Comment does not exist");

        Comment memory comment = postComments[_postId][_commentId];
        return (comment.commenter, comment.content, comment.timestamp);
    }
}
