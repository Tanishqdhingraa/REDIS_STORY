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

  // ================= TTL (Expire) =================
  // Simulating OTP or Session token
  await redisClient.set("otp:1001", "987654", {
    EX: 60 // expires in 60 seconds
  });

  const otp = await redisClient.get("otp:1001");
  const ttl = await redisClient.ttl("otp:1001");
  console.log("OTP:", otp, "TTL left:", ttl, "seconds");

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

  // ================= RATE LIMITING =================
  // Simulate API calls from same IP
  const ip = "192.168.1.10";
  const rateKey = `rate:${ip}`;

  const requests = await redisClient.incr(rateKey);

  // First request → start time window
  if (requests === 1) {
    await redisClient.expire(rateKey, 10); // 10 second window
  }

  if (requests > 5) {
    console.log("🚫 Too many requests from", ip);
  } else {
    console.log(`✅ Request ${requests} allowed for`, ip);
  }

  // ================= CLOSE CONNECTION =================
  await redisClient.quit();
  console.log("❌ Redis Disconnected");
}

// Run function
redisDemo();
