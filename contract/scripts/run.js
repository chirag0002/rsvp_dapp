// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const main = async () => {
  const [deployer, address1, address2] = await hre.ethers.getSigners();
  const rsvpContractFactory = await hre.ethers.getContractFactory("Web3RSVP");
  // console.log(rsvpContractFactory)
  const rsvpContract = await rsvpContractFactory.deploy();
  // console.log(rsvpContract);
  await rsvpContract.deployed;
  console.log("Contract deployed to:", rsvpContract.target); 
  
  let deposit = hre.ethers.parseEther("1");
  let maxCapacity = 3;
  let timestamp = 1718926200;
  let eventDataCID ="bafybeibhwfzx6oo5rymsxmkdxpmkfwyvbjrrwcl7cekmbzlupmp5ypkyfi";

  let txn = await rsvpContract.createNewEvent(
    timestamp,
    deposit,
    maxCapacity,
    eventDataCID
  );

  // console.log("NEW EVENT:", txn.hash);
  // console.log(txn);
  let wait = await txn.wait();
  // console.log(wait);
  if (wait.events && wait.events.length > 0) {
    console.log("NEW EVENT CREATED:", wait.events[0].event, wait.events[0].args);
  } else {
    console.log("No events found in the transaction receipt.");
  }
  
  
  let eventID = wait.events[0].args.eventID;
  console.log("EVENT ID:", eventID);

  txn = await rsvpContract.createNewRSVP(eventID, { value: deposit });
  wait = await txn.wait();
  console.log("NEW RSVP:", wait.events[0].event, wait.events[0].args);

  txn = await rsvpContract
    .connect(address1)
    .createNewRSVP(eventID, { value: deposit });
  wait = await txn.wait();
  console.log("NEW RSVP:", wait.events[0].event, wait.events[0].args);

  txn = await rsvpContract
    .connect(address2)
    .createNewRSVP(eventID, { value: deposit });
  wait = await txn.wait();
  console.log("NEW RSVP:", wait.events[0].event, wait.events[0].args);

  txn = await rsvpContract.confirmAllAttendees(eventID);
  wait = await txn.wait();
  wait.events.forEach((event) =>
    console.log("CONFIRMED:", event.args.attendeeAddress)
  );

  await hre.network.provider.send("evm_increaseTime", [15778800000000]);

  txn = await rsvpContract.withdrawUnclaimedDeposits(eventID);
  wait = await txn.wait();
  console.log("WITHDRAWN:", wait.events[0].event, wait.events[0].args);

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