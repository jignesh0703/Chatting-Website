const dotenv = require('dotenv')
dotenv.config()

const { createClient } = require('redis');

const redisClient = createClient({
    url: process.env.REDIS_URL
});

async function checkRedisConnection() {
  try {
    await redisClient.connect(); // Connect to Redis
    console.log("✅ Redis is connected!");
    
    // Optional: test a simple command
    const pong = await redisClient.ping();
    console.log("PING response:", pong); // Should print "PONG"

  } catch (err) {
    console.error("❌ Redis connection failed:", err.message);
  }
}

checkRedisConnection()

redisClient.on('error', (err) => console.log('Redis connection error:', err));

module.exports = redisClient

// const dotenv = require('dotenv')
// dotenv.config()

// const { createClient } = require('redis');

// const redisClient = createClient({
//     url: process.env.REDIS_URL
// });

// async function checkRedisConnection() {
//   try {
//     await redisClient.connect(); // Connect to Redis
//     console.log("✅ Redis is connected!");
    
//     // Optional: test a simple command
//     const pong = await redisClient.ping();
//     console.log("PING response:", pong); // Should print "PONG"

//     await redisClient.quit(); // Disconnect
//   } catch (err) {
//     console.error("❌ Redis connection failed:", err.message);
//   }
// }

// checkRedisConnection()

// redisClient.on('error', (err) => console.log('Redis connection error:', err));

// module.exports = redisClient

// const client = createClient();

// async function showAllData() {
//   await client.connect();

//   // get all keys
//   const keys = await client.keys("*");

//   if (keys.length === 0) {
//     console.log("No data found in Redis");
//   } else {
//     console.log("Data in Redis:");
//     for (let key of keys) {
//       const value = await client.get(key);
//       console.log(`${key} => ${value}`);
//     }
//   }

//   await client.quit();
// }

// showAllData();
