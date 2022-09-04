const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const authRoute = require("./routes").auth;
const courseRoute = require("./routes").course;
const passport = require("passport");
require("./config/passport")(passport);
const cors = require("cors");

mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => {
    console.log("Connet to Mongo Altas...");
  })
  .catch((e) => {
    console.log(e);
  });

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // 注意放的位置
app.use("/api/user", authRoute);
app.use(
  "/api/courses",
  passport.authenticate("jwt", { session: false }),
  courseRoute
);

app.listen(8080, () => {
  console.log("Server running on port 8080.");
});
