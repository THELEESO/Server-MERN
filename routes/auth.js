const router = require("express").Router();
const registerValidation = require("../validation").registerValidation;
const loginValidatio = require("../validation").loginValidation;
const User = require("../models").userModel;
const jwt = require("jsonwebtoken");
const { loginValidation } = require("../validation");

router.use((req, res, next) => {
  console.log("A request is coming in to auth.js");
  next();
});

router.get("/testAPI", (req, res) => {
  const msgObj = {
    message: "Test API is working",
  };
  return res.json(msgObj);
});

router.post("/register", async (req, res) => {
  // check validation of data
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  console.log(req.body);

  // check user if exists
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("Email has been reigstered.");

  // register user
  const newUser = new User({
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    role: req.body.role,
  });

  try {
    const savedUser = await newUser.save();
    res.status(200).send({
      msg: "success",
      savedObject: savedUser,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send("User not saved.");
  }
});

router.post("/login", (req, res) => {
  // check the validation of data
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      res.status(400).send(err);
    }
    if (!user) {
      res.status(401).send("User not found");
    } else {
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (err) return res.status(400).send(err);
        if (isMatch) {
          const tokenObject = { _id: user.id, email: user.email };
          const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
          res.send({ success: true, token: "JWT " + token, user }); // dont forget "JWT_"
        } else {
          console.log(err);
          res.status(401).send("Wrong Password");
        }
      });
    }
  });
});

module.exports = router;
