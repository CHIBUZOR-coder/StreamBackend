// redisClient.js
const { createClient } = require("redis");

const redisClient = createClient({
  url: "redis://localhost:6379", // change if using hosted Redis
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;
