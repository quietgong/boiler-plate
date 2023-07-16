const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { auth } = require('./middleware/auth');
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

app.post('/api/users/register', async (req, res) => {
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

app.post('/api/users/login', async (req, res) => {
  try{
    // 요청된 email이 database에 있는지 찾는다.
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "해당하는 ID가 존재하지 않습니다."
      })
    }
    // 요청된 email이 존재한다면 DB의 비밀번호와 입력된 비밀번호를 비교
    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) 
      return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." })

    // 비밀번호가 일치한다면, 해당 User에게 Token 생성
    user.generateToken((err, user) => {
      if (err) return res.status(400).send(err);
      // 토큰 저장위치 결정 (쿠키, 세션, 로컬 스토리지) 여기서는 쿠키에 저장
      res.cookie("x_auth", user.token)
      .status(200)
      .json({loginSuccess:true, userId : user._id})
    });
  } catch(err) {
    return res.status(400).send(err);
  }
})

        
app.get('/api/users/auth', auth, (req, res) => {
  // 여기까지 미들웨어를 통과했다는 의미는 Authentication 통과
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
})

app.get('/api/users/logout', auth, (req, res) => {
  // 로그아웃하려는 UserId의 토큰을 ""으로 지운다.
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
      success: true
    })
  })
})

app.get('/api/hello', (req,res)=>{
  res.json({
    "status":200,
    "message":"안녕하세요",
  })
})

const port = 5000

app.listen(port, () => {
  console.log(`boiler-plate app listening on port ${port}`)
})
