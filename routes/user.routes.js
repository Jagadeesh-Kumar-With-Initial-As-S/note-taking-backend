const userrouter = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/userModel");
const client = require("../redis");
client
  .connect()
  .then(() => {
    // console.log("connected to redis");
  })
  .catch((e) => {
    console.log(e);
  });
userrouter.get("/", (req, res) => {
  res.send("All the user");
});

userrouter.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  bcrypt.hash(password, 5, async function (err, hash) {
    if (err) {
      return res.send({ message: "something went wrong", status: 0 });
    }
    try {
      let user = new UserModel({ name, email, password: hash });
      await user.save();
      res.send({
        message: "User created",
        status: 1,
      });
    } catch (error) {
      res.send({
        message: error.message,
        status: 0,
      });
    }
  });
});

userrouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let option = {
    expiresIn: "3m",
  };

  await client.set(`key-${email}`, JSON.stringify(option.expiresIn));
  try {
    let data = await UserModel.find({ email });
    if (data.length > 0) {
      let token = jwt.sign(
        { userId: data[0]._id },
        "Jagadeesh Kumar with initial as S",
        option
      );
      bcrypt.compare(password, data[0].password, function (err, result) {
        if (err) {
          return res.send({
            message: "Something went wrong:" + err,
            status: 0,
          });
        }
        if (result) {
          res.send({
            message: "User logged in successfully",
            token: token,
            status: 1,
          });
        } else {
          res.send({
            message: "Incorrect password",
            status: 0,
          });
        }
      });
    } else {
      res.send({
        message: "User does not exist",
        status: 0,
      });
    }
  } catch (error) {
    res.send({
      message: error.message,
      status: 0,
    });
  }
});

module.exports = userrouter;
