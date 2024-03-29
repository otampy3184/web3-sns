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

    // ユーザーへの送金を可能にさせるためPayableでコンストラクタを作成
    constructor() payable {
        console.log("construct success");
    }

    // 全Postを管理する配列
    Post[] allPosts;

    // 誰がどのPostをいいねしたか管理するマッピング
    mapping(address => uint256[]) public userToLikedList;

    // 新しいPostがおこなわれた際に呼ばれるイベント
    event NewPost(
        uint256 postId,
        address from,
        string message,
        uint256 timestamp,
        uint256 likes,
        bool likeFlag
    );

    // 新しくPostをいいねした際に呼ばれるイベント
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
        // 現在のPostIDを取得
        uint256 newPostId = _postIds.current();

        // 現在のTimestampをBlockから取得
        uint256 _timestamp = block.timestamp;

        // 変数の初期値
        uint256 initialLikes = 0;
        bool initialFlag = false;

        // 新規Postの作成し、配列に渡す
        Post memory newPost = Post({
            postId: newPostId,
            from: msg.sender,
            message: _message,
            timestamp: _timestamp,
            likes: initialLikes,
            likeFlag: initialFlag
        });
        allPosts.push(newPost);

        _postIds.increment();

        emit NewPost(
            newPostId,
            msg.sender,
            _message,
            _timestamp,
            initialLikes,
            initialFlag
        );
    }

    // Postへのいいね機能
    function likesIncrement(uint256 _index) public {
        // 過去に同じ投稿に対していいねをしていないかをチェック
        for (uint256 i = 0; i < userToLikedList[msg.sender].length; i++) {
            uint256 likedIndex = userToLikedList[msg.sender][i];
            require(likedIndex != _index, "You already liked this post");
        }
        // いいね情報の更新
        allPosts[_index].likes++;
        userToLikedList[msg.sender].push(_index);

        // Flag情報を保持させないため、Response用のPost配列を作る
        Post[] memory resPosts = allPosts;
        resPosts[_index].likeFlag = true;

        emit NewLike(
            resPosts[_index].postId,
            resPosts[_index].from,
            resPosts[_index].message,
            resPosts[_index].timestamp,
            resPosts[_index].likes,
            resPosts[_index].likeFlag
        );
    }

    // Postへのいいねを解除する機能
    function likesDiscrement(uint256 _index) public {
        // いいね情報の更新
        allPosts[_index].likes--;

        // 削除対象のいいねListのIndexを線形探索で探す
        uint256 listLength = userToLikedList[msg.sender].length;
        uint256 target;
        for(uint256 i = 0; i < listLength; i++){
            if(userToLikedList[msg.sender][i] == _index){
                target = i;
                break;
            }
        }

        // ユーザーのLikeを管理するリストのうち削除したいものを配列の最後尾に渡して削除する
        userToLikedList[msg.sender][target] = userToLikedList[msg.sender][listLength - 1];
        userToLikedList[msg.sender].pop();

        // Flag情報を保持させないため、Response用のPost配列を作る
        Post[] memory resPosts = allPosts;
        resPosts[_index].likeFlag = false;

        emit NewLike(
            resPosts[_index].postId,
            resPosts[_index].from,
            resPosts[_index].message,
            resPosts[_index].timestamp,
            resPosts[_index].likes,
            resPosts[_index].likeFlag
        );
    }

    // 少額のTipを投稿者に与える機能
    function sendEther(address to) public payable {
        uint256 tipAmount = 0.0001 ether;
        require(tipAmount <= address(this).balance, "Insufficient Funds");
        (bool success, ) = (to).call{value: tipAmount}("");
        require(success, "Failed to send tip");
    }

    // 全投稿を確認
    function getAllPosts() public view returns (Post[] memory) {
        // 現状のallPostをコピーして読みとっったものをMemoryとして保持することでStorage操作を避ける
        Post[] memory resPosts = allPosts;
        // allPostsのIdとLikedListのIdを突合し、合致しているものがあれば該当するPostのFlagをTrueにする
        for (uint256 i = 0; i < resPosts.length; i++) {
            for (uint256 j = 0; j < userToLikedList[msg.sender].length; j++) {
                if (resPosts[i].postId == userToLikedList[msg.sender][j]) {
                    resPosts[i].likeFlag = true;
                }
            }
        }
        return resPosts;
    }
}
