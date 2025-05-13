/* server/init.js
 ** You must write a script that will create documents in your database according
 ** to the datamodel you have defined for the application.  Remember that you
 ** must at least initialize an admin user account whose credentials are derived
 ** from command-line arguments passed to this script. But, you should also add
 ** some communities, posts, comments, and link-flairs to fill your application
 ** some initial content.  You can use the initializeDB.js script from PA03 as
 ** inspiration, but you cannot just copy and paste it--you script has to do more
 ** to handle the addition of users to the data model.
 */

// need admin user
// * credential of admin -> command line args passed into script
//    * email displayName pw
// * admin -> has reputation of 1000

// initializeDB.js - Will add initial application data to MongoDB database
// Run this script to test your schema
// Start the mongoDB service as a background process before running the script
// Pass URL of your mongoDB instance as first argument
// (e.g., mongodb://127.0.0.1:27017/phreddit)

// use this to run the init.js
// node init.js admin@phreddit.com Admin32 password123

//import libraries
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

//import models
const CommunityModel = require("./models/communities");
const PostModel = require("./models/posts");
const CommentModel = require("./models/comments");
const LinkFlairModel = require("./models/linkflairs");
const UserModel = require("./models/users");

// connecting / creating phreddit db:
const databaseName = "mongodb://127.0.0.1:27017/phreddit";
mongoose.connect(databaseName);
let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// mainly used for resetting database for testing purposes
async function resetDB() {
  try {
    await UserModel.deleteMany({});
    await LinkFlairModel.deleteMany({});
    await CommentModel.deleteMany({});
    await PostModel.deleteMany({});
    await CommunityModel.deleteMany({});
    console.log("Database reset successful.");
  } catch (err) {
    console.error("Error resetting database:", err);
    throw err;
  }
}

// hashes the password in userObj
async function createUser(userObj) {
  const saltRounds = 11;

  const passwordHash = await bcrypt.hash(userObj.password, saltRounds);

  let newUserDoc = new UserModel({
    email: userObj.email,
    displayName: userObj.displayName,
    firstName: userObj.firstName,
    lastName: userObj.lastName,
    isAdmin: userObj.isAdmin,
    reputation: userObj.reputation,
    passwordHash: passwordHash,
  });
  return newUserDoc.save();
}

// ex of using createUser:
// First create the user
// const adminUser = {
//   email: "admin@fakereddit.com",
//   displayName: "AdminGuy",
//   firstName: "Admin",
//   lastName: "User",
//   isAdmin: true,
//   reputation: 1000,
//   password: "password123"
// };

// const adminDoc = await createUser(adminUser);

// console.log(`Admin created with _id: ${adminDoc._id}`);

function createLinkFlair(linkFlairObj) {
  let newLinkFlairDoc = new LinkFlairModel({
    content: linkFlairObj.content,
  });
  return newLinkFlairDoc.save();
}

function createComment(commentObj) {
  let newCommentDoc = new CommentModel({
    content: commentObj.content,
    commentedBy: commentObj.commentedBy,
    commentedDate: commentObj.commentedDate,
    commentIDs: commentObj.commentIDs,
    voteCount: 0,
    votes: [],
  });
  return newCommentDoc.save();
}

function createPost(postObj) {
  let newPostDoc = new PostModel({
    title: postObj.title,
    content: postObj.content,
    postedBy: postObj.postedBy,
    postedDate: postObj.postedDate,
    views: postObj.views,
    linkFlairID: postObj.linkFlairID,
    commentIDs: postObj.commentIDs,
    voteCount: 0,
    votes: [],
  });
  return newPostDoc.save();
}

function createCommunity(communityObj) {
  let newCommunityDoc = new CommunityModel({
    name: communityObj.name,
    description: communityObj.description,
    postIDs: communityObj.postIDs,
    startDate: communityObj.startDate,
    members: communityObj.members,
    creator: communityObj.creator,
  });
  return newCommunityDoc.save();
}

