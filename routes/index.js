// 공통 페이지 제공(로그인, 회원가입, 암호찾기)

var express = require('express');
var router = express.Router();

var db = require('../models/index.js');
var Op = db.Sequelize.Op;

// 로그인 웹페이지 요청 및 응답
router.get('/login', async(req, res)=>{
  res.render('login.ejs',{layout:"authLayout", resultMsg:""})
});

// 로그인 처리 요청 및 응답, 로그인 완료 후 채팅 페이지 이동
router.post('/', async(req, res)=>{
  var email = req.body.email;
  var password = req.body.member_password;

  login = {
    email,
    member_password:password
  }

  var member = await db.Member.findOne({where:{email:login.email}});

  var resultMsg = '';

  if (member==null){
    resultMsg = '관리자 정보가 등록되지 않았습니다.'
  } else {
    if (member.member_password == login.member_password) {
      res.redirect('/chat');
    } else {
      resultMsg = '암호가 일치하지 않습니다.'
    }
  }
  
  if (resultMsg !== ''){
    res.render('login', {resultMsg, login, member})
  }
});



// 회원가입 웹페이지 요청 및 응답
router.get('/entry', async(req, res)=>{
  res.render('entry.ejs', {layout:"authLayout"})
});

// 회원가입 처리 요청 및 응답, 회원가입 완료 후 로그인 페이지 이동
router.post('/entry', async(req, res)=>{

  // step1: 회원가입페이지에서 사용자가 입력한 회원정보 추출
  var email = req.body.email;
  var name = req.body.name;
  var password = req.body.password;
  var telephone = req.body.telephone;
  var birthDate = req.body.birthDate;
  var profileImgPath = req.body.profileImgPath;

  // step2: db 신규 회원 등록 처리
  member = {
    email,
    name,
    member_password:password,
    telephone,
    birth_date:birthDate,
    profile_img_path:profileImgPath
  };

  await db.Member.create(member)

  // 등록완료시 로그인 페이지로 이동시키기
  res.redirect('/login')
});

/* 암호찾기 웹페이지 요청과 응답 */
router.get('/find', async(req, res, next)=>{
  res.render('find', {msg:"", email:"", layout:"authLayout"});
});

/* 암호찾기 사용자 입력정보 처리 요청과 응답 */
router.post('/find', async (req, res, next) => {
  try {
    var Email = req.body.email;

    // DB에서 찾기
    var email = await db.Member.findOne({ where: { email: Email } });

    var msg = '';

    if (!email || email.email !== Email) {
      msg = '등록된 메일이 없습니다. 가입 후 이용 바랍니다.';

    } else if (email.email == Email) {
      msg = '메일찾기완료';
    }

    if (msg !== '') {
      res.render('find', { msg, email, layout: "authLayout" })
    }

  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;