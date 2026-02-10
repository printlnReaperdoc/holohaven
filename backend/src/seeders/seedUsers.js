import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from '../models/User.js'; // adjust path if needed

dotenv.config();

const usersData = [
  {
    email: "sora@holohaven.com",
    username: "TokinoSora",
    password: "password123",
    profilePicture: "https://i.imgur.com/Xs9V2Yc.png",
    isAdmin: true, // Admin
  },
  {
    email: "roboco@holohaven.com",
    username: "Roboco",
    password: "password123",
    profilePicture: "https://i.imgur.com/k0J7oVZ.png",
    isAdmin: false,
  },
  {
    email: "sakura@holohaven.com",
    username: "SakuraMiko",
    password: "password123",
    profilePicture: "https://i.imgur.com/9k7s1qD.png",
    isAdmin: false,
  },
  {
    email: "suisei@holohaven.com",
    username: "HoshimachiSuisei",
    password: "password123",
    profilePicture: "https://i.imgur.com/G8kFXgk.png",
    isAdmin: false,
  },
  {
    email: "fubuki@holohaven.com",
    username: "ShirakamiFubuki",
    password: "password123",
    profilePicture: "https://i.imgur.com/4k2QZfH.png",
    isAdmin: false,
  },
  {
    email: "matsuri@holohaven.com",
    username: "NatsuiroMatsuri",
    password: "password123",
    profilePicture: "https://i.imgur.com/9bM5y5U.png",
    isAdmin: false,
  },
  {
    email: "aki@holohaven.com",
    username: "AkiRosenthal",
    password: "password123",
    profilePicture: "https://i.imgur.com/W0bqX0s.png",
    isAdmin: false,
  },
  {
    email: "haato@holohaven.com",
    username: "AkaiHaato",
    password: "password123",
    profilePicture: "https://i.imgur.com/EXgVRvQ.png",
    isAdmin: false,
  },
  {
    email: "ayame@holohaven.com",
    username: "NakiriAyame",
    password: "password123",
    profilePicture: "https://i.imgur.com/x6P7kDo.png",
    isAdmin: false,
  },
  {
    email: "choco@holohaven.com",
    username: "YuzukiChoco",
    password: "password123",
    profilePicture: "https://i.imgur.com/1J2zVq0.png",
    isAdmin: false,
  },
  {
    email: "subaru@holohaven.com",
    username: "OozoraSubaru",
    password: "password123",
    profilePicture: "https://i.imgur.com/3Z5pZqk.png",
    isAdmin: false,
  },
  {
    email: "pekora@holohaven.com",
    username: "UsadaPekora",
    password: "password123",
    profilePicture: "https://i.imgur.com/4yYvXJk.png",
    isAdmin: false,
  },
  {
    email: "flare@holohaven.com",
    username: "ShiranuiFlare",
    password: "password123",
    profilePicture: "https://i.imgur.com/5iQf2Rm.png",
    isAdmin: false,
  },
  {
    email: "noel@holohaven.com",
    username: "ShiroganeNoel",
    password: "password123",
    profilePicture: "https://i.imgur.com/6hM9QXx.png",
    isAdmin: false,
  },
  {
    email: "marine@holohaven.com",
    username: "HoushouMarine",
    password: "password123",
    profilePicture: "https://i.imgur.com/7vRZ1Fp.png",
    isAdmin: false,
  },
];

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected for users seeder");

    for (const u of usersData) {
      const hash = await bcrypt.hash(u.password, 10);
      await User.create({
        email: u.email,
        username: u.username,
        passwordHash: hash,
        profilePicture: u.profilePicture,
        isAdmin: u.isAdmin,
      });
      console.log(`User ${u.username} created`);
    }

    console.log("All users seeded");
    mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

seedUsers();
