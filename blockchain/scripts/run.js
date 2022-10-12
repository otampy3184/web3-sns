
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
    const tweetTxn3 = await tweetContract.tweet("test post#3");
    await tweetTxn3.wait();
    const tweetTxn4 = await tweetContract.tweet("test post#4");
    await tweetTxn4.wait();
    const likeTxn = await tweetContract.likesIncrement(0);
    await likeTxn.wait();
    const likeTxn2 = await tweetContract.likesIncrement(3);
    await likeTxn2.wait();

    const postCount = await tweetContract.getPostsCount();
    console.log(postCount);

    const posts = await tweetContract.getAllPosts();
    console.log(posts);

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

