import './App.css';

import React, { useEffect, useState } from "react";
import { ethers } from "ethers"
import abi from "./abi/Web3SNS.json";

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [tweetValue, setTweetValue] = useState("");
  const [allTweets, setAllTweets] = useState("");

  const contractAddress = "0x0eDd66F66aBF49655C58FB248E08867E1b0220B6";
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

  const getAllPosts = async() => {
    const { ethereum } = window;
    try {
      if(ethereum) {
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
    } catch(error){
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
      if(web3SNSContract) {
        web3SNSContract.off("NewPost", onNewPost);
      }
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {/* ウォレットコネクトのボタン */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {currentAccount && (
          <button className="waveButton">Wallet Connected</button>
        )}
      </header>
    </div>
  );
}

export default App;
