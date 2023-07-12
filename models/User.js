const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50
  },
  email: {
    type: String,
    trim: true,
    unique: 1
  },
  password: {
    type: String,
    minlength: 5
  },
  lastname: {
    type: String,
    maxlength: 50
  },
  role: {
    type: Number,
    default: 0
  },
  image: String,
  token: {
    type: String
  },
  tokenExp: {
    type: Number
  }
})

userSchema.statics.findByToken = function(token, cb){
  let user= this;

  // 토큰 decode
  jwt.verify(token, 'secretToken', function (err, decoded){
    // 유저 아이디를 이용해서 유저를 찾은 다음,
    // 클라이언트에서 가져온 token과 DB에 보관한 토큰이 일치하는지 확인
    user.findOne({"_id" : decoded, "token" : token}, function(err, user){
      if(err){
        return cb(err);
      }
      cb(null, user);
    })
  })
}

userSchema.methods.comparePassword = function (plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch)
  });
}


userSchema.methods.generateToken = function (cb) {
  let user = this;
  //json Web token을 이용해서 Token 생성
  let token = jwt.sign(user._id.toJSON(), 'secretToken');

  user.token = token;

  user
    .save()
    .then(() => {
      return ({
        success: true,
      });
    })
    .catch((err) => {
      console.error(err);
      return ({
        success: false,
        err: err,
      })
    })
}

userSchema.pre('save', function (next) {
  // user 정보 save 전 수행할 작업
  let user = this;

  // 비밀번호 변경 요청 시에만 수행
  if (user.isModified('password')) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash; // 해싱된 비밀번호로 교체
        next();
      })
    })
  }
  else {
    next();
  }
});

const User = mongoose.model('User', userSchema);

module.exports = { User };