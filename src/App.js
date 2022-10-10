import './App.css';

import React, { useEffect, useState } from "react";
import { ethers } from "ethers"
import abi from "./abi/Web3SNS.json";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PaymentIcon from '@mui/icons-material/Payment';
import { IconButton } from '@mui/material';

function App() {
  const [likesCount, setLikesCount] = useState("");
  const [cantLike, setCantLike] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [tweetValue, setTweetValue] = useState("");
  const [allTweets, setAllTweets] = useState([]);
  const [sortByDateFlg, setSortByDateFlg] = useState(true);
  const [sortByLikesFlg, setSortByLikesFlg] = useState(true);
  const [results, setResults] = useState([]);

  const contractAddress = "0x175204Ea760995d4F1c0A2443c38929242854AB8";
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
      // 描画が自動的に切り替わらないのでとりあえずリロード
      await window.location.reload();
    } catch (error) {
      console.log(error);
    }
  }

  const tip = async (to) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const Web3SNSContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const tipTxn = await Web3SNSContract.sendEther(to);
        console.log("Minting...", tipTxn.hash);
        await tipTxn.wait();
        console.log("Minted ---", tipTxn.hash);
      } else{ 
        console.log("ethereum object not found");
      }
    } catch(error) {
      console.log(error);
    }
  }

  // timestamp順にソートする関数
  const sortByDate = async () => {
    const result = allTweets.sort(await function (a, b) {
      if (sortByDateFlg === true) {
        setSortByDateFlg(false);
        return (a.timestamp < b.timestamp) ? -1 : 1;
      } else {
        setSortByDateFlg(true);
        return (a.timestamp > b.timestamp) ? -1 : 1;
      }
    });
    setResults(result);
    setAllTweets(result);
  }

  // いいね数順にソートする関数
  const sortByLikes = async () => {
    const result = allTweets.sort(await function (a, b) {
      if (sortByLikesFlg === true) {
        setSortByLikesFlg(false);
        return (a.timestamp < b.timestamp) ? -1 : 1;
      } else {
        setSortByLikesFlg(true);
        return (a.likes > b.likes) ? -1 : 1;
      }
      setResults(result);
      setAllTweets(result)
    })
  }

  return (
    <div className='mainContainer'>
      <div className='dataContainer'>
        <div className='header'>
          <span role="img" aria-label="hand-wave">
            👋
          </span>{" "}
          WELCOME!
        </div>
        <div className='bio'>
          メッセージを作成して投稿をBlockchainに記録しよう
        </div>
        <br />
        {/* ウォレットコネクトのボタン */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {currentAccount && (
          <textarea
            className='textArea'
            name="tweetArea"
            placeholder="メッセージを入力"
            type="text"
            id="tweet"
            value={tweetValue}
            onChange={(e) => setTweetValue(e.target.value)}
          />
        )}
        {currentAccount && (
          <button className="waveButton" onClick={post}>
            投稿
          </button>
        )}
        {currentAccount && (
          <div className="sort">
            <button className="sortButton" onClick={sortByDate}>sort Date</button>
            <button className="sortButton" onClick={sortByLikes}>sort LikeCount</button>
          </div>
        )}
        {currentAccount &&
          allTweets
            .slice(0)
            .reverse()
            .map((post, index) => {
              return (
                <div
                  key={index}
                  style={{
                    width: "600px",
                    backgroundColor: "#F8F8FF",
                    marginTop: "16px",
                    padding: "8px",
                  }}
                >
                  <div>#{post.postId}</div>
                  <div>@{post.address}</div>
                  <div>Posted at:{post.timestamp}</div>
                  <div className='message'>Message:{post.message}</div>
                  <div>
                    <IconButton aria-label="favorite" size="small" color="primary" onClick={() => like(post.postId)}><FavoriteBorderIcon />{post.likes}</IconButton>
                  </div>
                  <div>
                  <IconButton aria-label="favorite" size="small" color="primary" onClick={() => tip(post.address)}><PaymentIcon />Tip</IconButton>
                  </div>
                </div>
              );
            })}
      </div>

    </div>
  );
}

export default App;
