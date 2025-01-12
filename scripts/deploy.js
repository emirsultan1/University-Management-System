async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance));

    const UniversityContract = await ethers.getContractFactory("DecentralizedUniversity");
    const university = await UniversityContract.deploy();

    console.log("Contract deployed to address:", university.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
