const main = async() => {
    const tweetContractFactory = await hre.ethers.getContractFactory("Web3SNS");
    const tweetContract = await tweetContractFactory.deploy();
    await tweetContract.deployed();
    console.log("Contract deployed to: ", tweetContract.address);
    const tweetTxn = await tweetContract.tweet("test post#1");
    await tweetTxn.wait();
    const tweetTxn2 = await tweetContract.tweet("test post#2");
    await tweetTxn2.wait();
    let allPosts = await tweetContract.getAllPosts();
    console.log(allPosts);
};

const runMain = async() => {
    try {
        await main();
        process.exit(0);
    } catch(error){
        console.log(error);
        process.exit(1);
    }
};

runMain();
