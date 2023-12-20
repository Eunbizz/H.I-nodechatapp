var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressLayouts = require('express-ejs-layouts');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var memberAPIRouter = require('./routes/memberAPI');
var channelRouter = require('./routes/channel');


var channelAPIRouter = require('./routes/channelAPI');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

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
app.use('/users', usersRouter);
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
