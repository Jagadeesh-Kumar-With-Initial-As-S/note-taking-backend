const redis = require("redis");
require("dotenv").config();

const redisClient = () => {
  return redis.createClient({
    url: process.env.REDIS,
  });
};

const client = redisClient();
client.on("error", (err) => {
  console.log(err);
});
client.on("connect", () => {
  console.log("connected to redis");
});
client.on("end", () => {
  console.log("redis connection ended");
});
client.on("SIGQUIT", (err) => {
  client.quit();
});
module.exports = client;
