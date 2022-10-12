// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../node_modules/hardhat/console.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";

contract Web3SNS {
    // Postごとに付与する一意のIDを用意する
    using Counters for Counters.Counter;
    Counters.Counter private _postIds;

    // Postの構造体
    struct Post {
        uint256 postId;
        address from;
        string message;
        uint256 timestamp;
        uint256 likes;
        bool likeFlag;
    }

    constructor() payable {
        console.log("construct success");
    }

    // 全Postの配列
    Post[] allPosts;

    // PostをIdで管理するマッピング
    mapping (address => uint256[]) public userToLikedList;

    // 新しいPostがおこなわれた際に呼ばれるイベント
    event NewPost(
        uint256 postId,
        address from,
        string message,
        uint256 timestamp,
        uint256 likes,
        bool likeFlag
    );
    event NewLike(
        uint256 postId,
        address from,
        string message,
        uint256 timestamp,
        uint256 likes,
        bool likeFlag
    );

    // 新規の投稿機能
    function tweet(string memory _message) public {
        console.log("making tweet...");

        // 現在のPostIDを取得
        uint256 newPostId = _postIds.current();

        // 現在のTimestampをBlockから取得
        uint256 _timestamp = block.timestamp;

        uint256 initialLikes = 0;

        bool initialFlag = false;

        // 新規Postの作成
        Post memory newPost = Post({
            postId: newPostId,
            from: msg.sender,
            message: _message,
            timestamp: _timestamp,
            likes: initialLikes,
            likeFlag: initialFlag
        });

        // 新規Postを配列に渡し、マッピングに登録する
        allPosts.push(newPost);

        // 動作確認
        console.log(
            "tweet by %s w/ ID %s has been posted",
            msg.sender,
            newPostId
        );

        _postIds.increment();

        emit NewPost(newPostId, msg.sender, _message, _timestamp, initialLikes, initialFlag);
    }

    // Postへのいいね機能
    function likesIncrement(uint256 _index) public {
        // 過去に同じ投稿に対してLikeをしていないかをチェック
        for (uint256 i = 0; i < userToLikedList[msg.sender].length; i++){
            uint256 likedIndex = userToLikedList[msg.sender][i];
            console.log(likedIndex);
            require(likedIndex != _index, "You already liked this post");
        }
        //TweetIdToPost[_index].likes++;
        allPosts[_index].likes++;
        allPosts[_index].likeFlag= true;
        userToLikedList[msg.sender].push(_index);
        console.log("New Likes Count:%s by %s", allPosts[_index].likes, msg.sender);
        emit NewLike(
            allPosts[_index].postId,
            allPosts[_index].from,
            allPosts[_index].message,
            allPosts[_index].timestamp,
            allPosts[_index].likes,
            allPosts[_index].likeFlag
        );
    }

    function likesDiscrement(uint256 _index) public {
        allPosts[_index].likes--;
        console.log("New Likes Count:", allPosts[_index].likes);
        emit NewLike(
            allPosts[_index].postId,
            allPosts[_index].from,
            allPosts[_index].message,
            allPosts[_index].timestamp,
            allPosts[_index].likes,
            allPosts[_index].likeFlag
        );
    }

    function sendEther(address to) public payable {
        uint256 tipAmount = 0.0001 ether;
        require (tipAmount <= address(this).balance, "Insufficient Funds");
        (bool success, ) = (to).call{value: tipAmount}("");
        require(success, "Failed to send tip");
    }

    // 全投稿を確認
    function getAllPosts() public view returns (Post[] memory) {
        // 現状のallPostをコピーして読みとっったものをMemoryとして保持することでStorage操作を避ける
        Post[] memory resPosts = allPosts;
        // allPostsのIdとLikedListのIdを突合し、合致しているものがあれば該当するPostのFlagをTrueにする
        for (uint256 i = 0; i < resPosts.length; i++){
            for (uint256 j = 0; j < userToLikedList[msg.sender].length; j++){
                if (resPosts[i].postId == userToLikedList[msg.sender][j]){
                    resPosts[i].likeFlag = true;
                }
            }
        }
        return resPosts;
    }
}
