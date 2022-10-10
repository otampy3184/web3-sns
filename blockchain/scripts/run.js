
const main = async () => {
    const tweetContractFactory = await hre.ethers.getContractFactory("Web3SNS");
    const tweetContract = await tweetContractFactory.deploy({
        value: hre.ethers.utils.parseEther("0.1"),
    });
    await tweetContract.deployed();
    console.log("Contract deployed to: ", tweetContract.address);
    const tweetTxn = await tweetContract.tweet("test post#1");
    await tweetTxn.wait();
    const tweetTxn2 = await tweetContract.tweet("test post#2");
    await tweetTxn2.wait();
    const likeTxn = await tweetContract.likesIncrement(1);
    await likeTxn.wait();
    const likeTxn2 = await tweetContract.likesIncrement(1);
    await likeTxn2.wait();
    let allPosts = await tweetContract.getAllPosts();
    console.log(allPosts);
    // let post1 = await tweetContract.getSpecificPost1(1);
    // let post2 = await tweetContract.getSpecificPost2(1);
    // console.log("post1(1):", post1);
    // console.log("post2(1):", post2);
    [Signer1, Signer2] = await hre.ethers.getSigners();
    console.log(Signer1.address, Signer2.address)
    const address1 = Signer1.address;
    const address2 = Signer2.address;
    let Balance1 = await hre.ethers.provider.getBalance(address1);
    console.log(Balance1);

    const sendTxn = await tweetContract.sendEther(address1);
    await sendTxn.wait()
    Balance1 = await hre.ethers.provider.getBalance(address1);
    console.log(Balance1);
};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();

