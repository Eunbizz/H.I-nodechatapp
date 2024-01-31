var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
const cors = require("cors");
// 서버소켓 모듈을 참조
const webSocket = require("./socket");
var debug = require('debug')('chatbasicapp:server');

var indexRouter = require("./routes/index");
var memberAPIRouter = require("./routes/memberAPI");
var channelRouter = require("./routes/channel");
var channelAPIRouter = require("./routes/channelAPI");
var commonAPIRouter = require("./routes/commonAPI");
var sequelize = require("./models/index.js").sequelize;

var app = express();

// mysql과 자동연결처리 및 모델기반 물리 테이블 생성처리제공
sequelize.sync();

// 레이아웃
var expressLayouts = require("express-ejs-layouts");

// 모든 RESTFUL 호출에 대한 응답 허락하기 - CORS ALL 허락..
app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// 기본 레이아웃
app.set("layout", "layout");
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);
app.set("layout extractMetas", true);


app.set("authLayout", "authLayout");
app.set("authLayout extractScripts", true);
app.set("authLayout extractStyles", true);
app.set("authLayout extractMetas", true);
app.use(expressLayouts);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/member", memberAPIRouter);
app.use("/chat", channelRouter);
app.use("/api/channel", channelAPIRouter);
app.use("/api/common", commonAPIRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

// 노드앱의 기본 was 서비스 포트
app.set('port', process.env.PORT || 3000);

// 노드앱이 작동되는 서버 객체 생성
var server = app.listen(app.get('port'), function(){

});

// 웹소켓 express 서버와 연결처리
// webSocket 모듈에 nodeapp이 실행되는 서버객체를 전달
// socket.io 소켓모듈과 node express 앱을 통합
webSocket(server);

server.on('error', onError);
server.on('listening', onListening);


/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
