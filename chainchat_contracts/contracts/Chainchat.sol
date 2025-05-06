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
     */
    struct User {
        string username;
        address userAddress;
        bool isRegistered;
    }

    mapping(address => User) public users;

    /**l
     * @dev Struct representing a post in the dApp.
     * @param author The address of the user who created the post.
     * @param content The content of the post.
     * @param timestamp The time when the post was created.
     * @param likes The number of likes the post has received.
     * @param commentsCount The number of comments on the post.
     * @param likedBy A mapping to track if a user has liked the post.
     */
    struct Post {
        address author;
        string content;
        uint256 timestamp;
        uint256 likes;
        uint256 commentsCount;
        mapping(address => bool) likedBy; // Track likes by user
    }

    /**
     * @dev Struct representing a comment on a post.
     * @param commenter The address of the user who made the comment.
     * @param content The content of the comment.
     * @param timestamp The time when the comment was made.
     */
    struct Comment {
        address commenter;
        string content;
        uint256 timestamp;
    }

    mapping(uint256 => mapping(uint256 => Comment)) public postComments;
    mapping(uint256 => uint256) public postCommentsCount;

    Post[] public posts;

    event UserRegistered(address indexed userAddress, string username);
    event PostCreated(address indexed author, string content, uint256 timestamp);
    event PostLiked(address indexed liker, uint256 indexed postId);
    event CommentAdded(address indexed commenter, uint256 indexed postId, string content, uint256 timestamp);

    /**
     * @dev Modifier to check if the sender is a registered user.
     */
    modifier onlyRegisteredUser() {
        require(users[msg.sender].isRegistered, "User is not registered");
        _;
    }

    constructor() Ownable(msg.sender) {
        transferOwnership(msg.sender);
    }

    /**
     * @dev Registers a new user.
     * @param _username The username chosen by the user.
     */
    function registerUser(string memory _username) external {
        require(!users[msg.sender].isRegistered, "User is already registered");
        require(bytes(_username).length > 0, "Username should not be empty");

        users[msg.sender] = User({
            username: _username,
            userAddress: msg.sender,
            isRegistered: true
        });

        emit UserRegistered(msg.sender, _username);
    }

    /**
     * @dev Returns the user details for a given address.
     * @param _userAddress The address of the user.
     * @return The User struct for the given address.
     */
    function getUserByAddress(address _userAddress) external view returns (User memory) {
        require(users[_userAddress].isRegistered, "User not found");
        return users[_userAddress];
    }

    /**
     * @dev Creates a new post.
     * @param _content The content of the post.
     */
    function createPost(string memory _content) external onlyRegisteredUser {
        require(bytes(_content).length > 0, "Content should not be empty");

        Post storage newPost = posts.push();
        newPost.author = msg.sender;
        newPost.content = _content;
        newPost.timestamp = block.timestamp;

        emit PostCreated(msg.sender, _content, block.timestamp);
    }

    /**
     * @dev Likes a post.
     * @param _postId The ID of the post to like.
     */
    function likePost(uint256 _postId) external onlyRegisteredUser nonReentrant {
        require(_postId < posts.length, "Post does not exist");

        Post storage post = posts[_postId];
        require(!post.likedBy[msg.sender], "User has already liked this post");

        post.likes++;
        post.likedBy[msg.sender] = true;

        emit PostLiked(msg.sender, _postId);
    }

    /**
     * @dev Adds a comment to a post.
     * @param _postId The ID of the post to comment on.
     * @param _content The content of the comment.
     */
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

    /**
     * @dev Returns the total number of posts.
     * @return The total number of posts.
     */
    function getPostsCount() external view returns (uint256) {
        return posts.length;
    }

    /**
     * @dev Returns the details of a post.
     * @param _postId The ID of the post.
     * @return author The address of the post's author.
     * @return content The content of the post.
     * @return timestamp The time when the post was created.
     * @return likes The number of likes the post has received.
     * @return commentsCount The number of comments on the post.
     */
    function getPost(uint256 _postId) external view returns (
        address author,
        string memory content,
        uint256 timestamp,
        uint256 likes,
        uint256 commentsCount
    ) {
        require(_postId < posts.length, "Post does not exist");
        Post storage post = posts[_postId];
        return (post.author, post.content, post.timestamp, post.likes, post.commentsCount);
    }

    /**
     * @dev Returns the details of a comment on a post.
     * @param _postId The ID of the post.
     * @param _commentId The ID of the comment.
     * @return commenter The address of the user who made the comment.
     * @return content The content of the comment.
     * @return timestamp The time when the comment was made.
     */
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