import './App.css';

import React, { useEffect, useState } from "react";
import { ethers } from "ethers"
import abi from "./abi/Web3SNS.json";

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [tweetValue, setTweetValue] = useState("");
  const [allTweets, setAllTweets] = useState([]);

  const contractAddress = "0x600b263c2D18d686749748bf1B520318f1602d10";
  const contractABI = abi.abi;

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

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

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

        const postsCleaned = posts.map((post) => {
          return {
            address: post.from,
            timestamp: post.timestamp,
            message: post.message,
          };
        })
        setAllTweets(postsCleaned);
      } else {
        console.log("Ethereum object not found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let web3SNSContract;

    const onNewPost = (from, message, timestamp, likes) => {
      console.log("NewPost", from, message, timestamp, likes);
      setAllTweets((prevState) => [
        ...prevState,
        {
          address: from,
          message: message,
          timestamp: new Date(timestamp * 1000),
          likes: likes,
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

  const LikeButton = () => {
    const [ like, setLike ] = useState({ count: 0, liked: false });

    const onClick = () => {
        setLike({
            count: like.count + (like.liked ? -1 : 1),
            liked: !like.liked
        });
    }

    return (
        <>
            <button onClick={onClick}>
            {like.liked ? '✔' : ''}❤️
            </button>
            {like.count}
        </>
    );
  }

  return (
    <div className="mainContariner">
      <div className="dataContariner">
        <div className="header">
          Welcome....
        </div>
        <div className="bio">
          Ethereum walletを接続後、メッセージを入力して投稿してください
        </div>
        <br />
        {/* ウォレットコネクトのボタン */}
        {!currentAccount && (
          <button className="tweetButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        <br />
        {currentAccount && (
          <button className="tweetButton">Wallet Connected</button>
        )}
        {currentAccount && (
          <button className="tweetButton" onClick={post}>
            投稿
          </button>
        )}
        <br />
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
        {currentAccount &&
          allTweets
            .slice(0)
            .reverse()
            .map((post, index) => {
              return (
                <div className="tweet"
                  key={index}
                  style={{
                    backgroundColor: "#F8F8FF",
                    marginTop: "16px",
                    padding: "8px",
                  }}
                >
                  <div>Address: {post.address}</div>
                  <div>Time: {post.timestamp.toString()}</div>
                  <div>Message: {post.message}</div>
                  <LikeButton />
                </div>
              );
            })}
      </div>
    </div>
  );
}

export default App;
