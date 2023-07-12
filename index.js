const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { User } = require('./models/User');
const config = require('./config/key');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// MongoDB 연결
const mongoose = require('mongoose');
mongoose
  .connect(
    config.mongoURI,
    {
      // useNewUrlPaser: true,
      // useUnifiedTofology: true,
      // useCreateIndex: true,
      // useFindAndModify: false,
    }
  )
  .then(() => console.log('MongoDB conected'))
  .catch((err) => {
    console.log(err);
  });

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/register', async (req, res) => {
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
      })
    })
});

app.post('/login', (req, res) => {
  // 요청된 email이 database에 있는지 찾는다.
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.json({
          loginSuccess: false,
          message: "해당하는 ID가 존재하지 않습니다."
        })
      }
      // 요청된 email이 존재한다면 DB의 비밀번호와 입력된 비밀번호를 비교
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (!isMatch) {
          res.json({
            loginSuccess: false,
            message: "비밀번호가 틀렸습니다."
          })
        }
        // 비밀번호가 일치한다면, 해당 User에게 Token 생성
        user.generateToken((err, user) => {
          if (err) return res.status(400).send(err);
          // 토큰 저장위치 결정 (쿠키, 세션, 로컬 스토리지) 여기서는 쿠키에 저장
          res.cookie("x_auth", user.token);
          res.status(200).json({
            loginSuccess: true,
            userId: user._id
          })
        });
      })
    })
    .catch((err)=>{
      return res.status(400).send(err);
    })
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
