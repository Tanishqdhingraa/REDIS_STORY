import { createClient } from "redis";

async function redisDemo() {

  // 1️⃣ Create Redis Client
  const redisClient = createClient({
    url: "redis://localhost:6379"
  });

  redisClient.on("error", (err) => {
    console.log("❌ Redis Error:", err);
  });

  // 2️⃣ Connect to Redis
  await redisClient.connect();
  console.log("✅ Redis Connected");

  // ================= STRING =================
  await redisClient.set("username", "Tanishq");
  const username = await redisClient.get("username");
  console.log("STRING:", username);

  // ================= LIST =================
  await redisClient.lPush("subjects", "ML");
  await redisClient.lPush("subjects", "DBMS");
  const subjects = await redisClient.lRange("subjects", 0, -1);
  console.log("LIST:", subjects);

  // ================= SET =================
  await redisClient.sAdd("skills", "Redis");
  await redisClient.sAdd("skills", "NodeJS");
  const skills = await redisClient.sMembers("skills");
  console.log("SET:", skills);

  // ================= HASH =================
  await redisClient.hSet("student:1", {
    name: "Tanishq",
    branch: "CSE",
    year: "3rd"
  });
  const student = await redisClient.hGetAll("student:1");
  console.log("HASH:", student);

  // ================= SORTED SET =================
  await redisClient.zAdd("leaderboard", [
    { score: 95, value: "Alice" },
    { score: 88, value: "Bob" }
  ]);
  const leaderboard = await redisClient.zRange("leaderboard", 0, -1);
  console.log("ZSET:", leaderboard);

  // ================= CLOSE CONNECTION =================
  await redisClient.quit();
  console.log("❌ Redis Disconnected");
}

// Run function
redisDemo();
