var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require("dotenv").config();
const cors = require("cors");

var indexRouter = require('./routes/index');
var memberAPIRouter = require('./routes/memberAPI');
var channelRouter = require('./routes/channel');

var channelAPIRouter = require('./routes/channelAPI');
var sequelize = require('./models/index.js').sequelize;

var app = express();

// mysql과 자동연결처리 및 모델기반 물리 테이블 생성처리제공
sequelize.sync();

// 레이아웃
var expressLayouts = require('express-ejs-layouts');

// 모든 RESTFUL 호출에 대한 응답 허락하기 - CORS ALL 허락..
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 기본 레이아웃
app.set('layout', 'layout');
app.set("layout extractScripts", true); 
app.set("layout extractStyles", true); 
app.set("layout extractMetas", true); 

// 로그인, 회원가입, 비밀번호찾기 레이아웃
app.set('authLayout', 'authLayout');
app.set("authLayout extractScripts", true); 
app.set("authLayout extractStyles", true); 
app.set("authLayout extractMetas", true); 
app.use(expressLayouts);


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/member', memberAPIRouter);
app.use('/chat', channelRouter);
app.use('/api/channel', channelAPIRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