async function initializeDB() {
  // reset the database if any data is already in it (mainly for testing purposes)

  // extract admin credentials from commmand line
  const adminCredentials = process.argv.slice(2);

  // check if length is < 3 => throw error:
  if (adminCredentials.length < 3) {
    console.log(
      "ERROR: You need to provide 3 arguments: admin email, display name, and password for admin account in that order"
    );
    return;
  }
  await resetDB();

  // 1. admin email
  // 2. display name
  // 3. password

  // const admin = {
  //   email: "admin@admin.com",
  //   displayName: "admin32",
  //   firstName: "admin32",
  //   lastName: "admin32",
  //   isAdmin: true,
  //   reputation: 1000,
  //   passwordHash: "admin123",
  // };

  const admin = {
    email: adminCredentials[0],
    displayName: adminCredentials[1],
    firstName: "admin32",
    lastName: "admin32",
    isAdmin: true,
    reputation: 1000,
    password: adminCredentials[2],
  };

  const bigfeet = {
    email: "user1@gmail.com",
    displayName: "bigfeet",
    firstName: "big",
    lastName: "ft",
    password: "p123123",
  };

  const astyanax = {
    email: "user2@gmail.com",
    displayName: "astyanax",
    firstName: "astyanax",
    lastName: "astyanax",
    password: "p123123",
  };
  const outtheretruth47 = {
    email: "user3@gmail.com",
    displayName: "outtheretruth47",
    firstName: "outtheretruth47",
    lastName: "outtheretruth47",
    password: "p123123",
  };
  const rollo = {
    email: "user4@gmail.com",
    displayName: "rollo",
    firstName: "rollo",
    lastName: "rollo",
    password: "p123123",
  };
  const shemp = {
    email: "user5@gmail.com",
    displayName: "shemp",
    firstName: "shemp",
    lastName: "shemp",
    password: "p123123",
  };
  const trucknutz69 = {
    email: "user6@gmail.com",
    displayName: "trucknutz69",
    firstName: "trucknutz69",
    lastName: "trucknutz69",
    password: "p123123",
  };
  const MarcoArelius = {
    email: "user7@gmail.com",
    displayName: "MarcoArelius",
    firstName: "MarcoArelius",
    lastName: "MarcoArelius",
    password: "p123123",
  };
  const catlady13 = {
    email: "user8@gmail.com",
    displayName: "catlady13",
    firstName: "catlady13",
    lastName: "catlady13",
    password: "p123123",
  };

  // has reputation of 40
  const lowRepUser = {
    email: "user9@gmail.com",
    displayName: "lowRepUser",
    firstName: "lowRepUser",
    lastName: "lowRepUser",
    password: "p123123",
    reputation: 40,
  };
  // const community2Creator = {
  //   email: "user10@gmail.com",
  //   displayName: "community2Creator",
  //   firstName: "community2Creator",
  //   lastName: "community2Creator",
  //   password: "p123123",
  // };

  let adminRef = await createUser(admin);
  let bigfeetRef = await createUser(bigfeet);
  let astyanaxRef = await createUser(astyanax);
  let outtheretruth47Ref = await createUser(outtheretruth47);
  let rolloRef = await createUser(rollo);
  let shempRef = await createUser(shemp);
  let trucknutz69Ref = await createUser(trucknutz69);
  let MarcoAreliusRef = await createUser(MarcoArelius);
  let catlady13Ref = await createUser(catlady13);
  let lowRepUserRef = await createUser(lowRepUser);
  // let community1CreatorRef = await createUser(community1Creator);
  // let community2CreatorRef = await createUser(community2Creator);

  // link flair objects
  const linkFlair1 = {
    // link flair 1
    linkFlairID: "lf1",
    content: "The jerkstore called...",
  };
  const linkFlair2 = {
    //link flair 2
    linkFlairID: "lf2",
    content: "Literal Saint",
  };
  const linkFlair3 = {
    //link flair 3
    linkFlairID: "lf3",
    content: "They walk among us",
  };
  const linkFlair4 = {
    //link flair 4
    linkFlairID: "lf4",
    content: "Worse than Hitler",
  };
  let linkFlairRef1 = await createLinkFlair(linkFlair1);
  let linkFlairRef2 = await createLinkFlair(linkFlair2);
  let linkFlairRef3 = await createLinkFlair(linkFlair3);
  let linkFlairRef4 = await createLinkFlair(linkFlair4);

  // comment objects
  const comment7 = {
    // comment 7
    commentID: "comment7",
    content: "Generic poster slogan #42",
    commentIDs: [],
    commentedBy: bigfeetRef._id,
    commentedDate: new Date("September 10, 2024 09:43:00"),
  };
  let commentRef7 = await createComment(comment7);

  const comment6 = {
    // comment 6
    commentID: "comment6",
    content: "I want to believe.",
    commentIDs: [commentRef7],
    commentedBy: outtheretruth47Ref._id,
    commentedDate: new Date("September 10, 2024 07:18:00"),
    votes: [],
  };
  let commentRef6 = await createComment(comment6);

  const comment5 = {
    // comment 5
    commentID: "comment5",
    content:
      "The same thing happened to me. I guest this channel does still show real history.",
    commentIDs: [],
    commentedBy: bigfeetRef._id,
    commentedDate: new Date("September 09, 2024 017:03:00"),
    votes: [],
  };
  let commentRef5 = await createComment(comment5);

  const comment4 = {
    // comment 4
    commentID: "comment4",
    content: "The truth is out there.",
    commentIDs: [commentRef6],
    commentedBy: astyanaxRef._id,
    commentedDate: new Date("September 10, 2024 6:41:00"),
    votes: [],
  };
  let commentRef4 = await createComment(comment4);

  const comment3 = {
    // comment 3
    commentID: "comment3",
    content: "My brother in Christ, are you ok? Also, YTJ.",
    commentIDs: [],
    commentedBy: rolloRef._id,
    commentedDate: new Date("August 23, 2024 09:31:00"),
    votes: [],
  };
  let commentRef3 = await createComment(comment3);

  const comment2 = {
    // comment 2
    commentID: "comment2",
    content:
      "Obvious rage bait, but if not, then you are absolutely the jerk in this situation. Please delete your Tron vehicle and leave is in peace.  YTJ.",
    commentIDs: [],
    commentedBy: astyanaxRef._id,
    commentedDate: new Date("August 23, 2024 10:57:00"),
    votes: [],
  };
  let commentRef2 = await createComment(comment2);

  const comment1 = {
    // comment 1
    commentID: "comment1",
    content:
      "There is no higher calling than the protection of Tesla products.  God bless you sir and God bless Elon Musk. Oh, NTJ.",
    commentIDs: [commentRef3],
    commentedBy: shempRef._id,
    commentedDate: new Date("August 23, 2024 08:22:00"),
    votes: [],
  };
  let commentRef1 = await createComment(comment1);

  // post objects
  const post1 = {
    // post 1
    postID: "p1",
    title:
      "AITJ: I parked my cybertruck in the handicapped spot to protect it from bitter, jealous losers.",
    content:
      "Recently I went to the store in my brand new Tesla cybertruck. I know there are lots of haters out there, so I wanted to make sure my truck was protected. So I parked it so it overlapped with two of those extra-wide handicapped spots.  When I came out of the store with my beef jerky some Karen in a wheelchair was screaming at me.  So tell me prhreddit, was I the jerk?",
    linkFlairID: linkFlairRef1,
    postedBy: trucknutz69Ref._id,
    postedDate: new Date("August 23, 2024 01:19:00"),
    commentIDs: [commentRef1, commentRef2],
    views: 14,
    votes: [],
  };
  const post2 = {
    // post 2
    postID: "p2",
    title: "Remember when this was a HISTORY channel?",
    content:
      'Does anyone else remember when they used to show actual historical content on this channel and not just an endless stream of alien encounters, conspiracy theories, and cryptozoology? I do.\n\nBut, I am pretty sure I was abducted last night just as described in that show from last week, "Finding the Alien Within".  Just thought I\'d let you all know.',
    linkFlairID: linkFlairRef3,
    postedBy: MarcoAreliusRef._id,
    postedDate: new Date("September 9, 2024 14:24:00"),
    commentIDs: [commentRef4, commentRef5],
    views: 1023,
    votes: [],
  };
  let postRef1 = await createPost(post1);
  let postRef2 = await createPost(post2);

  // community objects
  // trucknutz69Ref._id is the creator instead
  const community1 = {
    // community object 1
    communityID: "community1",
    name: "Am I the Jerk?",
    description: "A practical application of the principles of justice.",
    postIDs: [postRef1],
    startDate: new Date("August 10, 2014 04:18:00"),
    members: [
      rolloRef._id,
      shempRef._id,
      catlady13Ref._id,
      astyanaxRef._id,
      trucknutz69Ref._id,
    ],
    memberCount: 5,
    creator: trucknutz69Ref._id,
  };
  const community2 = {
    // community object 2
    communityID: "community2",
    name: "The History Channel",
    description: "A fantastical reimagining of our past and present.",
    postIDs: [postRef2],
    startDate: new Date("May 4, 2017 08:32:00"),
    members: [
      MarcoAreliusRef._id,
      astyanaxRef._id,
      outtheretruth47Ref._id,
      bigfeetRef._id,
    ],
    memberCount: 4,
    creator: MarcoAreliusRef._id,
  };
  let communityRef1 = await createCommunity(community1);
  let communityRef2 = await createCommunity(community2);

  if (db) {
    db.close();
  }
  console.log("done");
}

initializeDB().catch((err) => {
  console.log("ERROR: " + err);
  console.trace();
  if (db) {
    db.close();
  }
});

console.log("processing...");
