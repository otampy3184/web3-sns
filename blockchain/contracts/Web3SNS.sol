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
    }

    // 全Postの配列
    Post[] allPosts;

    // PostをIdで管理するマッピング
    mapping(uint256 => Post) public TweetIdToPost;

    // 新しいPostがおこなわれた際に呼ばれるイベント
    event NewPost(
        uint256 postId,
        address from,
        string message,
        uint256 timestamp,
        uint256 likes
    );
    event NewLike(
        uint256 postId,
        address from,
        string message,
        uint256 timestamp,
        uint256 likes
    );

    // 新規の投稿機能
    function tweet(string memory _message) public {
        console.log("making tweet...");

        // 現在のPostIDを取得
        uint256 newPostId = _postIds.current();

        // 現在のTimestampをBlockから取得
        uint256 _timestamp = block.timestamp;

        uint256 initialLikes = 0;

        // 新規Postの作成
        Post memory newPost = Post({
            postId: newPostId,
            from: msg.sender,
            message: _message,
            timestamp: _timestamp,
            likes: initialLikes
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

        emit NewPost(newPostId, msg.sender, _message, _timestamp, initialLikes);
    }

    // Postへのいいね機能
    function likesIncrement(uint256 _index) public {
        //TweetIdToPost[_index].likes++;
        allPosts[_index].likes++;
        console.log("New Likes Count:", TweetIdToPost[_index].likes);
        emit NewLike(
            allPosts[_index].postId,
            allPosts[_index].from,
            allPosts[_index].message,
            allPosts[_index].timestamp,
            allPosts[_index].likes
        );
    }

    function likesDiscrement(uint256 _index) public {
        TweetIdToPost[_index].likes--;
        console.log("New Likes Count:", TweetIdToPost[_index].likes);
        emit NewLike(
            allPosts[_index].postId,
            allPosts[_index].from,
            allPosts[_index].message,
            allPosts[_index].timestamp,
            allPosts[_index].likes
        );
    }

    // 全投稿を確認
    function getAllPosts() public view returns (Post[] memory) {
        return allPosts;
    }
}
