const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { auth } = require("./middleware/auth");
const { User } = require("./models/User");
const config = require("./config/key");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// MongoDB 연결
const mongoose = require("mongoose");
mongoose
  .connect(config.mongoURI, {
    // useNewUrlPaser: true,
    // useUnifiedTofology: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then(() => console.log("MongoDB conected"))
  .catch((err) => {
    console.log(err);
  });

app.post("/api/users/register", async (req, res) => {
  const user = new User(req.body);
  await user
    .save()
    .then(() => {
      res.status(200).json({
        success: true,
      });
    })
    .catch((err) => {
      console.error(err);
      res.json({
        success: false,
        err: err,
      });
    });
});

app.post('/api/users/login', (req, res) => {
  // Find the requested email in the database.
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.json({
          loginSuccess: false,
          message: "There is no user with the provided email."
        });
      }

      // If the requested email is in the database, check if the password is correct.
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (!isMatch)
          return res.json({ loginSuccess: false, message: "Your password is incorrect." });

        // Generate a token if the password is correct.
        user.generateToken((err, user) => {
          if (err) return res.status(400).send(err);

          // Save the token, e.g., in a cookie
          res.cookie("x_auth", user.token)
            .status(200)
            .json({ loginSuccess: true, userId: user._id });
        });
      });
    })
    .catch(err => {
      // Handle any errors that occurred during the query
      return res.status(500).send(err);
    });
});


app.get("/api/users/auth", auth, (req, res) => {
  // 여기까지 미들웨어를 통과했다는 의미는 Authentication 통과
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

app.get("/api/users/logout", auth, (req, res) => {
  // 로그아웃하려는 UserId의 토큰을 ""으로 지운다.
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

app.get("/api/hello", (req, res) => {
  res.json({
    status: 200,
    message: "안녕하세요",
  });
});

const port = 5000;

app.listen(port, () => {
  console.log(`boiler-plate app listening on port ${port}`);
});
