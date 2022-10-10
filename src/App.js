import './App.css';

import React, { useEffect, useState } from "react";
import { ethers } from "ethers"
import abi from "./abi/Web3SNS.json";
import Post from "./components/Post";

function App() {
  const [likesCount, setLikesCount] = useState("");
  const [cantLike, setCantLike] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [tweetValue, setTweetValue] = useState("");
  const [allTweets, setAllTweets] = useState([]);

  const contractAddress = "0x9Aff87e6c9fD67F4f08186cd3a8A3Af0CCdA7edC";
  const contractABI = abi.abi;

  // Walletの接続状況をチェック
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      /* ユーザーのウォレットへのアクセスが許可されているかどうかを確認 */
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllTweets();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Walletの接続状態を監視
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  // Walletに接続
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  // 全Postを取得
  const getAllTweets = async () => {
    const { ethereum } = window;
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const web3SNSContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const posts = await web3SNSContract.getAllPosts();
        console.log("get all post ")
        const postsCleaned = posts.map((post) => {
          return {
            postId: post.postId.toNumber(),
            address: post.from,
            message: post.message,
            timestamp: post.timestamp.toNumber(),
            likes: post.likes.toNumber(),
          };
        })
        setAllTweets(postsCleaned);
        console.log("set all posts");
        console.log(postsCleaned);
      } else {
        console.log("Ethereum object not found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 新規Postの追加状況を監視
  useEffect(() => {
    let web3SNSContract;

    const onNewPost = (postId, from, message, timestamp, likes) => {
      console.log("NewPost", postId, from, message, timestamp, likes);
      setAllTweets((prevState) => [
        ...prevState,
        {
          postId: postId.toNumber(),
          address: from,
          message: message,
          timestamp: timestamp.toNumber(),
          likes: likes.toNumber(),
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      web3SNSContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      )
      web3SNSContract.on("NewPost", onNewPost);
    }
    return () => {
      if (web3SNSContract) {
        web3SNSContract.off("NewPost", onNewPost);
      }
    };
  }, []);

  useEffect(() => {
    let web3SNSContract;

    // Ethereumから飛んでくるEventから、Likeを更新した投稿を再構築
    // Json配列の特定部分だけ更新できるようにしたい、、、
    const onNewLike = (postId, from, message, timestamp, likes) => {
      // Mapとして管理しているpostIdと、Eventとして返ってくるpostIdは同一にしているためそのままIndex更新用に使う
      const updateIndex = postId.toNumber()
      // Eventとして取得した値から、特定Postを一から再生成する
      const newPost = {
        postId: postId.toNumber(),
        address: from,
        message: message,
        timestamp: timestamp.toNumber(),
        likes: likes.toNumber(),
      }
      // Index番号で検索をかけ、対象Indexの要素のみnewPostに入れ替える
      setAllTweets(
        allTweets.map((tweet, index) => (index === updateIndex ? newPost : tweet))
      );
    }

    // EthereumからのEvent発火を監視
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      web3SNSContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      )
      web3SNSContract.on("NewLike", onNewLike);
    }
    // メモリーリーク防止用
    return () => {
      if (web3SNSContract) {
        web3SNSContract.off("NewLike", onNewLike);
      }
    }
  }, []);

  // 新規投稿用関数
  const post = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const web3SNSContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const tweetTxn = await web3SNSContract.tweet(tweetValue);
        console.log("Minting...", tweetTxn.hash);
        await tweetTxn.wait();
        console.log("Minted -- ", tweetTxn.hash);
      } else {
        console.log("Ethereum object not found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // いいね用関数
  const like = async (_index) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const web3SNSContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )
        const likeTxn = await web3SNSContract.likesIncrement(_index);
        console.log("Minting...", likeTxn.hash);
        await likeTxn.wait();
        console.log("Minted ---", likeTxn.hash);
      } else {
        console.log("ethereum object not found");
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="App">
      <div className="header">
        <h1>Social Network Service 3.0</h1>
      </div>
      <div className="data-container">
        <div>
          <div className="data-container">
            <h2>
              Ethereum walletを接続後、メッセージを入力して投稿してください
            </h2>
            {/* ウォレットコネクトのボタン */}
            {!currentAccount && (
              <button className="tweetButton" onClick={connectWallet}>
                Connect Wallet
              </button>
            )}
            {currentAccount && (
              <button className="tweetButton">Wallet Connected</button>
            )}
            {currentAccount && (
              <button className="tweetButton" onClick={post}>
                投稿
              </button>
            )}
            {currentAccount && (
              <textarea className="postForm"
                name="tweetArea"
                placeholder="メッセージを入力"
                type="text"
                id="tweet"
                value={tweetValue}
                onChange={(e) => setTweetValue(e.target.value)}
              />
            )}
            {/*
                    allTweets.map((post) => (
                            <Post key={post.postId} data={{ id: post.postId, from: post.from, timestamp: post.timestamp, message: post.message, likes: post.likes }} />
                    ))
                    } 
            */}
            {currentAccount && 
              allTweets
                .slice(0)
                .reverse()
                .map((post, index) => {
                return (
                  <div key={index}>
                    <div>From:{post.address}</div>
                    <div>Time:{post.timestamp}</div>
                    <div>Message:{post.message}</div>
                    <div>Likes:{post.likes}</div>
                    <div>
                      <button onClick={()=>like(post.postId)}>Like</button>
                    </div>
                  </div>
                )
              })
              }
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;
