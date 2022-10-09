// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../node_modules/hardhat/console.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";

contract Web3SNS {
    // Postごとに付与する一意のIDを用意する
    using Counters for Counters.Counter;
    Counters.Counter private _postIds;

    // Postの構造体
    struct Post{
        address from;
        string message;
        uint256 timestamp;
        uint256 likes;
    }

    // 全Postの配列
    Post[] allPosts;

    // Postごとのいいね数を保存するマッピング
    //mapping (uint256 => uint256) public LikesCount;
    
    // PostをIdで管理するマッピング
    mapping (uint256 => Post) public TweetIdToPost;

    // 新しいPostがおこなわれた際に呼ばれるイベント
    event NewPost(address from, string message, uint256 timestamp, uint256 likes);

    // 新規の投稿機能
    function tweet(string memory _message) public {
        console.log("making tweet...");

        // 現在のPostIDを取得
        uint256 newPostId = _postIds.current();

        // 現在のTimestampをBlockから取得
        uint256 _timestamp = block.timestamp;

        uint256 initialLikes = 0;
        
        // 新規Postの作成
        Post memory newPost =Post({
            from: msg.sender,
            message: _message,
            timestamp: _timestamp,
            likes: initialLikes
        });

        // 新規Postを配列に渡し、マッピングに登録する
        allPosts.push(newPost);
        TweetIdToPost[newPostId] = newPost;

        // 動作確認
        console.log("tweet by %s w/ ID %s has been posted", msg.sender, newPostId);

        _postIds.increment();

        emit NewPost(msg.sender, _message, _timestamp, initialLikes);
    }

    // Postへのいいね機能
    function like(uint256 _index) public returns(uint256){
        TweetIdToPost[_index].likes++;
        return TweetIdToPost[_index].likes;
    }

    // 全投稿を確認
    function getAllPosts() public view returns (Post[] memory) {
        return allPosts;
    }
}