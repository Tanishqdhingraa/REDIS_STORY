// SET       → store a value in Redis (can include TTL)
// GET       → read a value from Redis
// SETEX    → store a value with expiry (used for cache)
// LPUSH    → add items to the beginning of a list
// LRANGE   → read items from a list
// LTRIM    → keep only the last N items in a list
// SADD     → add unique values to a set
// SMEMBERS → get all values from a set
// ZADD     → add values with scores to a sorted set
// ZRANGEWITHSCORES → get sorted set data with ranking
// HSET     → store an object (field-value pairs)
// HGETALL  → get full object from Redis
// INCR     → increase a numeric counter (used in rate limiting)
// EXPIRE   → set TTL (time to live) for a key
// DEL      → delete a key (cache invalidation)
// CONNECT  → connect Node.js to Redis
// QUIT     → close Redis connection

const redis = require("redis");

const client = redis.createClient({
  url: "redis://127.0.0.1:6379",
});

client.on("connect", () => {
  console.log("✅ Redis connected");
});

client.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

async function redisDataStructures() {
  try {
    await client.connect();

    /* ---------- STRING WITH TTL ---------- */
    await client.set("user:1:name", "Sangam Mukherjee", { EX: 60 });
    console.log("User Name:", await client.get("user:1:name"));

    /* ---------- JSON CACHING ---------- */
    const cacheKey = "cache:user:1";
    const cached = await client.get(cacheKey);

    if (cached) {
      console.log("⚡ From Cache:", JSON.parse(cached));
    } else {
      const user = { id: 1, email: "sangam@gmail.com", country: "India" };
      await client.setEx(cacheKey, 120, JSON.stringify(user));
      console.log("🗄 Cached Fresh Data:", user);
    }

    /* ---------- LIST ---------- */
    await client.lPush("user:1:activity", [
      "LOGIN",
      "VIEW_PRODUCT",
      "LOGOUT",
    ]);
    await client.lTrim("user:1:activity", 0, 4);
    console.log(
      "Recent Activities:",
      await client.lRange("user:1:activity", 0, -1)
    );

    /* ---------- SET ---------- */
    await client.sAdd("user:1:roles", ["ADMIN", "USER"]);
    console.log("User Roles:", await client.sMembers("user:1:roles"));

    /* ---------- SORTED SET (FIXED) ---------- */
    await client.zAdd("leaderboard", [
      { score: 120, value: "UserA" },
      { score: 300, value: "UserB" },
      { score: 50, value: "UserC" },
    ]);

    console.log(
      "Leaderboard:",
      await client.zRangeWithScores("leaderboard", 0, -1)
    );

    /* ---------- HASH ---------- */
    await client.hSet("product:101", {
      name: "iPhone 15",
      price: "80000",
      stock: "10",
    });

    console.log(
      "Product Details:",
      await client.hGetAll("product:101")
    );

    /* ---------- RATE LIMIT COUNTER ---------- */
    const key = "rate:user:1";
    const count = await client.incr(key);
    if (count === 1) await client.expire(key, 60);

    console.log("Requests in last minute:", count);

    await client.del(cacheKey);
    console.log("🧹 Cache invalidated");
  } catch (err) {
    console.error("Redis operation failed:", err);
  } finally {
     await client.quit();
     console.log("🔌 Redis disconnected");
   }
}

redisDataStructures()
