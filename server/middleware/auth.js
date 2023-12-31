const { User } = require('../models/User');

let auth = (req, res, next) => {
  // 인증 처리 수행
  // 1. 클라이언트 쿠키에서 토큰을 가져온다.
  let token = req.cookies.x_auth;

  // 2. 서버에서 1번에서 가져온 토큰을 복호화하고 해당 유저를 찾는다.
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user) return res.json({ isAuth: false, error: true })

    req.token = token;
    req.user = user;
    next();

  })
  // 3-1. 유저가 있으면 인증 Okay

  // 3-2. 유저가 없으면 인증 실패
}
module.exports = { auth };